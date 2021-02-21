console.log("Content injected.");

chrome.runtime.onMessage.addListener(
	function (message, sender, response) {
		console.log(message.type);

		var loading = document.getElementsByClassName("load-app");
		if (loading.length != 0) {
			console.log("Wait for loading!");
			response(null);
			return
		}

		var table = [];
		switch (message.type) {
			case 'order':
				var items = document.getElementsByClassName("item-name");
				for (item of items)
					table.push(item.innerText);
				break
			case 'cart':
			case 'side-cart':
				var items = document.getElementsByClassName("name");
				for (item of items)
					if (item.innerText != "")
						table.push(item.innerText);
				break
			default:
				console.log("Unknown message received.");
				break
		}
		console.log(table);
		response(table);
	}
)