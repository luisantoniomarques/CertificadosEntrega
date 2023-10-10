var allCountries = [];
var availableCountries;

$(document).ready(function () {

    loadAllCountries();

    $(document).on("change", "#nif, #nifCountry", function () {
        validateNif();
    });

    var props = {
        type: "GET",
        url: "countries.svc/rest/GetAll"
    };
    callService(props, function (result) {
        availableCountries = result;
        populateDropDown("nifCountry", result, "id", "name", false);

        var taxId = getUrlVars()["taxId"];
        if (taxId != null && taxId.length > 0 && taxId != getEditorValue("nif")) {
            setEditorValue("nif", taxId);
            $("#nif").change();
        }

    }, true);

});

function validateNif(callback) {
    var countryId = getEditorValue("nifCountry");
    var nif = getEditorValue("nif");

    if (nif == null || nif.length === 0 || countryId == null || countryId.length === 0) {
        showNifValidationResult(false, "");
        return;
    }
    
    //find iso code by selected country
    var country =
        availableCountries != null
            ? availableCountries.filter(function (data) { return data.id == countryId; })
            : null;
    
    //js
    var countryCD = (country != null && country.length > 0 ? country[0].countryCode : null);

    var propsT = {
        type: "GET",
        url: "countries.svc/rest/GetAll"
    };
    callService(propsT, function (result) {
        if (result != null) {
            result = result.filter(function (item) {
                return item.countryCode === countryCD;
                //return item.countryCode === "PRT";
            });
        }

        populateDropDown("country", result, "id", "name", false);
    }, true);
    //js

    var countryCD = (country != null && country.length > 0 ? country[0].countryCode : null);

    var propsT = {
        type: "GET",
        url: "countries.svc/rest/GetAll"
    };
    callService(propsT, function (result) {
        if (result != null) {
            result = result.filter(function (item) {
                return item.countryCode === countryCD;
            });
        }

        populateDropDown("country", result, "id", "name", false);
    }, true);
    
    var iso3Code = (country != null && country.length > 0 ? country[0].countryCode : null);

    country =
        allCountries != null
            ? allCountries.filter(function(data) { return data.iso3 == iso3Code; })
            : null;

    var countryCode = country != null && country.length > 0 ? country[0].iso2 : "PT";

    var parameters = {
        tinNumber: nif,
        countryCode: countryCode,
        countryId: countryId,
        outletEntityId: EmptyGuid,
        customerType: getUrlVars()["type"]
    };

    var props = {
        type: "GET",
        url: "outletentities.svc/rest/CheckTin?" + $.param(parameters)
    };

    callService(props, function (result) {
        var msg = "";
        var valid = result.ValidStructure && result.ValidSyntax && !result.TinInOutletCodeExists;

        if (result.TinInOutletCodeExists) {
            msg = getResource("entity.duplicatedTin");
        } else if (!valid) {
            msg = getResource("entity.invalidTin");
        }
        showNifValidationResult(valid, msg);

        if (callback) {
            callback(valid);
        }
    });
}

function loadAllCountries() {
    $.ajax({
        url: LocationPath.getVirtualDirectoryName() + "Content/countries.csv",
        success: function (data) {
            csvToJsObject(data);
        },
        async: false,
        dataType: "text"
    });
}

function csvToJsObject(csv) {
    var data = csv.split('\r\n');
    var headings = data[0].split(';');

    for (var i = 1; i < data.length; i++) {
        var parts = data[i].split(';');
        var country = {};
        for (var j = 0; j < headings.length; j++) {
            country[headings[j]] = parts[j];
        }
        allCountries.push(country);
    }
}

function showNifValidationResult(valid, msg) {
    if (valid) {
        $("#nif-input-group").removeClass("has-error");
    } else {
        $("#nif-input-group").addClass("has-error");
    }

    var result = {
        isValid: valid,
        message: msg
    }

    applyTemplate("nif-validation-template", "nif-validation-result", result);
}