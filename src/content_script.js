console.log("Load Content Script");

function sliceCapture(imageUri, position) {
  if (!position) {
    console.error("Error: Position is undefined");
    return;
  }

  const image = new Image();
  image.onload = function () {
    const imageHeight = image.height;

    const diff_ratio = imageHeight / position.innerHeight;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Error: Canvas context is null");
      return;
    }

    canvas.width = position.width * diff_ratio;
    canvas.height = position.height * diff_ratio;
    ctx.drawImage(
      image,
      position.left * diff_ratio - position.scrollX * diff_ratio,
      position.top * diff_ratio - position.scrollY * diff_ratio,
      position.width * diff_ratio,
      position.height * diff_ratio,
      0,
      0,
      position.width * diff_ratio,
      position.height * diff_ratio
    );

    const croppedImageUrl = canvas.toDataURL();

    chrome.storage.local.set({ captureImage: croppedImageUrl }, () => {});
  };
  image.src = imageUri;
}

chrome.storage.onChanged.addListener(function (changes) {
  for (const key in changes) {
    if (key === "capture") {
      const imageUri = changes[key].newValue.img;
      chrome.storage.local.get("position", (result) => {
        const position = result.position;
        sliceCapture(imageUri, position);
      });
    }
  }
});
