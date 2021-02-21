console.log("Content injected.");

const SEARCH_PRODUCT_URL = (product) => `https://api.wegmans.io/products/search?query=${product}&api-version=2018-10-18&subscription-key=${API_KEY}`;
const PRODUCT_INFO_URL = (sku) => `https://api.wegmans.io/products/${sku}?api-version=2018-10-18&subscription-key=${API_KEY}`;

function callApi(url) {
	return new Promise ((resolve, reject) => {
		var req = new XMLHttpRequest();
		req.open("GET", url);
		req.onload = () => resolve(req.responseText);
		req.onerror = () => reject(this.status);
		req.send();
	});
}

chrome.runtime.onMessage.addListener(
	function (message, sender, response) {
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
			promises.push(callApi(SEARCH_PRODUCT_URL(product)));

		Promise.all(promises).then((values) => {
			var skuPromises = [];
			for (query of values) {
				var query_data = JSON.parse(query);
				var first_match = query_data.results[0];
				var sku = first_match.sku;
				skuPromises.push(callApi(PRODUCT_INFO_URL(sku)));
			}

			Promise.all(skuPromises).then((values) => {
				var productNutrition = {};
				var totalNutrition = {};
				for (product of values) {
					var nutritionValues = {};
					var product_data = JSON.parse(product);
					var nutrients = product_data.nutrients;
					for (nutrient of nutrients) {
						nutritionValues[nutrient.type] = nutrient.dailyValuePercent;
						if (!(nutrient.type in totalNutrition))
							totalNutrition[nutrient.type] = nutrient.dailyValuePercent;
						else
							totalNutrition[nutrient.type] = totalNutrition[nutrient.type] + nutrient.dailyValuePercent;
					}
					productNutrition[product_data.name] = nutritionValues;
				}

				var table = document.createElement("table");

				// create table head
				var head = document.createElement("thead");
				table.appendChild(head);

				var headRow = document.createElement("tr");
				head.appendChild(headRow);

				var headerCell = document.createElement("th");
				headerCell.innerHTML = "Product"
				headRow.append(headerCell);

				for (nutrient in totalNutrition) {
					var headerCell = document.createElement("th");
					headerCell.innerHTML = nutrient;
					headRow.appendChild(headerCell);
				}

				// create table body
				var body = document.createElement("tbody");
				table.append(body);

				for (productName in productNutrition) {
					var product = productNutrition[productName];

					var bodyRow = document.createElement("tr");
					body.append(bodyRow);

					var bodyCell = document.createElement("td");
					bodyCell.innerHTML = productName;
					bodyRow.append(bodyCell);

					for (nutrient in totalNutrition) {
						var bodyCell = document.createElement("td");
						if (nutrient in product)
							bodyCell.innerHTML = product[nutrient];
						bodyRow.append(bodyCell);
					}
				}

				// create table footer
				var footer = document.createElement("tfoot");
				table.append(footer);

				// empty first cell
				var bodyRow = headRow.cloneNode(true);
				bodyRow.childNodes[0].innerHTML = "";
				footer.append(bodyRow);

				var bodyRow = document.createElement("tr");
				footer.append(bodyRow);

				var bodyCell = document.createElement("td");
				bodyCell.innerHTML = "Total";
				bodyRow.append(bodyCell);

				for (nutrient in totalNutrition) {
					var bodyCell = document.createElement("td");
					bodyCell.innerHTML = totalNutrition[nutrient].toFixed(2);
					bodyRow.append(bodyCell);
				}

				console.log(table);
				response(table.outerHTML);
			})
		});

		return true; // wait for promises
	}
)