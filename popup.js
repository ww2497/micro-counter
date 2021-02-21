chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	var currTab = tabs[0];
	var url = currTab.url;
	var id = currTab.id

	if (url.includes("https://shop.wegmans.com/account/order-history/order/"))
		chrome.tabs.sendMessage(id, {type: "order"}, updatePopup);
	else if (url.includes("https://shop.wegmans.com/checkout/v2/cart"))
		chrome.tabs.sendMessage(id, {type: "cart"}, updatePopup);
	else
		chrome.tabs.sendMessage(id, {type: "side-cart"}, updatePopup);

})

function updatePopup(result) {
	document.body.innerHTML = result;
}