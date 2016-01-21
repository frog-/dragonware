//Poll for existing item & Autocomplete
var poll = document.getElementById("number");
poll.addEventListener("blur", function() {
	var number = document.getElementById("number").value;
	var request = new XMLHttpRequest();
	var gets = "action=poll&number=" + number;
	request.open("GET", "updatedb.php?" + gets, "true");
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			responseObject = JSON.parse(request.responseText);
			document.getElementById("name").value = responseObject[0];
			document.getElementById("price").value = responseObject[1];
		}
	}
	request.send(null);
}, false);

//Add item to DB and read out updated DB
var button = document.getElementById("submit");
button.addEventListener("click", function() {
	var request = new XMLHttpRequest();
	var number = document.getElementById("number").value;
	var name = document.getElementById("name").value;
	var price = document.getElementById("price").value;
	if (number != "" && name != "" && price != "") {
		var gets = "action=add&number=" + number + "&name=" + name + "&price=" + price;
		request.open("GET", "updatedb.php?" + gets, "true");
		request.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				//
			}
		}
		request.send(null);
	}

	//Without the delay, it somehow receives the printout before the DB is updated
	setTimeout(displaydb,50);

}, false);

//Print out full database listing
function displaydb() {
	var request = new XMLHttpRequest();
	request.open("GET", "updatedb.php?action=print", "true");
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var dbprint = document.getElementsByClassName("jtable");
			dbprint[0].innerHTML = request.responseText;
		}
	}
	request.send(null);
}

//Display DB on initial load
displaydb();