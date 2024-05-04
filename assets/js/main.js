// Bootstrap hack to make sure you can't scroll the page when any modal is open
$(document).on("hidden.bs.modal", function () {
  if ($(".modal.show").length) {
    $("body").addClass("modal-open");
  }
});

// Comments reaction particles :)
let jsConfetti = new JSConfetti();
const comments = document.querySelector("hyvor-talk-comments");
if (comments) {
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