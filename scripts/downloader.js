/* Service worker that downloads the next image so it can be instantly shown when opening a new tab. */

const valid_extensions = ["png", "jpg", "jpeg", "webm", "gif"];

chrome.runtime.onMessage.addListener(function (arg, sender, sendResponse) {
  const async_wrapper = async (arg, sender, sendResponse) => {
    console.log("received payload");
    if (arg.type === "download") {
      chrome.downloads.download({
        url: arg.message,
        saveAs: false,
      });
    } else if (arg.type === "get_new_image") {
      let { sorting, range, time } = arg.message;

      async function tryARandomSubreddit() {
        const subreddit = await getRandomSubreddit();
        console.log("Subreddit is " + subreddit);
        const link = "https://www.reddit.com/r/" + subreddit + "/" + sorting + ".json?t=" + time + "&limit=" + range;

        try {
          const res = await fetch(link);
          const resJson = await res.json();

          console.log(link);
          console.log(resJson.data);

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
        console.log("Unsuccessful fetch 1, trying again");
        console.log(e);
        await tryARandomSubreddit().catch(async (e) => {
          console.log("Unsuccessful fetch 2, trying again");
          console.log(e);
          await tryARandomSubreddit().catch(async (e) => {
            console.log("Unsuccessful fetch 3, trying again");
            console.log(e);
          });
        });
      });
    }
  };

  async_wrapper(arg, sender, sendResponse);
});

const getRandomSubreddit = async () => {
  const { subreddits, curated_subreddits } = await chrome.storage.local.get(["subreddits", "curated_subreddits"]);
  let enabled_subreddits = {};

  for (let sub_key of Object.keys(subreddits)) {
    if (subreddits[sub_key].enabled) enabled_subreddits[sub_key] = sub_key;
  }

  for (let cat_key of Object.keys(curated_subreddits)) {
    for (let sub_key of Object.keys(curated_subreddits[cat_key])) {
      const sub = curated_subreddits[cat_key][sub_key];
      if (sub.enabled) enabled_subreddits[sub_key] = sub_key;
    }
  }

  const subcount = Object.keys(enabled_subreddits).length;
  const mean_chance = 1 / subcount;

  // TODO: faster random logic here
  if (subcount > 0) {
    while (1) {
      for (let sub in enabled_subreddits) {
        const chance = Math.random();
        if (chance < mean_chance) {
          return sub;
        }
      }
    }
  }
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
