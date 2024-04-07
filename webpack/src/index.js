const Tesseract = require('tesseract.js');

window.addEventListener("message", (event) => {
  // const url = event.data;
  const { url, detectLang } = event.data;

  Tesseract.recognize(
    url,
    detectLang,
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    console.log(text);
    // document.getElementById("text").innerText = text;
    window.parent.postMessage({
      type: 'result',
      result: text
    }, '*'); 
  })
});