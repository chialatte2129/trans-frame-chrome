function selectArea(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      let startX, startY;
      let isDrawing = false;
      let canvas = null;

      function handleMouseDown(event) {
        startX = event.clientX + window.scrollX;
        startY = event.clientY + window.scrollY;
        isDrawing = true;
      }

      function handleMouseMove(event) {
        if (!isDrawing) return;
        const endX = event.clientX + window.scrollX;
        const endY = event.clientY + window.scrollY;
        const width = endX - startX;
        const height = endY - startY;
        if (!canvas) {
          canvas = document.createElement("canvas");
          canvas.style.position = "absolute";
          document.body.appendChild(canvas);
        }
        const left = width >= 0 ? startX : endX;
        const top = height >= 0 ? startY : endY;
        canvas.style.left = left + "px";
        canvas.style.top = top + "px";
        canvas.width = Math.abs(width);
        canvas.height = Math.abs(height);
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = "red";
          ctx.strokeRect(0, 0, Math.abs(width), Math.abs(height));
        }
      }

      function handleMouseUp(event) {
        isDrawing = false;
        if (canvas) {
          const endX = event.clientX + window.scrollX;
          const endY = event.clientY + window.scrollY;
          const width = Math.abs(endX - startX);
          const height = Math.abs(endY - startY);
          const left = width >= 0 ? startX : endX;
          const top = height >= 0 ? startY : endY;
          const position = {
            scrollX: window.scrollX,
            scrollY: window.scrollY,
            top,
            left,
            width,
            height,
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
          };
          chrome.storage.local.set({ position }, () => {});
          const htmlElement = document.documentElement;
          htmlElement.style.cursor = "auto";
          htmlElement.style.userSelect = "auto";
          htmlElement.style.pointerEvents = "auto";

          document.body.removeChild(canvas);
          canvas = null;
          document.removeEventListener("mousedown", handleMouseDown);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        }
      }

      const htmlElement = document.documentElement;
      htmlElement.style.cursor = "crosshair";
      htmlElement.style.userSelect = "none";
      htmlElement.style.pointerEvents = "none";

      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
  });
}

async function screenShot(callback) {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (imageUri) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
      callback(null);
    } else {
      callback(imageUri);
    }
  });
}

const captureArea = () => {
  screenShot((imageUri) => {
    console.log("Set Capture Image");
    const date = new Date();
    chrome.storage.local.set(
      {
        capture: {
          img: imageUri,
          key: date.getMilliseconds(),
        },
      },
      () => {}
    );
  });
};

chrome.storage.onChanged.addListener((changes) => {
  for (const key in changes) {
    if (key === "captureImage") {
      const tab_url = chrome.runtime.getURL("index.html");
      chrome.tabs.query({}, function(tabs) {
        for (var i=tabs.length-1; i>=0; i--) {
          if (tabs[i].url === tab_url) {
            chrome.tabs.remove(tabs[i].id, function() {});
            break;
          }
        }
      });
      chrome.windows.create({
        url: "./index.html",
        type: "popup",
        width: 360,
        height: 380,
      });
    }
  }
});

chrome.storage.onChanged.addListener((changes) => {
  for (const key in changes) {
    if (key === "position") {
      captureArea();
    }
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "trans_frame",
    title: "Trans Frame",
    type: "normal",
  });
});

chrome.contextMenus.onClicked.addListener((_, tab) => {
  if (tab) selectArea(tab);
});