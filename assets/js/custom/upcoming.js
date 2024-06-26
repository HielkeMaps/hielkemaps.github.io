var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player");
}

$(function () {
  let countDownDate;
  const dateString = $("#JSdata").data("countdown-date");
  const isReveal = $("#JSdata").data("is-reveal");

  if (dateString) {
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split("-");
    const [hour, minute, second] = timePart.split(":");
    countDownDate = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second)
    );
  }

  const countdownOverlay = $("#countdownOverlay");
  const countdownText = $("#countdownText");

  const hypeBtn = $("#hypeBtn");
  const hypeCounter = $("#hypeCount");

  const now = new Date().getTime();
  const timeDiff = countDownDate - now;

  const oneMinute = 60 * 1000;

  // Show youtube comments until about 1 minutes after reveal started
  if (isReveal && timeDiff > -oneMinute) {
    $(".hyvor-comments").remove();
    $(".youtube-comments").show();
  }

  if (timeDiff > 0) {
    countdownOverlay.css("display", "flex");
  }

  function updateCountDown() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    let countdownString = "";
    if (days > 0) {
      countdownString += days + "d ";
    }
    if (hours > 0) {
      countdownString += hours + "h ";
    }
    if (minutes > 0) {
      countdownString += minutes + "m ";
    }
    countdownString += seconds + "s ";
    countdownText.html(countdownString);

    // Show video when less than 0
    if (timeDiff < 0) {
      clearInterval(countdown);
      countdownOverlay.fadeOut(1500);
      player.unMute();
    }
  }

  let countdown = setInterval(() => {
    updateCountDown();
  }, 1000);
  updateCountDown();

  let hypeCount = 0;

  function getHype() {
    $.ajax({
      url: "https://api.hielkemaps.com/counter/get",
      dataType: "json",
      success: function (response) {
        if (response.count > hypeCount) {
          hypeCount = response.count;
          updateHype();
        }
      },
    });
  }
  getHype();

  setInterval(() => {
    getHype();
  }, 1000);

  function updateHype() {
    hypeCounter.html(hypeCount);
    hypeCounter.css("transform", "scale(1.5)");
    setTimeout(function () {
      hypeCounter.css("transform", "scale(1)");
    }, 100);
  }

  hypeBtn.on("click", function () {
    $.ajax({
      url: "https://api.hielkemaps.com/counter/increase",
      dataType: "json",
    });
    hypeCount++;
    updateHype();
    jsConfetti.addConfetti();
  });

  function updateCommentsHeight() {
    //Only set comments height if on the side
    let targetHeight = "undefined";
    if (window.innerWidth >= 1200) {
      targetHeight =
        document.getElementById("comments-container").offsetHeight - 180;
    }
    document
      .querySelector(":root")
      .style.setProperty("--hyvor-comments-height", targetHeight + "px");
  }

  window.addEventListener("resize", updateCommentsHeight);
  updateCommentsHeight();
});

const isIframe = new URLSearchParams(window.location.search).get("iframe");
if (isIframe) {
  $("#comments-container").remove();
  $(".upcoming").css("padding", "0");

  document.querySelector("footer").style = "display: none";
  document.body.style.overflow = "hidden";
  document.body.style.backgroundColor = "transparent";
} else {
  //Not iframe, show comments
  customElements.whenDefined("hyvor-talk-comments").then(() => {
    const comments = document.querySelector("hyvor-talk-comments");
    comments.settings = {
      top_widget: "none",
      voting: {
        type: "up", 
        voters: false, 
      },
      comments_view: {
        is_keyboard_navigation_on: true,
        nested_levels: 1, 
      },
      realtime: {
        on: true, // enable realtime updates
        count: true, // show online count
        users: true, // show online users list
        typing: "on_with_typer", // show if someone is typing = 'off' | 'on_without_typer' | 'on_with_typer'
      },
      editor: {
        emoji: true,
        images: false,
        gifs: false,
        embeds: true, // link embedding
        mentions: true,
        code_blocks: false,
        blockquotes: false,
        inline_styles: true, // bold, italic, inline code, strike, spoiler
        links: false,
      },
    };
    comments.load();
  });
}
