<?php

require_once "login.php";

/*
 * Validate arguments. OID is the only field that gets sent
 * to the DB--make sure it's a number
 */
if (!isset($_GET["changetype"], $_GET["oid"]) && is_numeric($_GET["oid"])) {
	die("Error");
}

// Look up order info for verification before editing
$oid = $_GET["oid"];
$query = "SELECT * FROM Orders WHERE oid='$oid'";
$result = $conn->query($query);
if (!$result) die ($conn->error);

// Did we find any matching orders?
if ($result->num_rows > 0) {
	$info = $result->fetch_assoc();
} else {
	die ("Order does not exist.");
}

// Is the order still open?
if ($info["complete"] > 0) {
	die ("Order is already complete.");
}

// Prepare query based on action type
switch ($_GET["changetype"]) {
	case "paid":
		$paid = ($info["paid"] == 0) ? 1 : 0;
		$query = "UPDATE Orders SET paid=$paid WHERE oid=$oid";
		break;
	case "complete":
		if ($info["paid"] == 0) die ("Cannot complete order until paid");
		$query = "UPDATE Orders SET complete='1' WHERE oid=$oid";
		break;
	case "cancel":
		$query = "UPDATE Orders SET complete='2' WHERE oid=$oid";
		break;
	default:
		die ("Invalid option");
		break;
}

// Send off query; report any errors
if ($conn->query($query) == false) {
	echo "Error updating paid status." . $conn->error;
}

// Tidy up
$result->close();
$conn->close();