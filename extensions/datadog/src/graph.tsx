import { Clipboard, closeMainWindow, Toast, showToast } from "@raycast/api";
import { fetch } from "cross-fetch";
import { parse } from "node-html-parser";
import * as fs from "fs";

async function showError(message: string) {
  await showToast({ title: message, style: Toast.Style.Failure });
}

export default async function Graph() {
  // Read the current URL from the clipboard
  const url = await Clipboard.readText();
  if (!url || !url.startsWith("https://app.datadoghq.com/s/")) {
    await showError("No graph URL found in clipboard");
    return;
  }

  console.log("fetching", url);
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Fetching graph: " + url,
  });

  const response = await fetch(url);
  if (!response.ok) {
    await toast.hide();
    await showError("No URL found in clipboard");
    return;
  }

  const html = await response.text();
  const doc = parse(html);

  const graphTitle = doc.querySelector("meta[property='og:title']");
  if (graphTitle) {
    const title = graphTitle.getAttribute("content");
    if (title) {
      await Clipboard.paste("[" + title + "](" + url + ")\n");
    }
  }

  const imageMeta = doc.querySelector("meta[property='og:image']");
  if (!imageMeta) {
    await toast.hide();
    await showError("no meta tag found");
    return;
  }

  const imageURL = imageMeta.getAttribute("content");
  if (!imageURL) {
    await toast.hide();
    await showError("no og:image URL content available");
    return;
  }

  console.log("found OG image URL", imageURL);
  toast.title = "Fetching image: " + imageURL;

  const imageResponse = await fetch(imageURL);
  if (!imageResponse.ok) {
    await toast.hide();
    await showError("failed to fetch image");
    return;
  }

  const imageFile = "/tmp/" + new URL(imageURL).pathname.split("/").pop();
  fs.writeFileSync(imageFile, Buffer.from(await imageResponse.arrayBuffer()));
  console.log("wrote image file", imageFile);

  await Clipboard.paste({ file: imageFile });
  await toast.hide();
  closeMainWindow();
}
