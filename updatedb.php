<?php

require_once "login.php";

if (isset($_GET["number"])) {
	$number = $_GET["number"];
}

if (isset($_GET["name"])) {
	$name = $_GET["name"];
}

if (isset($_GET["price"])) {
	$price = $_GET["price"];
}

if (isset($_GET["action"])) {
	$action = $_GET["action"];

	switch ($action) {
		case "add":
			//Check if this is an update or add operation
			$query = "SELECT * FROM Menu WHERE number='$number'";
			$result = $conn->query($query);
			if (!$result) die ($conn->error);

			if ($result->num_rows == 0) { //Add new row
				$query = "INSERT INTO Menu VALUES('$number','$name','$price')";
				$result = $conn->query($query);
				if (!$result) die ($conn->error);
			} else { //Modify old row
				$query = "UPDATE Menu SET name='$name', price='$price' WHERE number='$number'";
				$result = $conn->query($query);
				if (!$result) die ($conn->error);
			}
			break;

		case "poll":
			$query = "SELECT * FROM Menu WHERE number='$number'";
			$result = $conn->query($query);
			if (!$result) die ($conn->error);
			if ($result->num_rows != 0) {
				$result->data_seek(0);
				$row = $result->fetch_assoc();
				$giveValues = array($row["name"], $row["price"]);
			} else {
				$giveValues = array("", "");
			}
			echo json_encode($giveValues);		
			break;

		case "print":
			$query = "SELECT * FROM Menu";
			$result = $conn->query($query);
			if (!$result) die ($conn->error);

			$rows = $result->num_rows;
			for ($i = 0; $i < $rows; $i++) {
				$result->data_seek($i);
				$row = $result->fetch_assoc();
				echo "<tr><td>";
				echo $row["number"];
				echo "</td><td>";
				echo $row["name"];
				echo "</td><td>";
				echo $row["price"];
				echo "</td>\n";
			}
			break;

		case "namecheck":
			$query = "SELECT * FROM Orders WHERE name='$name' AND complete='0'";
			$result = $conn->query($query);
			if (!$result) die ($conn->error);
			echo $result->num_rows == 0;
	}
}

$conn->close();
?>