// Create 'new row' button
$('#plusbut').on('click', addRow);

// Create 'drop all' button
$('#dropall').on('click', clearAll());

// Create 'complete order' button
$('#createorder').on('click', function(e) {
	// Check if the order was paid or not
	var paid = (e.target.name == "payprint");

	completeOrder(paid);
	populateOrders();
});

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

//Create a row for a new item
function addRow() {
	// Add to table
	var $newRow = $('<tr class="itemRow"></tr>');
	$('#item-list').append($newRow);

	// Add the quantity, item number, name, price fields and clear button
	$newRow.append('<td><input type="text" size="3" class="quantity"></td>');
	$newRow.append('<td><input type="text" size="3" class="number"></td>');
	$newRow.append('<td><input type="text" size="25" class="name"></td>');
	$newRow.append('<td><input type="text" size="4" class="price" readonly></td>');
	$newRow.append('<td><button class="drop-btn delete">&nbsp;X&nbsp;</button></td>');

	// If quantity is changed, update the price
	$newRow.find('.quantity').on('blur', function(e) {
		lookup(e);
		setTimeout(tabulateAll, 100);
	});

	// If an item number is entered, find it in the DB
	$newRow.find('.number').on('blur', function(e) {
		lookup(e);
		setTimeout(tabulateAll, 100);
	});

	// Update price 
	$newRow.find('.price').on('input', function(e) {
		alert(e.target.value);
	});

	// Delete row if the clear button is hit
	$newRow.find('.delete').on('click', function(e) {
		e.target.closest('tr').remove();
	});
}

// Autocomplete item name and price, adjusting for quantity
function lookup(e) {
	var $row = $(e.target).parent().parent().children();
	var gets = "action=poll&number=" + $row.children('.number').val();

	$.getJSON("updatedb.php", gets)
		.done(function(data) {
			// Write out the item name
			$row.children('.name').val(data[0]);

			// Update the price, multiply by quantity if necessary
			var quantity = $row.children('.quantity').val();
			$row.children('.price').val((data[1] * (quantity || 1)).toFixed(2));
		});
}

// Tabulate the cost of order
function tabulateAll() {
	var run = 0;
	$('.price').each(function() {
		run += parseFloat($(this).val());
	});

	$('#totalPrice').text('$' + (run.toFixed(2) || 0.00));
}

// Complete the currently open order
function completeOrder(paid) {
	/*
	 * Guarantee customer name is supplied and that it is not a duplicate
	 */
	var cname = $('#customerName').val();

	if (cname == '') {
		alert("Missing customer name!");
		return;
	}

	$.get('updatedb.php?action=namecheck&name=' + cname, function(data) {
		if (data != '1') {
			alert("An order is open with that name already.");
			return;
		}
	});

	var thisOrder = new Order();

	// Create Item objects from valid rows
	$('.itemRow').each(function() {
		if ($(this).find('.number').val() != '') {
			var thisItem = new Item();

			thisItem.number = $(this).find('.number').val();
			thisItem.quantity = $(this).find('.quantity').val();
			thisItem.price = $(this).find('.price').val();

			thisOrder.items.push(thisItem);

			thisOrder.price += parseFloat(thisItem.price);
		}
	});

	// If it was an empty order, don't even bother
	if (!thisOrder.items[0]) {
		return;
	}

	// Adjust final order price
	thisOrder.price.toFixed(2);

	// Grab customer information
	thisOrder.customerName = $('#customerName').val();
	thisOrder.customerAddr = $('#customerAddr').val();
	thisOrder.customerPhone = $('#customerPhone').val();
	thisOrder.orderType = $('#orderType').val();
	thisOrder.paid = paid;

	// Persist order in DB
	var data = 'order=' + JSON.stringify(thisOrder);
	$.post('neworder.php', data, function(result) {
		alert(result);
	});

	// Clean up for next order
	clearAll();
	$('#customerName').val('');
	$('#customerPhone').val('');
	$('#customerAddr').val('');
	$('#orderType').options[0].selected = true;
}

// Populate the order list
function populateOrders() {
	// Query for all open orders
	$orders = $('#order-list');
	$orders.load('poll.php?findopen=true');

	// After loading, make each row clickable
	setTimeout(function() {
		$orders.children().each(function() {
			$(this).on('click', function(e) {
				// When clicked, bring up the "manage" screen for that order
				manage($(e.target).closest('tr').find('.oid').val());
			});
		});
	}, 100);
}

// Clear the current order
function clearAll() {
	$('#item-list tr').each(function() {
		$(this).remove();
	});

	$('#totalPrice').text("$0.00");
}

// Start new order
function newOrder() {
	$('#manage').load('neworder.html');
}

// Manage orders
function manage(oid) {
	$('#manage').load('manageorder.html');
	setTimeout(function() {
		$('#manage-table tbody').load("poll.php?manage=true&oid=" + oid);
		$('#manage-table').attr('order', oid);
	}, 10);
}