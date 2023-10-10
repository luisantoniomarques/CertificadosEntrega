$(document).ready(function () {
    $("#Outlets").change(function () {
        populateSelectedOutlets();
    });

    $("#concession").change(function () {
        var selectedConcession = $(this).val();

        $.ajax({
            url: '/UserManagement/GetOutletsByConcession?concession=' + selectedConcession,
            success: function (data) {
                $("#Outlets").empty();
                if (data != null) {
                    var options = $("#Outlets");
                    $.each(data, function () {
                        options.append($("<option />").val(this.Value).text(this.Text));
                    });
                }
            }
        });
    });

    populateSelectedOutlets();
});

function getSelectedOutlets() {
    var list = [];
    var selectedValues = $("#Outlets").val();

    if (selectedValues != null) {
        $.each(selectedValues, function (index, item) {
            var listItem = {
                value: item,
                text: $("#Outlets option[value='" + item + "']").text()
            };

            list.push(listItem);
        });
    }

    return list;
}

function populateSelectedOutlets() {
    var list = getSelectedOutlets();

    if (list != undefined && list.length > 0) {
        applyTemplate("selected-outlets-template", "selectedOutlets", list);
    }
}

