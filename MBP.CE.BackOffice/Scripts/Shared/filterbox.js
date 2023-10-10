$(document).ready(function() {

    var props = {
        type: "GET",
        url: "outlets.svc/rest/useroutlets"
    }
    callService(props, function(result) {
        populateDropDown("outlet", result, "id", "name", true);
    }, false);

    $("#clear").click(function () {
        setEditorValue("type", "");
        setEditorValue("vin", "");
        setEditorValue("komission", "");
        setEditorValue("license", "");
        setEditorValue("engine", "");
        setEditorValue("model", "");
        setEditorValue("state", "");
        setEditorValue("outlet", "");
    });

});