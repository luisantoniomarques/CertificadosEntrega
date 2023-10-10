var entitiesInfo = {};

var FormUsage = {
    Owner: "Owner",
    Lessor: "Lessor",
    Lessee: "Lessee",
    Contact: "Contact",
    User: "User"
};

$(document).ready(function () {

    $("#form-new-cert-step2 .btn-goback").click(function () {
        gotoStep(1);
    });

    $("#form-new-cert-step2 .btn-clear").click(function () {
        for (var propertyName in FormUsage) {
            if (FormUsage.hasOwnProperty(propertyName)) {
                var id = propertyName.toLowerCase() + "taxid";
                setEditorValue(id, "");
                $("#" + id).trigger("change");
            }
        }
    });

    $("#form-new-cert-step2 .btn-next").click(function () {
        resetErrors();

        var formStep2 = $("#form-new-cert-step2");
        var formDetails = $("#form-vehicle-details");

        if (formStep2 == null || formDetails == null) {
            return;
        }

        var isStep2Valid = formStep2.valid(true);
        var isVehicleValid = formDetails.valid(true);

        if (!isVehicleValid || !isStep2Valid)
            return;

        removeAllCertificateEntities(function () {
            saveStep2Entities(function () {
                gotoStep(3);
            });
        });
    });

    $(document).on("change", "#form-new-cert-step2 [data-usage]", function () {
        var usage = $(this).data("usage");
        var taxId = getEditorValue(usage + "taxid");

        findOutletEntityByTaxId(taxId, usage, function (result) {

            if (result != null && result.length > 0) {
                var isValid = $("#" + usage + "taxid").valid(true);
                if (!isValid) {
                    applyStep2Template(usage, taxId, null);
                    $("#" + usage + "taxid").valid();
                    return;
                }
            } 
        });
    });

    $(document).on("click", "#form-new-cert-step2 [data-new-client]", function () {
        var usage = $(this).data("usage");
        var taxId = getEditorValue(usage + "taxid");

        var entityType = getTypeByUsage(usage);

        if (entityType != null) {
            var qs = {
                usage: usage,
                type: entityType,
                taxId: taxId
            };

            $("#modal-iframe iframe").attr("src", LocationPath.getVirtualDirectoryName() + "entity/create?" + $.param(qs));
            $("#modal-iframe #modal-title").text("Criar Cliente");
            $("#modal-iframe").modal("show");
        } else {
            alert(getResource("entity.invalidTin"));
        }
    });


    $(document).on("click", "#form-new-cert-step2 [data-edit-client]", function () {
        var usage = $(this).data("usage");
        var entityType = getTypeByUsage(usage);
        var guid = getEditorValue(usage + "guid");


        if (entityType != null) {
            var qs = {
                usage: usage,
                type: entityType,
                id: guid
            };

            $("#modal-iframe iframe").attr("src", LocationPath.getVirtualDirectoryName() + "entity/edit?" + $.param(qs));
            $("#modal-iframe #modal-title").text("Editar Cliente");
            $("#modal-iframe").modal("show");
        } else {
            alert(getResource("entity.invalidTin"));
        }
    });

    $(document).on("click", ".panel-body [data-without-taxid]", function () {
        var usage = $(this).data("usage");
        GenerateOutletEntity.create(usage, true);
    });

    $(document).on("change", "#form-new-cert-step2 [data-fullname]", function () {
        var usage = $(this).data("fullname");
        var fullname = getEditorValue(usage + "name");

        if (fullname != null && $.trim(fullname).length > 0) {
            var id = getEditorValue(usage + "guid");

            var props = {
                type: "PUT",
                url: "outletentity/" + id,
                data: { firstname: fullname, type: EntityType.Private }
            };

            callService(props, null, null, function () {
                setEditorValue(usage + "name", "");
            });
        }
    });

    $(document).on("click", "#generate-client-body ul li", function () {
        var usage = $(this).parent().data("usage");
        var taxid = $(this).data("taxid");

        closeModal("modal-generate-client");

        setEditorValue(usage + "taxid", taxid);
        enableEditor(usage + "taxid", false);
        $("#" + usage + "taxid").change();
    });

    $(document).on("click", "#modal-generate-client [data-without-taxid]", function () {
        closeModal("modal-generate-client");

        var usage = $(this).data("usage");
        GenerateOutletEntity.create(usage);
    });

    $.validator.addMethod("nifValidation", function (value, element) {
        var usage = $(element).data("usage");
        if (GenerateOutletEntity.canPassThrough(usage)) {
            return true;
        }

        return (getTypeOfEntityByUsage(usage) === getTypeByUsage(usage));
    }, "{0}");

});

function getDataForTemplate(usage, taxid, data) {
    if (data == null)
        data = [];

    data["title"] = getTitleByUsage(usage);
    data["usage"] = usage;
    data["taxid"] = taxid;
    data["needDataAuthorization"] = needsDataAuthorization(data.type);
    data["fakeTaxId"] = taxid != null && taxid.indexOf("MBP_") === 0;

    return data;
}

function findOutletEntityById(id, usage, callback) {
    if (id == null || id == EmptyGuid) {
        applyStep2Template(usage, null, null);
        return;
    }

    var props = {
        type: "GET",
        url: "outletentity/" + id + "?getAddresses=true&getContacts=true",
        async: false
    };

    callService(props, function (result) {
        applyStep2Template(usage, null, result);

        if (callback)
            callback(result != null ? result.id : null);
    });
}

function refreshOutletEntity(taxId, usage) {
    var guid = getEditorValue(usage + "guid");

    if (guid != null && guid.length > 0) {

        var fields = $("input:hidden[value='" + guid + "']");

        if (fields != null) {
            $.each(fields, function (i, element) {
                var fieldUsage = $(element).data("usage");
                findOutletEntityByTaxId(taxId, fieldUsage);
            });
        }
    } else {
        findOutletEntityByTaxId(taxId, usage);
    }
}

function findOutletEntityByTaxId(taxId, usage, callback) {
    applyStep2Template(usage, taxId, null);

    if (taxId == null || taxId.length === 0)
        return;

    var props = {
        type: "GET",
        url: "outletentitybytaxid/" + taxId + "?getAddresses=true&getContacts=true"
    };

    callService(props, function (result) {
        applyStep2Template(usage, taxId, result);
        if (callback)
            callback(result != null ? result.id : null);
    });
}

function applyStep2Template(usage, taxid, data) {
    if (data != null) {
        taxid = data.taxid || taxid;
    }

    var curPanel = $("#panel-" + usage);
    var templateId = "usage-form-template";
    var templateData = getDataForTemplate(usage, taxid, data);

    var targetId, templateAction;

    if (curPanel != null && curPanel.length > 0) {
        targetId = "panel-" + usage;
        templateAction = ApplyTemplateAction.Replace;
    } else {
        targetId = "certificateDeliveryTypes";
        templateAction = ApplyTemplateAction.Append;
    }

    applyTemplate(templateId, targetId, templateData, templateAction);

    if (data != null && data.addressList != null) {
        populateAddress(data.addressList, usage);
    }

    if (data != null && data.contactList != null) {
        populateContacts(data.contactList, usage);
    }

    entitiesInfo[usage] = data;
}

function initStep2() {
    initRulesForDeliveryTypes();
    hideAllPanels();

    if (window.selectedVehicle != null && window.selectedVehicle.certificate != null && window.selectedVehicle.certificate.userid != null) {
        var props = {
            type: "GET",
            url: "certificate/" + window.selectedVehicle.certificate.id + "/entities"
        };

        callService(props, function (result) {
            window.certificateEntities = result;
            initDeliveryType();
        });
    } else {
        initDeliveryType();
    }
}

function initDeliveryType() {
    var deliveryTypes;
    var delivery = convertToNumber(window.deliveryType);

    switch (delivery) {
        case DeliveryType.PP:
            deliveryTypes = [FormUsage.Owner];
            break;

        case DeliveryType.PT:
        case DeliveryType.SE:
        case DeliveryType.DE:
        case DeliveryType.RC:
            deliveryTypes = [FormUsage.Owner, FormUsage.User];
            break;

        case DeliveryType.ELR_PP:
            deliveryTypes = [FormUsage.Lessor, FormUsage.Lessee];
            break;

        case DeliveryType.ELR_E:
            deliveryTypes = [FormUsage.Lessor, FormUsage.Lessee, FormUsage.Contact, FormUsage.User];
            break;

        case DeliveryType.ELR_PT:
            deliveryTypes = [FormUsage.Lessor, FormUsage.Lessee, FormUsage.User];
            break;

        case DeliveryType.E:
        case DeliveryType.F:
            deliveryTypes = [FormUsage.Owner, FormUsage.Contact, FormUsage.User];
            break;

        case DeliveryType.RAC:
            deliveryTypes = [FormUsage.Owner, FormUsage.Contact];
            break;

        default:
            deliveryTypes = [];
            break;
    }

    showPanels(deliveryTypes);
}

function hideAllPanels() {
    for (var propertyName in FormUsage) {
        if (FormUsage.hasOwnProperty(propertyName)) {
            $("#panel-" + FormUsage[propertyName].toLowerCase()).hide();
        }
    }
}

function showPanels(deliveryTypes) {
    $("#certificateDeliveryTypes").html("");

    if (deliveryTypes != null) {
        var usage;

        for (var i = 0; i < deliveryTypes.length; i++) {
            usage = FormUsage[deliveryTypes[i]].toLowerCase();
            tryFindCertificateEntity(usage);
        }
    }
}

function needsDataAuthorization(type) {
    return (type === EntityType.Private);
}

function tryFindCertificateEntity(usage) {

    if (certificateEntities == null) {
        applyStep2Template(usage, null, null);
        return;
    }

    if (window.selectedVehicle != null && window.selectedVehicle.certificate != null) {
        var certificateEntityId = window.selectedVehicle.certificate[usage + "id"];

        if (certificateEntityId != null) {
            var certificateEntity = certificateEntities.filter(function (data) { return data.id == certificateEntityId; });
            var outletEntityId = certificateEntity != null && certificateEntity.length > 0 ? certificateEntity[0].outletEntityId : null;

            findOutletEntityById(outletEntityId, usage, function () {
                setEntityData(usage, certificateEntityId);
            });
        } else {
            applyStep2Template(usage, null, null);
        }
    }
}

function saveStep2Entities(callback) {
    var editors = [];

    generateAdditionalInformation();

    for (var propertyName in FormUsage) {
        if (FormUsage.hasOwnProperty(propertyName)) {
            var usage = FormUsage[propertyName].toLowerCase();
            var outletEntityId = getEditorValue(usage + "guid");

            if (outletEntityId == null || outletEntityId.length !== EmptyGuid.length) {
                outletEntityId = null;
            }

            var authDaimlerFlag = false;
            var authMbpFlag = false;
            var ASauthDaimlerFlag = false;
            var ASauthMbpFlag = false;

            //if (getEditorValue(usage + "authorizeDaimler"))
            //    authDaimlerFlag = getEditorValue(usage + "authorizeDaimler");

            //if (getEditorValue(usage + "authorizeMBP"))
            //    authMbpFlag = getEditorValue(usage + "authorizeMBP");

            //if (getEditorValue(usage + "ASauthorizeDaimler"))
            //    ASauthDaimlerFlag = getEditorValue(usage + "ASauthorizeDaimler");

            //if (getEditorValue(usage + "ASauthorizeMBP"))
            //    ASauthMbpFlag = getEditorValue(usage + "ASauthorizeMBP");

            if (outletEntityId != null) {
                var entity = {
                    type: getEntityTypeByUsage(usage),
                    certificateId: selectedVehicle.certificate.id,
                    outletEntityId: outletEntityId,
                    addressId: getEditorValue(usage + "address"),
                    phoneNumber: getEditorValue(usage + "phone"),
                    email: getEditorValue(usage + "email"),
                    authDaimler: authDaimlerFlag,
                    authMBP: authMbpFlag,
                    ASauthDaimler: ASauthDaimlerFlag,
                    ASauthMBP: ASauthMbpFlag
                };

                saveEntityFields(entity, function (result) {
                    if (result != null && result.length > 0) {
                        window.selectedVehicle.certificate[usage + "id"] = result;
                    }
                });
            }
        }
    }

    if (callback)
        callback();

    return editors;
}

function populateAddress(data, usage) {
    var items = [];

    if (data != null) {
        $.each(data, function (i, item) {
            var address = {
                value: item.id,
                text: (item.street || "") + " " + (item.door || "") + " " + (item.floor || "") + " - " + (item.postalCode || "") + " " + (item.districtDescription || "")
            };

            items.push(address);
        });
    }

    populateDropDown(usage + "address", items, "value", "text", false);
}

function populateContacts(data, usage) {
    var itemsPhone = [];
    var itemsEmail = [];

    if (data != null) {
        $.each(data, function (i, item) {
            var contact = {
                value: item.contactValue,
                text: item.contactValue
            };

            switch (item.contactType) {
                case ContactType.Phone: itemsPhone.push(contact); break;
                case ContactType.Email: itemsEmail.push(contact); break;
            }
        });
    }

    var phoneComboId = usage + "phone";
    var emailComboId = usage + "email";

    populateDropDown(phoneComboId, itemsPhone, "value", "text", true, "");
    populateDropDown(emailComboId, itemsEmail, "value", "text", true, "");

    if (itemsPhone.length === 1) {
        setEditorValue(phoneComboId, itemsPhone[0].value);
    }

    if (itemsEmail.length === 1) {
        setEditorValue(emailComboId, itemsEmail[0].value);
    }
}

function setEntityData(usage, certificateEntityId) {
    if (window.certificateEntities != null) {
        var entity = window.certificateEntities.filter(function (data) { return data.id == certificateEntityId; });
        entity = (entity != null && entity.length > 0 ? entity[0] : "");

        if (entity != null) {
            setEditorValue(usage + "address", findAddressId(entity, usage));
            setEditorValue(usage + "phone", entity.phone);
            setEditorValue(usage + "email", entity.email);

            if (entity.authorizesdata != null) {
                setEditorValue(usage + "authorizeMBP", entity.authorizesdata);
                setEditorValue(usage + "authorizeDaimler", entity.authorizesdatadaimler);

                setEditorValue(usage + "ASauthorizeMBP", entity.asauthorizesdata);
                setEditorValue(usage + "ASauthorizeDaimler", entity.asauthorizesdatadaimler);
            }
        }
    }
}

function findAddressId(entity, usage) {
    var addressList = entitiesInfo == null || entitiesInfo[usage] == null ? null : entitiesInfo[usage].addressList;

    if (addressList == null) {
        return null;
    }

    var userAddress = addressList.filter(function (data) { return data.street == entity.address; });
    userAddress = (userAddress != null && userAddress.length > 0 ? userAddress[0] : null);

    if (userAddress != null) {
        return userAddress.id;
    }

    return null;
}

function getEntityTypeByUsage(usage) {
    if (usage != null) {
        usage = usage.toLowerCase();
    }

    if (usage === FormUsage.User.toLowerCase())
        return CertificateEntityType.User;

    if (usage === FormUsage.Owner.toLowerCase())
        return CertificateEntityType.Owner;

    if (usage === FormUsage.Lessor.toLowerCase())
        return CertificateEntityType.Lessor;

    if (usage === FormUsage.Lessee.toLowerCase())
        return CertificateEntityType.Lessee;

    if (usage === FormUsage.Contact.toLowerCase())
        return CertificateEntityType.Contact;

    return null;
}

function getTypeOfEntityByUsage(usage) {
    return convertToNumber(getEditorValue(usage + "type"));
}

function getTypeByUsage(usage) {
    var entityType = getEntityTypeByUsage(usage);

    if (entityType != null) {
        var dType = convertToNumber(deliveryType);

        switch (entityType) {
            case CertificateEntityType.Contact:
                return EntityType.Private;

            case CertificateEntityType.Owner:
                if ($.inArray(dType, [DeliveryType.PP, DeliveryType.PT]) > -1) {
                    return EntityType.Private;
                }

                if ($.inArray(dType, [DeliveryType.SE, DeliveryType.DE, DeliveryType.RC, DeliveryType.E, DeliveryType.F, DeliveryType.RAC]) > -1) {
                    return EntityType.Enterprise;
                }
                break;

            case CertificateEntityType.Lessee:
                if ($.inArray(dType, [DeliveryType.ELR_PP, DeliveryType.ELR_PT]) > -1) {
                    return EntityType.Private;
                }

                if ($.inArray(dType, [DeliveryType.ELR_E]) > -1) {
                    return EntityType.Enterprise;
                }
                break;

            case CertificateEntityType.Lessor:
                return EntityType.Enterprise;

            case CertificateEntityType.User:
                return EntityType.Private;
        }
    }

    return null;
}

function generateAdditionalInformation() {
    var delivery = convertToNumber(window.deliveryType);

    switch (delivery) {
        case DeliveryType.PP:
            copyUsageInformation(FormUsage.Owner, FormUsage.User);
            break;

        case DeliveryType.ELR_PP:
            copyUsageInformation(FormUsage.Lessee, FormUsage.User);
            break;

        case DeliveryType.RAC:
            copyUsageInformation(FormUsage.Contact, FormUsage.User);
            break;
    }
}

function copyUsageInformation(copyFromUsage, copyToUsage) {
    var fieldsToCopy = ["guid", "authorizeDaimler", "authorizeMBP", "ASauthorizeDaimler", "ASauthorizeMBP", "address", "phone", "email"];

    copyFromUsage = copyFromUsage.toLowerCase();
    copyToUsage = copyToUsage.toLowerCase();

    $.each(fieldsToCopy, function (index, value) {
        createHidden(copyToUsage + value, getEditorValue(copyFromUsage + value));
    });
}

function getTitleByUsage(usage) {

    if (usage === FormUsage.User.toLowerCase()) {
        return getResource("certificate.deliveryType.title.user");
    }

    var delivery = convertToNumber(deliveryType);

    if (usage === FormUsage.Owner.toLowerCase()) {
        if (delivery === DeliveryType.PP) {
            return getResource("certificate.deliveryType.title.ownerUser");
        }
        return getResource("certificate.deliveryType.title.owner");
    }

    if (usage === FormUsage.Lessor.toLowerCase()) {
        return getResource("certificate.deliveryType.title.lessor");
    }

    if (usage === FormUsage.Lessee.toLowerCase()) {
        if (delivery === DeliveryType.ELR_PP) {
            return getResource("certificate.deliveryType.title.lesseeUser");
        }
        return getResource("certificate.deliveryType.title.lessee");
    }

    if (usage === FormUsage.Contact.toLowerCase()) {
        return getResource("certificate.deliveryType.title.contact");
    }

    return "";
}

function getErrorMessageByUsage(usage) {
    var type = getTypeByUsage(usage);

    if (type === EntityType.Enterprise) {
        return getResource("entity.onlyEnterpriseNif");
    }

    if (type === EntityType.Private) {
        return getResource("entity.onlyPrivateNif");
    }

    return getResource("entity.invalidTin");
}

function initRulesForDeliveryTypes() {
    $("#form-new-cert-step2").removeData("validator");

    $("#form-new-cert-step2").validate({
        rules: {
            ownertaxid: { nifValidation: true },
            usertaxid: { nifValidation: true },
            contacttaxid: { nifValidation: true },
            lessortaxid: { nifValidation: true },
            lesseetaxid: { nifValidation: true }
        },
        messages: {
            ownertaxid: getErrorMessageByUsage(FormUsage.Owner),
            usertaxid: getErrorMessageByUsage(FormUsage.User),
            contacttaxid: getErrorMessageByUsage(FormUsage.Contact),
            lessortaxid: getErrorMessageByUsage(FormUsage.Lessor),
            lesseetaxid: getErrorMessageByUsage(FormUsage.Lessee)
        }
    });
}

var GenerateOutletEntity = new function () {

    function checkFields() {
        var result = true;

        var entitiesList = $('input[id$="taxid"]');
        if (entitiesList != null) {
            $(entitiesList).each(function () {
                var itemUsage = $(this).data("usage");

                var itemTaxId = getEditorValue(itemUsage + "taxid");
                var itemName = getEditorValue(itemUsage + "name");

                if (itemTaxId != null && itemTaxId.length > 0 && (itemName == null || $.trim(itemName).length === 0)) {
                    alert("Preencha o nome nos " + getTitleByUsage(itemUsage).toLowerCase());
                    result = false;
                }
            });
        }

        return result;
    }

    function validate(usage, findRelated) {
        if (deliveryType == null) {
            return;
        }

        var generateFrom = ($.inArray(convertToNumber(deliveryType), [DeliveryType.ELR_E, DeliveryType.ELR_PP, DeliveryType.ELR_PT]) !== -1 ? FormUsage.Lessee : FormUsage.Owner).toLowerCase();
        var generateFromGuid = getEditorValue(generateFrom + "guid");

        if (generateFromGuid == null || generateFromGuid.length === 0) {
            alert("Preencha os " + getTitleByUsage(generateFrom).toLowerCase());
            return;
        }

        if (!checkFields()) {
            return;
        }

        if (findRelated) {
            var props = {
                type: "GET",
                url: "outletentities.svc/rest/getRelatedOutletEntities?outletEntityId=" + generateFromGuid
            };

            callService(props, function (result) {
                if (result != null && result.Records != null && result.Records.length > 0) {

                    var obj = { usage: usage, people: result.Records };
                    applyTemplate("fake-client-list-template", "generate-client-body", obj);
                    $("#modal-generate-client").modal({ backdrop: "static", keyboard: false });

                } else {
                    create(usage, generateFromGuid);
                }
            });
        } else {
            create(usage, generateFromGuid);
        }
    }

    function create(usage, generateFromGuid) {
        var props = {
            type: "GET",
            url: "outletentities.svc/rest/generateEntity?fromOutletEntityId=" + generateFromGuid
        };

        callService(props, function (outletEntity) {
            if (outletEntity != null) {
                applyStep2Template(usage, null, outletEntity);
            }
        });
    }

    function canPassThrough(usage) {
        var id = usage + "taxid";
        return getEditorValue(id).indexOf("MBP_") === 0;
    }

    this.create = validate;
    this.canPassThrough = canPassThrough;
}