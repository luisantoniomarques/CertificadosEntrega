var editMode = false;
var currentEntityId = null;
var currentEntityType = null;

$(document).ready(function () {

    $(".btn-saveEntity").click(function () {
        saveEntity();
    });

    $(".btn-goback").click(function () {
        if (isInIframe()) {
            closeIframe();
        } else {
            location.href = LocationPath.getVirtualDirectoryName() + "entity";
        }
    });

    $.validator.addMethod("oneEmailAndOnePhone", function () {
        if (contacts != null) {
            var existsPhone = contacts.filter(function (data) { return (data.contactType == ContactType.Phone && data.contactEntityState != EntityState.Deleted); }).length;
            var existsEmail = contacts.filter(function (data) { return (data.contactType == ContactType.Email && data.contactEntityState != EntityState.Deleted); }).length;

            return (existsPhone > 0 && existsEmail > 0);
        }
        return false;
    }, getResource("entity.oneEmailAndOnePhone"));

    $.validator.addMethod("atLeastOneAddress", function () {
        if (addresses != null) {
            return (addresses.filter(function (data) { return data.addressEntityState != EntityState.Deleted; }).length > 0);
        }
        return false;
    }, "Insira, pelo menos, uma morada.");

    $("#form-entity").validate({
        ignore: ".ignore",
        rules: {
            "dob": { daymonthyearfour: true },
            "addressWarning": { atLeastOneAddress: true },
            "contactWarning": { oneEmailAndOnePhone: true }
        }
    });

    init();
});

function init() {
    customizeForIframe();

    window.editMode = getUrlVars()["id"] != null;
    window.currentEntityId = getUrlVars()["id"];
    window.currentEntityType = getUrlVars()["type"];

    if (window.editMode === true) {
        $("#nif").prop("disabled", true);
        $("#nifCountry").prop("disabled", true);
    }

    loadCombos();
    loadEntity();
}

function loadCombos() {
    var comboConfig = [];

    if (window.currentEntityType == EntityType.Private) {
        comboConfig.push({ lookupName: "salutationtype", comboName: "greeting", addEmptyItem: true });
        comboConfig.push({ lookupName: "gender", comboName: "gender", addEmptyItem: true });
        comboConfig.push({ lookupName: "maritalstatus", comboName: "maritalStatus", addEmptyItem: true });
        comboConfig.push({ lookupName: "academiclevel", comboName: "education", addEmptyItem: true });

        $.each(comboConfig, function (index, item) {
            getLookupData(item.lookupName, "pt", function (result) {
                populateDropDown(item.comboName, result, "Key", "Value", item.addEmptyItem, "");
            });
        });
    } else if (window.currentEntityType == EntityType.Enterprise) {
        populateEnterpriseActivtyCodes();
    }
};

function loadEntity(callback) {
    var id = currentEntityId != null && currentEntityId.length > 0 ? currentEntityId : null;

    if (id != null) {
        var props = {
            type: "GET",
            url: "outletentity/" + id + "?getAddresses=true&getContacts=true"
        };
        callService(props, function (result) {
            setEditorsEntity(result);

            var addressList = null;
            var contactList = null;

            if (result != null) {
                addressList = result.addressList;
                contactList = result.contactList;
            }

            loadAddresses(addressList);
            loadContacts(contactList);

            if (callback != null) {
                callback();
            }
        });
    }
}

function setEditorsEntity(data) {
    if (data != null) {
        setEditorValue("nifCountry", data.tinCountry);
        setEditorValue("nif", data.taxid);

        if (window.currentEntityType == EntityType.Private) {
            setEditorValue("name", data.firstname);
            setEditorValue("surname", data.lastname);
            setEditorValue("greeting", data.salutation);
            setEditorValue("dob", data.birthdate);
            setEditorValue("gender", data.gender);
            setEditorValue("job", data.occupation);
            setEditorValue("maritalStatus", data.maritalstatus);
            setEditorValue("education", data.academiclevel);
            setEditorValue("handicapped", data.ishandicapped);
        } else
            if (window.currentEntityType == EntityType.Enterprise) {
                setEditorValue("companyname", data.companyName);
                setEditorValue("shortname", data.shortName);
                setEditorValue("cae", data.cae);
            }
    }
}

function editorsValues() {
    return {
        type: window.currentEntityType,
        id: window.currentEntityId || EmptyGuid,
        taxid: getEditorValue("nif"),
        tinCountry: getEditorValue("nifCountry"),
        salutation: getEditorValue("greeting"),
        firstname: getEditorValue("name"),
        lastname: getEditorValue("surname"),
        gender: getEditorValue("gender"),
        maritalstatus: getEditorValue("maritalStatus") != null ? (getEditorValue("maritalStatus").length > 0 ? getEditorValue("maritalStatus") : "0") : null,
        ishandicapped: getEditorValue("handicapped"),
        occupation: getEditorValue("job"),
        birthdate: getEditorValue("dob"),
        academiclevel: getEditorValue("education") != null ? (getEditorValue("education").length > 0 ? getEditorValue("education") : "0") : null,
        companyName: getEditorValue("companyname"),
        shortName: getEditorValue("shortname"),
        cae: getEditorValue("cae"),
        addressList: getAddressList(),
        contactList: getContactList()
    };
}

function saveEntity() {
    resetErrors();

    var isValid = $("#form-entity").valid(true);
    if (!isValid) {
        return;
    }

    if (window.editMode === true) {
        saveEntityFields();
    } else {
        validateNif(function (valid) {
            if (valid === true) {
                saveEntityFields();
            }
        });
    }
}

function saveEntityFields() {
    var props = {
        type: null,
        url: null,
        data: editorsValues()
    };

    if (window.editMode === true) {
        props.type = "PUT";
        props.url = "outletentity/" + window.currentEntityId;
    } else {
        props.type = "POST";
        props.url = "outletentity";
    }

    callService(props, function (result) {

        //////////////////////////////////////////////////////////////////
        if (isInIframe()) {
            if (window.parent.refreshOutletEntity) {
                var taxId = getEditorValue("nif");
                var usage = getUrlVars()["usage"];
                window.parent.refreshOutletEntity(taxId, usage);
            }
            closeIframe();
            return;
        }
        //////////////////////////////////////////////////////////////////

        editMode = true;
        currentEntityId = result;

        //for new addresses and contacts needs to load entity information to get new guids
        if (hasNewAddresses() || hasNewContacts()) {
            loadEntity(function () {
                showSuccessModal();
            });
        } else {
            saveAddressesCallback();
            saveContactsCallback();
            showSuccessModal();
        }

        $("#nif").prop("disabled", true);
        $("#nifCountry").prop("disabled", true);
    });
}

function populateEnterpriseActivtyCodes() {
    var props = {
        type: "GET",
        url: "cae/"
    };
    callService(props, function (result) {
        if (result != null) {
            $.each(result, function (idx, item) {
                if (item != null) {
                    item.codeDescription = item.code + " - " + item.description;
                }
            });
        }

        populateDropDown("cae", result, "id", "codeDescription", true, "");
    });
}

function customizeForIframe() {
    if (isInIframe()) {
        $("#header").hide();
        $(".navbar").hide();
        $(".foot").hide();
        $(".page-title").hide();
    }
}

function closeIframe() {
    if (window.parent.closeModal) {
        window.parent.closeModal("modal-iframe");
    }
}