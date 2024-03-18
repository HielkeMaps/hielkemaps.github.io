$(function () {

	const observer = new MutationObserver(function (mutationsList) {
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				const element = document.querySelector(".newsletter-section .inner");
				if (element) {
					element.remove();
					observer.disconnect();
				}
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
})