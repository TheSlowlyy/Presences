let elapsed = Math.floor(Date.now() / 1000),
	oldLang = "en",
	prevUrl = document.location.href;

const presence = new Presence({
		clientId: "951488835718635600",
	}),
	getStrings = async () => {
		return presence.getStrings(
			{
				playing: "general.playing",
				paused: "general.paused",
				live: "general.live",
				viewHome: "general.viewHome",
				viewProfile: "general.viewProfile",
				buttonViewProfile: "general.buttonViewProfile",
				browsing: "general.browsing",
				watchingLive: "general.watchingLive",
				watchingVid: "general.watchingVid",
				viewCategory: "general.viewCategory",
				viewTheir: "twitch.viewTheir",
				followList: "twitch.followList",
				dashboardManage: "twitch.dashboardManage",
				subs: "twitch.subs",
				browsingVideos: "youtube.browsingVideos",
				ofChannel: "youtube.ofChannel",
				searchFor: "general.searchFor",
				searchSomething: "general.searchSomething",
				search: "general.search",
				buttonWatchStream: "general.buttonWatchStream",
				buttonWatchVideo: "general.buttonWatchVideo",
			},
			oldLang
		);
	};

let strings: Awaited<ReturnType<typeof getStrings>>;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: "logo",
			startTimestamp: elapsed,
		},
		[
			showTimestamps,
			newLang,
			privacy,
			vidDetail,
			vidState,
			streamDetail,
			streamState,
			profilePic,
			buttons,
		] = await Promise.all([
			presence.getSetting<boolean>("timestamp"),
			presence.getSetting<string>("lang").catch(() => "en"),
			presence.getSetting<boolean>("privacy"),
			presence.getSetting<string>("vidDetail"),
			presence.getSetting<string>("vidState"),
			presence.getSetting<string>("streamDetail"),
			presence.getSetting<string>("streamState"),
			presence.getSetting<boolean>("profilePic"),
			presence.getSetting<boolean>("buttons"),
		]),
		{ pathname, search, href } = document.location,
		title = document
			.querySelector<HTMLSpanElement>(
				":is(#movie_title_content, .tw-player-page__title-editor-value)"
			)
			?.innerText.split("\n")[0],
		channelName =
			document.querySelector<HTMLSpanElement>(".tw-user-nav-name")?.textContent,
		game =
			document.querySelector<HTMLAnchorElement>(".category-label")?.textContent;

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	if (href !== prevUrl) {
		prevUrl = href;
		elapsed = Math.floor(Date.now() / 1000);
	}

	if (new URLSearchParams(search).has("genre")) {
		presenceData.smallImageKey = "reading";
		presenceData.smallImageText = strings.browsing;
		presenceData.details = strings.viewCategory;
		if (!privacy) {
			presenceData.state = document.querySelector<HTMLAnchorElement>(
				"[aria-selected='true']"
			).textContent;
		}
	} else if (pathname === "/") presenceData.details = strings.viewHome;
	else if (pathname.includes("/search")) {
		if (privacy) presenceData.details = strings.searchSomething;
		else {
			presenceData.details = strings.searchFor;
			presenceData.state = document
				.querySelector<HTMLHeadingElement>("h2")
				.textContent.split(":")[1]
				.trim();
		}
		presenceData.smallImageKey = "search";
		presenceData.smallImageText = strings.search;
	} else if (pathname.includes("/broadcaster"))
		presenceData.details = strings.dashboardManage;
	else if (document.querySelector<HTMLDivElement>(".tw-user-nav-user")) {
		if (profilePic) {
			presenceData.largeImageKey = document
				.querySelector<HTMLImageElement>(".tw-user-nav-icon > img")
				.src.replace("_bigger", "");
		}
		if (
			pathname.split("/").length === 2 &&
			!document.querySelector<HTMLSpanElement>("[data-status='offline']")
		) {
			if (privacy) presenceData.details = strings.watchingLive;
			else {
				presenceData.details = streamDetail
					.replace("%title%", title)
					.replace("%streamer%", channelName)
					.replace("%game%", game);
				presenceData.state = streamState
					.replace("%title%", title)
					.replace("%streamer%", channelName)
					.replace("%game%", game);
				presenceData.buttons = [
					{ label: strings.buttonWatchStream, url: document.URL },
				];
			}
			presenceData.smallImageKey = "live";
			presenceData.smallImageText = strings.live;
		} else if (pathname.includes("/movie")) {
			if (privacy) presenceData.details = strings.watchingVid;
			else {
				presenceData.details = vidDetail
					.replace("%title%", title)
					.replace("%uploader%", channelName)
					.replace("%game%", game);
				presenceData.state = vidState
					.replace("%title%", title)
					.replace("%uploader%", channelName)
					.replace("%game%", game);
				const { duration, currentTime, paused } =
					document.querySelector<HTMLVideoElement>("video");

				delete presenceData.startTimestamp;

				if (!paused) {
					presenceData.endTimestamp =
						Date.now() / 1000 + duration - currentTime;
				}

				presenceData.smallImageKey = paused ? "pause" : "play";
				presenceData.smallImageText = paused ? strings.paused : strings.playing;
				presenceData.buttons = [
					{ label: strings.buttonWatchVideo, url: document.URL },
				];
			}
		} else if (pathname.includes("/show") && !privacy) {
			presenceData.details = strings.browsingVideos;
			presenceData.state = `${strings.ofChannel} ${channelName}`;
			presenceData.buttons = [
				{ label: strings.buttonViewProfile, url: document.URL },
			];
		} else if (!privacy) {
			presenceData.details = strings.viewProfile;
			presenceData.state = channelName;
			presenceData.buttons = [
				{ label: strings.buttonViewProfile, url: document.URL },
			];
		}
	} else if (pathname.includes("/notifyindex" || "/membership"))
		presenceData.details = strings.subs;
	else if (pathname.includes("/mybacks")) {
		presenceData.details = strings.viewTheir;
		presenceData.state = strings.followList;
	}
	if (!showTimestamps) {
		delete presenceData.startTimestamp;
		delete presenceData.endTimestamp;
	}
	if (!buttons) delete presenceData.buttons;

	presence.setActivity(presenceData);
});
