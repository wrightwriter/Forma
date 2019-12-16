;(async () => {
  await import(chrome.extension.getURL("scripts/utils.js"))
})()

import {
  lS,
  toggleCuratedSubreddit,
  toggleSubreddit,
  removeSubreddit,
  addSubreddit,
  fetchAndSanitizeLocalStorage,
  addStyleString,
  getKeyFromValue,
  appendUserSubreddit,
  setUpEventHandlersForDropDownMenus,
  deleteUserSettings,
  default_curated_subreddits,
  setUpEventHandlersForBottomMenuFadeOut,
} from "./utils.js"


let mouse_delay = 5
let _delay = () => {}


window.onload = async res => {

  document.querySelector(".settings-button").onclick = () => {
    showSettings()
  }

  let {
    subreddits,
    curated_subreddits,
    sorting,
    range,
    time,
  } = fetchAndSanitizeLocalStorage()

  setUpEventHandlersForDropDownMenus(sorting, range, time)

  setUpEventHandlersForBottomMenuFadeOut(_delay)

    chrome.storage.local.get(null, (data) => {
      let  { title_name, sub_name, img_src, reddit_href, ratio, width, height} = data
      const img_in = data.Image 
      const img = new Image()

      if (width && height && ratio){
        width = JSON.parse(width)
        height = JSON.parse(height)
        ratio = JSON.parse(ratio)
      }

      if (img_in) {

        img.src = img_in.replace(/(\r\n|\n|\r)/gm, "")


        const style =
          `
                      .loaded {
                        width: 100%;
                        height:  100%;
                        background-size: cover ;
                        background: url("${img.src}")  no-repeat center center fixed;
                        background-size: ` + ( (width < window.innerWidth && height < window.innerHeight) ? "auto" :  (ratio > 1.1) ? "cover" : "contain") + `;
                        background-color: black;
                        position: absolute;
                        opacity: 1;
                        transition: opacity 100ms linear;
                        animation: fadeIn 0.5s linear;
                      }
                      `

        addStyleString(style)

        const container = document.querySelector(".loading")
        container.classList.remove("loading")
        container.classList.add("loaded")


        document.querySelector(".name").innerHTML = title_name
        document.querySelector(".sub").innerHTML = sub_name

        document
          .querySelector(".image-title .name")
          .setAttribute("href", "https://reddit.com/" + reddit_href)

        document
          .querySelector(".image-title .sub")
          .setAttribute("href", "https://reddit.com/r/" + sub_name)

        document.querySelector(".download-button").href = img_src
        document.querySelector(".download-button").onclick = e => {
          e.preventDefault()
          chrome.runtime.sendMessage({type:"download", message:img_src}) // send to downloader.js
        }
        chrome.runtime.sendMessage({type:"get_new_image", 
        message:{
          sorting: sorting,
          range: range,
          time: time,
        }}) // send to downloader.js

      } else {
        // Couldn't fetch an image
        const message = 
          {type:"get_new_image", 
            message:{
              sorting: sorting,
              range: range,
              time: time,
        }}
        chrome.runtime.sendMessage(
          message
        ) // send to downloader.js
      }

    });
  

}

const showSettings = () => {
  const settings_window_wrapper = document.querySelector(
    ".settings-window-wrapper"
  )

  settings_window_wrapper.classList.remove("invisible")
  settings_window_wrapper.classList.add("visible")

  document.querySelector(".settings-window-exit-button").onclick = () => {
    const settings = document.querySelector(".settings-window")
    while (settings.lastChild && settings.childElementCount > 2) {
      settings.removeChild(settings.lastChild)
    }
    document
      .querySelector(".settings-window-wrapper")
      .classList.remove("visible")
    document
      .querySelector(".settings-window-wrapper")
      .classList.add("invisible")
  }

  let {
    subreddits,
    curated_subreddits,
    sorting,
    range,
    time,
  } = fetchAndSanitizeLocalStorage()
  // document.querySelector(".dropdown-sort>button").innerHTML = sorting

  document
    .querySelector(".add-subreddit input")
    .addEventListener("keyup", event => {
      if (event.key == "Enter") {
        const subname = event.target.value
        addSubreddit(subname)
        subreddits = lS.getObjectItem("subreddits")
        appendUserSubreddit(subname, subreddits)
        document.querySelector(".add-subreddit input").value = ""
      }
    })

  // -------------------------------- Display Subreddits -------------------------------- //
  // user subreddits
  Object.keys(subreddits).map((key, idx) => {
    const subreddit = document.createElement("div")
    subreddit.classList.add("subreddit")

    subreddit.innerHTML =
      `<div class="pretty p-default">
                    <input type="checkbox" name="nature" ` +
      (subreddits[key].enabled ? "checked" : "") +
      `>
                    <div class="state"> <label>` +
      getKeyFromValue(subreddits, subreddits[key]) +
      `</label></div>
                  </div>
                  <div class="delete-button"></div>`
    subreddit.querySelector(".pretty").children[0].onclick = () => {
      toggleSubreddit(key)
    }
    subreddit.children[1].onclick = () => {
      removeSubreddit(key)
      subreddit.parentElement.removeChild(subreddit)
    }
    document.querySelector(".settings-window").appendChild(subreddit)
  })

  // curated subreddits
  Object.keys(curated_subreddits).map((cat, idx1) => {
    const title = document.createElement("div")
    document.querySelector(".settings-window").appendChild(title)
    title.classList.add("title")
    title.innerHTML = getKeyFromValue(
      curated_subreddits,
      curated_subreddits[cat]
    )
    Object.keys(curated_subreddits[cat]).map((subname, idx2) => {
      const subreddit = document.createElement("div")
      subreddit.classList.add("subreddit")
      subreddit.classList.add("pretty")
      subreddit.classList.add("p-default")
      subreddit.innerHTML =
        `
                    <input type="checkbox" name="nature" ` +
        (curated_subreddits[cat][subname].enabled ? "checked" : "") +
        `>
                    <div class="state"> <label>` +
        getKeyFromValue(
          curated_subreddits[cat],
          curated_subreddits[cat][subname]
        ) +
        `</label></div>
        `
      subreddit.children[0].onclick = () => {
        toggleCuratedSubreddit(cat, subname)
      }
      document.querySelector(".settings-window").appendChild(subreddit)
    })
  })
}
