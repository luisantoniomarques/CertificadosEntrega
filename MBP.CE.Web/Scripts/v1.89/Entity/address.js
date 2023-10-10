var addresses = [], selectedAddressIdx;

$(document).ready(function () {

    $("#postalCode").blur(function () {

        var postalCode = getEditorValue("postalCode");

        //js
        if (postalCode.length === 7 || postalCode.length === 8) {
            loadCountry();
            document.getElementById("district").disabled = false;
            document.getElementById("county").disabled = false;
            document.getElementById("country").disabled = true;
            document.getElementById("district").required = true;
            document.getElementById("county").required = true;
        }

        if (postalCode.length != 7 || postalCode.length != 8) {
            validateNif();
            document.getElementById("district").disabled = true;
            document.getElementById("county").disabled = true;
            document.getElementById("country").disabled = true;
            document.getElementById("district").required = false;
            document.getElementById("county").required = false;
        }
        //js
        

        loadAddressByPostalCode();
        var country = $("#country").text().toUpperCase();
        if (country === "PORTUGAL") {
            return validatePortuguesePostalCode(postalCode);
        }
    });

    $(".addAddress").click(function () { addAddress(); });
    $(".saveAddress").click(function () { editAddress(); });
    $(".deleteAddress").click(function () { removeAddress(); });

    $(document).on("click", "#panel-address-results tr[data-selectable]", function () {
        applyMenuAddress(Menu.Edit);
        selectedAddressIdx = convertToNumber($(this).data("index"));

        if (!isNaN(selectedAddressIdx)) {
            var address = addresses[selectedAddressIdx];
            if (address != null) {
                if (address.postalCode != null && address.postalCode.length >= 4 && (address.street == null || address.street.length === 0)) {
                    setEditorValue("postalCode", address.postalCode);
                    loadAddressByPostalCode();
                } else {
                    setEditorValue("typeOfAddress", address.addressType);
                    setEditorValue("door", address.door);
                    setEditorValue("floor", address.floor);
                    setEditorValue("city", address.city);
                    setPostalCodeEditors(address);
                }
            }
        }
    });

    $("#streetCombo").change(function () {
        setEditorValue("street", getEditorValue("streetCombo"));
        setEditorValue("streetCombo", "");
    });

    //$.validator.addMethod("portuguesePostalCode", function (value) {
    //    var country = $("#country").text().toUpperCase();

    //    var postalCode = value;

    //    //js
    //    if (postalCode.length === 7 || postalCode.length === 8) {
    //        loadCountry();
    //        document.getElementById("district").disabled = false;
    //        document.getElementById("county").disabled = false;
    //        document.getElementById("country").disabled = true;
    //        document.getElementById("district").required = true;
    //        document.getElementById("county").required = true;
    //        return true;
    //    }

    //    if (postalCode.length != 7 || postalCode.length != 8) {
    //        validateNif();
    //        document.getElementById("district").disabled = true;
    //        document.getElementById("county").disabled = true;
    //        document.getElementById("country").disabled = true;
    //        document.getElementById("district").required = false;
    //        document.getElementById("county").required = false;
    //        return true;
    //    }
    //    //js

    //    if (country === "PORTUGAL") {
    //        return validatePortuguesePostalCode(value);
    //    }

    //    return true;
    //}, getResource("")); //entity.invalidPortuguesePostalCode

    $(document).ready(function () {
        $("#postalCode").keypress(function (e) {
            if (e.which != 8 && e.which != 0 && String.fromCharCode(e.which) != '-' && (e.which < 48 || e.which > 57)) {
                $("#errmsg").html("Digits Only").show().fadeOut("slow");
                return false;
            }
        });
    });

    //$("#form-address").validate({
    //    rules: {
    //        "postalCode": { portuguesePostalCode: true }
    //    }
    //});

    initAddress();

});


function initAddress() {
    applyMenuAddress(Menu.Add);
    loadAddressCombos();
}

function loadCountry() {
    var props = {
        type: "GET",
        url: "countries.svc/rest/GetAll"
    };
    callService(props, function (result) {
        if (result != null) {
            result = result.filter(function (item) {
                return item.countryCode === "PRT";
            });
        }
        var postalCode = getEditorValue("postalCode");
        var re = new RegExp("^\\d{4}-\\d{3}$");
        var b = $('#nifCountry').val();

        var a = $('#nifCountry :selected').text();
        var c = !re.test(postalCode);
        if (postalCode.length === 8 && !re.test(postalCode)) {
            var coun = [];
            var dd = { id: b, name: a };
            coun.push(dd);
            populateDropDown("country", coun, "id", "name", false);
        }
        else
            populateDropDown("country", result, "id", "name", false);
    }, true);
}

function applyMenuAddress(menu) {
    $(".addAddress").hide();
    $(".saveAddress").hide();
    $(".deleteAddress").hide();

    switch (menu) {
        case Menu.Add:
            $(".addAddress").show();
            break;

        case Menu.Edit:
            $(".saveAddress").show();
            $(".deleteAddress").show();
            break;
    }
}

function loadAddressCombos() {
    var props = {
        type: "GET",
        url: "districts.svc/rest/GetAll"
    }
    callService(props, function (result) {
        populateDropDown("district", result, "id", "name", true, "");
    }, true);

    getLookupData("addresstype", "pt", function (result) {
        populateDropDown("typeOfAddress", result, "Key", "Value");

        if (window.currentEntityType == EntityType.Private) {
            setEditorValue("typeOfAddress", AddressType.Home);
        } else {
            setEditorValue("typeOfAddress", AddressType.Company);
        }
    });

    $("#district").change(function () {
        var districtId = getEditorValue("district");
        loadCountyByDistrictId(districtId);
    });

}

function loadCountyByDistrictId(districtId, selectedValue) {
    populateDropDown("county", null, null, null);

    loadCountry();

    var country = $("#country").text().toUpperCase();
    var postalCode = getEditorValue("postalCode");

    if (country === "PORTUGAL" && (postalCode.length === 7 || postalCode.length === 8)) {
        fieldsState("n");
    }

    if (country === "PORTUGAL" && (postalCode.length != 7 && postalCode.length != 8)) {
        fieldsState("y");

        var propsT = {
            type: "GET",
            url: "countries.svc/rest/GetAll"
        };
        callService(propsT, function (result) {
            if (result != null) {
                result = result.filter(function (item) {
                    return item.countryCode === "CHE";
                });
            }

            populateDropDown("country", result, "id", "name", false);
        }, true);


    }

    if (country === "" && (postalCode.length != 7 && postalCode.length != 8)) {
        fieldsState("y");

        var propsT = {
            type: "GET",
            url: "countries.svc/rest/GetAll"
        };
        callService(propsT, function (result) {
            if (result != null) {
                result = result.filter(function (item) {
                    return item.countryCode === "CHE";
                });
            }

            populateDropDown("country", result, "id", "name", false);
        }, true);

    }

    if (country != "PORTUGAL" && country != "" && (postalCode.length != 7 && postalCode.length != 8)) {
        fieldsState("y");
        validateNif();
    }

    if (districtId != null && districtId.length > 0) {
        var props = {
            type: "GET",
            url: "counties.svc/rest/GetAllByDistrict?districtId=" + districtId
        };
        callService(props, function (result) {
            populateDropDown("county", result, "id", "name", true, "");
            setEditorValue("county", selectedValue);
        }, true);

        //js
        loadCountry();
        document.getElementById("district").disabled = false;
        document.getElementById("county").disabled = false;
        document.getElementById("district").required = true;
        document.getElementById("county").required = true;
        //js
    }
}

function applyAddressTemplate(data) {
    applyTemplate("address-results-template", "panel-address-results", data);
}

function loadAddresses(result) {
    applyAddressTemplate(null);

    if (result != null && result.length > 0) {
        addresses = result;
        applyAddressTemplate(result);
    }
}

function loadAddressByPostalCode() {
    var validator = $("#form-address").validate();
    var postalCode = getEditorValue("postalCode");

    if (postalCode == null || postalCode.length === 0 || !validator.element("#postalCode")) {
        setPostalCodeEditors(null);
    } else {
        var props = {
            type: "GET",
            url: "postalcodes.svc/rest/fetch?postalcode=" + getEditorValue("postalCode")
        };

        callService(props, function (result) {
            setPostalCodeEditors(result);
        });
    }

    if (postalCode.length != 7 && postalCode.length != 8) {
        validateNif();
        fieldsState("y");
        return true;
    }

    if (postalCode.length === 7 || postalCode.length === 8) {
        loadCountry();
        fieldsState("n");
        return true;
    }
}

function populateAddressCombo(addressList) {
    addressList = addressList || null;
    populateDropDown("streetCombo", addressList, "address", "address", true, "");
    $("#streetCombo").data("list", JSON.stringify(addressList));
}

function setPostalCodeEditors(addressList) {
    var data;

    if ($.isArray(addressList)) {
        data = (addressList.length > 0 ? addressList[0] : {});
        populateAddressCombo(addressList);
    } else {
        data = addressList || {};
        populateAddressCombo(data.addressList);
    }

    var postalCode = (data.postalCode == null ? data.postalcode : data.postalCode);

    setEditorValue("postalCode", postalCode == null ? getEditorValue("postalCode") : postalCode);
    setEditorValue("street", data.street || data.address);
    setEditorValue("city", data.city);
    setEditorValue("district", data.districtId);
    setEditorValue("country", data.countryId);

    loadCountyByDistrictId(data.districtId, data.countyId);
}

function clearAddressEditors() {
    setEditorValue("typeOfAddress", "");
    setEditorValue("door", "");
    setEditorValue("floor", "");
    setEditorValue("city", "");
    setPostalCodeEditors({ postalCode: "" });
}

function clearAddressList() {
    addresses = null;
    finalizeAddressAction();
}

function addAddress() {
    resetErrors();

    var isValid = $("#form-address").valid(true);

    if (!isValid)
        return;
   
    var address = {
        addressEntityState: EntityState.Created,
        addressType: getEditorValue("typeOfAddress"),
        addressTypeDescription: $("#typeOfAddress option:selected").text(),
        postalCode: getEditorValue("postalCode"),
        street: getEditorValue("street"),
        door: getEditorValue("door"),
        city: getEditorValue("city"),
        floor: getEditorValue("floor"),
        districtId: getEditorValue("district"),
        districtDescription: $("#district option:selected").text(),
        countyId: getEditorValue("county"),
        countyDescription: $("#county option:selected").text(),
        countryId: getEditorValue("country"),
        countryDescription: $("#country option:selected").text(),
        addressList: $("#streetCombo").data("list")
    }

    addresses.push(address);
    finalizeAddressAction();
}

function editAddress() {
    var isValid = $("#form-address").valid(true);

    if (!isValid)
        return;

    var address = addresses[selectedAddressIdx];

    if (address != null) {
        address.addressEntityState = address.addressEntityState == EntityState.Created ? EntityState.Created : EntityState.Updated;
        address.addressType = getEditorValue("typeOfAddress");
        address.addressTypeDescription = $("#typeOfAddress option:selected").text();
        address.postalCode = getEditorValue("postalCode");
        address.street = getEditorValue("street");
        address.door = getEditorValue("door");
        address.city = getEditorValue("city");
        address.floor = getEditorValue("floor");
        address.districtId = getEditorValue("district");
        address.districtDescription = $("#district option:selected").text();
        address.countyId = getEditorValue("county");
        address.countyDescription = $("#county option:selected").text();
    }

    finalizeAddressAction();
}

function removeAddress() {
    var question = getResource("entity.removeAddress");

    if (confirm(question)) {
        var address = addresses[selectedAddressIdx];

        if (address != null) {
            if (address.addressEntityState == EntityState.Created) {
                addresses.splice(selectedAddressIdx, 1);
            } else {
                address.addressEntityState = EntityState.Deleted;
            }
        }

        finalizeAddressAction();
    }
}

function finalizeAddressAction() {
    applyAddressTemplate(addresses);
    selectedAddressIdx = null;
    clearAddressEditors();
    applyMenuAddress(Menu.Add);
}

function hasNewAddresses() {
    var count = 0;

    if (addresses != null) {
        var items = addresses.filter(function (item) {
            return item.addressEntityState == EntityState.Created;
        });

        count = items.length;
    }

    return (count > 0);
}

function saveAddressesCallback() {
    if (addresses != null) {

        addresses = $.grep(addresses, function (item) {
            return item.addressEntityState != EntityState.Deleted;
        });

        $.each(addresses, function (idx, item) {
            if (item != null) {
                item.addressEntityState = EntityState.Unchanged;
            }
        });

        finalizeAddressAction();
    }
}

function fieldsState(disable) {

    if (disable === "y") {
        document.getElementById("district").disabled = true;
        document.getElementById("county").disabled = true;
        document.getElementById("country").disabled = true;
        document.getElementById("district").required = false;
        document.getElementById("county").required = false;
    }

    if (disable === "n") {
        document.getElementById("district").disabled = false;
        document.getElementById("county").disabled = false;
        document.getElementById("country").disabled = true;
        document.getElementById("district").required = true;
        document.getElementById("county").required = true;
    }

}

function getAddressList() {
    return addresses;
}