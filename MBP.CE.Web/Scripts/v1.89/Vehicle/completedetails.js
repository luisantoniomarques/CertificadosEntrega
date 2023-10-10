$(document).ready(function () {

    getLookupData("licenseplatetype", "pt", function (result) {
        populateDropDown("licenseType", result, "Key", "Value", true, "");
    }, false);

    getLookupData("specialusetype", "pt", function (result) {
        populateDropDown("specialUse", result, "Key", "Value", true, "");
    }, false);

    getLookupData("paymenttype", "pt", function (result) {
        populateDropDown("paymentType", result, "Key", "Value", true, "");
    }, false);

    getLookupData("transporttype", "pt", function (result) {
        populateDropDown("transportType", result, "Key", "Value", true, "");
    }, false);

    var tempFinancingPeriodData = [
        { value: "12",  text: getResource("vehicle.financingPeriod.12months") },
        { value: "24",  text: getResource("vehicle.financingPeriod.24months") },
        { value: "36",  text: getResource("vehicle.financingPeriod.36months") },
        { value: "48",  text: getResource("vehicle.financingPeriod.48months") },
        { value: "60",  text: getResource("vehicle.financingPeriod.60months") },
        { value: "72",  text: getResource("vehicle.financingPeriod.72months") },
        { value: "84",  text: getResource("vehicle.financingPeriod.84months") },
        { value: "96",  text: getResource("vehicle.financingPeriod.96months") },
        { value: "108", text: getResource("vehicle.financingPeriod.108months") },
        { value: "120", text: getResource("vehicle.financingPeriod.120months") },
        { value: "0",   text: getResource("vehicle.financingPeriod.unknown") }
    ];
    populateDropDown("financing", tempFinancingPeriodData, "value", "text", true, "");

    initCompleteDetails();
});

function verifyPaymentType(paymentType) {
    if (paymentType == null || paymentType === "" || convertToNumber(paymentType) === PaymentType.Cash) {
        setEditorValue("financing", "");
        setMandatory("financing", false);
        $("#financingGroup").hide();
    } else {
        setMandatory("financing", true);
        $("#financingGroup").show();
    }
}

function initCompleteDetails() {
    var vehicle = window.selectedVehicle;

    if (vehicle == null)
        return;

    var licenseWarning = $("#panel-warning-license");
    licenseWarning.hide();
    if (vehicle.license == null || vehicle.license.length === 0) {
        licenseWarning.show();
    }

    switch (vehicle.certificateType) {
        case CreateCertificateType.WithoutLicensePlate:
            setMandatory("licenseType", false);
            setMandatory("details-license", false);
            setMandatory("details-licenseIssueDate", false);

            enableEditor("licenseType");
            enableEditor("details-license");
            enableEditor("details-licenseIssueDate");
            break;

        case CreateCertificateType.Used:
            $(".vehicleUsed").css("display", "block");
            break;
    }



    var strFirstSix = vehicle.chassis.substring(0, 6);

    var index = Chassis_Prefix_MBVans.MercedesProAdapter.indexOf(strFirstSix);
    if (index != -1) { 
        isMercedesProAdapter = true;
    } else {
        isMercedesProAdapter = false;
    }

    var index = Chassis_Prefix_MBVans.MercedesProConnect.indexOf(strFirstSix);
    if (index != -1) {
        isMercedesProConnect = true;
    } else {
        isMercedesProConnect = false;
    }
    
       
    if (isMercedesProAdapter && (vehicle.proadapter == true || vehicle.proadapter == null)) {
        $("#mercedesproconnect").css("display", "none");
        $("#mercedesproconnectinput").css("display", "none");

        $("#certmercedesproconnect").css("display", "none");
        $("#certProConnectY").css("display", "none");
        $("#certProConnectN").css("display", "none");
        $("#lblCertProConnectY").css("display", "none");
        $("#lblCertProConnectN").css("display", "none");

    } else
        if (isMercedesProAdapter && (vehicle.proadapter == false || vehicle.proadapter == null)) {
            $("#mercedesproconnect").css("display", "none");
            $("#mercedesproconnectinput").css("display", "none");

            $("#certmercedesproconnect").css("display", "none");

            //$("#certProAdapterOptions").css("display", "none");

            $("#certmercedesproadapter").css("display", "none");
        } else 
            if (isMercedesProConnect && (vehicle.proconnect == true || vehicle.proconnect == null)) {
                $("#mercedesproadapter").css("display", "none");
                $("#mercedesproadapterinput").css("display", "none");

                $("#certmercedesproadapter").css("display", "none");
                $("#certProAdapterY").css("display", "none");
                $("#certProAdapterN").css("display", "none");
                $("#lblCertProAdapterY").css("display", "none");
                $("#lblCertProAdapterN").css("display", "none");
            } else
                if (isMercedesProConnect && (vehicle.proconnect == false || vehicle.proconnect == null)) {
                    $("#mercedesproadapter").css("display", "none");
                    $("#mercedesproadapterinput").css("display", "none");

                    $("#certmercedesproadapter").css("display", "none");

                    //$("#certProConnectOptions").css("display", "none");

                    $("#certmercedesproconnect").css("display", "none");
                } else
                    if (isMercedesProAdapter == false && isMercedesProConnect == false) {
                        //$("#certProAdapterOptions").css("display", "none");
                        //$("#certProConnectOptions").css("display", "none");

                        $("#mercedesproconnect").css("display", "none");
                        $("#mercedesproconnectinput").css("display", "none");
                                
                        $("#mercedesproadapter").css("display", "none");
                        $("#mercedesproadapterinput").css("display", "none");

                        $("#certmercedesproconnect").css("display", "none");
                        $("#certmercedesproadapter").css("display", "none");

                        $("#certProAdapterY").css("display", "none");
                        $("#certProAdapterN").css("display", "none");
                        $("#lblCertProAdapterY").css("display", "none");
                        $("#lblCertProAdapterN").css("display", "none");

                        $("#certProConnectY").css("display", "none");
                        $("#certProConnectN").css("display", "none");
                        $("#lblCertProConnectY").css("display", "none");
                        $("#lblCertProConnectN").css("display", "none");
                    }

    if (vehicle.proadapter === true) {
        $("#certificateProAdapterGroup").show();
    } else {
        $("#certificateProAdapterGroup").hide();
    }

    if (vehicle.proconnect === true) {
        $("#certificateProConnectGroup").show();
    } else {
        $("#certificateProConnectGroup").hide();
    }


    var isStarSelection = (vehicle.certificateType === CreateCertificateType.StarSelection);
    var isMBCertified = (vehicle.certificateType === CreateCertificateType.MBCertified);
    var isUsed1 = (vehicle.certificateType === CreateCertificateType.Used1);

    setMandatory("mileage", isStarSelection);

    var delivery = convertToNumber(deliveryType);

    var cashPaymentOption = $("#paymentType option[value=" + PaymentType.Cash + "]");
    if ($.inArray(delivery, [DeliveryType.ELR_E, DeliveryType.ELR_PP, DeliveryType.ELR_PT]) >= 0) {
        cashPaymentOption.hide();
    } else {
        cashPaymentOption.show();
    }

    if (isStarSelection) {
        $("#specialUseGroup").hide();
        $("#paymentTypeGroup").hide();

        $("#licenseType").prop("disabled", true);
        setEditorValue("licenseType", LicensePlateType.Regular);
        setEditorValue("mileage", vehicle.mileage);

        $("#mileagemb").css("display", "none");
        $("#mileageu1").css("display", "none");
        $("#sscardnamemb").css("display", "none");
        $("#sscardnameu1").css("display", "none");
    } else
        if (isMBCertified) {
            $("#specialUseGroup").hide();
            $("#paymentTypeGroup").hide();

            $("#licenseType").prop("disabled", true);
            setEditorValue("licenseType", LicensePlateType.Regular);
            setEditorValue("mileage", vehicle.mileage);

            $("#mileagess").css("display", "none");
            $("#mileageu1").css("display", "none");
            $("#sscardnamess").css("display", "none");
            $("#sscardnameu1").css("display", "none");
        } else
            if (isUsed1) {
                $("#specialUseGroup").hide();
                $("#paymentTypeGroup").hide();

                $("#licenseType").prop("disabled", true);
                setEditorValue("licenseType", LicensePlateType.Regular);
                setEditorValue("mileage", vehicle.mileage);

                $("#mileagess").css("display", "none");
                $("#mileagemb").css("display", "none");
                $("#sscardnamess").css("display", "none");
                $("#sscardnamemb").css("display", "none");
            } else
            {
                $("#mileageGroup").hide();
                $("#ssCardNameGroup").hide();
                $("#mileagess").css("display", "none");
                $("#mileageu1").css("display", "none");
                $("#sscardnamess").css("display", "none");
            }

    if (vehicle.meconnect === true) {
        $("#certificateMeConnectGroup").show();
    } else {
        $("#certificateMeConnectGroup").hide();
    }

    setEditorValue("details-license", vehicle.license);
    setEditorValue("details-licenseIssueDate", vehicle.licenseIssueDate);

    if (vehicle.certificate != null && vehicle.certificate.vehicleid != null && vehicle.certificate.vehicleid !== EmptyGuid) {
        setCertificateEditors(vehicle);
    } else {
        loadCertificateForCompleteDetails();
    }
}

function setCertificateEditors(data) {
    initCompleteDetails
    if (data != null && data.certificate != null) {
        if (data.certificate.purchaseanddeliverycontact || $("input:radio[name='buyAndDeliveryQuestion']").is(':disabled')) {
            setEditorValue("buyAndDeliveryQuestion", data.certificate.purchaseanddeliverycontact);
        }

        setEditorValue("warrantyStartDate", data.certificate.warrantystartdate);
        setEditorValue("warrantyStartDateUsed", data.certificate.warrantystartdate);
        setEditorValue("warrantyEndDate", data.certificate.warrantyenddate);
        setEditorValue("deliveryDate", data.certificate.date);
        setEditorValue("details-licenseIssueDate", data.licenseIssueDate);
        setEditorValue("mileage", data.certificate.mileage || data.mileage);
        setEditorValue("financing", data.certificate.financingperiod);
        setEditorValue("licenseType", (data.certificate.licenseplatetype || getEditorValue("licenseType")));
        setEditorValue("transportType", data.certificate.transporttype);
        setEditorValue("specialUse", data.certificate.specialusetype);
        setEditorValue("paymentType", data.certificate.paymenttype);
        setEditorValue("ssCardName", data.certificate.cardname);
        setEditorValue("certificateMeConnect", data.certificate.meconnect);

        var strFirstSixChars = data.chassis.substring(0, 6);

        var index = Chassis_Prefix_MBVans.MercedesProAdapter.indexOf(strFirstSixChars);
        if (index != -1) { 
            isMercedesProAdapter = true;
            setEditorValue("certificateProAdapter", data.certificate.proadapter);   //js
        } else {
            isMercedesProAdapter = false;
        }

        var index = Chassis_Prefix_MBVans.MercedesProConnect.indexOf(strFirstSixChars);
        if (index != -1) {
            isMercedesProConnect = true;
            setEditorValue("certificateProConnect", data.certificate.proconnect);   //js
        } else {
            isMercedesProConnect = false;
        }
                
        verifyPaymentType(data.certificate.paymenttype);
    }
}

function loadCertificateForCompleteDetails() {
    if (window.selectedVehicle != null && window.selectedVehicle.certificate != null && window.selectedVehicle.certificate.id != null && window.selectedVehicle.certificate.id.length > 0) {
        var props = {
            type: "GET",
            url: "certificate/" + window.selectedVehicle.certificate.id
        }
        callService(props, function (result) {
            window.selectedVehicle.certificate = result;
            setCertificateEditors(window.selectedVehicle);

            if (window.loadCertificateForCompleteDetailsCompleted) {
                loadCertificateForCompleteDetailsCompleted();
            }
        });
    }
}