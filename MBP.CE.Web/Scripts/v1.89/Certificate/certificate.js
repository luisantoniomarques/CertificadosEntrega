
var vehiclesResult, selectedVehicle, deliveryType, certificateEntities;

function saveFields(fields, callback) {

    if (window.selectedVehicle == null || window.selectedVehicle.certificate == null || window.selectedVehicle.certificate.id == null)
        return;

    var props = {
        type: "PUT",
        url: "certificate/" + window.selectedVehicle.certificate.id,
        data: { fields: fields }
    };

    callService(props, callback);
}

function saveEntityFields(fields, callback) {

    if (window.selectedVehicle == null || window.selectedVehicle.certificate == null || window.selectedVehicle.certificate.id == null)
        return;

    var props = {
        type: "POST",
        url: "certificateentity",
        data: fields,
        async: false
    };

    callService(props, callback);
}

function removeAllCertificateEntities(callback) {
    if (window.selectedVehicle != null && window.selectedVehicle.certificate != null && window.selectedVehicle.certificate.id != null) {
        var props = {
            type: "DELETE",
            url: "certificate/outletentities/" + window.selectedVehicle.certificate.id
        };

        callService(props, function (result) {
            window.selectedVehicle.certificate.userid = null;
            window.selectedVehicle.certificate.ownerid = null;
            window.selectedVehicle.certificate.rentalid = null;
            window.selectedVehicle.certificate.lesseeid = null;
            window.selectedVehicle.certificate.contactid = null;

            if (callback) {
                callback(result);
            }
        });
    }
}

function gotoStep(stepNumber) {
    var stepId = stepNumber - 1;
    $('.nav-tabs li:eq(' + stepId + ') a').tab('show');
}

function saveSelectedVehicle() {
    if (window.selectedVehicle != null) {
        window.selectedVehicle.certificates = null;
    }

    Cookies.set(CookieName.SelectedVehicle, window.selectedVehicle, { expires: 1, path: "/" });
}

function loadSelectedVehicle() {
    window.selectedVehicle = Cookies.getJSON(CookieName.SelectedVehicle);

    if (window.selectedVehicle != null
        && window.selectedVehicle.certificate != null
        && window.location.href.indexOf("certificate/new") > -1) {
        window.selectedVehicle.certificate = null;
    }

    Cookies.remove(CookieName.SelectedVehicle);
}

function loadCertificateStatusCombo(selectedValue) {
    var certStatus = [
            { value: CertificateStatus.Archived, text: getResource("certificate.status.archived") },
            { value: CertificateStatus.Assigned, text: getResource("certificate.status.assigned") },
            { value: CertificateStatus.Available, text: getResource("certificate.status.available") },
            { value: CertificateStatus.Delivered, text: getResource("certificate.status.delivered") },
            { value: CertificateStatus.Closed, text: getResource("certificate.status.closed") }
    ];
    populateDropDown("state", certStatus, "value", "text", true);

    if (selectedValue) {
        setEditorValue("state", selectedValue);
    }
}

$(document).ready(function () {
    loadSelectedVehicle();
});