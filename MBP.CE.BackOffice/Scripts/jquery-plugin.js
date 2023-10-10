var _valid = $.fn.valid;

$.fn.valid = function (verifyDisabled) {
    var disabledFields;
    var alsoDisabled = verifyDisabled || false;

    if (alsoDisabled) {
        disabledFields = this.find('[disabled]');
        this.find('[disabled]').prop('disabled', false);
        $('select').attr('style', 'display: block !important;');
    }

    var isValid = _valid.apply(this);

    if (alsoDisabled && disabledFields != null) {
        disabledFields.prop('disabled', true);
        $('select').attr('style', 'display: none !important;');
    }

    if (isValid) {
        var hasError = this.find('.has-error-is-invalid').length > 0;
        isValid = !hasError;
    }
    return isValid;
};

$.validator.setDefaults({
    highlight: function (element) {
    },
    unhighlight: function (element) {
        resetElementError(element);
    },
    errorPlacement: function (error, element) {
        toggleError(error, element);
    }
});

function setValidate() {
    $.extend($.validator.messages, {
        required:   getResource("jQuery.validator.required"),
        email:      getResource("jQuery.validator.email"),
        url:        getResource("jQuery.validator.url"),
        date:       getResource("jQuery.validator.date"),
        dateISO:    getResource("jQuery.validator.dateISO"),
        number:     getResource("jQuery.validator.number"),
        digits:     getResource("jQuery.validator.digits"),

        remote: "Please fix this field.",
        creditcard: "Please enter a valid credit card number.",
        equalTo: "Introduza o mesmo valor novamente.",
        accept: "Please enter a value with a valid extension.",
        maxlength: jQuery.validator.format("O valor excede o tamanho máximo permitido ({0})."),
        minlength: jQuery.validator.format("Tamanho minimo insuficiente ({0})."),
        rangelength: jQuery.validator.format("Introduza um valor com tamanho compreendido entre {0} e {1}."),
        range: jQuery.validator.format("Introduza um valor entre {0} e {1}."),
        max: jQuery.validator.format("Introduza um valor igual ou superior a {0}."),
        min: jQuery.validator.format("Introduza um valor igual ou inferior a {0}.")
    });

    $.validator.addMethod("daymonthyearfour", function (value, element) {
        if (value != '') {
            return validateDate(value);
        }
        return true;     
    }, getResource("jQuery.validator.daymonthyearfour"));


    $.validator.addMethod("greaterThanZero", function (value, element) {
        return this.optional(element) || (parseFloat(value) > 0);
    }, getResource("jQuery.validator.greaterThanZero"));

    $.validator.addMethod("positiveNumber6length", function(value, element) {
        return this.optional(element) || (/^\d{1,6}$/i).test(value);
    }, getResource("jQuery.validator.invalidValue"));
}

function toggleError(error, element) {
    if (error.html() != '' && element.parent('div').has('.field-validation-error').length == 0) {
        error.appendTo(element.closest('div'));

        element.addClass("input-validation-error");
        //especial bootstrap combos
        element.next(".bootstrap-select").addClass("input-validation-error");
    }
    else {
        var err = $('.field-validation-error');
        if (err.length) {
            element.closest('div').remove(err);
        }

        element.removeClass("input-validation-error");
        //especial bootstrap combos
        element.next(".bootstrap-select").removeClass("input-validation-error");
    }
}

function resetErrors() {
    $('.error').remove();
    $('.input-validation-error').removeClass('input-validation-error');
}

function resetElementError(element) {
    $(element).removeClass('input-validation-error');
}