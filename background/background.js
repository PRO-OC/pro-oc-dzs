importScripts("./../lib/crypto-js.min.js");

// Duplikované v background/background.js
const chromeLocalStorageOptionsNamespace = "pro-oc-dzs-options";

const DEFAULT_DZS_PROD_SERVER_URL = '"http://registr.dzs.cz';

function getOptionsFromLocalStorage(callback) {
    chrome.storage.local.get([chromeLocalStorageOptionsNamespace], function(data) {
        callback(data[chromeLocalStorageOptionsNamespace]);
    });
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'OveritStatusStipendisty' && msg.data.KmenoveCislo && msg.data.DatumNarozeni) {
        OveritStatusStipendisty(msg.data.KmenoveCislo, msg.data.DatumNarozeni, function(responseOveritStatusStipendisty) {
            sendResponse(responseOveritStatusStipendisty);
        }, function() {
            sendResponse(false);
        });
        return true;
    }
});

function getDZSRegistrPage() {
    return "/dotaz.nsf";
}

function getDZSRegistrUrlParams(KmenoveCislo, dD, dM, dR) {
    var urlParams = new URLSearchParams();
    urlParams.set("kdo", KmenoveCislo);
    urlParams.set("dD", dD);
    urlParams.set("dM", dM);
    urlParams.set("dR", dR);
    return urlParams;
}

function OveritStatusStipendisty(KmenoveCislo, DatumNarozeni, onSuccess, onError) {
    getOptionsFromLocalStorage(function(optionsURLSearchParams) {

        var options = new URLSearchParams(optionsURLSearchParams);
        var DZSServerUrlFromOptions = options.get("DZSServerUrl");
        var DZSServerUrl = DZSServerUrlFromOptions ? DZSServerUrlFromOptions : DEFAULT_DZS_PROD_SERVER_URL;
        var EncryptingDisabled = options.get("EncryptingDisabled") == "true" ? true : false;
        var EncryptingPassword = options.get("EncryptingPassword");

        const dD = DatumNarozeni.split(".")[0];
        const dM = DatumNarozeni.split(".")[1];
        const dR = DatumNarozeni.split(".")[2];

        if(dD > 31 || dD < 1 ||
           dM > 12 || dM < 1 ||
           !dR)
        {
            return;
        }

        var urlParams = getDZSRegistrUrlParams(KmenoveCislo, dD, dM, dR);

        var url = DZSServerUrl + getDZSRegistrPage() + "?" + urlParams.toString();

        fetch(url, {
            method: 'get'
        })
        .then(function (response) {
            if (response.status == 200) {
                try {
                    response.text().then(function(responseText) {

                        var text = getResponseBody(EncryptingDisabled, responseText, EncryptingPassword);

                        onSuccess(text);
                    });
                } catch(err) {
                    console.log(err)
                    onError();
                }
            } else {
                onError();
            }
        })
        .catch(function (error) {
            console.log(error);
            onError();
        });
    });
}

function decryptBody(body, key) {
    let decData = CryptoJS.enc.Base64.parse(body).toString(CryptoJS.enc.Utf8);
    let bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(bytes).body;
}

function getResponseBody(EncryptingDisabled, body, key) {
    return !EncryptingDisabled ? decryptBody(body, key) : body;
}