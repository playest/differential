<?php
$db = new PDO('sqlite://'.realpath('.').'/bdd/bdd.sqlite');

// Clean
$reqClean = $db->prepare("DELETE FROM infos WHERE last_activity < :time");
$reqClean->execute(array(":time" => time() - 10));

if(isset($_GET['chan']))
{
    $chan = $_GET['chan'];
    if(isset($_GET['user']) && isset($_GET['time']) && isset($_GET['state']) && isset($_GET['source']) && isset($_GET['action']))
    {
        $user = $_GET['user'];
        $time = $_GET['time'];
        $state = $_GET['state'];
        $source = $_GET['source'];
        $action = $_GET['action'];
        
        if($state == "leaving")
        {
            $reqClean = $db->prepare("DELETE FROM infos WHERE chan=:chan AND user=:user");
            $reqClean->execute(array(":chan" => $chan, ":user"=> $user));
        }
        else
        {
            // Check if chan exists
            $reqCheck = $db->prepare("SELECT chan, user FROM infos WHERE chan=:chan AND role=:role LIMIT 1");
            $reqCheck->execute(array(":chan" => $chan, ":role" => "master"));
            $chanWithThisName = $reqCheck->fetchAll(PDO::FETCH_ASSOC);

            if(count($chanWithThisName) == 0) {
                $role = "master";
            }
            else {
                $role = "user";
            }

            // Check if user exists
            $reqCheck = $db->prepare("SELECT chan, user FROM infos WHERE chan=:chan AND user=:user LIMIT 1");
            $reqCheck->execute(array(":chan" => $chan, ":user"=> $user));
            $usersOnChan = $reqCheck->fetchAll(PDO::FETCH_ASSOC);

            // Set infos
            if(count($usersOnChan) == 0)
            {
                $reqSetInfos = $db->prepare("INSERT INTO infos (chan, user, time, last_activity, state, source, action, role) VALUES (:chan, :user, :time, :last_activity, :state, :source, :action, :role)");
                $reqSetInfos->execute(array(":chan" => $chan, ":user"=> $user, ":time" => $time, ":last_activity" => time(), ":state" => $state, ":source" => $source, ":action" => $action, ":role" => $role));
            }
            else
            {
                $reqSetInfos = $db->prepare("UPDATE infos SET time=:time, last_activity=:last_activity, state=:state, source=:source, action=:action WHERE chan=:chan AND user=:user");
                $reqSetInfos->execute(array(":chan" => $chan, ":user"=> $user, ":time" => $time, ":last_activity" => time(), ":state" => $state, ":source" => $source, ":action" => $action));
            }
        }
    }
    
    // Display
    $req = $db->prepare("SELECT chan, user, time, last_activity, state, source, action, role FROM infos WHERE chan=:chan");
    $req->execute(array(":chan" => $chan));
    $items = $req->fetchAll(PDO::FETCH_ASSOC);
}

if(isset($_GET["debug"]))
{
    echo("<pre>");
    print_r($items);
    echo("</pre>");
}
else
{
    echo json_encode($items);
}

?>
