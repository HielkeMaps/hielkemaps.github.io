// Bootstrap hack to make sure you can't scroll the page when any modal is open
$(document).on("hidden.bs.modal", function () {
  if ($(".modal.show").length) {
    $("body").addClass("modal-open");
  }
});

// Fancybox lightbox
if (typeof Fancybox !== 'undefined') {
  Fancybox.bind("[data-fancybox]", {
    wheel: "slide",
    Thumbs: {
      type: "classic",
    },
    Toolbar: {
      display: {
        left: ["close"],
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
    },
  });
}

// Comments reaction particles :)
let jsConfetti = new JSConfetti();
const comments = document.querySelector("hyvor-talk-comments");
if (comments) {

  const urlParams = new URLSearchParams(window.location.search);
  comments.addEventListener("loaded", () => {
    if (urlParams.has("comments")) {
      setTimeout(() => {
        comments.scrollIntoView({ behavior: "smooth" });
      }, 1);
    }
  });

  comments.addEventListener("reaction", function (e) {
    switch (e.detail.type) {
      case "superb":
        jsConfetti.addConfetti({
          emojis: ["🔥"],
        });
        break;
      case "love":
        jsConfetti.addConfetti({
          emojis: ["❤️"],
        });
        break;
      case "wow":
        jsConfetti.addConfetti({
          emojis: ["😲"],
        });
        break;
      case "sad":
        jsConfetti.addConfetti({
          emojis: ["😢"],
        });
        break;
      case "laugh":
        jsConfetti.addConfetti({
          emojis: ["😂"],
        });
        break;
    }
  });
}