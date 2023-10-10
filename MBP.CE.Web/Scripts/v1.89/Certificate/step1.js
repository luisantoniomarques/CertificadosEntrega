$(document).ready(function() {

    var partial = $("#delivery-type-partial");
    if (partial != null) {
        Handlebars.registerPartial("delivery-type", partial.html());
    }

    $("#form-new-cert-step1 .btn-goback").click(function () {
        window.location.href = LocationPath.getVirtualDirectoryName() + "vehicle/search";
    });

    $("#form-new-cert-step1 .btn-clear").click(function () {
        $("input:radio").prop('checked', false);
    });

    $("#form-new-cert-step1 .btn-next").click(function () {
        var formStep1 = $("#form-new-cert-step1");
        var formDetails = $("#form-vehicle-details");

        if (formStep1 == null || formDetails == null) {
            return;
        }

        formStep1.valid();
        formDetails.valid(true);

        if (!formDetails.valid(true) || !formStep1.valid())
            return;

        window.deliveryType = getEditorValue("deliveryType");

        if (window.selectedVehicle != null && (window.selectedVehicle.certificate == null || window.selectedVehicle.certificate.id === window.EmptyGuid)) {
            var props = {
                type: "POST",
                url: "certificate/" + window.selectedVehicle.id
            };

            callService(props, function(result) {
                if (result != null && result.length > 0) {
                    if (result === EmptyGuid) {
                        alert(getResource("certificate.onlyOneNewCertificate"));
                        return;
                    }

                    window.selectedVehicle.certificate = { id: result };
                    gotoStep2();
                }
            });
        } else {
            if (window.selectedVehicle.certificate.deliverytype !== convertToNumber(window.deliveryType)) {
                removeAllCertificateEntities(function() { gotoStep2(); });
            } else {
                gotoStep2();
            }
        }
    });

    $("#form-new-cert-step1").validate({
        rules: { }
    });

    initStep1();

});

function gotoStep2() {
    saveFields(step1Fields(), function() {
        initStep2();
        initStep3();
        gotoStep(2);
    });
}

function step1Fields() {
    var editors = [
        { Name: "noesis_deliverytype", Value: window.deliveryType, Type: FieldType.OptionSet }
    ];

    window.selectedVehicle.certificate.deliverytype = window.deliveryType;

    return editors;
}

function initStep1() {
    if (window.selectedVehicle != null
        && window.selectedVehicle.certificate != null
        && window.selectedVehicle.certificate.id != null
        && window.selectedVehicle.certificate.id !== EmptyGuid) {

        var props = {
            type: "GET",
            url: "certificate/" + window.selectedVehicle.certificate.id
        }

        callService(props, function(result) {
            window.selectedVehicle.certificate = result;
            initializeDeliveryTypes(result != null ? result.deliverytype : null);
        });
    } else {
        initializeDeliveryTypes();
    }
}

function initializeDeliveryTypes(selectedDeliveryType) {
    var deliveryTypes = loadDeliveryTypes();

    //find selected delivery type
    if (selectedDeliveryType != null && deliveryTypes != null) {
        var selected = null;

        if (deliveryTypes.Owner != null) {
            selected = deliveryTypes.Owner.filter(function (data) { return data.Value === selectedDeliveryType; });
        }

        if ((selected == null || selected.length === 0) && deliveryTypes.Renting != null) {
            selected = deliveryTypes.Renting.filter(function (data) { return data.Value === selectedDeliveryType; });
        }

        if (selected != null && selected.length === 1) {
            selected[0].Checked = true;
        }
    }

    applyTemplate("delivery-type-template", "deliveryTypesList", deliveryTypes);
}

function loadDeliveryTypes() {
    var deliveryTypes = {};

    deliveryTypes.Owner = [
        { Value: DeliveryType.DE,       Description: getResource("certificate.deliveryType.DE") },
        { Value: DeliveryType.SE,       Description: getResource("certificate.deliveryType.SE") },
        { Value: DeliveryType.PP,       Description: getResource("certificate.deliveryType.PP") },
        { Value: DeliveryType.PT,       Description: getResource("certificate.deliveryType.PT") },
        { Value: DeliveryType.RC,       Description: getResource("certificate.deliveryType.RC") },
        { Value: DeliveryType.RAC,      Description: getResource("certificate.deliveryType.RAC") },
        { Value: DeliveryType.F,        Description: getResource("certificate.deliveryType.F") },
        { Value: DeliveryType.E,        Description: getResource("certificate.deliveryType.E") }
    ];

    deliveryTypes.Renting = [
        { Value: DeliveryType.ELR_PP,   Description: getResource("certificate.deliveryType.ELR_PP") },
        { Value: DeliveryType.ELR_PT,   Description: getResource("certificate.deliveryType.ELR_PT") },
        { Value: DeliveryType.ELR_E,    Description: getResource("certificate.deliveryType.ELR_E") }
    ];

    return deliveryTypes;
}