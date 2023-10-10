Handlebars.registerHelper("sum", function () {
    var sum = 0, v;

    for (var i = 0; i < arguments.length; i++) {
        v = parseFloat(arguments[i]);
        if (!isNaN(v)) sum += v;
    }
    return sum;
});

Handlebars.registerHelper("ifCond", function (v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("ifNotCond", function (v1, v2, options) {
    if (v1 !== v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("ifGreaterThan", function (v1, v2, options) {
    if (v1 > v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper("typeOfVehicle", function (starSelection) {

    if (starSelection == undefined)
        return "";

    return (starSelection
                ? getResource("vehicle.type.used")
                : getResource("vehicle.type.new"));
});

Handlebars.registerHelper("formatDate", function (date) {
    return formatDate(date);
});

Handlebars.registerHelper("comboTextByValue", function (comboId, value) {
    if (value == null) {
        return "";
    }

    var list = [];
    var values = value.toString().split(",");

    $("#" + comboId + " option").each(function () {
        if ($.inArray($(this).val().toString(), values) !== -1) {
            list.push($(this).text());
        }
    });

    return list.join(", ");
});
