(async () => {
  let src2 = chrome.extension.getURL('scripts/utils.js');
  let contentScript2 = await import(src2);
})();

// import {default_curated_subreddits, default_subreddits} from "./subreddits"
import {lS,toggleCuratedSubreddit,toggleSubreddit,removeSubreddit, addSubreddit,fetchAndSanitizeLocalStorage, addStyleString, getKeyFromValue, appendUserSubreddit, setUpEventHandlersForDropDownMenus} from "./utils.js"

const valid_extensions = ["png", "jpg", "webm", "gif"]


window.onload = res => {

  document.querySelector(".settings-button").onclick = () => {
    showSettings()
  }
  
  // --------------------------- fetching ------------------------------ //
  
  const {subreddits, curated_subreddits, sorting, range, time} = fetchAndSanitizeLocalStorage()
  
  setUpEventHandlersForDropDownMenus(sorting,range,time);

  const subreddit = getSubreddit();

  console.log("Subreddit is " + subreddit)

  const link = "https://www.reddit.com/r/" + subreddit + "/" + sorting + ".json?t=" + time + "&limit=" + range

  const max_unsuccessful_fetches = 1
  let fetch_attempts_cnt = 0

  do {
    fetch_attempts_cnt++
    fetch(link, {
      method: "get",
    })
      .then(res => {
        return res.json()
      })
      .then(res => {
        console.log(link)
        console.log(res)
        // successful_fetch = true
        let img_src
        let ext
        let is_extension_valid
        do {
          const idx = Math.floor(Math.random() * range)
          img_src = res.data.children[idx].data.url
          const title = res.data.children[idx].data.title
          const reddit_href = res.data.children[idx].data.permalink
          const url_split = img_src.split(".")
          ext = url_split[url_split.length - 1]
          console.log(ext)
          is_extension_valid = valid_extensions.includes(ext)

          if (is_extension_valid) {
            const img = new Image()
            img.onload = () => {
              const ratio = img.width / img.height
              const style =
                `
                            .loaded {
                                opacity: 100;
                                background: url("${img.src}")  no-repeat center center fixed;
                                background-size: ` +
                (ratio > 1.1 ? "cover" : "contain") +
                `;
                                background-color: black;
                                transition: opacity 200ms linear;
                            } 
                            `
              addStyleString(style)
              document.querySelector("body").classList.remove("loading")
              document.querySelector("body").classList.add("loaded")
              document.querySelector(".name").innerHTML = title
              document.querySelector(".sub").innerHTML = subreddit
              document
                .querySelector(".image-title .name")
                .setAttribute("href", "https://reddit.com/" + reddit_href)
              document
                .querySelector(".image-title .sub")
                .setAttribute("href", "https://reddit.com/r/" + subreddit)
              document
                .querySelector(".download-button")
                .setAttribute("href", img_src)
              document
                .querySelector(".download-button")
                .setAttribute("download", `arttab.jpg`)
              document
                .querySelector(".download-button")
                .setAttribute("download", ``)
            }
            img.src = img_src
            is_extension_valid = true
            // display: flex;
          }
        } while (!is_extension_valid)
        // } while (0)
      })
      .catch(err => {
        console.log(err)
      })
  } while (
    // 0
    fetch_attempts_cnt < max_unsuccessful_fetches
    // ( successful_fetch === false )
  )
}

const getSubreddit = () => {
  const subreddits = lS.getObjectItem("subreddits")
  const curated_subreddits = lS.getObjectItem("curated_subreddits")

  let enabled_subreddits = {};

  for (let sub_key of Object.keys(subreddits)){
    if (subreddits[sub_key].enabled) enabled_subreddits[sub_key] = sub_key
  }

  for (let cat_key of Object.keys(curated_subreddits)){
    for (let sub_key of Object.keys(curated_subreddits[cat_key])){
      const sub = curated_subreddits[cat_key][sub_key]
      if (sub.enabled) enabled_subreddits[sub_key] = sub_key
    }
  }

  const subcount = Object.keys(enabled_subreddits).length
  const desired_idx = Math.floor(0.999 * Math.random() *  subcount )
  const mean_chance = 1/subcount
  let subreddit = ""
  
  if (subcount > 0){
    while (1){
      for (let sub in enabled_subreddits){
        const chance = Math.random() 
        if (chance < mean_chance){
          return sub
        }
      }
    }
  }
}

const showSettings = () => {


    document.querySelector(".settings-window-wrapper") .classList.remove("invisible")
    document.querySelector(".settings-window-wrapper").classList.add("visible")

    document.querySelector(".settings-window-exit-button").onclick = () => {
      
      const settings = document.querySelector(".settings-window")
      while(settings.lastChild && settings.childElementCount > 2){
        settings.removeChild(settings.lastChild)
      }
      document .querySelector(".settings-window-wrapper") .classList.remove("visible")
      document.querySelector(".settings-window-wrapper").classList.add("invisible")
    }

    let { subreddits, curated_subreddits, sorting, range, time} = fetchAndSanitizeLocalStorage()
    document.querySelector(".dropdown-sort>button").innerHTML = sorting
    
    document.querySelector(".add-subreddit input").addEventListener("keyup", (event) => {
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
      // subreddit.classList.add("pretty")
      // subreddit.classList.add("p-default")
      subreddit.innerHTML =
                `<div class="pretty p-default">
                    <input type="checkbox" name="nature" ` + (subreddits[key].enabled ? "checked" : "") + `>
                    <div class="state"> <label>`+ getKeyFromValue(subreddits, subreddits[key]) + `</label></div>
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
        title.innerHTML = getKeyFromValue(curated_subreddits, curated_subreddits[cat])
      Object.keys(curated_subreddits[cat]).map((subname, idx2)=>{
        const subreddit = document.createElement("div")
        subreddit.classList.add("subreddit")
        subreddit.classList.add("pretty")
        subreddit.classList.add("p-default")
        subreddit.innerHTML =
          `
                    <input type="checkbox" name="nature" ` +
          (curated_subreddits[cat][subname].enabled ? "checked" : "") +
          `>
                    <div class="state"> <label>`+ getKeyFromValue(curated_subreddits[cat], curated_subreddits[cat][subname]) + `</label></div>
        `
        subreddit.children[0].onclick = () => {
          toggleCuratedSubreddit(cat,subname)
        }
        document.querySelector(".settings-window").appendChild(subreddit)
      })
    })
    
}


