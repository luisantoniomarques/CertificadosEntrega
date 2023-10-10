Handlebars.registerHelper('ifCond', function (v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('ifNotCond', function (v1, v2, options) {
    if (v1 !== v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('ifGreaterThan', function (v1, v2, options) {
    if (v1 > v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('formatDate', function (date) {
    return formatDate(date);
});

Handlebars.registerHelper('comboTextByValue', function (comboId, value) {
    var list = [];

    $("#" + comboId + " option").each(function () {
        var option = { value: $(this).val(), text: $(this).text() };
        list.push(option);
    });

    var result = list.filter(function (data) { return data.value == value; });
    result = (result != null && result.length > 0 ? result[0].text : "");

    return result;
});

Handlebars.registerHelper("vehicleOptions", function (vehicle) {
    var actions = [];
    var dhtml = "";

    var actionType = {
        link: "link",
        func: "func"
    };

    var actionResource = {
        view:       getResource("certificate.action.view"),
        correct:    getResource("certificate.action.correct"),
        issue:      getResource("certificate.action.issue"),
        reassign:   getResource("certificate.action.reassign"),
        cont:       getResource("certificate.action.continue"),
        edit:       getResource("certificate.action.edit"),
    }

    var status = (vehicle.certificate == null ? CertificateStatus.Available : vehicle.certificate.status);

    switch (status) {
        case CertificateStatus.Archived:
            actions.push({ type: actionType.link, target: "_blank", url: "/certificate/pdf?certificateId=" + vehicle.certificate.id, text: actionResource.view });
            actions.push({ type: actionType.link, url: "/correctionrequest/submit", text: actionResource.correct });
            break;

        case CertificateStatus.Available:
            actions.push({ type: actionType.link, url: "/certificate/new", text: actionResource.issue });
            actions.push({ type: actionType.link, url: "/vehicle/reassign", text: actionResource.reassign });
            break;

        case CertificateStatus.Assigned:
            actions.push({ type: actionType.link, url: "/certificate/edit", text: actionResource.cont });
            break;

        case CertificateStatus.Delivered:
            var today = new Date();
            var deliveryDate = jsonWcfDatetimeToJsDate(vehicle.certificate.date);
            if (diffDays(deliveryDate, today) < 15) {
                actions.push({ type: actionType.link, url: "/certificate/edit", text: actionResource.edit });
            } else {
                actions.push({ type: actionType.link, url: "/correctionrequest/submit", text: actionResource.correct });
            }

        case CertificateStatus.Closed:
            actions.push({ type: actionType.link, target: "_blank", url: "/certificate/pdf?certificateId=" + vehicle.certificate.id, text: actionResource.view });
            break;
    }

    if (actions.length > 0) {
        $.each(actions, function (i, action) {
            switch (action.type) {
                case actionType.link:
                    dhtml += "<a data-vehicle='" + vehicle.id + "' href='" + action.url + "' target='" + (action.target || "")  + "' style='margin-left:20px;'>" + action.text + "</a>";
                    break;

                case actionType.func:
                    dhtml += "<a data-vehicle='" + vehicle.id + "' href='javascript:void(0);' data-func='" + action.url + "' style='margin-left:20px;'>" + action.text + "</a>";
                    break;
            }
        });
    }

    return new Handlebars.SafeString(dhtml);
});
