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