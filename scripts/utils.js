export const default_subreddits = {
  creativecoding: {
    enabled: false,
  },
};

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
};

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
};

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
};

export const default_curated_subreddits = {
  Art: curated_subreddits_art,
  Imaginary: curated_subreddits_imaginary,
  Nature: curated_subreddits_nature,
};

export const addStyleString = (str) => {
  var node = document.createElement("style");
  node.innerHTML = str;
  document.body.appendChild(node);
};
export const getKeyFromValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};
export const toggleCuratedSubreddit = async (catkey, subkey) => {
  const { curated_subreddits } = await chrome.storage.local.get("curated_subreddits");
  curated_subreddits[catkey][subkey].enabled = !curated_subreddits[catkey][subkey].enabled;
  await chrome.storage.local.set({ curated_subreddits });
};

export const toggleSubreddit = async (key) => {
  const { subreddits } = await chrome.storage.local.get("subreddits");
  subreddits[key].enabled = !subreddits[key].enabled;
  await chrome.storage.local.set({ subreddits });
};
export const removeSubreddit = async (key) => {
  const { subreddits } = await chrome.storage.local.get("subreddits");
  delete subreddits[key];
  await chrome.storage.local.set({ subreddits });
};
export const addSubreddit = async (subreddit) => {
  const { subreddits } = await chrome.storage.local.get("subreddits");
  subreddits[subreddit] = { enabled: true };
  await chrome.storage.local.set({ subreddits });
  return subreddits;
};

export const deleteUserSettings = async () => {
  await chrome.storage.local.set({
    subreddits: undefined,
    curated_subreddits: undefined,
    sorting: undefined,
    range: undefined,
    time: undefined,
  });
};
export const fetchAndSanitizeLocalStorage = async () => {
  let { subreddits, curated_subreddits, sorting, range, time } = await chrome.storage.local.get([
    "subreddits",
    "curated_subreddits",
    "sorting",
    "range",
    "time",
  ]);

  // Set default subs and settings on first launch
  if (!subreddits) {
    await chrome.storage.local.set({ subreddits: default_subreddits });
    subreddits = default_subreddits;
  }
  if (!curated_subreddits) {
    await chrome.storage.local.set({ curated_subreddits: default_curated_subreddits });
    curated_subreddits = default_curated_subreddits;
  }
  if (!sorting) {
    await chrome.storage.local.set({ sorting: "top" });
    sorting = "top";
  }
  if (!range) {
    await chrome.storage.local.set({ range: "100" });
    range = "100";
  }
  if (!time) {
    await chrome.storage.local.set({ time: "all" });
    time = "all";
  }

  // Check if curated subs have been changed and add accordingly
  // TODO: only run if in settings

  let user_has_all_curated_subs = true;
  for (let cat_key of Object.keys(default_curated_subreddits)) {
    for (let sub_key of Object.keys(default_curated_subreddits[cat_key])) {
      if (!curated_subreddits[cat_key][sub_key] || !Object.keys(curated_subreddits[cat_key]).includes(sub_key)) {
        user_has_all_curated_subs = false;
      }
    }
  }

  if (!user_has_all_curated_subs) {
    console.log("Updating curated subreddits...");
    console.log(default_curated_subreddits);
    let new_curated_subs = default_curated_subreddits;
    console.log(new_curated_subs);

    for (let cat_key of Object.keys(default_curated_subreddits)) {
      for (let sub_key of Object.keys(default_curated_subreddits[cat_key])) {
        if (curated_subreddits[cat_key][sub_key]) {
          if (Object.keys(new_curated_subs[cat_key]).includes(sub_key)) {
            new_curated_subs[cat_key][sub_key] = curated_subreddits[cat_key][sub_key];
          }
        }
      }
    }
    console.log(new_curated_subs);
    await chrome.storage.local.set({ curated_subreddits: new_curated_subs });
  }

  return {
    sorting: sorting,
    time: time,
    range: range,
    subreddits: subreddits,
    curated_subreddits: curated_subreddits,
  };
};

export const appendUserSubreddit = (subname, subreddits) => {
  const subreddit = document.createElement("div");
  subreddit.classList.add("subreddit");
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
    `;
  subreddit.children[0].onclick = () => {
    toggleSubreddit(subname);
  };
  subreddit.children[1].onclick = () => {
    removeSubreddit(subname);
    subreddit.parentElement.removeChild(subreddit);
  };
  const settings_window = document.querySelector(".settings-window");
  settings_window.insertBefore(subreddit, settings_window.children[1]);
};

export const setUpEventHandlersForDropDownMenus = (sorting, range, time) => {
  document.querySelector(".dropdown-sort .dropdown-content").value = sorting;
  document.querySelector(".dropdown-time .dropdown-content").value = time;
  document.querySelector(".dropdown-range .dropdown-content").value = range;

  const setEventListenerForMenu = (menu_selector, setting_name) => {
    document.querySelector(menu_selector).addEventListener("change", async (e) => {
      await chrome.storage.local.set({ [setting_name]: e.target.value });
      console.log(setting_name);
      console.log(e.target.value);
    });
  };
  setEventListenerForMenu(".dropdown-sort .dropdown-content", "sorting");
  setEventListenerForMenu(".dropdown-range .dropdown-content", "range");
  setEventListenerForMenu(".dropdown-time .dropdown-content", "time");
};

export const setUpEventHandlersForBottomMenuFadeOut = (_delay) => {
  let timedelay = 1;
  function delayCheck() {
    if (timedelay == 5) {
      $("#bottom-bar").fadeOut();
      timedelay = 1;
    }
    timedelay = timedelay + 1;
  }

  $(document).mousemove(function () {
    $("#bottom-bar").fadeIn();
    timedelay = 1;
    clearInterval(_delay);
    _delay = setInterval(delayCheck, 170);
  });
  // page loads starts delay timer
  _delay = setInterval(delayCheck, 500);
};
