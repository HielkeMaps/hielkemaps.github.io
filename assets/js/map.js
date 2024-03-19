// Fancybox lightbox
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

const downloadLink = document.querySelector(".java-download-btn");

downloadLink.addEventListener("click", function (event) {
  $("#downloadModal").modal("hide");

  if (this.href) {
    window.location.href = this.href; //Open download link. We need to do this again because the modal toggle overrides it by default.
  }
});

$(function () {
  const observer = new MutationObserver(function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        const element = document.querySelector("[eo-block='powered-by']");
        if (element) {
          element.remove();
          observer.disconnect();
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
