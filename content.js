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
				console.log(productNutrition);
				console.log(totalNutrition);

				response({products: productNutrition, total: totalNutrition});
			})
		});

		return true; // wait for promises
	}
)