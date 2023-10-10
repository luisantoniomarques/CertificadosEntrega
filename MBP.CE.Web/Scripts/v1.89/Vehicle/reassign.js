$(document).ready(function() {

    init();

    $(".btn-goback").click(function() {
        window.location.href = LocationPath.getVirtualDirectoryName() + "vehicle/search";
    });

    $(".btn-next").click(function () {
        var isReassignValid = $("#form-reassign").valid(true);
        var isVehicleValid = $("#form-vehicle-details").valid(true);

        if (!isVehicleValid || !isReassignValid)
            return;

        var vehicleId = window.selectedVehicle.id;
        var dealerId = getEditorValue("dealer");

        var props = {
            type: "POST",
            url: "vehicle/" + vehicleId + "/reassign",
            data: dealerId
        };

        callService(props, function() {
            showSuccessModalWithRedirect("vehicle/search");
        });
    });
});

function init() {
    var props = {
        type: "GET",
        url: "outlets?sort=name&direction=asc"
    };

    callService(props, function (result) {

        if (result != null && selectedVehicle != null) {
            result = $.grep(result, function (data) { return data.id !== selectedVehicle.outletid; });
        }

        populateDropDown("dealer", result, "id", "name", true, "");
    }, true);

    setMandatory("dealer", true);
}