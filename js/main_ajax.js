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