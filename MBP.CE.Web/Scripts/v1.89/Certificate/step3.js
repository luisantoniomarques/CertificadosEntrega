$(document).ready(function () {

    $("#form-complete-details .datepicker").datepicker({
        showAnim: "slideDown",
        dateFormat: "dd-mm-yy",
        changeMonth: true,
        changeYear: true,
        onClose: function () {
            calculateWarrantyEndDate();
        }
    });

    $("#panel-control-step3 .btn-clear").click(function () {
        setEditorValue("deliveryDate", "");
        setEditorValue("specialUse", "");
        setEditorValue("transportType", "");
        setEditorValue("paymentType", "");
        setEditorValue("financing", "");
        setEditorValue("mileage", "");
        setEditorValue("ssCardName", "");
        setEditorValue("details-numberOfKeys", ""); //js
        setEditorValue("warrantyStartDateUsed", "");

        if ($("#licenseType").is(":enabled")) {
            setEditorValue("licenseType", "");
        }

        if ($("#details-license").is(":enabled")) {
            setEditorValue("details-license", "");
            $("#details-license").change();
        }

        if ($("#details-licenseIssueDate").is(":enabled")) {
            setEditorValue("details-licenseIssueDate", "");
            $("#details-licenseIssueDate").change();
        }

        if ($("#warrantyEndDate").is(":enabled")) {
            setEditorValue("warrantyEndDate", "");
        }

        $("#paymentType").change();

        $("#form-complete-details input:radio").prop("checked", false);
        calculateWarrantyEndDate();
        resetErrors();
    });

    $("#panel-control-step3 .btn-goback").click(function () {
        gotoStep(2);
    });

    $("#panel-control-step3 .btn-next").click(function () {
        resetErrors();

        var formStep3 = $("#form-complete-details");
        var formDetails = $("#form-vehicle-details");

        if (formStep3 == null || formDetails == null) {
            return;
        }

        var isStep3Valid = formStep3.valid(true);
        var isVehicleValid = formDetails.valid(true);
        var certificateId = window.selectedVehicle.certificate.id;

        if (!isVehicleValid || !formStep3.valid(true) || certificateId == null)
            return;

        updateVehicleInfo();

        saveFields(step3Fields(), function () {
            var props = {
                type: "POST",
                url: "/certificate/" + certificateId + "/finalize"
            };

            callService(props, function () {
                window.open(LocationPath.getVirtualDirectoryName() + "certificate/pdf?certificateId=" + certificateId, "_blank");
                showSuccessModalWithRedirect("vehicle/search");
            });
        });
    });

    $(document).on("change", "#paymentType", function () {
        verifyPaymentType(getEditorValue("paymentType"));
    });

    function setLicenseMandatory(mandatory) {
        if (!$("#details-license").is(":enabled")) {
            mandatory = true;
        }

        setMandatory("licenseType", mandatory);
        setMandatory("details-license", mandatory);
        setMandatory("details-licenseIssueDate", mandatory);

        var licenseWarning = $("#panel-warning-license");
        licenseWarning.hide();
        if (!mandatory) {
            licenseWarning.show();
        }
    }

    $("#warrantyStartDateUsed").change(function () {
        setEditorValue("warrantyStartDate", getEditorValue("warrantyStartDateUsed"));
    });

    $("#deliveryDate").change(function () {
        if ($("#warrantyStartDateUsed").val() === "") {
            setEditorValue("warrantyStartDateUsed", getEditorValue("deliveryDate"));
            $("#warrantyStartDateUsed").change();
        }
    });

    $("#licenseType").bind("change", function () {
        var licenseType = getEditorValue("licenseType");
        var mandatory = (licenseType != null && licenseType.length > 0);
        setLicenseMandatory(mandatory);
    });

    $("#details-license").bind("keyup change focusout", function () {
        var license = getEditorValue("details-license");
        setEditorValue("license", license);

        var mandatory = (license != null && license.length > 0);
        setLicenseMandatory(mandatory);
    });

    $("#details-licenseIssueDate").bind("keyup change focusout", function () {
        var licenseIssueDate = getEditorValue("details-licenseIssueDate");
        setEditorValue("licenseDate", $.datepicker.formatDate("dd-mm-yy", licenseIssueDate));

        var mandatory = (licenseIssueDate != null && licenseIssueDate.toString().length > 0);
        setLicenseMandatory(mandatory);
    });

    $.validator.addMethod("warrantyEndDateGreaterThanWarratyStarDate", function () {
        var starDate = getEditorValue("warrantyStartDateUsed");
        var endDate = getEditorValue("warrantyEndDate");
        return starDate <= endDate;
    }, getResource("certificate.warrantyEndDateGreaterThanWarrantyStartDate"));

    $.validator.addMethod("cardNameSize", function () {
        var response = $.ajax({
            type: "GET",
            async: false,
            url: LocationPath.getVirtualDirectoryName() + "entity/ValidateCardName?name=" + getEditorValue("ssCardName")
        }).responseText;
        return $.parseJSON(response);
    }, getResource("entity.cardNameSizeExceeded"));

    $.validator.addMethod("cardNameFormat", function (e) {

        var regex = /^[a-zA-ZéúíóáÉÚÍÓÁèùìòàÈÙÌÒÀõãñÕÃÑêûîôâÊÛÎÔÂëÿüïöäËYÜÏÖÄ\-\'\s]+$/;
        var str = e;
        if (regex.test(str)) {
            return true;
        } else {
            return false;
        }
    }, getResource("entity.cardNameInvalid"));

    $.validator.addMethod("deliveryDateRule", function () {
        var vehicle = window.selectedVehicle;

        //welber - 24/10/2019 - Data da Campanha certificado 4 anos
        var maxDateCert = $("#MaxDate").val();

        if (vehicle != null) {
            var deliveryDate = $("#deliveryDate");

            deliveryDate.rules("remove");
            deliveryDate.rules("add", { daymonthyearfour: true });

            switch (vehicle.certificateType) {
                case CreateCertificateType.StarSelection:
                    deliveryDate.rules("add", { greaterOrEqualThan: ["details-licenseIssueDate", getResource("certificate.deliveryDateGreaterOrEqualThanLicenseDate")] });
                    break;
                case CreateCertificateType.MBCertified:
                    deliveryDate.rules("add", { greaterOrEqualThan: ["details-licenseIssueDate", getResource("certificate.deliveryDateGreaterOrEqualThanLicenseDate")] });  //js
                    break;
                case CreateCertificateType.MBCertified4:
                    deliveryDate.rules("add", { greaterOrEqualThan: ["details-licenseIssueDate", getResource("certificate.deliveryDateGreaterOrEqualThanLicenseDate")] });
                    //welber - 24/10/2019 - Data da Campanha certificado 4 anos
                    //deliveryDate.rules("add", { lessOrEqualThan: [new Date("2018-11-30"), "Campanha MBCertified 4 Anos - Data de entrega tem que ser inferior a 30-11-2018"] });
                    deliveryDate.rules("add", { lessOrEqualThan: [new Date(maxDateCert), "Periodo da Campanha MBCertified 4 Anos - Terminou"] });
                    break;

                case CreateCertificateType.New:
                case CreateCertificateType.WithoutLicensePlate:
                    deliveryDate.rules("add", { deliveryDateForNewVehicles: true });
            }

            deliveryDate.valid();

            return true;
        }

        return false;
    }, "");

    $.validator.addMethod("starselectionmileage", function (value) {
        var vehicle = window.selectedVehicle;

        if (vehicle != null && vehicle.certificateType === CreateCertificateType.StarSelection) {
            return StarSelection.validateStarSelectionMileage(vehicle.brandname, value);
        }

        return true;
    }, getResource("vehicle.invalidStarSelectionMileage"));

    $.validator.addMethod("deliveryDateForNewVehicles", function () {
        var vehicle = window.selectedVehicle;
        var deliveryDate = getEditorValue("deliveryDate");
        var licenseDate = getEditorValue("details-licenseIssueDate");
        if (vehicle != null && vehicle.certificateType !== CreateCertificateType.WithoutLicensePlate) {
            if (deliveryDate instanceof Date && licenseDate instanceof Date) {
                if (deliveryDate < licenseDate) {
                    if (confirm(getResource("certificate.confirmDeliveryDateLessThanLicenseDate"))) {
                        $("#deliveryDate").rules("remove", "deliveryDateForNewVehicles");
                        return true;
                    } else {
                        setEditorValue("deliveryDate", "");
                        return false;
                    }
                }
                return true;
            }
        } else {
            return true;
        }
        return false;
    }, "");

    $("#form-complete-details").validate({
        rules: {
            "deliveryDate": { deliveryDateRule: true },
            "mileage":          { positiveNumber6length: true, starselectionmileage: true },
            "ssCardName":       { cardNameSize: true, cardNameFormat: true },
            "warrantyEndDate": { warrantyEndDateGreaterThanWarratyStarDate: true }
        }
    });

});

function initStep3() {
    if (window.selectedVehicle != null) {
        var vehicle = window.selectedVehicle;
        applyTemplate("vehicle-confirm-template", "confirmInfo", vehicle);
        initCompleteDetails();
        calculateWarrantyEndDate();
    }
}

function isCertificateMeConnect() {
    return getEditorValue("certificateMeConnect") === true.toString() && $("input[name=certificateMeConnect]").is(":visible");
}


function isCertificateProAdapter() {
    return getEditorValue("certificateProAdapter") === true.toString() && $("input[name=certificateProAdapter]").is(":visible");
}

function isCertificateProConnect() {
    return getEditorValue("certificateProConnect") === true.toString() && $("input[name=certificateProConnect]").is(":visible");
}


//js
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;
    return true;
}
//js

function step3Fields() {
    var fields = [
        { Name: "noesis_warrantystartdate", Value: getEditorValue("warrantyStartDate"), Type: FieldType.DateTime },
        { Name: "noesis_warrantyenddate", Value: getEditorValue("warrantyEndDate"), Type: FieldType.DateTime },
        { Name: "noesis_deliverydate", Value: getEditorValue("deliveryDate"), Type: FieldType.DateTime },
        { Name: "noesis_currentmileage", Value: getEditorValue("mileage"), Type: FieldType.Integer },
        { Name: "noesis_financingperiod", Value: getEditorValue("financing"), Type: FieldType.Integer },
        { Name: "noesis_purchaseanddeliverycontact", Value: getEditorValue("buyAndDeliveryQuestion"), Type: FieldType.Boolean },
        { Name: "noesis_licenseplatetype", Value: getEditorValue("licenseType"), Type: FieldType.OptionSet },
        { Name: "noesis_specialusetype", Value: getEditorValue("specialUse"), Type: FieldType.OptionSet },
        { Name: "noesis_transporttype", Value: getEditorValue("transportType"), Type: FieldType.OptionSet },
        { Name: "noesis_paymenttype", Value: getEditorValue("paymentType"), Type: FieldType.OptionSet },
        { Name: "noesis_cardname", Value: getEditorValue("ssCardName"), Type: FieldType.String },
        { Name: "noesis_numberofkeys", Value: getEditorValue("details-numberOfKeys"), Type: FieldType.Integer } //js
    ];

    var meconnect = isCertificateMeConnect();
    if (meconnect !== null) {
        fields.push({ Name: "noesis_mercedesmeconnect", Value: meconnect, Type: FieldType.Boolean });
    }


    var vehicle = window.selectedVehicle;
    var strFirstSixC = vehicle.chassis.substring(0, 6);

    var index = Chassis_Prefix_MBVans.MercedesProAdapter.indexOf(strFirstSixC);
    if (index != -1) { 
        var proadapter = isCertificateProAdapter();
        if (proadapter !== null) {
            fields.push({ Name: "noesis_mercedesproadapter", Value: proadapter, Type: FieldType.Boolean }); //js
        }
    } else {
        isMercedesProAdapter = false;
    }

    var index = Chassis_Prefix_MBVans.MercedesProConnect.indexOf(strFirstSixC);
    if (index != -1) {
        var proconnect = isCertificateProConnect();
        if (proconnect !== null) {
            fields.push({ Name: "noesis_mercedesproconnect", Value: proconnect, Type: FieldType.Boolean }); //js
        }
    } else {
        isMercedesProConnect = false;
    }
    

    return fields;
}

function vehicleData(vehicle) {
    return {
        chassis: vehicle.chassis,
        komission: vehicle.komission,
        engine: vehicle.engine,
        license: vehicle.license,
        licenseIssueDate: vehicle.licenseIssueDate,
        modelid: vehicle.modelid,
        outletid: vehicle.outletid,
        starselection: vehicle.starselection,
        baumustercode: vehicle.baumustercode,
        mileage: vehicle.mileage,
        brandid: vehicle.brandid,
        certificateType: vehicle.certificateType
    };
}

function updateVehicleInfo() {
    var licenseEnabled = $("#details-license").is(":enabled");
    var license = getEditorValue("details-license");

    if (licenseEnabled && license != null && license.length > 0) {
        var vehicle = window.selectedVehicle;

        vehicle.license = license;
        vehicle.licenseIssueDate = getEditorValue("details-licenseIssueDate");

        var props = {
            type: "POST",
            url: "vehicle/",
            data: vehicleData(vehicle)
        };

        callService(props);
    }
}

function calculateWarrantyEndDate() {
    var vehicle = window.selectedVehicle;

    if (vehicle != null) {
        var licenseIssueDate = getEditorValue("details-licenseIssueDate");
        var deliveryDate = getEditorValue("deliveryDate");

        var warranty = Warranty.calculateWarrantyEndDate(vehicle, licenseIssueDate, deliveryDate);

        setEditorValue("warrantyStartDate", warranty.warrantyStartDate || getEditorValue("warrantyStartDate"));
        setEditorValue("warrantyEndDate", warranty.warrantyEndDate || getEditorValue("warrantyEndDate"));

        enableEditor("warrantyEndDate", ($.inArray(vehicle.certificateType, [CreateCertificateType.Used]) !== -1));
    }
}