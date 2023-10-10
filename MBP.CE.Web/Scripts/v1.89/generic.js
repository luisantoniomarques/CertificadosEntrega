var SERVICE_URL;
var EmptyGuid = "00000000-0000-0000-0000-000000000000";

var retryRequests = [];

/**
 * Populate a dropdown
 * @param {string} dropDownId - The id of dropdown to be populated
 * @param {string or object} data - The data in JSON string or object format
 * @param {boolean} addEmptyItem - If true adds a empty item to dropdown
 */
function populateDropDown(dropDownId, data, tagValue, tagText, addEmptyItem, emptyItemDescription) {
    var items = "";

    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch (e) {
            data = JSON.parse(null);
        }
    }

    if (addEmptyItem != undefined && addEmptyItem && data != null && data.length > 1) {
        items += "<option value=''>" + (emptyItemDescription === undefined ? getResource("certificate.all"): emptyItemDescription) + "</option>";
    }

    if (data != null) {
        $.each(data, function (i, item) {
            if (item != null) {
                items += "<option   value='" + item[tagValue] + "'>" + item[tagText] + "</option>";
                //if (item["countryCode"] === "PRT" && dropDownId === "nifCountry")
                //    $('select option:contains("Portugal")').prop('selected', true);
            }
        });
    }
    
    $("#" + dropDownId).html(items);
    $("#" + dropDownId).selectpicker("refresh");
}

$(document).on("changed.bs.select", function (event, clickedIndex) {
    var comboId = event.target.id;
    var comboOptions = $("#" + comboId + " option").map(function () { return $(this).val(); }).get();
    
    var selectedItems = getEditorValue(comboId);
    if (selectedItems === null) {
        setEditorValue(comboId, "");
        return;
    }

    //validate if combo contains item "select all"
    if ($.inArray("", comboOptions) >= 0) {
        if (clickedIndex === 0) {
            setEditorValue(comboId, "");
        } else {
            if (($(comboOptions).size() - 1) === ($.isArray(selectedItems) ? $(selectedItems).size() : 0)) {
                setEditorValue(comboId, "");
            } else if ($.inArray("", selectedItems) >= 0) {
                setEditorValue(comboId, comboOptions[clickedIndex]);
            }
        }
    }
});

/**
 * Call WCF  Service
 * @param {object} props - The properties of request
 * @param {function} callback - The callback function for ok
 * @param {object} props - The properties of request
 * @param {function} errorCallback - The callback function for error
 */
function callService(props, callback, cacheResponse, errorCallback) {

    if (cacheResponse == undefined)
        cacheResponse = false;
    $.ajaxSetup({ cache: cacheResponse });

    var url = SERVICE_URL + props.url;

    $.ajax({
        type: "POST", //GET or POST or PUT or DELETE verb
        url: location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "") + LocationPath.getVirtualDirectoryName() + "api/Proxy/", //  SERVICE_URL + props.url, // Location of the service
        data: JSON.stringify({
            Verb: props.type,
            Url: url,
            RequestData: props.data
        }), //Data sent to server
        contentType: "application/json; charset=utf-8", // content type sent to server
        dataType: props.dataType == null ? "json" : props.dataType, //Expected data format from server

        async: props.async != null ? props.async : true,

        success: function (result) { //On Successfull service call
            if (callback != null && callback)
                callback(result.ResponseData);
        },

        error: function (request, status, error) { // When Service fails
            //jQuery will fire the error event if the response cannot be parsed as JSON, even if server returns 200
            if (request != undefined && request.status === 200) {
                if (callback != null && callback) {
                    callback(null);
                }
            } else {
                retryRequests.push({ props: props, callback: callback, cache: cacheResponse });

                if (request != null) {
                    logError(request.status, (request.responseJSON == null ? "" : request.responseJSON.ResponseData));
                }
                
                if (errorCallback) {
                    errorCallback(request, status, error);
                }
            }
        }
    });
}

function logError(status, message) {
    $.ajax({
        type: "POST",
        url: "/Log/LogMessage",
        data: JSON.stringify({ status: status, message: message }),
        contentType: "application/json; charset=utf-8"
    });
}

$(document).on("click", "#modal-error-message .btn-danger", function () {
    if (retryRequests != null) {
        $.each(retryRequests, function (index, value) {
            callService(value.props, value.callback, value.cache);
        });
    }
});

/**
 * Apply JSON object to handlebars template
 * @param {string} templateId - The id of handlebars template
 * @param {string} targetId - The id of object that receives the compiled html
 * @param {object} data - The JSON object
 */

var ApplyTemplateAction = {
    Create: 1,
    Append: 2,
    Replace: 3
};

function applyTemplate(templateId, targetId, data, actionType) {
    var results = Handlebars.compile($("#" + templateId).html());

    var targetObj = $("#" + targetId);

    actionType = actionType || ApplyTemplateAction.Create;
    switch (actionType) {
        case ApplyTemplateAction.Create:
            targetObj.html(results(data));
            break;

        case ApplyTemplateAction.Append:
            targetObj.append(results(data));
            break;

        case ApplyTemplateAction.Replace:
            targetObj.replaceWith(results(data));
            break;
    }

    $(".selectpicker").selectpicker("refresh");
}

/**
 * Gets the value of editor
 * @param {string} editorId - The id of editor
 */
function getEditorValue(editorId) {
    var editor = $("#" + editorId);

    if (editor == null || editor.length === 0) {
        editor = $("input:radio[name='" + editorId + "']:checked");
        if (editor == null || editor.length === 0)
            return null;
    }

    switch (editor.get(0).type) {
        case "text":
            if (editor.hasClass("datepicker")) {
                return editor.datepicker("getDate");
            }

        case "textarea":
        case "hidden":
        case "radio":
        case "select-one":
        case "select-multiple":
            return editor.val();

        case "checkbox":
            return editor.prop("checked");

        case "button":
            return editor.data("value");

        default:
            return null;
    }
}

/**
 * Sets the value to editor
 * @param {string} editorId - The id of editor
 * @param {string} value - The value to be setted
 */
function setEditorValue(editorId, value) {
    var editor = $("#" + editorId).get(0);

    if (editor == null) {
        editor = $("input:radio[name='" + editorId + "'][value='" + value + "']").get(0);
    }

    if (editor == null)
        return;

    if (value == undefined)
        value = "";

    switch (editor.type) {
        case "radio":
            editor.checked = true;
            break;

        case "text":
        case "textarea":
        case "hidden":
            if ($("#" + editorId).hasClass("datepicker")) {
                $("#" + editorId).datepicker("setDate", (value.indexOf && value.indexOf("/Date") !== -1 ? jsonWcfDatetimeToJsDate(value) : value));
                $("#" + editorId).datepicker("refresh");
            } else {
                $("#" + editorId).val(value);
            }
            break;

        case "select-one":
        case "select-multiple":
            $("#" + editorId).val(value);
            $("#" + editorId).selectpicker("refresh");
            break;

        case "checkbox":
            editor.checked = value;
            break;
    }
}

/**
 * Sets the text to editor
 * @param {string} editorId - The id of editor
 * @param {string} text - The text to be setted
 */
function setEditorText(editorId, text) {
    var editor = $("#" + editorId).get(0);

    if (editor != null && editor.type === "select-one") {
        $("#" + editorId + " option").filter(function () { return this.text.toLowerCase() === text.toLowerCase(); }).attr("selected", true);
        $("#" + editorId).selectpicker("refresh");
    } else {
        setEditorValue(editorId, text);
    }
}

/** 
 * Read a page's GET URL variables and return them as an associative array.
 */
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split("=");
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/** 
 * Set or unset the required property from an element
 * @param {string} elemetId - The id of element
 * @param {boolean} value - The value to be setted (true or false)
 */
function setMandatory(elementId, value) {
    $("#" + elementId).prop("required", value);

    if (value === true) {
        $("label[for='" + elementId + "']").addClass("required");
    } else {
        $("label[for='" + elementId + "']").removeClass("required");
    }
}

/** 
 * Validates if user contains specific permission
 * @param {string} permissionToValidate - The permission to validate
 */
function hasRolePermission(permissionToValidate) {
    var filtered = [];
    var perms = Cookies.get("userPermissions");

    if (perms != null && perms.length > 0) {
        var permsList = JSON.parse(Base64.decode(perms));

        if (permsList != null && permsList.length > 0) {
            filtered = $(permsList).filter(function () {
                return this.Role === permissionToValidate;
            });
        }
    }

    return (filtered.length > 0);
}

/** 
 * Get lookup data in a given language
 * @param {string} name - The name of lookup element.
 * @param {string} language - The language to retrieve the lookup values.
 * @param {function} callbackFunction - The callback function to process the results.
 */
function getLookupData(name, language, callbackFunction, async) {
    var props = {
        type: "GET",
        url: "lookup?name=" + name + "&lang=" + language,
        async: async == null ? true : async
    };
    callService(props, function (result) {
        if (callbackFunction)
            callbackFunction(result);
    }, true);
}

/** 
 * Validate email format
 * @param {string} email - The email to be validated.
 */
function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

/** 
 * Validate internacional phone format
 * @param {string} phone - The phone to be validated.
 */
function validatePhone(phone) {
    //var re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
    var re =/^(?:[0-9]{9,13})?$/i;
    return re.test(phone);
}

/**
* Validate date in dd-MM-yyyy format for portuguese notation
*
*/
function validateDate(date)
{
    var re = /((0[1-9]|[12]\d)-(0[1-9]|1[012])|30-(0[13-9]|1[012])|(31-(0[13578]|1[02])))-(19|20)\d\d/;
    return re.test(date);
}

/**
* Validate portuguese postal code format
*
*/
function validatePortuguesePostalCode(value)
{
    var re = /^(\d{4})\-?(\d{3})$/i;
    return re.test(value);
}

/**
 * Try convert the providade value to number.
 * @param {object} value - The value to be converted
 */
function convertToNumber(value) {
    if (value != null && !isNaN(value))
        return Number(value);
    return null;
}

/** 
 * Converts a WCF JSON date to a javascript date
 * @param {string} jsonWcfDate - The date.
 */
function jsonWcfDatetimeToJsDate(jsonWcfDate) {
    var jsDate = null;

    if (jsonWcfDate != null && jsonWcfDate.length > 6) {
        jsDate = new Date(parseInt(jsonWcfDate.substr(6)));
    }

    return jsDate;
}

/** 
 * Converts a javascript date to a WCF JSON date
 * @param {string} jsDate - The date.
 */
function jsDateToJsonWcfDatetime(jsDate) {
    var dt = jsDate.getTime();
    return "\/Date(" + dt + ")\/";
}

function formatDate(date) {
    var result = "";
    date = jsonWcfDatetimeToJsDate(date);

    if (date instanceof Date) {
        result = $.datepicker.formatDate("dd-mm-yy", date);
    }

    return result;
}

/** 
 * Clear bootstrap select selected value or values
 * @param {string} selectId - The id of select.
 */
function clearAllSelected(selectId) {
    setEditorValue(selectId, "");
    $("#" + selectId).selectpicker("deselectAll");
}

/**
 * Calculate the difference, in days, between two dates
 * @param {firstDate} The first date to compare
 * @param {secondDate} The second date to compare
 */
function diffDays(firstDate, secondDate) {
    if (firstDate instanceof Date && secondDate instanceof Date) {
        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        var result = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));

        return result;
    }

    return -1;
}

/**
 * Calculate the difference, in ticks, between two dates
 * @param {firstDate} The first date to compare
 * @param {secondDate} The second date to compare
 */
function diffTicks(firstDate, secondDate) {
    if (firstDate instanceof Date && secondDate instanceof Date) {
        return firstDate.getTime() - secondDate.getTime();
    }

    return -1;
}

function showSuccessModal() {
    $("#modal-success-message").modal("show");
}

function showSuccessModalWithRedirect(url) {
    $("#modal-success-redirect-message").modal({ backdrop: "static", keyboard: false });

    if (url != null) {
        setTimeout(function() { location.href = LocationPath.getVirtualDirectoryName() + url; }, 3000);    
    }
}

function getResource(name) {
    return i18n.t(name);
}

function isInIframe() {
    return (window.location !== window.parent.location);
}

function closeModal(modalId) {
    $("#" + modalId).modal("hide");
}

function createHidden(id, value) {
    $("<input>").attr({type: "hidden", id: id, value: value}).appendTo("body");
}

function enableEditor(editorId, state) {
    $("#" + editorId)
        .prop("disabled", (state == null ? false : !state))
        .selectpicker("refresh");
}

var LocationPath = new function()
{
    this.getVirtualDirectoryName = function() {
        return $("base").attr("href");
    }
}