const presence = new Presence({
		clientId: "767140375785111562",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);
let currentTime: number, duration: number, paused: boolean;

presence.on(
	"iFrameData",
	(data: {
		iframevideo: boolean;
		currentTime: number;
		duration: number;
		paused: boolean;
	}) => {
		if (data.iframevideo === true) ({ currentTime, duration, paused } = data);
	}
);

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "lolesports",
			startTimestamp: browsingTimestamp,
		},
		path = document.location.pathname;

	if (path === "/") presenceData.details = "Browsing...";
	else if (path.includes("/news"))
		presenceData.details = "Viewing the latest news";
	else if (path.includes("/schedule"))
		presenceData.details = "Browsing the schedule";
	else if (path.includes("/live/")) {
		presenceData.details = "Watching Live";
		presenceData.state = document
			.querySelector("div.teams")
			.textContent.replace("VS", " vs ");
		presenceData.smallImageKey = "live";
	} else if (path.includes("/article/")) {
		presenceData.details = "Reading news article:";
		presenceData.state = document.querySelector("div.title").textContent;
		presenceData.smallImageKey = "reading";
	} else if (path.includes("/vods/")) {
		presenceData.details = "VODS";
		presenceData.state = "Looking at past matches";
	} else if (path.includes("/vod/")) {
		[presenceData.startTimestamp, presenceData.endTimestamp] =
			presence.getTimestamps(Math.floor(currentTime), Math.floor(duration));
		presenceData.smallImageKey = paused ? "pause" : "play";
		if (paused) {
			delete presenceData.startTimestamp;
			delete presenceData.endTimestamp;
		}
		presenceData.details = "Watching a replay";
		presenceData.state = `${document
			.querySelector("div.teams")
			.textContent.replace("VS", " vs ")} - Game ${
			document.querySelector(".game.selected").textContent
		}`;
	} else if (path.includes("/standings/"))
		presenceData.details = "Looking at the standings";

	presenceData.buttons = [
		{
			label: "Watch Broadcast",
			url: document.URL,
		},
	];
	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});