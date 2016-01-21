<?php

require_once "login.php";

// We need an order if we're going to store it
if (!isset($_POST["order"])) {
	die("No order to store");
}

// Order comes as JSON
$order = json_decode($_POST["order"]);

/* 
 * All data is initially screened by the front-end before submission, but as 
 * extra safety in case some tricksy bugger POSTs to the server from an
 * external source, we use prepared statements
 */
// Create new Order with customer info
$query = "INSERT INTO Orders(name, address, phone, type, paid) VALUES(?,?,?,?,?)";
$stmt = $conn->prepare($query);
$stmt->bind_param(	'sssii',
					$order->customerName,
					$order->customerAddr,
					$order->customerPhone,
					$order->orderType,
					$order->paid
					);
$result = $stmt->execute();
if (!$result) die ($conn->error);
$stmt->close();

/*
 * Store all items associated with the Order
 */
// Grab the OID of the current order
$query = "SELECT MAX(oid) FROM Orders";
$result = $conn->query($query);
if (!$result) die ($conn->error);
$oid = $result->fetch_array()[0];

// Store each Item object in Order_items
$query = "INSERT INTO Order_items(oid, number, quantity, price) VALUES(?,?,?,?)";
$stmt = $conn->prepare($query);
$stmt->bind_param('iiii', $oid, $number, $quantity, $price);

foreach ($order->items as $item) {
	$number = $item->number;
	$quantity = $item->quantity;
	$price = $item->price;

	$result = $stmt->execute();
	if (!$result) die($conn->error);
}

// Tidy up
$stmt->close();
$conn->close();