const presence = new Presence({
		clientId: "630478614894477337",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

let title: string;

async function getStrings() {
	return presence.getStrings(
		{
			editingDoc: "google docs.editingDoc",
			viewingDoc: "google docs.viewingDoc",
			browsingDoc: "google docs.browsingDoc",
			editingForm: "google docs.editingForm",
			viewingForm: "google docs.viewingForm",
			browsingForm: "google docs.browsingForm",
			editingSheet: "google docs.editingSheet",
			viewingSheet: "google docs.viewingSheet",
			browsingSheet: "google docs.browsingSheet",
			editingPresentation: "google docs.editingPresentation",
			browsingPresentation: "google docs.browsingPresentation",
			vieiwngPresentation: "google docs.viewingPresentation",
		},
		await presence.getSetting<string>("lang").catch(() => "en")
	);
}

let strings: Awaited<ReturnType<typeof getStrings>>,
	oldLang: string = null;

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			startTimestamp: browsingTimestamp,
		},
		privacy = await presence.getSetting<boolean>("privacy"),
		newLang = await presence.getSetting<string>("lang").catch(() => "en");

	if (oldLang !== newLang || !strings) {
		oldLang = newLang;
		strings = await getStrings();
	}

	title = document.title
		.replace("- Google Docs", "")
		.replace("- Google Forms", "")
		.replace("- Google Sheets", "")
		.replace("- Google Slides", "");

	if (document.location.pathname.includes("/document")) {
		presenceData.largeImageKey = "docslogo";
		if (document.location.pathname.includes("/edit"))
			presenceData.details = (await strings).editingDoc;
		else if (document.location.pathname.includes("/document/u/"))
			presenceData.details = (await strings).browsingDoc;
		else presenceData.details = (await strings).viewingDoc;
	} else if (document.location.pathname.includes("/forms/")) {
		presenceData.largeImageKey = "formslogo";
		if (document.location.pathname.includes("/edit"))
			presenceData.details = (await strings).editingForm;
		else if (document.location.pathname.includes("/forms/u/"))
			presenceData.details = (await strings).browsingForm;
		else presenceData.details = (await strings).viewingForm;
	} else if (document.location.pathname.includes("/spreadsheets")) {
		presenceData.largeImageKey = "sheetslogo";
		if (document.location.pathname.includes("/edit"))
			presenceData.details = (await strings).editingSheet;
		else if (document.location.pathname.includes("/spreadsheets/u/"))
			presenceData.details = (await strings).browsingSheet;
		else presenceData.details = (await strings).viewingSheet;
	} else if (document.location.pathname.includes("/presentation/")) {
		presenceData.largeImageKey = "slideslogo";
		if (document.location.pathname.includes("/edit"))
			presenceData.details = (await strings).editingPresentation;
		else if (document.location.pathname.includes("/presentation/u/"))
			presenceData.details = (await strings).browsingPresentation;
		else presenceData.details = (await strings).vieiwngPresentation;
	}

	if (!privacy) presenceData.state = title;

	if (presenceData.details) presence.setActivity(presenceData);
	else presence.setActivity();
});