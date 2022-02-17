// Duplikované v background/background.js
const chromeLocalStorageOptionsNamespace = "pro-oc-dzs-options";

function setOptionsToLocalStorage(options) {
  chrome.storage.local.set({[chromeLocalStorageOptionsNamespace] : options});
}

function getOptionsFromLocalStorage(callback) {
  chrome.storage.local.get([chromeLocalStorageOptionsNamespace], function(data) {
    callback(data[chromeLocalStorageOptionsNamespace]);
  });
}

function setDZSServerUrl(DZSServerUrl) {
  var DZSServerUrlElement = document.getElementById("DZSServerUrl");
  DZSServerUrlElement.value = DZSServerUrl;
}

function saveOptions(DZSServerUrl) {
  var options = new URLSearchParams();
  options.set("DZSServerUrl", DZSServerUrl);

  setOptionsToLocalStorage(options.toString());
}

function getOptions(callback) {
  getOptionsFromLocalStorage(function(optionsURLSearchParams) {

    var options = new URLSearchParams(optionsURLSearchParams);
    var DZSServerUrl = options.get("DZSServerUrl");

    callback({
      "DZSServerUrl": DZSServerUrl
    });
  });
}

const optionsForm = document.getElementById("options");
if(optionsForm) {
  optionsForm.addEventListener("submit", function(event) {

    event.preventDefault();

    var optionsFormData = new FormData(optionsForm);

    saveOptions(
      optionsFormData.get("DZSServerUrl")
    )
  });
}

window.onload = function() {
  getOptions(function(options) {
    setDZSServerUrl(options.DZSServerUrl);
  });
};