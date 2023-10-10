
function OutletEntity() {
    this.grid = undefined;

    this.gridPanel = "panel-client-results";

    this.initGrid = function() {
        this.grid = new KendoGridConfig("outletentities", this.editorsValues);

        this.grid.addColumn("typeDescription", "Tipo");
        this.grid.addColumn("fullname", "Nome", { width: 400 });
        this.grid.addColumn("taxid", "NIF");
        this.grid.addColumn("", "", { sortable: false, template: "<a href='" + LocationPath.getVirtualDirectoryName() + "Entity/Edit?id=#:id#&type=#:type#'>Editar</a>" });

        this.grid.drawGrid(this.gridPanel);
    };

    this.refreshGrid = function() {
        if (this.grid != undefined) {
            this.grid.refresh();
        }
    };

    this.clearSearchForm = function() {
        setEditorValue("nif", "");
        setEditorValue("entityType", "");
        setEditorValue("name", "");
    };

    this.newClient = function() {
        var isValid = $("#form-new-client").valid(true);

        if (!isValid)
            return;

        window.location.href = LocationPath.getVirtualDirectoryName() + "entity/create?type=" + getEditorValue("newEntityType");
    };

    this.editorsValues = function() {
        return {
            taxid: $.trim(getEditorValue("nif")),
            type: getEditorValue("entityType"),
            name: $.trim(getEditorValue("name"))
        };
    };
}

$(document).ready(function () {
    var outletEntity = new OutletEntity();

    getLookupData("customertype", "pt", function (result) {
        populateDropDown("entityType", result, "Key", "Value", true);
        populateDropDown("newEntityType", result, "Key", "Value", false);
    });

    $(".btn-search").click(function () {
        outletEntity.refreshGrid();
    });

    $(".btn-clear").click(function () {
        outletEntity.clearSearchForm();
    });

    $("#newclient").click(function () {
        outletEntity.newClient();
    });

    outletEntity.initGrid();
});

