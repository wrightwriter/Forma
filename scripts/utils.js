


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
  setItem: (location, input) => {
    return localStorage.setItem(location, JSON.stringify(input))
  },
  getItem: location => {
    return JSON.parse(localStorage.getItem(location))
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
  const subreddits = lS.getItem("curated_subreddits")
  subreddits[catkey][subkey].enabled = !subreddits[catkey][subkey].enabled  
  lS.setItem("curated_subreddits", subreddits)
}

export const toggleSubreddit = key => {
  const subreddits = lS.getItem("subreddits")
  subreddits[key].enabled = !subreddits[key].enabled
  lS.setItem("subreddits", subreddits)
}
export const removeSubreddit = key => {
  const subreddits = lS.getItem("subreddits")
  delete subreddits[key]
  lS.setItem("subreddits", subreddits)
}
export const addSubreddit = subreddit => {
  const subreddits = lS.getItem("subreddits")
  subreddits[subreddit] = {enabled: true}
  lS.setItem("subreddits", subreddits)
}

export const sanitizeLocalStorage = () => {
  let subreddits = localStorage.getItem("subreddits")
  let curated_subreddits = localStorage.getItem("curated_subreddits")

  if (subreddits === null || subreddits === "null") {
    lS.setItem("subreddits", default_subreddits)
    subreddits = default_subreddits
  } else {
    subreddits = lS.getItem("subreddits")
  }

  if (curated_subreddits === null || curated_subreddits === "null") {
    lS.setItem("curated_subreddits", default_curated_subreddits)
    curated_subreddits = default_curated_subreddits
  } else {
    curated_subreddits = lS.getItem("curated_subreddits")
  }

  return {
    subreddits: subreddits,
    curated_subreddits: curated_subreddits
  }
}


