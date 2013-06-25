<!DOCTYPE html>
<html>
<head>
    <title>&#8706;ifferential</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="bootstrap.css"  media="screen" charset="utf-8" />
    <link rel="stylesheet" type="text/css" href="differential.css"  media="screen" charset="utf-8" />
</head>
<body>

<div class="container-fluid alone">
    <div class="row-fluid">
        <div class="well span6 offset3">
            <h1 class="pull-left alone">&#8706;</h1>
            Here you can watch videos (from youtube, vimeo, even from your computer) with your friends. The website will synchronize the time between videos. If the video is paused it will be paused for all the others viewers.<br />
            Create a channel an give the <a href="https://en.wikipedia.org/wiki/URL">URL</a> (what's in the adress bar) to your friends. Then, start playing :)
        </div>
    </div>
    <div class="row-fluid">
        <div class="create_chan span4 offset4">
            <h2>Create a channel</h2>
            <form method="get" action="sync.php">
                <input class="span12" type="text" name="chan" placeholder="Channel's name" />
                <label class="checkbox">
                    <input type="checkbox" name="sync_type" value="everyone" /> Sync with everyone (unstable)
                </label>
                <div class="span12 text-center">
                    <button class="btn btn-primary" type="submit">Go</button>
                </div>
            <form>
        </div>
    </div>
    <div class="row-fluid">
        <div class="join_chan span4 offset4">
            <h2>Or join one</h2>
        <?php
            $db = new PDO('sqlite://'.realpath('.').'/bdd/bdd.sqlite');
            $req = $db->prepare("SELECT DISTINCT(chan) FROM infos");
            $req->execute();
            $chans = $req->fetchAll(PDO::FETCH_ASSOC);
            foreach($chans as $chan) {
                echo('<a href="sync.php?chan='.$chan["chan"].'">#'.$chan["chan"].'</a><br />');
            }
        ?>
        </div>
    </div>
    <div class="alone">
        <span class="label">version 0.1</span>
    </div>
</div>

</body>
</html>
