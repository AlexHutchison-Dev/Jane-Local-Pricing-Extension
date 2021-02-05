//jshint esversion:6

var exchangeRate = null;
var currency = null;

checkStoredDataAge();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.reset) {
    currency = null;
    exchangeRate = null;
  }
  if (request.message === "currency") {
    currency = request.currency;
    checkStoredDataAge();
    getExchangeRate(currency, (rate) => {
      exchangeRate = rate;
      sendResponse({ exchangeRate });
    });
    createTab();
  }
  if (request.message === "content script loaded") {
    
    if (exchangeRate) {
      sendResponse({
        currency,
        exchangeRate,
        requested: true,
      });
    }
  }
});

function checkStoredDataAge() {
  chrome.storage.local.get(["date"], (storedDate) => {
    const oneDay = 60 * 60 * 1000;
    if (!storedDate.date || Date.now() - storedDate.date > oneDay) {
      fetchApiData();
    }
  });
}

function fetchApiData() {
  fetch(
    "https://api.exchangeratesapi.io/latest?base=CAD"
  )
    .then((responce) => responce.json())
    .then((data) => {
      const { base, date, rates } = data;
      console.log(rates);
      chrome.storage.local.set({ base, date: Date.now(), rates });
    })
    .catch((err) => console.log(err));
}

function getExchangeRate(currency, callback) {
  chrome.storage.local.get(["rates"], (data) => {
    const rates = data.rates;
    callback(rates[currency]);
  });
}

function createTab() {
  chrome.tabs.create({ url: "http://janeapp.com/pricing" });
}
