//jshint esversion:6

const buttons = document.getElementById("button-group");


buttons.addEventListener("click", (event) => {
  

  chrome.runtime.sendMessage({
    message: "currency",
    currency: event.target.value,
    zoom: document.getElementById("zoom").checked
  });
});

