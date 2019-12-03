var presence = new Presence({
  clientId: "639107568672702484",
  mediaKeys: false
}),
strings = presence.getStrings({
  play: "presence.playback.playing"
});
var browsingStamp = Math.floor(Date.now()/1000);
let dj, listeners, artist, track;
setInterval(newStats, 1000);
newStats();
function newStats() {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          let data = JSON.parse(this.responseText);
          track = data.song;
          artist = data.artist;
          listeners = data.listeners;
          dj = data.dj;
        }
    };
    xhttp.open('GET', 'https://truckstopradio.co.uk/assets/php/premid.php', true);
    xhttp.send();
}
presence.on("UpdateData", async () => {
  let presenceData: presenceData = {
    largeImageKey: "tsr"
  };
  if (document.querySelector('.fa.fa-pause') !== null) {
    presenceData.details = artist + " - " + track;
    presenceData.state = "DJ: " + dj + " / Listeners: " + listeners;
    presenceData.smallImageKey = "play";
    presenceData.smallImageText = (await strings).play;
  } else if (document.location.pathname.includes("/team")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Viewing the staff team"; 
  } else if (document.location.pathname.includes("/schedule")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Viewing the schedule";
  } else if (document.location.pathname.includes("/request")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Requesting a song";
  } else if (document.location.pathname.includes("/apply")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Applying for staff";
    presenceData.smallImageKey = "writing";
  } else if (document.location.pathname.includes("/about")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Reading about TSR";
    presenceData.smallImageKey = "reading";
  } else if (document.location.pathname.includes("/contact")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Contacting TSR";
    presenceData.smallImageKey = "writing";
  } else if (document.location.pathname.includes("/news/")) {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Reading article:";
    presenceData.state = document.querySelector('.section_title').textContent;
    presenceData.smallImageKey = "reading";
  } else if (document.location.pathname == "/") {
    presenceData.startTimestamp = browsingStamp;
    presenceData.details = "Browsing...";
  }

  if (presenceData.details == null) {
    presence.setTrayTitle();
    presence.setActivity();
  } else {
    presence.setActivity(presenceData);
  }

});