function VehiclesCertificate() {
    this.grid = undefined;

    this.gridPanel = "panel-vehicles-results";

    function loadCertificateTypeByPermission() {
        var vehicleStatusData = [];
        var certificateTypeData = [];

        if (hasRolePermission(UserPermission.CertificateNew)) {
            vehicleStatusData.push({ value: VehicleType.New, text: getResource("vehicle.type.new") });
            certificateTypeData.push({ value: CreateCertificateType.New, text: getResource("certificate.create.new") });
        }

        certificateTypeData.push({ value: CreateCertificateType.WithoutLicensePlate, text: getResource("certificate.create.nolicense") });

        //js
        if (hasRolePermission(UserPermission.CertificateStarSelection)) {
            //vehicleStatusData.push({ value: VehicleType.Used, text: getResource("vehicle.type.used") });
            //certificateTypeData.push({ value: CreateCertificateType.StarSelection, text: getResource("certificate.create.starselection") });
        }

        //js
        if (hasRolePermission(UserPermission.CertificateMBCertified)) {
            vehicleStatusData.push({ value: VehicleType.Used, text: getResource("vehicle.type.used") });
            certificateTypeData.push({ value: CreateCertificateType.MBCertified, text: getResource("certificate.create.mbcertified2") });
            certificateTypeData.push({ value: CreateCertificateType.MBCertified4, text: getResource("certificate.create.mbcertified4") });
        }

        //js03082018
        if (hasRolePermission(UserPermission.CertificateUsed1)) {
            vehicleStatusData.push({ value: VehicleType.Used, text: getResource("vehicle.type.used") });
            certificateTypeData.push({ value: CreateCertificateType.Used1, text: getResource("certificate.create.used1") });
        }
        
        if (hasRolePermission(UserPermission.CertificateUsed)) {
            certificateTypeData.push({ value: CreateCertificateType.Used, text: getResource("certificate.create.used") });
        }

        populateDropDown("type", vehicleStatusData, "value", "text", true);
        populateDropDown("certificateType", certificateTypeData, "value", "text", true);
    }

    function init() {
        loadCertificateTypeByPermission();
        loadCertificateStatusCombo();

        var lastSearch = Cookies.getJSON(CookieName.SearchVehicle);
        if (lastSearch != null) {
            setEditorValue("outlet", lastSearch.outlet);
            setEditorValue("type", lastSearch.vehicleStatus);
            setEditorValue("vin", lastSearch.chassis);
            setEditorValue("komission", lastSearch.comission);
            setEditorValue("license", lastSearch.license);
            setEditorValue("engine", lastSearch.engine);
            setEditorValue("model", lastSearch.model);
            setEditorValue("state", (lastSearch.certstatus || "").split(","));
            setEditorValue("certificateType", lastSearch.certificateType);
        } else {
            setEditorValue("type", VehicleType.New);
            setEditorValue("state", [CertificateStatus.Available, CertificateStatus.Assigned]);
        }

        var createVehicleBtn = $("#newvehicle");

        if (hasRolePermission(UserPermission.CertificateStarSelection)) {
            createVehicleBtn.show();
        } else {
            createVehicleBtn.hide();
        }
    }

    this.editorsValues = function () {
        return {
            vehicleStatus: getEditorValue("type"),
            chassis: $.trim(getEditorValue("vin")),
            comission: $.trim(getEditorValue("komission")),
            license: $.trim(getEditorValue("license")),
            engine: $.trim(getEditorValue("engine")),
            model: $.trim(getEditorValue("model")),
            certstatus: (typeof getEditorValue("state") == "object" && getEditorValue("state") != null ? getEditorValue("state").join() : getEditorValue("state")),
            outlet: getEditorValue("outlet"),
            certificateType: getEditorValue("certificateType")
        };
    };

    var getEditorsValues = this.editorsValues;

    function successCallBack(result) {
        window.vehiclesResult = result == null ? null : result.Records;

        var noResultsData = {
            zeroRecords: (result == null || result.Records == null || result.Records.length === 0),
            search: getEditorsValues()
        };

        if (noResultsData.zeroRecords) {
            var editorsData = getEditorsValues();

            if (editorsData.chassis != null && editorsData.chassis.length > 0
                || editorsData.comission != null && editorsData.comission.length > 0
                || editorsData.license != null && editorsData.license.length > 0
                || editorsData.engine != null && editorsData.engine.length > 0) {

                editorsData.vehicleStatus = null,
                editorsData.outlet = null;
                editorsData.model = null;
                editorsData.certstatus = null;
                editorsData.certificateType = null;
                editorsData.ignoreOutlet = true;

                var props = {
                    type: "GET",
                    url: "vehicles?" + $.param(editorsData),
                    async: false
                };

                callService(props, function (result) {
                    if (result != null && result.Records != null && result.Records.length > 0) {
                        var record = result.Records[0];
                        var outletIds = $("select#outlet option").map(function() { return $(this).val(); }).get();

                        //validate if vehicle is in point of sale => '(' char means that the local of point of sale is specified
                        if (record.outletname != null
                            && record.outletname.indexOf("(") > -1
                            && $.inArray(record.outletid, outletIds) === -1) {
                            noResultsData.data = result.Records[0];
                        }
                    }
                });
            }
        }

        applyTemplate("vehicles-noresults-template", "panel-vehicles-noresults", noResultsData);
    }

    this.initGrid = function () {
        init();

        this.grid = new KendoGridConfig("vehicles", this.editorsValues, successCallBack);
        this.grid.addColumn("outletname", "Ponto de Venda", { width: 145, minScreenWidth: 1200 });
        this.grid.addColumn("status", "Tipo Veículo", { width: 95, minScreenWidth: 1200, template: "#: getResource('vehicle.status.' + status) #" });
        this.grid.addColumn("chassis", "Nº Chassis", { width: 145 });
        this.grid.addColumn("komission", "Nº Encomenda", { width: 110, minScreenWidth: 1200 });
        this.grid.addColumn("modeldescription", "Modelo", { width: 300 });
        this.grid.addColumn("license", "Matrícula", { width: 90 });
        this.grid.addColumn("licenseIssueDate", "Data Matrícula", { width: 110, minScreenWidth: 1200, template: "#: formatDate(licenseIssueDate) #" });
        this.grid.addColumn("certificate.status", "Estado", { template: "#: getResource('certificate.status.' + certificate.status) #" });
        this.grid.addColumn("", "", { sortable: false, template: "#= certificateOptions(data) #" });

        this.grid.drawGrid(this.gridPanel);
    };

    this.refreshGrid = function () {
        if (this.grid != undefined) {
            this.grid.refresh();
        }
    };
}

var vehiclesCertificate;

$(document).ready(function () {
    vehiclesCertificate = new VehiclesCertificate();
    vehiclesCertificate.initGrid();

    $(".btn-search").click(function () {
        if (hasRolePermission(UserPermission.CertificateStarSelection) || hasRolePermission(UserPermission.CertificateNew) || hasRolePermission(UserPermission.Administator)) {
            Cookies.set(CookieName.SearchVehicle, vehiclesCertificate.editorsValues(), { expires: 1, path: "/" });
            vehiclesCertificate.refreshGrid();
        } else {
            alert(getResource("certificate.doesNotHaveSearchPermissions"));
        }
    });

    $(document).on("click", "[data-vehicle]", function () {
        var result = window.vehiclesResult;

        if (result != undefined) {
            var vehicleId     = $(this).attr("data-vehicle");
            var certificateId = $(this).attr("data-certificate");

            result = result.filter(function (data) { return data.id === vehicleId && data.certificate.id === certificateId; });

            if (result.length > 1) {
                logError(200, "vehicle/search.js => something is wrong! unique vehicle search returned more than one row!");
            }

            window.selectedVehicle = (result.length > 0 ? result[0] : null);
            window.certificateEntities = null;
            saveSelectedVehicle();

            var func = $(this).attr("data-func");
            if (func != null && window[func]) {
                window[func](vehicleId, certificateId);
            }
        }
    });

    $("#newvehicle").click(function () {
        window.location.href = LocationPath.getVirtualDirectoryName() + "vehicle/create";
    });
});

function certificateOptions(vehicle) {

    if (vehicle == null) {
        return null;
    }

    var actions = [];
    var dhtml = "";

    var actionType = {
        link: "link",
        func: "func"
    };

    var actionResource = {
        view:     getResource("certificate.action.view"),
        correct:  getResource("certificate.action.correct"),
        issue:    getResource("certificate.action.issue"),
        reassign: getResource("certificate.action.reassign"),
        cont:     getResource("certificate.action.continue"),
        edit:     getResource("certificate.action.edit"),
        cancel:   getResource("certificate.action.cancel")
    }

    var today = new Date(); 
    today.setHours(0, 0, 0, 0);

    var outletIds = $("select#outlet option").map(function () { return $(this).val(); }).get();

    var certificate = vehicle.certificate;

    var status = (certificate == null ? CertificateStatus.Available : certificate.status);

    var hasAssignedCertificate = vehicle.certificates != null && vehicle.certificates.filter(function(data) { return data.status === CertificateStatus.Assigned; }).length > 0;

    var lastCertificateDate = certificate != null ? jsonWcfDatetimeToJsDate(certificate.date) : new Date();
    var lastModifiedOnUser  = vehicle.lastModifiedOnUser != null ? jsonWcfDatetimeToJsDate(vehicle.lastModifiedOnUser) : null;
    var lastModifiedByUser = vehicle.lastModifiedByUser != null ? vehicle.lastModifiedByUser : "";

    var licenseDate = jsonWcfDatetimeToJsDate(vehicle.licenseIssueDate);
    var licenseDateDaysPassed = diffDays(licenseDate, today);

    if (status === CertificateStatus.Archived
        && vehicle.certificate != null
        && diffDays(lastCertificateDate, lastModifiedOnUser) > 0
        && $("#UserIdentityName").text().toUpperCase() === lastModifiedByUser.toUpperCase()) {
        status = CertificateStatus.Available;
    }

    if (vehicle.numberOfCertificatePdfs === 1 && certificate != null) {
        if (certificate.hasCertPDF && $.inArray(certificate.outletid, outletIds) > -1) {
            actions.push({
                type:   actionType.link,
                target: "_blank",
                url:    "certificate/pdf?certificateId=" + certificate.id,
                action: actionResource.view,
                text:   actionResource.view
            });
        }
    }
    else if (vehicle.numberOfCertificatePdfs > 1) {
        actions.push({
            type:   actionType.func,
            url:    "showCertificateDetails",
            action: actionResource.view,
            text:   actionResource.view + " (" + vehicle.numberOfCertificatePdfs + ")"
        });
    }

    var isStarSelection = vehicle.certificateType === CreateCertificateType.StarSelection;
    var validStarSelection = isStarSelection && StarSelection.isValidStarSelection(vehicle.brandname, vehicle.mileage, vehicle.licenseIssueDate, vehicle.komission);

    var isVLP = vehicle.komission != null && vehicle.komission.length > 0 && (vehicle.komission[0] === "0" || vehicle.komission[0] === "6");
    var canIssueCertificate = (!hasAssignedCertificate && (!isStarSelection || validStarSelection) && (vehicle.certificateType !== CreateCertificateType.New || !isVLP || licenseDateDaysPassed <= 30));
    
    switch (status) {
        case CertificateStatus.Available:
            if (canIssueCertificate) {
                actions.push({
                    type:   actionType.link,
                    url:    "certificate/" + (certificate != null && certificate.number != null  && certificate.paymenttype == null ? "edit" : "new"),
                    action: actionResource.issue,
                    text:   actionResource.issue + " - " + getResource("certificate.create." + vehicle.certificateType)
                });

                actions.push({
                    type:   actionType.link,
                    url:    "vehicle/reassign",
                    action: actionResource.reassign,
                    text:   actionResource.reassign
                });
            }
            break;

        case CertificateStatus.Assigned:
            actions.push({
                type:   actionType.link,
                url:    "certificate/edit",
                action: actionResource.cont,
                text:   actionResource.cont + " - " + getResource("certificate.create." + vehicle.certificateType)
            });
            break;

        case CertificateStatus.Archived:
        case CertificateStatus.Delivered:
            if (certificate != null) {
                var lastDeliveryDate = jsonWcfDatetimeToJsDate(certificate.date);
                
                if ($.inArray(vehicle.currentoutletid, outletIds) > -1) {
                    if (canIssueCertificate && (vehicle.certificateType !== CreateCertificateType.New)) {
                        actions.push({
                            type:   actionType.link,
                            url:    "certificate/new",
                            action: actionResource.issue,
                            text:   actionResource.issue + " - " + getResource("certificate.create." + vehicle.certificateType)
                        });
                    }

                    if ($.inArray(certificate.outletid, outletIds) > -1) {
                        if (diffDays(lastDeliveryDate, today) < 15 && status !== CertificateStatus.Archived) {
                            actions.push({
                                type:   actionType.link,
                                url:    "certificate/edit",
                                action: actionResource.edit,
                                text:   actionResource.edit
                            });

                            actions.push({
                                type:   actionType.func,
                                url:    "cancelCertificate",
                                action: actionResource.cancel,
                                text:   actionResource.cancel
                            });

                            actions = actions.filter(function(data) {
                                return data.action !== actionResource.issue;
                            });
                        } else {
                            actions.push({
                                type:   actionType.link,
                                url:    "correctionrequest/submit",
                                action: actionResource.correct,
                                text:   actionResource.correct
                            });
                        }
                    }
                }
            }
            break;
    }

    if (actions.length > 0) {
        $.each(actions, function (i, action) {
            dhtml += "<div>";
            switch (action.type) {
                case actionType.link:
                    dhtml += "<a data-vehicle='" + vehicle.id + "' data-certificate='" + certificate.id + "' href='" + LocationPath.getVirtualDirectoryName() + action.url + "' target='" + (action.target || "") + "'>" + action.text + "</a>";
                    break;

                case actionType.func:
                    dhtml += "<a data-vehicle='" + vehicle.id + "' data-certificate='" + certificate.id + "' href='javascript:void(0);' data-func='" + action.url + "'>" + action.text + "</a>";
                    break;
            }
            dhtml += "</div>";
        });
    }

    return dhtml;
}

function showCertificateDetails(vehicleId) {
    if (window.vehiclesResult != null) {
        var vehicle = window.vehiclesResult.filter(function(data) { return data.id === vehicleId; });

        if (vehicle != null && vehicle.length === 1) {
            vehicle = vehicle[0];
            var qs = vehiclesCertificate.editorsValues();
            qs.chassis = vehicle.chassis;

            $("#modal-iframe iframe").attr("src", LocationPath.getVirtualDirectoryName() + "certificate/pdflist?" + $.param(qs));
            $("#modal-iframe #modal-title").text("Certificados do veículo " + vehicle.license);
            $("#modal-iframe").modal("show");
        }
        else {
            logError(200, "vehicle/search.js => more than one vehicle found in grid with same guid!");
        }
    }
    else {
        logError(200, "vehicle/search.js => selected vehicle not found!");
    }
}

function cancelCertificate(vehicleId, certificateId) {
    var findVehicle = vehiclesResult.filter(function (data) { return data.id === vehicleId; });
    if (findVehicle != null && findVehicle.length === 1) {
        var vehicle = findVehicle[0];
        if (vehicle.certificate != null && vehicle.certificate.id === certificateId) {
            var confirmMessage = getResource("certificate.cancelConfirmation");
            confirmMessage = confirmMessage.replace("{0}", vehicle.certificate.number);
            confirmMessage = confirmMessage.replace("{1}", formatDate(vehicle.certificate.date));

            if (confirm(confirmMessage)) {
                var props = {
                    type: "POST",
                    url: "certificates.svc/rest/CancelCertificate?certificateId=" + certificateId
                };

                callService(props, function (result) {
                    if (result) {
                        alert(getResource("certificate.cancelConfirmationSuccess"));
                        location.reload();
                    } else {
                        alert(getResource("certificate.cancelConfirmationFailed"));
                    }
                });
            }
        }
    }
}