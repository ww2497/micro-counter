chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	var url = tabs[0].url;
	if (url.includes("https://shop.wegmans.com/account/order-history/order/")) {
		chrome.tabs.sendMessage(tabs[0].id, {type: "order"}, updatePopup);
	} else if (url.includes("https://shop.wegmans.com/checkout/v2/cart")) {
		chrome.tabs.sendMessage(tabs[0].id, {type: "cart"}, updatePopup);
	} else {
		chrome.tabs.sendMessage(tabs[0].id, {type: "side-cart"}, updatePopup);
	}
})

function updatePopup(input) {
	console.log(input);
}