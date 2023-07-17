const tooltipElement = document.querySelector('[data-bs-toggle="tooltip"]');
let bsTooltip = new bootstrap.Tooltip(tooltipElement);

let timeoutId;

async function copyText(element) {
  const text = "play.hielkemaps.com";
  navigator.clipboard.writeText(text);

  tooltipElement.title = "Address copied!";
  bsTooltip.hide();
  bsTooltip = new bootstrap.Tooltip(tooltipElement);
  bsTooltip.show();

  clearTimeout(timeoutId); // Clear the previous timeout

  timeoutId = setTimeout(function () {
    tooltipElement.title = "Click to copy";

    bsTooltip.hide();
    bsTooltip = new bootstrap.Tooltip(tooltipElement);

    if (element.matches(":hover")) {
      bsTooltip.show();
    }
  }, 2000);
}

async function getServerStatus() {
  try {
    const response = await fetch(
      "https://api.mcstatus.io/v2/status/java/play.hielkemaps.com"
    );
    const data = await response.json();

    const serverStatusElement = document.getElementById("server-status");
    serverStatusElement.classList.add("fade-in");

    if (data.online) {
      serverStatusElement.innerHTML = `
          <span>
          <span class="online">Online</span><br>
            ${data.players.online} players online<br>
            ${data.version.name_html}
          </span>
        `;
    } else {
      serverStatusElement.innerHTML = `
          <span class="offline">Offline</span>
        `;
    }
  } catch (error) {
    console.log("Error:", error);
  }
}

// Call the function to fetch the server status
getServerStatus();