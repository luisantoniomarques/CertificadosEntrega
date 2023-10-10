var ContactType = {
    Email: 291110000,
    Phone: 291110001,
    Fax: 291110002
};

var contacts = [], selectedContactIdx;

$(document).ready(function () {

    applyMenuContact(Menu.Add);

    $(".addContact").click(function () { addContact(); });
    $(".saveContact").click(function () { editContact(); });
    $(".deleteContact").click(function () { removeContact(); });

    $(document).on("click", "#panel-contact-results tr[data-selectable]", function () {
        applyMenuContact(Menu.Edit);
        selectedContactIdx = convertToNumber($(this).data("index"));

        if (!isNaN(selectedContactIdx)) {
            var contact = contacts[selectedContactIdx];
            if (contact != null) {
                setEditorValue("typeOfContact", contact.contactType);
                setEditorValue("availability", contact.contactAvailability);
                setEditorValue("contactValue", contact.contactValue);
            }
        }
    });

    $.validator.addMethod("compositeEmail", function (value, element) {
        var type = convertToNumber(getEditorValue("typeOfContact"));

        if (value !== "" && type === ContactType.Email) {
            return validateEmail(value);
        }
        return true;
    }, "E-mail inválido.");

    $.validator.addMethod("compositePhone", function (value, element) {
        var type = convertToNumber(getEditorValue("typeOfContact"));

        if (value !== "" && (type === ContactType.Phone)) {
            return validatePhone(value);
        }
        return true;
    }, "Número de telefone inválido.");

    $.validator.addMethod("compositeFax", function (value, element) {
        var type = convertToNumber(getEditorValue("typeOfContact"));

        if (value !== "" && (type === ContactType.Fax)) {
            return validatePhone(value);
        }
        return true;
    }, "Fax inválido.");

    $("#form-contact").validate({
        rules: {
            "contactValue": { compositePhone: true, compositeEmail: true, compositeFax: true }
        }
    });

    getLookupData("contacttype", "pt", function (result) {
        populateDropDown("typeOfContact", result, "Key", "Value");
    });

    getLookupData("contactavailability", "pt", function (result) {
        populateDropDown("availability", result, "Key", "Value");
    });
});

function applyMenuContact(menu) {
    $(".addContact").hide();
    $(".saveContact").hide();
    $(".deleteContact").hide();

    switch (menu) {
        case Menu.Add:
            $(".addContact").show();
            break;

        case Menu.Edit:
            $(".saveContact").show();
            $(".deleteContact").show();
            break;
    }
}

function applyContactTemplate(data) {
    applyTemplate("contact-results-template", "panel-contact-results", data);
}

function loadContacts(result) {
    applyContactTemplate(null);

    if (result != null && result.length > 0) {
        contacts = result;
        applyContactTemplate(result);
    }
}

function clearContactEditors() {
    setEditorValue("contactValue", "");
    setEditorValue("availability", "");
}

function clearContactList() {
    contacts = null;
    finalizeContactAction();
}

function validateContactForm() {
    resetErrors();

    var isValid = $("#form-contact").valid();

    return isValid;
}

function addContact() {
    if (!validateContactForm())
        return;

    var contact = {
        contactEntityState              : EntityState.Created,
        contactAvailability             : getEditorValue("availability"),
        contactAvailabilityDescription  : $("#availability option:selected").text(),
        contactType                     : getEditorValue("typeOfContact"),
        contactTypeDescription          : $("#typeOfContact option:selected").text(),
        contactValue                    : getEditorValue("contactValue")
    }

    contacts.push(contact);
    finalizeContactAction();
}

function editContact() {
    if (!validateContactForm())
        return;

    var contact = contacts[selectedContactIdx];

    if (contact != null) {
        contact.contactEntityState              = contact.contactEntityState == EntityState.Created ? EntityState.Created : EntityState.Updated;
        contact.contactAvailability             = getEditorValue("availability"),
        contact.contactAvailabilityDescription  = $("#availability option:selected").text(),
        contact.contactType                     = getEditorValue("typeOfContact");
        contact.contactTypeDescription          = $("#typeOfContact option:selected").text(),
        contact.contactValue                    = getEditorValue("contactValue");
    }

    finalizeContactAction();
}

function removeContact() {
    var question = getResource("entity.removeContact");

    if (confirm(question)) {
        var contact = contacts[selectedContactIdx];

        if (contact != null) {
            if (contact.contactEntityState == EntityState.Created) {
                contacts.splice(selectedContactIdx, 1);
            } else {
                contact.contactEntityState = EntityState.Deleted;
            }
        }

        finalizeContactAction();
    }
}

function finalizeContactAction() {
    applyContactTemplate(contacts);
    selectedContactIdx = null;
    clearContactEditors();
    applyMenuContact(Menu.Add);
}

function hasNewContacts() {
    var count = 0;

    if (contacts != null) {
        var items = contacts.filter(function (item) {
            return item.contactEntityState == EntityState.Created;
        });

        count = items.length;
    }

    return (count > 0);
}

function saveContactsCallback() {
    if (contacts != null) {

        contacts = $.grep(contacts, function (item) {
            return item.contactEntityState != EntityState.Deleted;
        });

        $.each(contacts, function (idx, item) {
            if (item != null) {
                item.contactEntityState = EntityState.Unchanged;
            }
        });

        finalizeContactAction();
    }
}

function getContactList() {
    return contacts;
}

