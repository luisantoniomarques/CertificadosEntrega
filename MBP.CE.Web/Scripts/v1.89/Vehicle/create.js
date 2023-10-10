$(document).ready(function () {

    $("#vin, #komission").change(function () {
        var editors = {
            chassis: $.trim(getEditorValue("vin")),
            comission: $.trim(getEditorValue("komission")),
            ignoreOutlet: true
        };

        if ((editors.chassis != null && editors.chassis.length > 0) || (editors.comission != null && editors.comission.length > 0)) {
            var props = {
                type: "GET",
                url: "vehicles?" + $.param(editors)
            };

            callService(props, function (result) {
                CreateVehicle.showVehicleAvailability(result);
            });
        }
    });

    $("#brand").change(function () {
        var brandId = getEditorValue("brand");
        CreateVehicle.loadModelsByBrand(brandId);
    });

    $(".btn-clear").click(function () {
        CreateVehicle.clear();
    });

    $(".btn-create").click(function () {
        CreateVehicle.create();
    });

    function mbcertifiedSelected() {
        var selectedValue = $("#certificateType").val();
        return (selectedValue === CreateCertificateType.MBCertified.toString());
    }   //js

    function mbcertified4Selected() {
        var selectedValue = $("#certificateType").val();
        return (selectedValue === CreateCertificateType.MBCertified4.toString());
    }

    function starselectionSelected() {
        var selectedValue = $("#certificateType").val();
        return (selectedValue === CreateCertificateType.StarSelection.toString());
    }

    function withoutLicenceSelected() {
        var selectedValue = $("#certificateType").val();
        return (selectedValue === CreateCertificateType.WithoutLicensePlate.toString());
    }

    function used1Selected() {
        var selectedValue = $("#certificateType").val();
        return (selectedValue === CreateCertificateType.Used1.toString());
    }   //js03082018

    //$.validator.addMethod("baumuster", function (value) {
    //    if (value !== "") {
    //        return CreateVehicle.validateBaumuster();
    //    }
    //    return true;
    //}, getResource("vehicle.invalidBaumuster"));

    //$.validator.addMethod("vinandbaumuster", function (value) {
    //    if (value !== "") {
    //        return CreateVehicle.validateVinWithBaumuster();
    //    }
    //    return true;
    //}, getResource("vehicle.invalidBaumuster"));

    $.validator.addMethod("starselectionmileage", function (value) {
        if (mbcertifiedSelected() && value !== "") {
            var brand = $("#brand :selected").text();
            return StarSelection.validateStarSelectionMileage(brand, value);
        }
        if (used1Selected() && value !== "") {
            var brand = $("#brand :selected").text();
            return StarSelection.validateUsed1Mileage(brand, value);
        }
        return true;
    }, getResource("vehicle.invalidStarSelectionMileage"));

    $.validator.addMethod("starselectiondate", function (value) {
        if (mbcertifiedSelected() && value !== "") {
            var brand = $("#brand :selected").text();
            var date = getEditorValue("licenseIssueDate");
            return StarSelection.validateStarSelectionDate(brand, date);
        } else {
            if (used1Selected() && value !== "") {
                var brand = $("#brand :selected").text();
                var date = getEditorValue("licenseIssueDate");
                return StarSelection.validateUsed1Date(brand, date);
            }
        }
        return true;
    }, getResource("vehicle.invalidStarSelectionDate"));

    $.validator.addMethod("starselectionkomission", function (value) {
        if (starselectionSelected() && value !== "") {
            return StarSelection.validateKomissionStarSelection(value);
        }
        return true;
    }, getResource("vehicle.invalidKomissionStarSelection"));

    $.validator.addMethod("validateKomission", function (value) {
        if (value == null || value.length === 0) {
            return true;
        }

        var acceptedKomissionFirstDigitList = [0, 1, 5, 6, 7, 8];
        var firstDigit = Number(value[0]);

        return ($.inArray(firstDigit, acceptedKomissionFirstDigitList) !== -1);
    }, getResource("vehicle.invalidKomission"));

    $.validator.addMethod("validateKomissionSize", function (value) {
        return (value != null && value.length === 10);
    }, getResource("vehicle.invalidKomissionSize"));

    $.validator.addMethod("validateEngineSize", function (value) {
        return (value != null && value.length >= 10);
    }, getResource("vehicle.invalidEngineSize"));

    $.validator.addMethod("validateVINSize", function (value) {
        return (value != null && value.length === 17);
    }, getResource("vehicle.invalidVINSize"));

    $("#form-create-vehicle").validate({
        rules: {
            "licenseIssueDate": { daymonthyearfour: true, starselectiondate: true },
            //"baumuster": { vinandbaumuster: true, baumuster: true },
            "mileage": { positiveNumber6length: true, starselectionmileage: true },
            "komission": { validateKomissionSize: true, starselectionkomission: true, validateKomission: true },
            "engine": { validateEngineSize: true },
            "vin": { validateVINSize: true }
        }
    });

    $("#certificateType").change(function () {
        var starselectionMileageGroup = $("#starselectionMileage");

        //if (starselectionSelected()) {
        //    document.getElementById("mileageu1").style.display = "none";
        //    starselectionMileageGroup.show();
        //} else {
        //    starselectionMileageGroup.hide();
        //}

        //if (mbcertifiedSelected() || mbcertified4Selected()) {
        //    document.getElementById("mileageu1").style.display = "none";
        //    starselectionMileageGroup.show();
        //} else {
        //    if (used1Selected()) {
        //        document.getElementById("mileagemb").style.display = "none";
        //        starselectionMileageGroup.show();
        //    } else {
        //        starselectionMileageGroup.hide();
        //    }
        //} //js03082018

        //if (used1Selected()) {
        //    document.getElementById("mileagemb").style.display = "none";
        //    starselectionMileageGroup.show();
        //} else {
        //    //starselectionMileageGroup.hide();
        //}

        var withoutLicence = withoutLicenceSelected();
        setMandatory("license", !withoutLicence);
        setMandatory("licenseIssueDate", !withoutLicence);
    });

    CreateVehicle.init();
});

var CreateVehicle = new function () {

    function loadCertificateType(type, komission) {
        var comboValues = [];
        //welber - 24/10/2019 - Data da Campanha certificado 4 anos
        var maxDateCert = $("#MaxDate").val();


        var resource = {
            mbcertified: getResource("certificate.create.mbcertified2"), //js
            mbcertified4: getResource("certificate.create.mbcertified4"),
            //starselection: getResource("certificate.create.starselection"),   //js
            used: getResource("certificate.create.used"),
            used1: getResource("certificate.create.used1"),   //js03082018
            withoutLicense: getResource("certificate.create.nolicense")
        };

        switch (type) {
            //case CreateCertificateType.StarSelection:
            //    comboValues.push({ value: CreateCertificateType.MBCertified, text: resource.mbcertified });
            //    //comboValues.push({ value: CreateCertificateType.StarSelection, text: resource.starselection });
            //    comboValues.push({ value: CreateCertificateType.Used, text: resource.used });
            //    break;
            //js
            case CreateCertificateType.MBCertified:
                comboValues.push({ value: CreateCertificateType.MBCertified, text: resource.mbcertified });
                if (new Date() <= new Date(maxDateCert)) {
                    comboValues.push({ value: CreateCertificateType.MBCertified4, text: resource.mbcertified4 });
                }
                comboValues.push({ value: CreateCertificateType.Used, text: resource.used });
                break;
            //js

            case CreateCertificateType.WithoutLicensePlate:
                comboValues.push({ value: CreateCertificateType.WithoutLicensePlate, text: resource.withoutLicense });
                break;

            case CreateCertificateType.Used:
                comboValues.push({ value: CreateCertificateType.Used, text: resource.used });
                comboValues.push({ value: CreateCertificateType.Used1, text: resource.used1 });
                break;

            //js03082018
            case CreateCertificateType.Used1:
                comboValues.push({ value: CreateCertificateType.Used1, text: resource.used1 });
                break;

            default:
                //comboValues.push({ value: CreateCertificateType.StarSelection, text: resource.starselection });   //js
                comboValues.push({ value: CreateCertificateType.MBCertified, text: resource.mbcertified });   //js
                if (new Date() <= new Date(maxDateCert)) {
                    comboValues.push({ value: CreateCertificateType.MBCertified4, text: resource.mbcertified4 });
                }
                comboValues.push({ value: CreateCertificateType.WithoutLicensePlate, text: resource.withoutLicense });
                comboValues.push({ value: CreateCertificateType.Used, text: resource.used });
                //comboValues.push({ value: CreateCertificateType.Used1, text: resource.used1 });   //03082018
                break;
        }

        var firstDigitOfKomission = komission != null ? komission.substring(0, 1) : null;
        if ($.inArray(firstDigitOfKomission, [null, "0", "6"]) === -1) {
            comboValues = comboValues.filter(function (data) {
                return data.value !== CreateCertificateType.StarSelection;
            });
        }

        if ($.inArray(firstDigitOfKomission, [null, "5", "7", "8"]) === -1) {
            comboValues = comboValues.filter(function (data) {
                return data.value !== CreateCertificateType.Used1;
            });
        }

        populateDropDown("certificateType", comboValues, "value", "text", (comboValues.length > 1), "");
        $("#certificateType").trigger("change");
    }

    function loadOutlets() {
        var props = {
            type: "GET",
            url: "outlets.svc/rest/useroutlets"
        };
        callService(props, function (result) {
            populateDropDown("outlet", result, "id", "name", true, "");
            if (result != null && result.length === 1) {
                setEditorValue("outlet", result[0].id);
            }
        }, true);
    }

    function loadBrands() {
        var props = {
            type: "GET",
            url: "brands/"
        };
        callService(props, function (result) {
            populateDropDown("brand", result, "id", "name", false);
            setEditorText("brand", Brand.Mercedes);
            $("#brand").change();
        }, true);
    }

    this.init = function () {
        loadCertificateType();
        loadOutlets();
        loadBrands();
    }

    function loadModelsByBrand(brandId, callback) {
        populateDropDown("model", null);

        if (brandId != null && brandId.length > 0) {
            var props = {
                type: "GET",
                url: "brands/" + brandId + "/models"
            };

            callService(props, function (result) {
                populateDropDown("model", result, "id", "name", true, "");

                if (callback != null) {
                    callback();
                }
            }, true);
        }
    }

    this.loadModelsByBrand = loadModelsByBrand;

    function disableEditorIfHasInformation(editorId) {
        var editorValue = getEditorValue(editorId);
        enableEditor(editorId, (editorValue == null || editorValue.length === 0));
    }

    function vehicleHasLicense(vehicle) {
        return (vehicle.license != null && $.trim(vehicle.license).length > 0);
    }

    function setVehicleValues(vehicle) {
        var type = null;
        var komission = null;

        if (vehicle != null) {
            if (!vehicleHasLicense(vehicle)) {
                type = CreateCertificateType.WithoutLicensePlate;
            } else {
                var brand = $("#brand option[value='" + vehicle.brandid + "']").text();

                type = StarSelection.isValidStarSelection(brand, vehicle.mileage, vehicle.licenseIssueDate, vehicle.komission)
                    ? CreateCertificateType.StarSelection
                    : CreateCertificateType.Used;
            }

            var selectedBrand = getEditorValue("brand");

            setEditorValue("vin", vehicle.chassis);
            disableEditorIfHasInformation("vin");

            setEditorValue("komission", vehicle.komission);
            disableEditorIfHasInformation("komission");

            setEditorValue("engine", vehicle.engine);
            disableEditorIfHasInformation("engine");

            setEditorValue("license", vehicle.license);
            enableEditor("license", false);

            setEditorValue("licenseIssueDate", vehicle.licenseIssueDate);
            enableEditor("licenseIssueDate", false);

            setEditorValue("baumuster", vehicle.baumustercode);
            disableEditorIfHasInformation("baumuster");

            setEditorValue("mileage", vehicle.mileage || (vehicle.certificate != null ? vehicle.certificate.mileage : null));

            setEditorValue("brand", vehicle.brandid);
            disableEditorIfHasInformation("brand");

            if (selectedBrand !== vehicle.brandid) {
                loadModelsByBrand(getEditorValue("brand"), function () {
                    setEditorText("model", vehicle.model);
                    disableEditorIfHasInformation("model");
                });
            } else {
                setEditorText("model", vehicle.model);
                disableEditorIfHasInformation("model");
            }
            komission = vehicle.komission;

        }

        loadCertificateType(type, komission);
    }

    function clearWarnings() {
        $("#warning").html("");
    }

    function clear() {
        resetErrors();
        enableEditor("brand");
        clearWarnings();
        loadCertificateType();
        loadModelsByBrand(getEditorValue("brand"));

        $(["certificateType", "outlet", "mileage", "vin", "komission", "baumuster", "engine", "license", "licenseIssueDate", "model"])
            .each(function (index, value) {
                enableEditor(value);
                setEditorValue(value, "");
            });
    }

    this.clear = clear;

    function showAsAssigned(vehicle) {
        var selectedOutlet = getEditorValue("outlet");
        clear();
        setEditorValue("outlet", selectedOutlet);
        applyTemplate("vehicle-warning-assigned", "warning", vehicle);
    }

    function showAsAvailable(vehicle) {
        setVehicleValues(vehicle);
    }

    function showAsNotAvailable(vehicle) {
        clear();
        applyTemplate("vehicle-warning-not-available", "warning", vehicle);
    }

    function editorsValues() {
        return {
            chassis: getEditorValue("vin"),
            komission: getEditorValue("komission"),
            engine: getEditorValue("engine"),
            license: getEditorValue("license"),
            licenseIssueDate: getEditorValue("licenseIssueDate"),
            modelid: getEditorValue("model"),
            outletid: getEditorValue("outlet"),
            starselection: (getEditorValue("certificateType") === CreateCertificateType.StarSelection.toString()),
            baumustercode: getEditorValue("baumuster"),
            mileage: getEditorValue("mileage") === "" ? null : getEditorValue("mileage"),
            brandid: getEditorValue("brand"),
            certificateType: getEditorValue("certificateType")
        };
    }

    this.create = function () {
        resetErrors();

        var isValid = $("#form-create-vehicle").valid(true);

        if (!isValid) {
            return;
        }

        var props = {
            type: "POST",
            url: "vehicle/",
            data: editorsValues()
        };

        callService(props, function () {
            clear();
            showSuccessModal();
        });
    }

    this.validateVinWithBaumuster = function () {
        var chassis = getEditorValue("vin");
        var baumuster = getEditorValue("baumuster");

        if (chassis == null || chassis.length === 0 || baumuster == null || baumuster.length === 0) {
            return false;
        }

        var chassisPart = chassis.substring(3, 10);
        var baumusterPart = baumuster.substring(0, 7);

        return chassisPart === baumusterPart;
    }

    this.validateBaumuster = function () {
        var isValid = true;
        var baumuster = $.trim(getEditorValue("baumuster"));

        if (baumuster != null && baumuster.length > 0) {
            var props = {
                async: false,
                type: "GET",
                url: "brands.svc/rest/ExistsBaumuster?baumuster=" + baumuster
            };

            callService(props, function (result) {
                isValid = result;
            });
        }

        return isValid;
    }

    function isVehicleAvailable(vehicle) {
        if (vehicle != null && vehicle.certificate != null) {
            switch (vehicle.certificate.status) {
                case CertificateStatus.Assigned:
                    return false;

                case CertificateStatus.Archived:
                case CertificateStatus.Available:
                case CertificateStatus.Closed:
                case CertificateStatus.Delivered:
                    return true;

                default:
                    break;
            }
        }

        return true;
    }

    this.showVehicleAvailability = function (searchResult) {
        clearWarnings();

        if (searchResult != null && searchResult.Records != null && searchResult.Records.length > 0) {
            if (searchResult.Records.length > 1) {
                logError(200, "A procura de viaturas retornou mais que um registo, quando era esperado apenas um! Procura: " + JSON.stringify(searchResult));
            }

            var vehicle = searchResult.Records[0];

            if (vehicle != null) {
                if (!vehicleHasLicense(vehicle)) {
                    if (!vehicle.belongsToUserConcession) {
                        showAsNotAvailable(vehicle);
                        return;
                    }
                }

                if (isVehicleAvailable(vehicle)) {
                    showAsAvailable(vehicle);
                } else {
                    showAsAssigned(vehicle);
                }
            }
        }

        if ($("#model").is(":enabled")) {
            var baumuster = $.trim(getEditorValue("baumuster"));

            if (baumuster == null || baumuster.length === 0) {
                baumuster = getEditorValue("vin");

                if (baumuster != null) {
                    baumuster = baumuster.substring(3, 10);

                    if (baumuster.length > 0) {
                        var props = {
                            type: "GET",
                            url: "brands.svc/rest/GetModelsByBaumuster?baumuster=" + baumuster
                        };

                        callService(props, function (result) {
                            if (result == null) {
                                logError(200, "A procura dos modelos associados ao baumuster " + baumuster + " não encontrou resultados em CRM. Foram apresentados todos os modelos ao utilizador");
                                CreateVehicle.loadModelsByBrand(getEditorValue("brand"));
                            } else {
                                populateDropDown("model", result, "id", "name", true, "");
                                if (result.length > 0) {
                                    var brand = result[0].brand;
                                    if (brand != null && brand.id != null && brand.name != null) {
                                        var brandResults = [];
                                        brandResults.push({ "id": brand.id, "name": brand.name });
                                        populateDropDown("brand", brandResults, "id", "name");
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    }
}