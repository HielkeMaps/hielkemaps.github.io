// Bootstrap hack to make sure you can't scroll the page when any modal is open
$(document).on("hidden.bs.modal", function () {
  if ($(".modal.show").length) {
    $("body").addClass("modal-open");
  }
});

function toggleMobileMenu() {
  var $toggleBtn = $('[data-toggle="toggle-menu"]');
  var $navMenuCont = $($toggleBtn.data("target"));
  var isOpen = $toggleBtn.data("isopen");
  var isAnimating = $navMenuCont.is(":animated");

  if (isAnimating) {
    return;
  }

  if (isOpen) {
    closeMobileMenu();
    $toggleBtn.data("isopen", false);
  } else {
    openMobileMenu();
    $toggleBtn.data("isopen", true);
  }

  function openMobileMenu() {
    $("body").addClass("navbar-open");
    $(".hamburger").addClass("active");
    $(".navbar-collapse").css("backdrop-filter", "blur(15px)");

    $navMenuCont.css("display", "block");
    $("#mainNav").css("backdrop-filter", "none");

    let $navItems = $navMenuCont.find(".nav-item");
    $navItems.removeClass("animate__fadeOutUp").addClass("animate__fadeInDown");
    $navMenuCont.animate({ minHeight: "100vh", height: "-webkit-fill-available", opacity: "1" }, 350);
  }

  function closeMobileMenu() {
    $("body").removeClass("navbar-open");
    $(".hamburger").removeClass("active");

    let $navItems = $navMenuCont.find(".nav-item");
    $navItems.removeClass("animate__fadeInDown").addClass("animate__fadeOutUp");

    $navMenuCont
      .removeClass("slide-in")
      .delay(100)
      .animate({ height: "0vh", opacity: "0" }, 350, function () {
        $navMenuCont.css("display", "none");

        $(".navbar-collapse").css("backdrop-filter", "none");
        $("#mainNav").css("backdrop-filter", "blur(5px)");
      });
  }
}

const hideNav = new URLSearchParams(window.location.search).get("hideNav");
if (hideNav) {
  $("nav").hide();
}

$('[data-toggle="toggle-menu"]').on("click", toggleMobileMenu);

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