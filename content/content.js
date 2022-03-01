const ZdravotniPojistovnaKod = document.getElementById("ZdravotniPojistovnaKod");
if(ZdravotniPojistovnaKod) {
    ZdravotniPojistovnaKod.addEventListener("change", () => {
        VysledekKontrolyStipendistaText();
    });
}

const TestovanyDatumNarozeni = document.getElementById("TestovanyDatumNarozeni");
if(TestovanyDatumNarozeni) {
    TestovanyDatumNarozeni.addEventListener("change", () => {
        VysledekKontrolyStipendistaText();
    });
}

const TestovanyNarodnost = document.getElementById("TestovanyNarodnost");
if(TestovanyNarodnost) {
    TestovanyNarodnost.addEventListener("change", () => {
        VysledekKontrolyStipendistaText();
    });
}

VysledekKontrolyStipendistaText();

function getVysledekKontrolyStipendistaElement(id, text) {
    var VysledekKontrolyStipendistaElement = document.getElementById(id);

    if(!VysledekKontrolyStipendistaElement) {
        VysledekKontrolyStipendistaElement = document.createElement("div");
        VysledekKontrolyStipendistaElement.setAttribute("class", "textField");
        VysledekKontrolyStipendistaElement.setAttribute("id", id);
    } else {
        VysledekKontrolyStipendistaElement.style.display = "block";
    }
    VysledekKontrolyStipendistaElement.innerHTML = text;

    return VysledekKontrolyStipendistaElement;
}

function getKmenoveCisloDivElement(idContainerDiv, idInput) {
    var KmenoveCisloDivElement = document.getElementById(idContainerDiv);

    if(!KmenoveCisloDivElement) {

        KmenoveCisloDivElement = document.createElement("div");
        KmenoveCisloDivElement.setAttribute("class", "fieldGraphic");
        KmenoveCisloDivElement.setAttribute("id", idContainerDiv);
        KmenoveCisloDivElement.setAttribute("style", "display: block;");

        var label = document.createElement("label");
        label.setAttribute("for", "TestovanyKmenoveCislo");
        label.innerText = "Kmenové číslo";
        KmenoveCisloDivElement.appendChild(label);

        var input = document.createElement("input");
        input.setAttribute("id", idInput);
        input.setAttribute("name", "TestovanyKmenoveCislo");
        input.setAttribute("type", "text");
        KmenoveCisloDivElement.addEventListener("change", () => {
            VysledekKontrolyStipendistaText();
        });
        KmenoveCisloDivElement.appendChild(input);
    } else {
        KmenoveCisloDivElement.setAttribute("style", "display: block;");
    }
    return KmenoveCisloDivElement;
}

function VysledekKontrolyStipendistaText() {

    const KmenoveCisloDivElementId = "kmenove-cislo-dzs-stipendista-div";
    const KmenoveCisloElementId = "kmenove-cislo-dzs-stipendista";
    var KmenoveCisloDivElement = document.getElementById(KmenoveCisloDivElementId);
    const VysledekElementId = "vysledek-kontroly-stipendista";
    var VysledekElement = document.getElementById(VysledekElementId);

    if(
        ZdravotniPojistovnaKod && ZdravotniPojistovnaKod.value == "800"
    ) {

        if(!KmenoveCisloDivElement) {
            KmenoveCisloDivElement = getKmenoveCisloDivElement(KmenoveCisloDivElementId, KmenoveCisloElementId);
            ZdravotniPojistovnaKod.parentNode.parentNode.insertBefore(KmenoveCisloDivElement, ZdravotniPojistovnaKod.parentNode.nextSibling);
        } else {
            KmenoveCisloDivElement = getKmenoveCisloDivElement(KmenoveCisloDivElementId, KmenoveCisloElementId);
        }

        var KmenoveCisloElement = document.getElementById(KmenoveCisloElementId);

        if(
            KmenoveCisloElement.value &&
            TestovanyNarodnost && TestovanyNarodnost != "CZ" && 
            TestovanyDatumNarozeni && TestovanyDatumNarozeni.value)
        {
            chrome.runtime.sendMessage({
                "text": "OveritStatusStipendisty",
                "data": {
                    "KmenoveCislo": KmenoveCisloElement.value,
                    "DatumNarozeni": TestovanyDatumNarozeni.value
                }
            }, function(VysledekKontroly) {

                if(!VysledekKontroly) {
                    VysledekKontroly = "Nebylo možné ověřit. Problém na straně zprostředkovatele ověření nebo poskytovatele ověření DZS (Dům zahraniční spolupráce).";
                } else if(VysledekKontroly.includes("samoplátce")) {
                    alert("Nepojištěn");
                } else if(VysledekKontroly.includes("hradí MZČR")) {
                   // nothing
                }

                var VysledekElement = getVysledekKontrolyStipendistaElement(VysledekElementId, VysledekKontroly);
                ZdravotniPojistovnaKod.parentNode.insertBefore(VysledekElement, ZdravotniPojistovnaKod.nextElementSibling);
            });
        }
    } else {
        if(KmenoveCisloDivElement) {
            KmenoveCisloDivElement.style.display = "none";
        }
        if(VysledekElement) {
            VysledekElement.style.display = "none";
        }
    }
}