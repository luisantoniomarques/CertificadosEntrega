
$(document).ready(function () {

    var vehicle = window.selectedVehicle;
    applyTemplate("vehicle-details-form-template", "vehicle-details", vehicle);

    var certificateStatus = null;
    if (vehicle != null) {
        certificateStatus = vehicle.certificate != null 
            ? vehicle.certificate.status
            : CertificateStatus.Available;

        loadVehicleType(vehicle.status);
    }
    loadCertificateStatusCombo(certificateStatus);
   
    $.validator.addMethod("dateIsRequiredWhenHasLicense", function () {
        var license = getEditorValue("license") || "";

        $("#licenseDate").rules("remove");
        if (license.length > 0) {
            $("#licenseDate").rules("add", "required");
            $("#licenseDate").rules("add", { daymonthyearfour: true });
            $("#licenseDate").valid();
        }

        return true;
    }, "");

    $.validator.addMethod("licenseIsRequiredWhenHasLicenseDate", function () {
        var licenseDate = getEditorValue("licenseDate") || "";

        $("#license").rules("remove");
        if (licenseDate.length > 0) {
            $("#license").rules("add", "required");
            $("#license").valid();
        }

        return true;
    }, "");

    $("#form-vehicle-details").validate({
        rules: {
            licenseDate: { dateIsRequiredWhenHasLicense: true },
            license: { licenseIsRequiredWhenHasLicenseDate: true }
        }
    });
});

function loadVehicleType(vehicleStatus) {
    var vehicleStatusData = [
        { value: VehicleType.New, text: getResource("vehicle.type.new") },
        { value: VehicleType.Used, text: getResource("vehicle.type.used") }
    ];
    populateDropDown("typeOfVehicle", vehicleStatusData, "value", "text", true);

    setEditorValue("typeOfVehicle", vehicleStatus);
}