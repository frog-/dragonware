//On page load, populate the order list and 
//prepare for a new order.
var activerows = 0;
addRow();
populateOrders();

//New item constructor
function Item() {
	this.number = 0;
	this.quantity = 1;
	this.price = 0;

	this.findPrice = function() {
		return Number(this.quantity * this.price).toFixed(2);
	}
}

//New order constructor
function Order() {
	this.items = [];
	this.price = 0;
	this.customerName = "";
	this.customerAddr = "";
	this.customerPhone = "";
	this.orderType = "";
	this.timestamp = "";
	this.paid = false;
}

//Create 'new row' button
var plusbutton = document.getElementById("plusbut");
plusbutton.addEventListener("click", addRow, false);

//Create 'complete order' button
var createorder = document.getElementById("createorder");
createorder.addEventListener("click", function(e) {
	//Two cases: pay and complete, or just complete
	if (e.target.name == "payprint") {
		var newOrder = completeOrder(true);

		if (newOrder) {
			populateOrders();
		}
	}

	if (e.target.name =="print") {
		var newOrder = completeOrder(false);

		if (newOrder) {
			populateOrders();
		}
	}
}, false);

//Create 'drop all' button
var dropall = document.getElementById("drop0");
dropall.addEventListener("click", function(e) {
	for (i = 0; i < activerows; i++) {
		deleteRow(i);
		document.getElementById("totalPrice").textContent = "$0.00";
	}
}, false);

//Create a row for a new item
function addRow() {
	var table = document.getElementById("item-list");
	var newRow = document.createElement('tr');
	var newAttr = "";
	var rowNum = activerows;

	//Create unique name for each row
	newAttr = "row" + rowNum;
	newRow.setAttribute("id", newAttr);

	//Identify item rows as separate
	newRow.setAttribute("class", "itemRow");

	//Specify the row number for easy access
	newRow.setAttribute("rowNum", rowNum);

	function addCell(cellContent) {
		var newCell = document.createElement('td');	
		newCell.innerHTML = cellContent;
		newRow.appendChild(newCell);
	}

	//Add QUANTITY field
	addCell("<input id='quantity" + rowNum + "' type='text' size='3'>");
	//Add ITEM NUMBER field
	addCell("<input id='number" + rowNum + "' type='text' size='3'>");
	//Add ITEM NAME field
	addCell("<input type='text' size='25'>");
	//Add PRICE field
	addCell("<input id='price" + rowNum + "' class='price' type='text' size='4' readonly>");
	//Add DROP BUTTON
	addCell("<button name='" + rowNum + "' class='drop-btn'>&nbsp;X&nbsp;</button>");

	newRow.addEventListener("click", function(e) {
		deleteRow(e.target.name) 
	}, false);

	table.appendChild(newRow);

	var poll = document.getElementById("number" + rowNum);
	poll.addEventListener("blur", function(e) {
		lookup(e);
		setTimeout(tabulateAll, 100);
	}, false);

	var tab = document.getElementById("quantity" + rowNum);
	tab.addEventListener("blur", function(e) {
		if (e.target.value < 1 || isNaN(e.target.value)) {
			e.target.value = "";
		}
		tabulateItem(e);
		setTimeout(tabulateAll, 100);
	}, false);

	var cost = document.getElementById("price" + rowNum);
	cost.addEventListener("input", function(e) {
		alert(e.target.value);
	}, false);

	activerows++;
}

//Remove an item from the order
function deleteRow(targetName) {
	targetRow = "row" + targetName;
	var removeElement = document.getElementById(targetRow);
	if (removeElement != null) {
		var containingElement = removeElement.parentNode;
		containingElement.removeChild(removeElement);
	}
}

//Poll for existing item & Autocomplete
function lookup(e) {
	var number = e.target.value;
	var request = new XMLHttpRequest();
	var gets = "action=poll&number=" + number;
	request.open("GET", "updatedb.php?" + gets, "true");
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			responseObject = JSON.parse(request.responseText);
			var field = e.target.parentNode.nextSibling;
			field.firstChild.value = responseObject[0];
			var quantity = e.target.parentNode.parentNode.firstChild.firstChild.value
			if (quantity != "") {
				field.nextSibling.firstChild.value = (responseObject[1] * quantity).toFixed(2);
			} else {
				field.nextSibling.firstChild.value = responseObject[1];
			}

		}
	}
	request.send(null);
}

//Tabulate cost of item
function tabulateItem(e) {
	var quantity = (e.target.value == "") ? 1 : e.target.value;
	var number = e.target.parentNode.nextSibling.firstChild.value;
	var request = new XMLHttpRequest();
	var gets = "action=poll&number=" + number;
	request.open("GET", "updatedb.php?" + gets, "true");
	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			responseObject = JSON.parse(request.responseText);
			var priceField = e.target.parentNode.parentNode.lastChild.previousSibling;
			priceField.firstChild.value = (quantity * responseObject[1]).toFixed(2);
		}
	}
	request.send(null);
}

//Tabulate cost of order
function tabulateAll() {
	var priceList = document.getElementsByClassName("price");
	var orderPrice = document.getElementById("totalPrice");
	
	var run = 0;
	for (i = 0; i < priceList.length; i++) {
		run += parseFloat(priceList[i].value);
	}

	if (isNaN(run)) {
		run = 0;
	}

	orderPrice.textContent = "$" + run.toFixed(2);
}

//Complete an order
function completeOrder(paid) {
	var thisOrder = new Order();

	var allItems = document.getElementsByClassName("itemRow");

	for (i = 0; i < allItems.length; i++) {
		var rowNum = allItems[i].getAttribute("rowNum");

		if (document.getElementById("number" + rowNum).value != "") {
			var thisItem = new Item();

			thisItem.number = document.getElementById("number" + rowNum).value;
			thisItem.quantity = document.getElementById("quantity" + rowNum).value;
			thisItem.price = document.getElementById("price" + rowNum).value;
			thisOrder.items[i] = thisItem;

			thisOrder.price += parseFloat(thisItem.price);
		}
	}

	thisOrder.price.toFixed(2);

	//If it was an empty order, don't even bother
	if (!thisOrder.items[0]) {
		return null;
	}

	thisOrder.customerName = document.getElementById("customerName").value;
	thisOrder.customerAddr = document.getElementById("customerAddr").value;
	thisOrder.customerPhone = document.getElementById("customerPhone").value;
	thisOrder.orderType = document.getElementById("orderType").value;
	
	thisOrder.paid = paid;


	//Persist order in DB
	var job = JSON.stringify(thisOrder);

	var request = new XMLHttpRequest();
	request.open("POST", "persist.php", "true");
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	request.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			// alert(request.responseText);
		}
	}
	request.send("order=" + job);


	//Clean up for next order
	for (i = 0; i < activerows; i++) {
		deleteRow(i);
		document.getElementById("totalPrice").textContent = "$0.00";
	}

	document.getElementById("customerName").value = 
	document.getElementById("customerPhone").value =
	document.getElementById("customerAddr").value =	"";
	document.getElementById("orderType").options[0].selected = true;

	activerows = 0;

	return thisOrder;
}

//Populate the order list
function populateOrders() {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "persist.php?findopen=true", "true");
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var orderTable = document.getElementById("order-list");
			orderTable.innerHTML = xhr.responseText;
		}
	}
	xhr.send(null);
}