<?php
if(isset($_GET['chan'])) {
    $chan = $_GET['chan'];
}
else {
    $chan = 'main';
}

if(!isset($_GET['sync_type'])) {
    $sync_type = "master";
}
else {
    $sync_type = $_GET['sync_type'];
}

?>
<!DOCTYPE html>
<html>
<head>
    <title><?php echo($chan); ?> - &#8706;ifferential</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script src="extras.js"></script>
    <script src="popcorn-complete.js"></script>
    <script src="player.js"></script>
    <script src="syncer.js"></script>
    <script src="playlist.js"></script>
    <link rel="stylesheet" type="text/css" href="bootstrap.css"  media="screen" charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="differential.css"  media="screen" charset="utf-8" />
</head>
<body onunload="onLeave();" onbeforeunload="onLeave();">

<script>
    // Main
    var myself = "user_" + ("" + Math.random()).substring(2,8);
    var chan = "<?php echo($chan); ?>";
    var sync_type = "<?php echo($sync_type); ?>";
    var player;
    var syncer;
    var playlist;
    document.addEventListener("DOMContentLoaded", function() {
        player = new Player("thevideo", "none");
        //player = new Player("thevideo");
        syncer = new Syncer(player, chan, myself);
        if(sync_type == "master") {
            syncer.setSimpleSync(true);
        }
        else {
            syncer.setSimpleSync(false);
        }

        syncer.startSync();

        document.getElementById('username').value = myself;

        playlist = new Poplist(document.getElementById("theplaylist"));
        playlist.getList();
        playlist.onDblClickCb = function() { player.changeSource(this.value); };
        document.getElementById('files').addEventListener('change', function(evt) { handleFileSelect(player, playlist, evt); }, false);
        
    }, false);

    function onLeave() {
        console.log("onLeave");
        syncer.leave();
    }
</script>

<div class="container-fluid">

<div class="row-fluid">
    <div class="text-center sep offset4 span4">
        <a href="."><h1>&#8706;</h1></a>
        <button class="btn btn-inverse" onclick="toggleDisplayElementByID('menu');">Show/hide panel</button>
    </div>
</div>

<div class="row-fluid" id="menu" style="display:;">
<div class="well well-small span6 offset3">

    <div class="menublock">
        <div class="span12">

        <form class="form-full"
        onsubmit="player.changeSource(document.getElementById('videoURL').value); playlist.add(document.getElementById('videoURL').value); return false;">
            <select class="span12" id="theplaylist" size="4"
                onchange="document.getElementById('videoURL').value = this.options[this.selectedIndex].value;">
                <option ondblclick="player.changeSource(this.value);" value="http://www.youtube.com/watch?v=FzSR_TFMirs">Omoide Wa Okkusenman</option>
                <option ondblclick="player.changeSource(this.value);" value="http://www.youtube.com/watch?v=cEJ8CzAD4TE">Love is in bloom!</option>
                <option ondblclick="player.changeSource(this.value);" value="http://vimeo.com/56901429">http://vimeo.com/56901429</option>
            </select>
            <input class="span12" type="text" id="videoURL" placeholder="Put the address of the video here and validate" />
            <button class="btn btn-primary" type="submit">Validate</button>
            <button class="btn-link pull-right" onclick="toggleDisplayElementByID('help_playlist'); return false;">Hey, listen!</button>
            <div id="help_playlist" class="help-block" style="display:none;">
                This is the playlist, you can add videos in here. Go on your favorite video website and find a video. Copy the URL, put it it in the address field and click on the "validate" button. Select one element to view its URL. You can also double-click on a video in the playist to play this video.
            </div>
        </div>
        </form>
    </div>

    <div class="menublock row-fluid">
        <form>
            Add a local video: <input style="height:1.8em;"type="file" id="files" name="files[]" />
            <button class="btn-link pull-right" onclick="toggleDisplayElementByID('help_local_video'); return false;">Wait. What!?</button>
            <div id="help_local_video" class="help-block" style="display:none;">
                Yes ! You can also watch a video from <strong>your</strong> computer with your friends. <strong>BUT</strong> it's not a good as it seems: it only works if your friends have a copy of the video on their computer too. The video is not sent to this website. If you want to play around you could watch <em>The Godfather</em> while your friend watch <em>The Shawshank Redemption</em>, the time will be synchronized (1 hour of Godfather equals 1 hour of redemption). Of course this is just playing around, it's much better if everybody watch the same movie :)
            </div>
        </form>
    </div>

</div> <!-- /menu -->
</div>
</div>


<div class="main alone text-center">
    <div>
        <div id="thevideo"></div>
    </div>
</div>

<div class="alone">
    <span class="label">version 0.1</span>
    <button class="btn-link btn-small" onclick="toggleDisplayElementByID('debug'); return false;">Debug</button>
</div>

<div id="debug" style="display:none;">
    <div>
        <?php echo("php sync type: " . $sync_type . "<br />"); ?>
        <?php echo("php chan: " . $chan . "<br />"); ?>
        <script>
            document.write("js sync type: " + sync_type + "<br />");
            document.write("js chan: " + chan + "<br />");
            document.write("js myself: " + myself + "<br />");
        </script>
    </div>
    <div class="menublock">
        <form>
            <button class="btn" type="button" onclick="syncer.startSync();">Start sync</button>
            <button class="btn" type="button" onclick="syncer.stopSync();">Stop sync</button>
        </form>
    </div>

    <div class="menublock">
        <form onsubmit="changeUsername(document.getElementById('username').value); return false;">
            <input type="text" name="username" id="username" /><br />
            <button class="btn" type="submit">change name</button>
        </form>
    </div>
</div>

<?php
    if(file_exists("stats.php")) {
        include("stats.php");
    }
?>
  
</body>
</html>

