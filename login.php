<?php

$conn = new mysqli("localhost",
					"root",
					"root",
					"China");
if ($conn->connect_error) die ($conn->connect_error);

?>