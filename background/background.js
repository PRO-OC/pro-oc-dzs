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

function OveritStatusStipendisty(KmenoveCislo, DatumNarozeni, onSuccess) {
    getOptionsFromLocalStorage(function(optionsURLSearchParams) {

        var options = new URLSearchParams(optionsURLSearchParams);
        var DZSServerUrlFromOptions = options.get("DZSServerUrl");
        var DZSServerUrl = DZSServerUrlFromOptions ? DZSServerUrlFromOptions : DEFAULT_DZS_PROD_SERVER_URL;

        var url = DZSServerUrl + getDZSRegistrPage();

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

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', url + "?" + urlParams.toString(), true);
        xmlhttp.onreadystatechange = function () {
            if(xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status == 200) {  

                onSuccess(xmlhttp.responseText);
            }
        }
        xmlhttp.send();
    });
}