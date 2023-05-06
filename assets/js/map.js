// Fancybox lightbox
Fancybox.bind("[data-fancybox]", {
	wheel: "slide",
	Thumbs: {
		type: "classic",
	},
	Toolbar: {
		display: {
			left: ['close'],
			middle: [],
			right: [],
		},
	},
	Images: {
		initialSize: "fit",
	},

	Carousel: {
		transition: "classic",
		friction: 0,
	}
});

// Remove commento text
$(function () {

	const observer = new MutationObserver(function (mutationsList) {
		for (let mutation of mutationsList) {
			if (mutation.type === 'childList') {
				const element = document.querySelector(".commento-logo-text");
				if (element) {
					element.remove();
					observer.disconnect();
				}
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });
})