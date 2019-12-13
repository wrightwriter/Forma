


export const default_subreddits = {
  museum: {
    enabled: false,
  },
  SculturePorn: {
    enabled: false,
  },
  ArtPorn: {
    enabled: false,
  },
  creativecoding: {
    enabled: false,
  },
}

export const curated_subreddits_art = {
  "museum": {
    enabled: true,
  },
  "SculpturePorn": {
    enabled: true,
  },
  "ArtPorn": {
    enabled: false,
  },
  "creativecoding": {
    enabled: true,
  },
  "Art": {
    enabled: false,
  },
  "FractalPorn": {
    enabled: true,
  },
}

export const curated_subreddits_imaginary = {
  "ImaginarySkyscapes": {
    enabled: false,
  },
  "ImaginaryColorscapes": {
    enabled: false,
  },
  "ImaginaryWeather": {
    enabled: false,
  },
  "ImaginaryMindscapes": {
    enabled: true,
  },
  "ImaginaryLandscapes": {
    enabled: false,
  },
  "ImaginaryWildlands": {
    enabled: false,
  },
  "ImaginaryCityscapes": {
    enabled: false,
  },
  "ImaginaryHellscapes": {
    enabled: false,
  },
  "ImaginaryArchers": {
    enabled: false,
  },
  "ImaginaryDragons": {
    enabled: false,
  },
  "ImaginaryArchers": {
    enabled: false,
  },
  "ImaginaryBestOf": {
    enabled: false,
  },
}

export const curated_subreddits_nature = {
  "EarthPorn": {
    enabled: true,
  },
  "NatureIsFuckingLit": {
    enabled: false,
  },
  "BotanicalPorn": {
    enabled: false,
  },
  "WaterPorn": {
    enabled: false,
  },
  "SeaPorn": {
    enabled: false,
  },
  "SkyPorn": {
    enabled: false,
  },
  "FirePorn": {
    enabled: false,
  },
  "DesertPorn": {
    enabled: false,
  },
  "WinterPorn": {
    enabled: false,
  },
  "AutumnPorn": {
    enabled: false,
  },
  "VillagePorn": {
    enabled: false,
  },
  "CityPorn": {
    enabled: false,
  },
  "WeatherPorn": {
    enabled: false,
  },
  "GeologyPorn": {
    enabled: false,
  },
  "SpacePorn": {
    enabled: false,
  },
  "BeachPorn": {
    enabled: false,
  },
  "MushroomPorn": {
    enabled: false,
  },
  "SpringPorn": {
    enabled: false,
  },
  "SummerPorn": {
    enabled: false,
  },
  "LavaPorn": {
    enabled: false,
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
export const addStyleString = (str) => {
  var node = document.createElement("style")
  node.innerHTML = str
  document.body.appendChild(node)
}
export const getKeyFromValue = (object, value) => {
  return Object.keys(object).find(key => object[key] === value);
}
export const toggleCuratedSubreddit = (catkey,subkey) => {
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
  // Set default parameters on first launch
  let subreddits = localStorage.getItem("subreddits")
  let curated_subreddits = localStorage.getItem("curated_subreddits")
  let sorting = lS.getStringItem("sorting")
  let range = lS.getStringItem("range")
  let time = lS.getStringItem("time")

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

  if (sorting == null || sorting === "null") {
    lS.setStringItem("sorting", "top")
    sorting = "top"
  }
  if (range == null || range === "null") {
    lS.setStringItem("range", "100")
    range = "100"
  }
  if (time == null || time === "null") {
    lS.setStringItem("time", "all")
    time = "all"
  }

  return {
    sorting: sorting,
    time: time,
    range: range,
    subreddits: subreddits,
    curated_subreddits: curated_subreddits
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
                <input type="checkbox" name="nature" ` + (subreddits[subname].enabled ? "checked" : "") + `>
                <div class="state"> <label>`+ getKeyFromValue(subreddits, subreddits[subname]) + `</label></div></div>
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



export const setUpEventHandlersForDropDownMenus = (sorting,range,time) => {

  document.querySelector(".dropdown-sort .dropdown-content").value = sorting
  document.querySelector(".dropdown-time .dropdown-content").value = time
  document.querySelector(".dropdown-range .dropdown-content").value = range

  const setEventListenerForMenu = (menu_selector, local_storage_name) => {
    document.querySelector(menu_selector).addEventListener("change", (e)=>{
      localStorage.setItem(local_storage_name,e.target.value)
      console.log(local_storage_name)
      console.log(e.target.value)
    })
  }
  setEventListenerForMenu(".dropdown-sort .dropdown-content", "sorting")
  setEventListenerForMenu(".dropdown-range .dropdown-content", "range")
  setEventListenerForMenu(".dropdown-time .dropdown-content", "time")


};