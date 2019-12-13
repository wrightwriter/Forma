
console.log("this is content.js reporting for duty");
alert("yooo")
chrome.runtime.onMessage.addListener(
  function(arg, sender, sendResponse) {
    // var args=arg.collection;
    alert("asfgadsg")
     chrome.downloads.download({
     url: arg,
    //  filename: saveas,
    saveAs: false
    });
   }
);
