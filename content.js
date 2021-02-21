console.log("Content injected.");

chrome.runtime.onMessage.addListener(
	function (message, sender, response) {
		var loading = document.getElementsByClassName("load-app");
		if (loading.length != 0)
			return null;

		console.log(message);
		console.log(message.type);

		switch (message.type) {
			case 'order':
				var table = [];
				var items = document.getElementsByClassName("item-name");
				for (item of items) {
					table.push(item.innerText);
				}
				response(table);
				break
			case 'cart':
				var items = document.getElementsByClassName("side-cart-content");
				break
			case 'side-cart':
				var items = document.getElementsByClassName("side-cart-content");
				response(null);
				break
			default:
				console.log("Unknown message received.");
				response(null);
				break
		}
	}
)