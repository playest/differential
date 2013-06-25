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