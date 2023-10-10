function PdfList() {
    this.grid = undefined;

    this.gridPanel = "certificates-list";

    function beforeRender(result) {
        if (result != null && result.Records != null && result.Records.length === 1) {
            result.Records = result.Records[0].certificates;
        }

        return result;
    }

    this.initGrid = function () {
        this.grid = new KendoGridConfig("vehicles", this.editorsValues, null, beforeRender);

        if (this.grid != undefined) {
            this.grid.addColumn("outletname", "Ponto de Venda", { sortable: false });
            this.grid.addColumn("number", "Nº Certificado", { sortable: false });
            this.grid.addColumn("date", "Data de entrega", { sortable: false, template: "#: formatDate(date) #" });
            this.grid.addColumn("starselection", "Tipo de certificado", { sortable: false, template: "#: getResource('certificate.create.' + certificateType) #" });
            this.grid.addColumn("status", "Estado", { sortable: false, template: "#: getResource('certificate.status.' + status) #" });
            this.grid.addColumn("", "", { sortable: false, template: "<a target='_blank' style='display:#: showPrintOption(hasCertPDF, outletid) #' href='" + LocationPath.getVirtualDirectoryName() + "certificate/pdf?certificateId=#= id #'>Visualizar</a>" });

            this.grid.drawGrid(this.gridPanel);
        }
    };

    this.refreshGrid = function () {
        if (this.grid != undefined) {
            this.grid.refresh();
        }
    };

    this.editorsValues = function () {
        return {
            vehicleStatus:   getUrlVars()["vehicleStatus"],
            chassis:         getUrlVars()["chassis"],
            comission:       getUrlVars()["comission"],
            license:         getUrlVars()["license"],
            engine:          getUrlVars()["engine"],
            model:           getUrlVars()["model"],
            certstatus:      [CertificateStatus.Delivered, CertificateStatus.Archived].toString(),
            outlet:          getUrlVars()["outlet"],
            isStarSelection: getUrlVars()["isStarSelection"]
        };
    };
}

$(document).ready(function () {
    var pdflist = new PdfList();

    pdflist.initGrid();
});

function showPrintOption(hasPdf, outletid) {
    var outletIds = $("select#outlet option", parent.document).map(function () { return $(this).val(); }).get();

    return hasPdf && $.inArray(outletid, outletIds) > -1 ? "block" : "none";
}