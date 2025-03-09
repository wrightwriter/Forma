(async () => {
  await import(chrome.runtime.getURL("scripts/utils.js"));
})();

import {
  toggleCuratedSubreddit,
  toggleSubreddit,
  removeSubreddit,
  addSubreddit,
  fetchAndSanitizeLocalStorage,
  addStyleString,
  getKeyFromValue,
  appendUserSubreddit,
  setUpEventHandlersForDropDownMenus,
  setUpEventHandlersForBottomMenuFadeOut,
} from "./utils.js";

let _delay = () => {};

window.onload = async (res) => {
  document.querySelector(".settings-button").onclick = () => {
    showSettings();
  };

  let { sorting, range, time } = await fetchAndSanitizeLocalStorage();

  setUpEventHandlersForDropDownMenus(sorting, range, time);

  setUpEventHandlersForBottomMenuFadeOut(_delay);

  chrome.storage.local.get(null, async (data) => {
    let { title_name, sub_name, reddit_href } = data;

    const blob = await getBlob();

    if (blob) {
      const img_src = URL.createObjectURL(blob);
      const style = `
                      .loaded {
                        width: 100%;
                        height:  100%;
                        background: url("${img_src}") no-repeat center center fixed;
                        background-size: contain;
                        background-color: black;
                        position: absolute;
                        opacity: 1;
                        transition: opacity 100ms linear;
                        animation: fadeIn 0.5s linear;
                      }
                      `;

      addStyleString(style);

      const container = document.querySelector(".loading");
      container.classList.remove("loading");
      container.classList.add("loaded");

      document.querySelector(".name").innerHTML = title_name;
      document.querySelector(".sub").innerHTML = sub_name;

      document.querySelector(".image-title .name").setAttribute("href", "https://reddit.com" + reddit_href);

      document.querySelector(".image-title .sub").setAttribute("href", "https://reddit.com/r/" + sub_name);

      document.querySelector(".download-button").href = img_src;
      document.querySelector(".download-button").onclick = (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({ type: "download", message: img_src }); // send to service-worker.js
      };
      chrome.runtime.sendMessage({
        type: "get_new_image",
        message: {
          sorting: sorting,
          range: range,
          time: time,
        },
      }); // send to service-worker.js
    } else {
      console.warn("Couldn't get image from indexedDB, retrying...");
      const message = {
        type: "get_new_image",
        message: {
          sorting: sorting,
          range: range,
          time: time,
        },
      };
      chrome.runtime.sendMessage(message); // send to service-worker.js
    }
  });
};

const showSettings = async () => {
  const settings_window_wrapper = document.querySelector(".settings-window-wrapper");

  settings_window_wrapper.classList.remove("invisible");
  settings_window_wrapper.classList.add("visible");

  document.querySelector(".settings-window-exit-button").onclick = () => {
    const settings = document.querySelector(".settings-window");
    while (settings.lastChild && settings.childElementCount > 2) {
      settings.removeChild(settings.lastChild);
    }
    document.querySelector(".settings-window-wrapper").classList.remove("visible");
    document.querySelector(".settings-window-wrapper").classList.add("invisible");
  };

  let { subreddits, curated_subreddits } = await fetchAndSanitizeLocalStorage();
  // document.querySelector(".dropdown-sort>button").innerHTML = sorting

  document.querySelector(".add-subreddit input").addEventListener("keyup", async (event) => {
    if (event.key == "Enter") {
      const subname = event.target.value;
      subreddits = await addSubreddit(subname);
      appendUserSubreddit(subname, subreddits);
      document.querySelector(".add-subreddit input").value = "";
    }
  });

  // -------------------------------- Display Subreddits -------------------------------- //
  // user subreddits
  Object.keys(subreddits).map((key, idx) => {
    const subreddit = document.createElement("div");
    subreddit.classList.add("subreddit");

    subreddit.innerHTML =
      `<div class="pretty p-default">
                    <input type="checkbox" name="nature" ` +
      (subreddits[key].enabled ? "checked" : "") +
      `>
                    <div class="state"> <label>` +
      getKeyFromValue(subreddits, subreddits[key]) +
      `</label></div>
                  </div>
                  <div class="delete-button"></div>`;
    subreddit.querySelector(".pretty").children[0].onclick = () => {
      toggleSubreddit(key);
    };
    subreddit.children[1].onclick = () => {
      removeSubreddit(key);
      subreddit.parentElement.removeChild(subreddit);
    };
    document.querySelector(".settings-window").appendChild(subreddit);
  });

  // curated subreddits
  Object.keys(curated_subreddits).map((cat, idx1) => {
    const title = document.createElement("div");
    document.querySelector(".settings-window").appendChild(title);
    title.classList.add("title");
    title.innerHTML = getKeyFromValue(curated_subreddits, curated_subreddits[cat]);
    Object.keys(curated_subreddits[cat]).map((subname, idx2) => {
      const subreddit = document.createElement("div");
      subreddit.classList.add("subreddit");
      subreddit.classList.add("pretty");
      subreddit.classList.add("p-default");
      subreddit.innerHTML =
        `
                    <input type="checkbox" name="nature" ` +
        (curated_subreddits[cat][subname].enabled ? "checked" : "") +
        `>
                    <div class="state"> <label>` +
        getKeyFromValue(curated_subreddits[cat], curated_subreddits[cat][subname]) +
        `</label></div>
        `;
      subreddit.children[0].onclick = () => {
        toggleCuratedSubreddit(cat, subname);
      };
      document.querySelector(".settings-window").appendChild(subreddit);
    });
  });
};

/**
 * Retrieves a Blob object from "forma" indexedDB, "nextImageBlob" store, "blob" key.
 * @returns {Promise<Blob>} Promise that resolves to a Blob object or null if not found.
 */
async function getBlob() {
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
      if (!db.objectStoreNames.contains("nextImageBlob")) {
        return resolve(null); // First time running the extension, no image has been fetched yet
      }

      const tx = db.transaction("nextImageBlob", "readonly");
      const store = tx.objectStore("nextImageBlob");

      const getRequest = store.get("blob");
      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}
