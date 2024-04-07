document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(
    {
      detect: "eng",
      trans: "zh-TW",
    },
    (result) => {
      const detectSelector = document.getElementById("detect");
      detectSelector.value = result.detect;
      const transSelector = document.getElementById("trans");
      transSelector.value = result.trans;
    }
  );

  // Listen for change events on the dropdown menus
  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    select.addEventListener("change", () => {
      // Get the selected values
      const detectValue = (
        document.getElementById("detect")
      ).value;
      const transValue = document.getElementById("trans").value;

      // Store the new values in chrome.storage
      chrome.storage.local.set({
        detect: detectValue,
        trans: transValue,
      }, () => {console.log("Updated Config");});
    });
  });
});
