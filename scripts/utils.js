export const default_subreddits = {
  creativecoding: {
    enabled: false,
  },
}

export const curated_subreddits_art = {
  ArtPorn: {
    enabled: false,
  },
  Art: {
    enabled: false,
  },
  ColorizedHistory: {
    enabled: false,
  },
  SculpturePorn: {
    enabled: true,
  },
  museum: {
    enabled: false,
  },
  Heavymind: {
    enabled: true,
  },
  glitch_art: {
    enabled: false,
  },
  generative: {
    enabled: false,
  },
  pixelsorting: {
    enabled: false,
  },
  nocontextpics: {
    enabled: false,
  },
  creativecoding: {
    enabled: true,
  },
  FractalPorn: {
    enabled: true,
  },
}

export const curated_subreddits_imaginary = {
  ImaginarySkyscapes: {
    enabled: true,
  },
  ImaginaryColorscapes: {
    enabled: true,
  },
  ImaginaryWeather: {
    enabled: false,
  },
  ImaginaryMindscapes: {
    enabled: true,
  },
  ImaginaryLandscapes: {
    enabled: true,
  },
  ImaginaryWildlands: {
    enabled: false,
  },
  ImaginaryCityscapes: {
    enabled: false,
  },
  ImaginaryHellscapes: {
    enabled: false,
  },
  ImaginaryArchers: {
    enabled: false,
  },
  ImaginaryDragons: {
    enabled: false,
  },
  ImaginaryArchers: {
    enabled: false,
  },
  ImaginaryBestOf: {
    enabled: false,
  },
}

export const curated_subreddits_nature = {
  EarthPorn: {
    enabled: true,
  },
  NatureIsFuckingLit: {
    enabled: true,
  },
  BotanicalPorn: {
    enabled: false,
  },
  WaterPorn: {
    enabled: false,
  },
  SeaPorn: {
    enabled: false,
  },
  SkyPorn: {
    enabled: true,
  },
  FirePorn: {
    enabled: false,
  },
  DesertPorn: {
    enabled: false,
  },
  WinterPorn: {
    enabled: true,
  },
  AutumnPorn: {
    enabled: true,
  },
  VillagePorn: {
    enabled: true,
  },
  CityPorn: {
    enabled: false,
  },
  WeatherPorn: {
    enabled: false,
  },
  GeologyPorn: {
    enabled: false,
  },
  SpacePorn: {
    enabled: true,
  },
  BeachPorn: {
    enabled: false,
  },
  MushroomPorn: {
    enabled: false,
  },
  SpringPorn: {
    enabled: false,
  },
  SummerPorn: {
    enabled: false,
  },
  LavaPorn: {
    enabled: true,
  },
}

export const default_curated_subreddits = {
  Art: curated_subreddits_art,
  Imaginary: curated_subreddits_imaginary,
  Nature: curated_subreddits_nature,
}

export const lS = {
  setObjectItem: (location, input) => {
    return localStorage.setItem(location, JSON.stringify(input))
  },
  getObjectItem: location => {
    return JSON.parse(localStorage.getItem(location))
  },
  setStringItem: (location, input) => {
    return localStorage.setItem(location, input)
  },
  getStringItem: location => {
    return localStorage.getItem(location)
  },
}
export const addStyleString = str => {
  var node = document.createElement("style")
  node.innerHTML = str
  document.body.appendChild(node)
}
export const getKeyFromValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value)
}
export const toggleCuratedSubreddit = (catkey, subkey) => {
  const subreddits = lS.getObjectItem("curated_subreddits")
  subreddits[catkey][subkey].enabled = !subreddits[catkey][subkey].enabled
  lS.setObjectItem("curated_subreddits", subreddits)
}

export const toggleSubreddit = key => {
  const subreddits = lS.getObjectItem("subreddits")
  subreddits[key].enabled = !subreddits[key].enabled
  lS.setObjectItem("subreddits", subreddits)
}
export const removeSubreddit = key => {
  const subreddits = lS.getObjectItem("subreddits")
  delete subreddits[key]
  lS.setObjectItem("subreddits", subreddits)
}
export const addSubreddit = subreddit => {
  const subreddits = lS.getObjectItem("subreddits")
  subreddits[subreddit] = {enabled: true}
  lS.setObjectItem("subreddits", subreddits)
}

export const deleteUserSettings = () => {
  let subreddits = localStorage.setItem("subreddits", "null")
  let curated_subreddits = localStorage.setItem("curated_subreddits", "null")
  let sorting = localStorage.setItem("sorting", "null")
  let range = localStorage.setItem("range", "null")
  let time = localStorage.setItem("time", "null")
}
export const fetchAndSanitizeLocalStorage = () => {
  let subreddits = localStorage.getItem("subreddits")
  let curated_subreddits = localStorage.getItem("curated_subreddits")
  let sorting = lS.getStringItem("sorting")
  let range = lS.getStringItem("range")
  let time = lS.getStringItem("time")

  // Set default subs and settings on first launch
  if (subreddits === null || subreddits === "null") {
    lS.setObjectItem("subreddits", default_subreddits)
    subreddits = default_subreddits
  } else {
    subreddits = lS.getObjectItem("subreddits")
  }

  if (curated_subreddits === null || curated_subreddits === "null") {
    lS.setObjectItem("curated_subreddits", default_curated_subreddits)
    curated_subreddits = default_curated_subreddits
  } else {
    curated_subreddits = lS.getObjectItem("curated_subreddits")
  }

  if (sorting === null || sorting === "null") {
    lS.setStringItem("sorting", "top")
    sorting = "top"
  }
  if (range === null || range === "null") {
    lS.setStringItem("range", "100")
    range = "100"
  }
  if (time === null || time === "null") {
    lS.setStringItem("time", "all")
    time = "all"
  }

  // Check if curated subs have been changed and add accordingly
  // TODO: only run if in settings

  let user_has_all_curated_subs = true
  for (let cat_key of Object.keys(default_curated_subreddits)) {
    for (let sub_key of Object.keys(default_curated_subreddits[cat_key])) {
      if (
        !curated_subreddits[cat_key][sub_key] ||
        !Object.keys(curated_subreddits[cat_key]).includes(sub_key)
      ) {
        user_has_all_curated_subs = false
      }
    }
  }

  if (!user_has_all_curated_subs) {
    console.log("Updating curated subreddits...")
    console.log(default_curated_subreddits)
    let new_curated_subs = default_curated_subreddits
    console.log(new_curated_subs)

    for (let cat_key of Object.keys(default_curated_subreddits)) {
      for (let sub_key of Object.keys(default_curated_subreddits[cat_key])) {
        if (curated_subreddits[cat_key][sub_key]) {
          if (Object.keys(new_curated_subs[cat_key]).includes(sub_key)) {
            new_curated_subs[cat_key][sub_key] =
              curated_subreddits[cat_key][sub_key]
          }
        }
      }
    }
    console.log(new_curated_subs)
    lS.setObjectItem("curated_subreddits", new_curated_subs)
  }

  return {
    sorting: sorting,
    time: time,
    range: range,
    subreddits: subreddits,
    curated_subreddits: curated_subreddits,
  }
}

export const appendUserSubreddit = (subname, subreddits) => {
  const subreddit = document.createElement("div")
  subreddit.classList.add("subreddit")
  // subreddit.classList.add("pretty")
  // subreddit.classList.add("p-default")
  subreddit.innerHTML =
    `
              <div class="pretty p-default">
                <input type="checkbox" name="nature" ` +
    (subreddits[subname].enabled ? "checked" : "") +
    `>
                <div class="state"> <label>` +
    getKeyFromValue(subreddits, subreddits[subname]) +
    `</label></div></div>
                <div class="delete-button"></div>
    `
  subreddit.children[0].onclick = () => {
    toggleSubreddit(subname)
  }
  subreddit.children[1].onclick = () => {
    removeSubreddit(subname)
    subreddit.parentElement.removeChild(subreddit)
  }
  const settings_window = document.querySelector(".settings-window")
  settings_window.insertBefore(subreddit, settings_window.children[1])
}

export const setUpEventHandlersForDropDownMenus = (sorting, range, time) => {
  document.querySelector(".dropdown-sort .dropdown-content").value = sorting
  document.querySelector(".dropdown-time .dropdown-content").value = time
  document.querySelector(".dropdown-range .dropdown-content").value = range

  const setEventListenerForMenu = (menu_selector, local_storage_name) => {
    document.querySelector(menu_selector).addEventListener("change", e => {
      localStorage.setItem(local_storage_name, e.target.value)
      console.log(local_storage_name)
      console.log(e.target.value)
    })
  }
  setEventListenerForMenu(".dropdown-sort .dropdown-content", "sorting")
  setEventListenerForMenu(".dropdown-range .dropdown-content", "range")
  setEventListenerForMenu(".dropdown-time .dropdown-content", "time")
}

export const setUpEventHandlersForBottomMenuFadeOut = (_delay) => {
  let timedelay = 1
  function delayCheck() {
    if (timedelay == 5) {
      $("#bottom-bar").fadeOut()
      timedelay = 1
    }
    timedelay = timedelay + 1
  }

  $(document).mousemove(function() {
    $("#bottom-bar").fadeIn()
    timedelay = 1
    clearInterval(_delay)
    _delay = setInterval(delayCheck, 170)
  })
  // page loads starts delay timer
  _delay = setInterval(delayCheck, 500)
}
