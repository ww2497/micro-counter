console.log("Content injected.");

function query_product(product) {
	return new Promise ((resolve, reject) => {
		var URL = `https://api.wegmans.io/products/search?query=${product}&api-version=2018-10-18&subscription-key=${API_KEY}`;
		var req = new XMLHttpRequest();
		req.open("GET", URL);
		req.onload = () => resolve(req.responseText);
		req.onerror = () => reject(this.status);
		req.send();
	});
}

chrome.runtime.onMessage.addListener(
	function (message, sender, response) {
		console.log(message.type);

		var loading = document.getElementsByClassName("load-app");
		if (loading.length != 0) {
			response("Please wait for the page to load before running the extension.");
			return
		}

		var table = [];
		switch (message.type) {
			case 'order':
				var products = document.getElementsByClassName("item-name");
				for (product of products)
					table.push(product.innerText);
				break
			case 'cart':
			case 'side-cart':
				var products = document.getElementsByClassName("name");
				for (product of products)
					if (product.innerText != "")
						table.push(product.innerText);
				break
			default:
				response("Unknown error.");
				break
		}

		var promises = [];
		for (product of table)
			promises.push(query_product(product));

		response(Promise.all(promises).then((values) => {
			console.log(values);
		}));
		return
	}
)