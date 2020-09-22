//jshint esversion:6

const PRICING_STATEMENT =
  "Jane subscriptions are billed in Canadian dollars, so the cost of your monthly subscription can fluctuate slightly.<br><br>Here is our pricing based on todays exchange rate:";
const currencySign = {
  GBP: "£",
  USD: "$",
  AUD: "$",
  NZD: "$",
  EUR: "€",
  BRL: "$",
};

chrome.runtime.sendMessage({ message: "content script loaded" }, (response) => {
  if (response.requested) {
    
    const { currency, exchangeRate, zoom, tabId } = response;
    updateContent(currency, exchangeRate);
  }
});

function updateContent(currency, exchangeRate) {
  updateDollars(currency, exchangeRate);
  updateDetails(currency, exchangeRate);
  insertPricingStatement();
  removeCadStatement();
  callForReset();
}

function updateDollars(currency, exchangeRate) {
  const dollars = Array.prototype.slice.call(
    document.querySelectorAll(".panel-price .dollars")
  );
  dollars.map((element) => {
    const priceInDollars = element.innerText.match(/(\d+)/);
    element.innerHTML = generateDollarsHtml(
      priceInDollars,
      currency,
      exchangeRate
    );
  });
}

function generateDollarsHtml(price, currency, exchangeRate) {
  return `<sup>${currencySign[currency]}</sup>${Math.floor(
    price[0] * exchangeRate
  )}
  <small>${currency} per month</small>`;
}

function updateDetails(currency, exchangeRate) {
  const details = Array.prototype.slice.call(
    document.querySelectorAll(".panel-body .details")
  );
  details.map((element) => {
    const numbers = element.innerHTML.match(/\d+/g).map(Number);
    const priceInDollars = numbers[1];
    console.log(priceInDollars);
    element.innerHTML = generateDetailsHtml(
      priceInDollars,
      currency,
      exchangeRate
    );
  });
}

function generateDetailsHtml(price, currency, exchangeRate) {
  return `Includes 1 License
  <br>
  + ${currencySign[currency]}${Math.floor(price * exchangeRate)} per additional
  <i data-toggle="tooltip" title="" data-original-title="We consider full time 24 or more hours / week">full time*</i>
  practitioner
  `;
}

function insertPricingStatement() {
  const header = document.querySelectorAll(
    "header .container .row .col-sm-12 hgroup h3"
  );
  console.log(header);
  header[0].innerHTML = `${PRICING_STATEMENT}`;
}

function callForReset() {
  chrome.runtime.sendMessage({ reset: true });
}

function removeCadStatement() {
  document.querySelector(".row .col-sm-12 p").innerHTML = "*We consider a full time practitioner to be 24 or more hours / week.";
  
}