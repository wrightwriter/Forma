
console.log("The background script is working");
chrome.runtime.onMessage.addListener(
  function(arg, sender, sendResponse) {
     chrome.downloads.download({
     url: arg,
    //  filename: saveas,
    saveAs: false
    });
   }
);
