<?php

$db = new PDO('sqlite://'.realpath('.').'/bdd/bdd.sqlite');

// Clean
$reqClean = $db->prepare("DELETE FROM infos");
$reqClean->execute();