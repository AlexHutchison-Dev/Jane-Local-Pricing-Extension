//jshint esversion:6

document.getElementById("button-group").addEventListener("click", (event) => {
  if(event.target.value) {
   sendMessage(event.target.value);
  }
});
document.getElementById("others").addEventListener("change", (event) => {
  if(event.target.value) {
    sendMessage(event.target.value);
   }
});

function sendMessage(currency) {
  chrome.runtime.sendMessage({
    message: "currency",
    currency
  });
}

