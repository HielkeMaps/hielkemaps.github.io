$(function () {
	$('[data-toggle="tooltip"]').tooltip()

	//Remove commento text
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

$(document).on('click', '[data-toggle="lightbox"]', function (event) {
	event.preventDefault();
	$(this).ekkoLightbox();
});

//bootstrap hack to make sure you can't scroll the page when any modal is open
$(document).on('hidden.bs.modal', function () {
	if ($('.modal.show').length) {
		$('body').addClass('modal-open');
	}
});

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