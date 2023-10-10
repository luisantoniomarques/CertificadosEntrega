function SubmitCorrectionRequest() {
    $('[data-existspendingcorrection="true"]').hide();
    this.grid = undefined;

    this.gridPanel = "panel-corrections-results";

    this.initGrid = function () {
        this.grid = new KendoGridConfig("correctionrequests", this.editorsValues, function (result) {
            if (result != null && result.Records != null) {
                var results = result.Records.filter(function (data) {
                    return data.statusCode === 1;
                });

                if (results.length !== 0) {
                    $('[data-existspendingcorrection="true"]').show();
                    $('[data-existspendingcorrection="false"]').hide();
                }
            }
        });

        if (this.grid != undefined) {
            this.grid.addColumn("requestDate", "Data do Pedido", { template: "#:formatDate(requestDate)#" });
            this.grid.addColumn("outlet.name", "Ponto de Venda");
            this.grid.addColumn("vehicle.chassis", "Nº Chassis");
            this.grid.addColumn("vehicle.komission", "Nº Encomenda");
            this.grid.addColumn("vehicle.license", "Matrícula");
            this.grid.addColumn("observations", "Observações", { template: "#:$.parseHTML(observations) != null ? $.parseHTML(observations)[0].data : ''#" });
            this.grid.addColumn("comments", "Comentários", { template: "#:$.parseHTML(comments) != null ? $.parseHTML(comments)[0].data : ''#" });
            this.grid.addColumn("statusCode", "Estado", { template: "#:getResource('correctionRequest.status.' + statusCode)#" });

            this.grid.drawGrid(this.gridPanel);
        }
    };

    this.editorsValues = function () {
        return {
            chassis: window.selectedVehicle.chassis
        };
    };
}

$(document).ready(function () {

    var correctionRequest = new SubmitCorrectionRequest();
    correctionRequest.initGrid();

    $(".btn-goback").click(function () {
        location.href = LocationPath.getVirtualDirectoryName() + "vehicle/search";
    });

    $(".btn-next").click(function () {

        var isValid = $("#form-correction-request").valid(true);

        if (!isValid || window.selectedVehicle == null || window.selectedVehicle.certificate == null) {
            return;
        }

        var certificateId = window.selectedVehicle.certificate.id;

        var props = {
            type: "POST",
            url: "correctionrequests/",
            data: {
                certificateId: certificateId,
                type: CorrectionRequestType.DataCleaning,
                observations: getEditorValue("remarks")
            }
        };
        callService(props, function () {
            showSuccessModalWithRedirect("vehicle/search");
        });
    });

    $("#form-complete-details").validate({
        rules: {}
    });
});

function loadCertificateForCompleteDetailsCompleted() {
    //disable all form
    $("#form-complete-details :enabled").attr("disabled", "disabled");
    $(".selectpicker").selectpicker("refresh");
    $("#form-complete-details label").removeClass("required");
}