$(document).ready(function() {

    var props = {
        type: "GET",
        url: "outlets.svc/rest/useroutlets",
        async: false
    }
    callService(props, function(result) {
        populateDropDown("outlet", result, "id", "name", true);
    }, false);

    $(".btn-clear").click(function () {
        setEditorValue("certificateType", "");
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