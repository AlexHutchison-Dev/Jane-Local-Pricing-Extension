//jshint esversion:6
/********  ON REMOVED NOT WORKING YET ********/
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

    exchangeRate = getExchangeRate(currency, (rate) => {
      exchangeRate = rate;
      //could just call getExchangerate and have it reyturn the rate here
      sendResponse({ exchangeRate });
    });
    createTab(request.zoom);
  }
  if (request.message === "content script loaded") {
    console.log(request.message);
    console.log(exchangeRate);
    if (exchangeRate) {
      console.log(`sending exchangeRate : ${exchangeRate}`);

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
    if (storedDate && Date.now() - storedDate.date > oneDay) {
      fetchApiData();
    }
  });
}

function fetchApiData() {
  const { base, date, rates } = fetch(
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
    exchangerate = rates[currency];
    callback(exchangerate);
  });
}

function createTab(zoom) {
  chrome.tabs.create({ url: "http://janeapp.com/pricing" }, (tab) => {
    console.log(tab.id);
    //chrome.tabs.onRemoved.addListener(resetZoom);
    
    setZoomMode(tab.id, "automatic", () => {
      if (zoom) {
        setZoom(tab.id, 0.75);
      }
    });
    //setZoomMode(tab.id, "automatic");
  });
}

function setZoomMode(tab, mode, callback) {
  chrome.tabs.setZoomSettings(tab, { mode: mode, scope: "per-tab" }, () => {
    if (callback) {
      callback();
    }
  });
}
function setZoom(tab, zoom, callback) {
  chrome.tabs.setZoom(tab.id, zoom, () => {
    console.log("CHanged zoom");
    if (callback) {
      callback();
    }
  });
}

function resetZoom(tabId, removeInfo) {
  console.log("from remove listener" + tabId);
  console.log(removeInfo);
  console.log("tab closing");
  setZoom(tabId, 1, () => {
    setZoomMode(tabId, "automatic", () => {});
  });
}
