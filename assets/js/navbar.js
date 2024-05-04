$(document).scroll(function () {
  let $nav = $(".navbar");
  $nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
});

let mobileNav;
let isOpen = false;
let isAnimating = false;
let toggleBtn = $('[data-toggle="toggle-menu"]');
mobileNav = $(toggleBtn.data("target"));

function toggleMobileMenu() {
  isAnimating = mobileNav.is(":animated");
  if (isAnimating) return;

  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

function openMobileMenu() {
  isOpen = true;
  $("body").addClass("navbar-open");
  $(".hamburger").addClass("active");
  $(".navbar-collapse").css("backdrop-filter", "blur(15px)");

  mobileNav.css("display", "block");
  $("#mainNav").css("backdrop-filter", "none");

  let navItems = mobileNav.find(".nav-item");
  navItems.removeClass("animate__fadeOutUp").addClass("animate__fadeInDown");
  mobileNav.animate({ height: "100vh", opacity: "1" }, 350);
}

function closeMobileMenu() {
  isOpen = false;
  $("body").removeClass("navbar-open");
  $(".hamburger").removeClass("active");

  let navItems = mobileNav.find(".nav-item");
  navItems.removeClass("animate__fadeInDown").addClass("animate__fadeOutUp");

  mobileNav
    .delay(150)
    .animate({ height: "0vh", opacity: "0" }, 350, function () {
      mobileNav.css("display", "");
      mobileNav.css("opacity", "");
      mobileNav.css("height", "");
      mobileNav.css("backdrop-filter", "none");
      navItems.removeClass("animate__fadeOutUp");

      $("#mainNav").css("backdrop-filter", "blur(5px)");
    });
}

window.addEventListener("resize", () => {
  if (window.innerWidth >= 992 && isOpen) {
    closeMobileMenu();
  }
});

const hideNav = new URLSearchParams(window.location.search).get("hideNav");
if (hideNav) {
  $("nav").hide();
}

$('[data-toggle="toggle-menu"]').on("click", toggleMobileMenu);
