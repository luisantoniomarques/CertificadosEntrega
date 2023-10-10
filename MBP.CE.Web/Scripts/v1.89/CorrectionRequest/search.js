function CorrectionRequest() {
    this.grid = undefined;

    this.gridPanel = "panel-corrections-results";

    this.initGrid = function () {
        this.grid = new KendoGridConfig("correctionrequests", this.editorsValues);

        if (this.grid != undefined) {
            this.grid.addColumn("requestDate", "Data do Pedido", { template: "#:formatDate(requestDate)#" });
            this.grid.addColumn("outlet.name", "Ponto de Venda", { minScreenWidth: 1200 });
            this.grid.addColumn("vehicle.chassis", "Nº Chassis");
            this.grid.addColumn("vehicle.komission", "Nº Encomenda", { minScreenWidth: 992 });
            this.grid.addColumn("vehicle.license", "Matrícula");
            this.grid.addColumn("observations", "Observações", { minScreenWidth: 560, template: "#:$.parseHTML(observations) != null ? $.parseHTML(observations)[0].data : ''#" });
            this.grid.addColumn("comments", "Comentários", { minScreenWidth: 992, template: "#:$.parseHTML(comments) != null ? $.parseHTML(comments)[0].data : ''#" });
            this.grid.addColumn("statusCode", "Estado", { template: "#:getResource('correctionRequest.status.' + statusCode)#" });

            this.grid.drawGrid(this.gridPanel);
        }
    };

    this.refreshGrid = function () {
        if (this.grid != undefined) {
            Cookies.set(CookieName.SearchCorrectionRequest, this.editorsValues(), { expires: 1, path: "/" });
            this.grid.refresh();
        }
    };

    this.editorsValues = function () {
        return {
            type:       getEditorValue("type"),
            chassis:    $.trim(getEditorValue("vin")),
            comission:  $.trim(getEditorValue("komission")),
            license:    $.trim(getEditorValue("license")),
            engine:     $.trim(getEditorValue("engine")),
            model:      $.trim(getEditorValue("model")),
            status:     getEditorValue("state"),
            outlet:     getEditorValue("outlet")
        };
    };
}

$(document).ready(function () {
    var correctionRequest = new CorrectionRequest();

    var correctionRequestType = [
        { value: 291110000, text: getResource("correctionRequest.type.dataClean") }
    ];
    populateDropDown("type", correctionRequestType, "value", "text", true);

    var correctionRequestStatus = [
        { value: 1, text: getResource("correctionRequest.status.pending") },
        { value: 291110001, text: getResource("correctionRequest.status.rejected") },
        { value: 291110002, text: getResource("correctionRequest.status.processed") }
    ];
    populateDropDown("state", correctionRequestStatus, "value", "text", true);

    $(".btn-search").click(function () {
        correctionRequest.refreshGrid();
    });

    correctionRequest.initGrid();
});