var player;

function onYouTubeIframeAPIReady() {
  console.log("iFrame ready!!!!");
  player = new YT.Player("player");
}

$(function () {
  const dateStr = $('#countdownDate').data("countdown-date");
  const countDownDate = new Date(new Date(dateStr).toLocaleString("en-US", {timeZone: "UTC",}));
  const countdownOverlay = $("#countdownOverlay");
  const countdownText = $("#countdownText");

  const hypeBtn = $("#hypeBtn");
  const hypeCounter = $("#hypeCount");

  const now = new Date().getTime();
  const distance = countDownDate - now;
  if (distance > 0) {
    countdownOverlay.css("display", "flex");
    console.log("Show countdown!");
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

    // If the count down is finished, write some text
    if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
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
      url: "https://count.cab/get/EgNI92tn6q",
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
  }, 5000);

  function updateHype() {
    hypeCounter.html(hypeCount);
    hypeCounter.css("transform", "scale(1.5)");
    setTimeout(function () {
      hypeCounter.css("transform", "scale(1)");
    }, 100);
  }

  hypeBtn.on("click", function () {
    $.ajax({
      url: "https://count.cab/hit/EgNI92tn6q",
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

customElements.whenDefined("hyvor-talk-comments").then(() => {
  const comments = document.querySelector("hyvor-talk-comments");
  comments.settings = {
    top_widget: "none",
    voting: {
      type: "up", // 'both' | 'up' | 'down'
      voters: false, // show voters list
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
