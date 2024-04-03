// 當前工作頁
function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            resolve(tab);
        });
    });
}

// 選取區塊，利用canvas畫出選取框 -> 需要將position傳遞出去，進行下一個流程
function selectArea(tab) {
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: () => {
            let startX, startY;
            let isDrawing = false;
            let canvas;
            let position;

            function handleMouseDown(event) {
                startX = event.clientX + window.scrollX;
                startY = event.clientY + window.scrollY;
                isDrawing = true;
                document.body.style.userSelect = "none";
                document.body.style.pointerEvents = "none";
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
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = "red";
                ctx.strokeRect(0, 0, Math.abs(width), Math.abs(height));
            }

            function handleMouseUp(event) {
                isDrawing = false;
                document.body.style.cursor = "auto";
                document.body.style.pointerEvents = "auto";
                document.body.style.userSelect = "auto";
                if (canvas) {
                    const endX = event.clientX + window.scrollX;
                    const endY = event.clientY + window.scrollY;
                    const width = Math.abs(endX - startX);
                    const height = Math.abs(endY - startY);
                    const left = width >= 0 ? startX : endX;
                    const top = height >= 0 ? startY : endY;
                    position = {
                        scrollX: window.scrollX,
                        scrollY: window.scrollY,
                        top: top,
                        left: left,
                        width: width,
                        height: height
                    }
                    document.body.removeChild(canvas);
                    canvas = null;

                    console.log(position);
                    document.removeEventListener('mousedown', handleMouseDown);
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }
            }
            document.body.style.cursor = "crosshair";
            document.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    });
}


// 擷取頁面
function capture(position) {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, function(imageUri) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
        } else {
            console.log(imageUri);
            sliceCaptured(imageUri, position)
        }
    });
}

// 裁切頁面
function sliceCaptured(imageUri, position) {
    console.log(`Success: ${imageUri}`);

    const image = new Image();
    image.onload = function() {
        // 創建一個 Canvas 元素
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        // 設置 Canvas 的寬度和高度與位置相同
        canvas.width = position.width;
        canvas.height = position.height;
        // 在 Canvas 上繪製捕獲的截圖的指定位置
        ctx.drawImage(image,
            position.left - position.scrollX,
            position.top - position.scrollY,
            position.width,
            position.height, 
            0, 
            0, 
            position.width, 
            position.height);
        // 將 Canvas 轉換為圖片 URL
        const croppedImageUrl = canvas.toDataURL();
        // croppedImageUrl 現在包含了指定位置的圖片
        console.log(croppedImageUrl);
    };
    // 將截圖的數據 URL 分配給圖像元素的 src 屬性
    image.src = imageUri;
}

function main(){
    getCurrentTab()
    .then(tab => {
        selectArea(tab);
    });
}

document.getElementById("startButton").addEventListener("click", main);
