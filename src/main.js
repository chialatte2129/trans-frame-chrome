function messageHandler(event) {
    console.log("Listen back");
    const iframe = document.getElementById("ocrFrame");
    if (event.source === iframe.contentWindow && event.data.type === "result") {
      const resultBox = document.getElementById("result-box");
      resultBox.value = event.data.result;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const translateBtn = document.getElementById("trans-btn");
    const resultBox = document.getElementById("result-box");
    translateBtn.addEventListener("click", function() {
      const selectWords = resultBox.value.trim();
      if (selectWords !== "") {
        chrome.storage.local.get(
          {trans: "zh-TW"},
          (result) => {
            const transUrl = `http://translate.google.com/#auto|${result.trans}|${selectWords}`;
            window.open(transUrl, "_blank");
          }
        );
      } else {
        alert("Please select some words to translate.");
      }
    });
});

// Define your textOCR function
async function textOCR(url) {
    console.log("Sending to iframe");
    const res = await fetch(url);
    const blob = await res.blob();
    const iframe = document.getElementById("ocrFrame");
    chrome.storage.local.get(
      {detect: "eng"},
      (result) => {
        iframe.contentWindow.postMessage({url:blob, detectLang:result.detect}, "*");
      }
    );
    
}

// Define your handleIframeLoad function
function handleIframeLoad() {
    chrome.storage.local.get("captureImage", (result) => {
        console.log(result.captureImage);
        textOCR(result.captureImage);
    });
}

// Add event listener for iframe load event
const iframe = document.getElementById("ocrFrame");
iframe.addEventListener("load", handleIframeLoad);

window.addEventListener("message", messageHandler);

// Clean up event listener when the page is unloaded
window.addEventListener("beforeunload", function() {
    iframe.removeEventListener("load", handleIframeLoad);
    window.removeEventListener("message", messageHandler);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "closeWindows"){
      console.log("Close Windows");
    }
  }
);
