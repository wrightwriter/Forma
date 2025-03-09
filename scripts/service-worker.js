/*
 * Service worker that preloads the next image so it can be instantly shown when opening a new tab.
 * It also handles the user request to download the shown image to file system.
 */

const valid_extensions = ["png", "jpg", "jpeg", "webm", "gif"];

chrome.runtime.onMessage.addListener(async function (arg) {
  if (arg.type === "download") {
    chrome.downloads.download({
      url: arg.message,
      saveAs: false,
    });
  } else if (arg.type === "get_new_image") {
    let { sorting, range, time } = arg.message;

    async function tryARandomSubreddit() {
      const subreddit = await getRandomSubreddit();
      const link = "https://www.reddit.com/r/" + subreddit + "/" + sorting + ".json?t=" + time + "&limit=" + range;

      try {
        const res = await fetch(link);
        const resJson = await res.json();
        const choices = resJson.data.children //shuffle array
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
        for (let i = 0; i < choices.length; i++) {
          const selectedImage = choices[i].data;
          const img_url = URL.parse(selectedImage.url);
          if (valid_extensions.some((ext) => img_url.pathname.endsWith(ext))) {
            const response = await fetch(img_url.href + "?" + new Date().getTime());
            if (!response.ok) {
              console.error(response);
              continue; //try another choice from the same subreddit
            }
            const blob = await response.blob();
            await storeBlob(blob);
            chrome.storage.local.set({
              title_name: selectedImage.title,
              sub_name: subreddit,
              reddit_href: selectedImage.permalink,
            });
            break;
          }
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    }

    // Try 3 different subreddits
    await tryARandomSubreddit().catch(async (e) => {
      console.error("Unsuccessful fetch 1, trying again", e);
      await tryARandomSubreddit().catch(async (e) => {
        console.error("Unsuccessful fetch 2, trying again", e);
        await tryARandomSubreddit().catch(async (e) => {
          console.error("Unsuccessful fetch 3", e);
        });
      });
    });
  }
});

/**
 * Get a random subreddit name from the user's enabled subreddits.
 * @returns {Promise<string>} Promise that resolves with a subreddit name.
 */
const getRandomSubreddit = async () => {
  const { subreddits, curated_subreddits } = await chrome.storage.local.get(["subreddits", "curated_subreddits"]);
  //collect enabled subreddits
  const enabled_subreddits = Object.values(curated_subreddits)
    .flatMap((cat) => Object.entries(cat))
    .filter(([_, sub]) => sub.enabled)
    .map(([sub_key, _]) => sub_key)
    .concat(Object.keys(subreddits).filter((sub) => subreddits[sub].enabled));
  //sample 1 evenly from enabled subreddits
  const random_sub = enabled_subreddits[Math.floor(Math.random() * enabled_subreddits.length)];
  return random_sub;
};

/**
 * Store a blob in "forma" indexedDB, "nextImageBlob" store, "blob" key, overwriting the existing record.
 * @param {Blob} blob The binary image data to be stored.
 * @returns {Promise<void>} Resolves when the blob is stored in indexedDB.
 */
async function storeBlob(blob) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("forma", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("nextImageBlob")) {
        db.createObjectStore("nextImageBlob");
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("nextImageBlob", "readwrite");
      const store = tx.objectStore("nextImageBlob");

      store.put(blob, "blob");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}
