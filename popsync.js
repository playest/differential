// TODO ne synchro que ce qui est nécéssaire
// Délai supplémentaire sur les fichiers locaux

function Player(nodeID, sourceURL) {
    this.nodeID = nodeID;
    this.sourceURL = sourceURL;
    this.lastTimeupdateEvent = 0;
    this.callbacks = [];
    this.initPlayer();
}

Player.prototype.initPlayer = function() {
    if(this.sourceURL) {
        this.player = Popcorn.smart("#" + this.nodeID, this.sourceURL);
    }
    else {
        Popcorn.player("baseplayer");
        this.player = Popcorn.baseplayer("#" + this.nodeID);
    }

    var callbacksBkp = this.callbacks.slice(0);
    this.callbacks = [];
    for(var i = 0; i < callbacksBkp.length; i++) {
        this.on(callbacksBkp[i].event, callbacksBkp[i].callback);
    }
    this.player.on("timeupdate", this.onTimeupdate.bind(this));
};

Player.prototype.currentTime = function(time) {
    if(time === undefined) {
        return this.player.currentTime();
    }
    else {
        this.player.currentTime(time);
    }
};

Player.prototype.state = function(targetState) {
    var state;
    if(this.player.paused()) {
        state = "paused";
    }
    else {
        state = "playing";
    }
    
    if(!targetState) {
        return state;
    }
    else {
        console.log("set state");
        if(state != targetState) {
            if(targetState == "paused") {
                this.player.pause();
            }
            else if(targetState == "playing") {
                this.player.play();
            }
            else {
                console.log("unknown state: '" + targetState + "'");
            }
        }
    }
};

Player.prototype.on = function(evt, cb) {
    this.callbacks.push({event:evt, callback:cb});
    
    if(evt != "jump" && evt != "changesource") {
        this.player.on(evt, cb);
    }
};

Player.prototype.off = function(evt, cb) {
    for(var i = 0; i < this.callbacks.length; i++) {
        if(this.callbacks[i].event == evt && this.callbacks[i].callback == cb) {
            this.callbacks.splice(i, 1);
            i--;
        }
    }
};

Player.prototype.onTimeupdate = function() {
    var currentTime = this.currentTime();
    
    if(Math.abs(currentTime - this.lastTimeupdateEvent) > 2) {
        for(var i = 0; i < this.callbacks.length; i++) {
            if(this.callbacks[i].event == "jump") {
                this.callbacks[i].callback.call();
            }
        }
    }
    
    this.lastTimeupdateEvent = currentTime;
};

Player.prototype.changeSource = function(sourceURL) {
    console.log("change source to " + sourceURL);
    removeChildren(document.getElementById(this.nodeID));
    this.sourceURL = sourceURL;
    var bkpEvents = this.player.data.events
    this.initPlayer();
    this.player.data.events = bkpEvents;
    for(var i = 0; i < this.callbacks.length; i++) {
        if(this.callbacks[i].event == "changesource") {
            this.callbacks[i].callback.call(this);
        }
    }
};

// Syncer

function Syncer(player, chan, uid) {
    this.player = player;
    this.syncTimerID = null;

    this.updatePeriod = 1000; // milliseconds
    this.acceptableSyncDelay = (5 * this.updatePeriod) / 1000; // seconds
    this.defaultSuspendDelay = 5 * this.updatePeriod; // milliseconds

    this.forbidSync = false;
    this.simpleSync = true;

    this.chan = chan;
    this.uid = uid;
    this.currentAction;
    
    
    this.onJumpCb = this.onJump.bind(this);
    this.onChangeSourceCb = this.onChangeSource.bind(this);
    this.onStateCb = this.onState.bind(this);
    this.disableSuspendSync = false;
}

Syncer.prototype.setSimpleSync = function(simpleSync) {
    this.simpleSync = simpleSync;
}

Syncer.prototype.startSync = function() {
    this.receiveInfos();
    this.syncTimerID = setTimeout(this.onTimeout.bind(this), this.updatePeriod*2);
    this.player.on("jump", this.onJumpCb);
    this.player.on("changesource", this.onChangeSourceCb);
    this.player.on("pause", this.onStateCb);
    this.player.on("playing", this.onStateCb);
    this.player.on("play", this.onStateCb);
};

Syncer.prototype.stopSync = function() {
    clearTimeout(this.syncTimerID);
    //this.player.off("jump", this.onJumpCb);
    //this.player.off("changesource", this.onChangeSourceCb);
    this.player.off("jump", this.onJumpCb);
    this.player.off("changesource", this.onChangeSourceCb);
    this.player.off("pause", this.onStateCb);
    this.player.off("playing", this.onStateCb);
    this.player.off("play", this.onStateCb);
};

Syncer.prototype.suspendSync = function(time) {
    if(this.disableSuspendSync == false) {
        this.forbidSync = true;
        if(time === undefined) {
            time = this.defaultSuspendDelay;
        }
        console.log("suspend sync for " + time + " ms");
        var that = this;
        setTimeout(function() { that.forbidSync = false; }, time);
    }
    else {
        console.log("suspendSync disabled");
    }
};

Syncer.prototype.temporarilyDisableSuspendSync = function(time) {
    this.disableSuspendSync = true;

    if(time === undefined) {
        time = this.defaultSuspendDelay / 2;
    }
    
    var that = this;
    setTimeout(function() { that.disableSuspendSync = false; }, time);
};

Syncer.prototype.setCurrentActionFor = function(action, time) {
    // Priority between actions
    var prioAction = ["undefined", "state", "jump", "changesource", "master"];
    if(prioAction.indexOf(this.currentAction) < prioAction.indexOf(action)) {
        this.currentAction = action;
    }
    
    if(time === undefined) {
        time = this.defaultSuspendDelay * 0.75;
    }
    
    var that = this;
    setTimeout(function() { that.currentAction = undefined; }, time);
};

Syncer.prototype.onTimeout = function() {
    this.sendAndReceiveInfos();
    this.syncTimerID = setTimeout(this.onTimeout.bind(this), this.updatePeriod);
};

Syncer.prototype.onReceiveInfos = function(data) {
    var infos = JSON.parse(data);
    this.sync(infos);
};

Syncer.prototype.sync = function(infos) {
    var syncWith = this.findUserToSyncWith(infos);
    if(syncWith != null) {
        if(!this.forbidSync) {
            console.log("sync");
            this.temporarilyDisableSuspendSync();
            if(this.player.sourceURL != syncWith.source) {
                if(syncWith.source.indexOf("blob:") != 0 && this.player.sourceURL.indexOf("blob:") != 0) {
                    this.player.changeSource(syncWith.source);
                }
            }
            var t = (parseFloat(syncWith.time));
            console.log("sync at " + t);
            this.player.currentTime(t);
            this.player.state(syncWith.state);
        }
    }
};

Syncer.prototype.findUserToSyncWith = function(infos) {
    if(this.simpleSync === false) {
        return this.findUserToSyncWith_source_jump_median(infos);
    }
    else {
        var master = this.findMasterUser(infos);
        if(master.user != this.uid) {
            console.log(infos);
            console.log(master);
            console.log([master]);
            return this.findUserToSyncWith_source_jump_median([master]);
        }
    }
};

Syncer.prototype.findMasterUser = function(infos) {
    var syncWith = null;
    for(var i = 0, l = infos.length; i < l; i++) {
        if(infos[i].role == "master") {
            syncWith = infos[i];
            break;
        }
    }
    return syncWith;
}

Syncer.prototype.findUserToSyncWith_source_jump_median = function(infos) {
    var syncWith = null;

    if(this.player.sourceURL.indexOf("blob:") != 0) {
        syncWith = this.findUserToSyncWith_prio_action(infos.slice(0), "changesource");
    }
    if(syncWith != null) { console.log("sync source " + syncWith.user + ", " + syncWith.state + ", " + syncWith.time); }
    if(syncWith == null) {
        syncWith = this.findUserToSyncWith_prio_action(infos.slice(0), "jump");
        if(syncWith != null) { console.log("sync jump " + syncWith.user + ", " + syncWith.state + ", " + syncWith.time); }
    }
    if(syncWith == null) {
        syncWith = this.findUserToSyncWith_median(infos.slice(0));
        if(syncWith != null) { console.log("sync median " + syncWith.user + ", " + syncWith.state + ", " + syncWith.time); }
    }
    //if(syncWith == null) { console.log("no sync"); }
    return syncWith;
};

Syncer.prototype.findUserToSyncWith_prio_action = function(infos, action) {
    var syncWith = null;
    for(var i = 0, l = infos.length; i < l; i++) {
        if(infos[i].action == action && infos[i].user != this.uid) {
            syncWith = infos[i];
            break;
        }
    }
    return syncWith;
};

Syncer.prototype.findUserToSyncWith_median = function(infos) {
    var syncWith = null;

    for(var i = 0; i < infos.length; i++) {
        if(infos[i].user == myself)
        {
            //console.log("remove " + i + "th " + infos[i].user + " (myself)");
            infos.splice(i, 1);
            i--;
        }
        else if(!in_array(infos[i].state, ["playing", "paused"]))
        {
            //console.log("remove " + i + "th " + infos[i].user + " (state = " + infos[i].state + ")");
            infos.splice(i, 1);
            i--;
        }
        else if(infos[i].time < 0)
        {
            //console.log("remove " + i + "th " + infos[i].user + " (time negative)");
            infos.splice(i, 1);
            i--;
        }
        else {
            //console.log("not removing " + i + "th " + infos[i].user);
        }
    }

    if(infos.length > 0) {
        infos.sort(function(a, b) { return a.time > b.time; });
        
        i = Math.round((infos.length - 1) / 2);
        //console.log("=-1?: " + (sortedInfos[i].time != -1));
        if(this.isSyncNecessary(infos[i])) {
            syncWith = infos[i];
        }
        //if(thevideo != null) { console.log("me: " + thevideo.currentTime() + ", other: " + infos[i].time); }
    }
    
    return syncWith;
};

Syncer.prototype.isSyncNecessary = function(user) {
    if(user.state != this.player.state()) {
        return true;
    }
    else if(Math.abs(parseFloat(user.time) - this.player.currentTime()) > this.acceptableSyncDelay) {
        console.log("isSyncNecessary: his time:" + parseFloat(user.time) + ", me:" + this.player.currentTime() + ", de: " + this.acceptableSyncDelay);
        return true;
    }
    else {
        console.log("isSyncNecessary: no");
        return false;
    }
};

Syncer.prototype.sendInfos = function(xhr, chan, userName, currentTime, state, sourceURL, role) {
    var currentTime = this.player.currentTime();
    var infosUrl = "infos.php?chan=" + chan + "&user=" + userName + "&time=" + currentTime + "&state=" + state + "&source=" + encodeURIComponent(sourceURL) + "&action=" + this.currentAction;
    xhr.open("GET", infosUrl, true);
    xhr.send(null);
};

Syncer.prototype.receiveInfos = function(xhr, chan) {
    var xhrResp = XMLHttpRequest();
    
    var that = this;
    xhrResp.onreadystatechange = function() {
        if (xhrResp.readyState == 4 && (xhrResp.status == 200 || xhrResp.status == 0)) {
            that.onReceiveInfos.call(that, xhrResp.responseText);
        }
    };
    
    var currentTime = this.player.currentTime();
    var infosUrl = "infos.php?chan=" + chan;
    xhrResp.open("GET", infosUrl, true);
    xhrResp.send(null);
};

Syncer.prototype.sendInfosWithoutSync = function() {
    var xhrNo = XMLHttpRequest();
    this.sendInfos(xhrNo, this.chan, this.uid, this.player.currentTime(), this.player.state(), this.player.sourceURL);
};

Syncer.prototype.sendAndReceiveInfos = function() {
    this.startSendInfos = new Date().getTime();
    var xhrResp = XMLHttpRequest();
    
    var that = this;
    xhrResp.onreadystatechange = function() {
        if (xhrResp.readyState == 4 && (xhrResp.status == 200 || xhrResp.status == 0)) {
            that.onReceiveInfos.call(that, xhrResp.responseText);
        }
    };
    
    this.sendInfos(xhrResp, this.chan, this.uid, this.player.currentTime(), this.player.state(), this.player.sourceURL, this.currentAction, this.role);
    //this.receiveInfos(xhrResp, this.chan);
};

Syncer.prototype.onJump = function() {
    console.log("jump cb ! " + this.player.sourceURL);
    // Set state to "jumping"
    this.suspendSync(this.defaultSuspendDelay);
    this.setCurrentActionFor("jump");
    this.sendInfosWithoutSync();
    // Suspend sync
    // Reload state in 3.5
    // Send infos without syncing
    // Restart sync with syncWithTimeout
};

Syncer.prototype.onChangeSource = function() {
    console.log("change source cb ! " + this.player.sourceURL);
    this.suspendSync(this.defaultSuspendDelay * 1.5);
    this.setCurrentActionFor("changesource");
    this.sendInfosWithoutSync();
};

Syncer.prototype.onState = function() {
    console.log("state cb ! " + this.player.state());
    this.suspendSync(this.defaultSuspendDelay * 1.5);
    this.setCurrentActionFor("state");
    this.sendInfosWithoutSync();
};

Syncer.prototype.leave = function() {
    syncer.stopSync();
    var xhrNo = XMLHttpRequest();
    this.sendInfos(xhrNo, this.chan, this.uid, this.player.currentTime(), "leaving", this.player.sourceURL);
}