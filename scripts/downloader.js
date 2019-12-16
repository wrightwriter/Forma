const valid_extensions = ["png", "jpg", "webm", "gif"]

const lS = {
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
chrome.runtime.onMessage.addListener(
  function(arg, sender, sendResponse) {
     const async_wrapper = async (arg, sender, sendResponse) =>{
      
      console.log("received payload")
      if (arg.type === "download"){
         chrome.downloads.download({
         url: arg.message,
            //  filename: saveas,
            saveAs: false
            });
      }
      else if (arg.type === "get_new_image") {

         let { sorting, range, time} = arg.message


            async function tryARandomSubreddit() {
               const subreddit = getRandomSubreddit()
               console.log("Subreddit is " + subreddit)
               const link =
                  "https://www.reddit.com/r/" +
                  subreddit +
                  "/" +
                  sorting +
                  ".json?t=" +
                  time +
                  "&limit=" +
                  range

               let fetch_successful = false

               const res = await fetch(link, {
                  method: "get",
               })
                  .then(res => {
                  return res.json()
                  })
                  .then(res => {
                  console.log(link)
                  console.log(res)

                  range = res.data.children.length
                  let img_src
                  let ext
                  let is_extension_valid
                  do {
                     // Try different images of selected subreddit
                     const idx = Math.floor(Math.random() * range)
                     img_src = res.data.children[idx].data.url
                     const title = res.data.children[idx].data.title
                     const reddit_href = res.data.children[idx].data.permalink
                     const url_split = img_src.split(".")
                     ext = url_split[url_split.length - 1]
                     console.log(ext)
                     is_extension_valid = valid_extensions.includes(ext)

                     if (is_extension_valid) {
                        ImageLoader(img_src, title,subreddit, img_src, reddit_href)
                        fetch_successful = true
                        is_extension_valid = true
                     }
                  } while (!is_extension_valid)
                  })
                  .catch((e) => {
                     console.log(e)
                     fetch_successful = false
                  })

               if (!fetch_successful) {
                  throw Error(404)
               }
            }

            // Try 3 different subreddits
            await tryARandomSubreddit().catch(async (e) => {
               console.log("Unsuccessful fetch 1, trying again")
               console.log(e)
               await tryARandomSubreddit().catch(async (e) => {
                  console.log("Unsuccessful fetch 2, trying again")
                  console.log(e)
                  await tryARandomSubreddit().catch(async (e) => {
                     console.log("Unsuccessful fetch 3, trying again")
                     console.log(e)
                  })
               })
            })
      }

     }

     async_wrapper(arg, sender, sendResponse)
     
   }
);


const getRandomSubreddit = () => {
  const subreddits = lS.getObjectItem("subreddits")
  const curated_subreddits = lS.getObjectItem("curated_subreddits")

  let enabled_subreddits = {}

  for (let sub_key of Object.keys(subreddits)) {
    if (subreddits[sub_key].enabled) enabled_subreddits[sub_key] = sub_key
  }

  for (let cat_key of Object.keys(curated_subreddits)) {
    for (let sub_key of Object.keys(curated_subreddits[cat_key])) {
      const sub = curated_subreddits[cat_key][sub_key]
      if (sub.enabled) enabled_subreddits[sub_key] = sub_key
    }
  }

  const subcount = Object.keys(enabled_subreddits).length
  const desired_idx = Math.floor(0.999 * Math.random() * subcount)
  const mean_chance = 1 / subcount
  let subreddit = ""

  // TODO: faster random logic here
  if (subcount > 0) {
    while (1) {
      for (let sub in enabled_subreddits) {
        const chance = Math.random()
        if (chance < mean_chance) {
          return sub
        }
      }
    }
  }
}



function ImageLoader(url, title_name, sub_name, img_src, reddit_href, ratio ) {
  let imgxhr = new XMLHttpRequest()
  imgxhr.open("GET", url + "?" + new Date().getTime())
  imgxhr.responseType = "blob"
  imgxhr.onload = function() {
    if (imgxhr.status === 200) {
      reader.readAsDataURL(imgxhr.response)
    }
  }
  let reader = new FileReader()
  reader.onloadend = () => {
   const img = new Image()
   img.onload = () => {
      chrome.storage.local.set(
         {
            Image: reader.result,
            title_name:title_name, 
            sub_name:sub_name, 
            img_src:img_src, 
            reddit_href:reddit_href,
            ratio: JSON.stringify(img.width / img.height),
            width: JSON.stringify(img.width),
            height:JSON.stringify(img.height),
         })
   }
   img.src = reader.result.replace(/(\r\n|\n|\r)/gm, "")
   console.log("loaded an image")
  }
  imgxhr.send()
}