<?php

require_once "login.php";

if (isset($_GET["findopen"])) {
	$query = "SELECT * FROM Orders WHERE complete = '0' ORDER BY time";
	$result = $conn->query($query);
	if (!$result) die($conn->error);

	$rows = $result->num_rows;

	if (!$rows) {
		echo "<tr><td colspan='3'><em>No open orders</em></td></tr>";
	} else {
		for ($i = 0; $i < $rows; $i++) {
			$result->data_seek($i);
			$tuple = $result->fetch_assoc();

			echo "<tr><td>";
			$time = strtotime($tuple["time"]);
			echo date("h:i", $time);
			echo "</td><td>";
			
			$paid = ($tuple["paid"] == 0) ? "<span class='notpaid'><strong>NOT PAID</strong></span>"
										 : "<span class='paid'>Paid</span>";
			echo $paid;
			echo "</td><td>";
			echo $tuple["name"];
			echo "<input class='oid' type='hidden' value='" . $tuple["oid"] . "'>";
			echo "</td></tr>";
		}
	}
}

if (isset($_GET["manage"])) {
	/* Poll for matching order */
	$oid = $_GET["oid"];
	$query = "SELECT * FROM Orders WHERE oid='$oid'";
	$result = $conn->query($query);
	if (!$result) die ($conn->error);

	/* Pull out relevant customer info */
	$info = $result->fetch_assoc();
	$name = $info["name"];
	$phone = $info["phone"];
	$type = $info["type"];
	$addr = $info["address"];

	/* Make order type human readable */
	switch ($type) {
		case 0: 
			$type = "Pickup (phone)";
			$addr = "No address given";
			break;
		case 1: 
			$type = "Pickup (walk in)";
			$addr = "No address given";
			break;
		case 2: 
			$type = "Delivery";
			break;
	}

	/* Return the info organized as the table body */
	echo <<<_END
<tr>
	<td id="customerName">$name</td>
	<td id="customerNumber">$phone</td>
</tr>
<tr>
	<td id="orderType">$type</td>
	<td id="customerAddr">$addr</td>
</tr>
<tr>
	<td colspan='2' id="edit-button">
		<button class="btn btn-warning pull-right">Update customer info</button>
	</td>
</tr>
_END;
}