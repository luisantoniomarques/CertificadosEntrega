$(document).ready(function () {

    var option = {
        lng: "pt",
        resGetPath: "/Scripts/v1.73/i18n/locales/__lng__/__ns__.json",
        getAsync: false
    };

    i18n.init(option);

    $(function () {
        /**
         * Initilize all date editors with customized parameters
         */
        bindAllDatepickers();
    });

    /**
     * Configure a spinner to show while ajax request is completing
     */
    $(document).ajaxSend(function () {
        if ($("#spinner-waiter").length == 0) {
            $("body").append("<div id='spinner-waiter'><div class='background-loader'></div><img class='loader' src='../Content/themes/base/images/ring-alt.gif' alt='' /></div>");
        }
    });

    $(document).ajaxComplete(function () {
        if ($.active == 1) {
            $('#spinner-waiter').remove();
        }

        if (retryRequests.length > 0) {
            $("#modal-error-message").modal("show");
        }
    });

    $("#modal-error-message").on("hidden.bs.modal", function () {
        retryRequests = [];
    });

    /**
     * Configure all tables with clickable rows
     */
    $(document).on("click", "tr[data-selectable]", function () {
        $(this).addClass("info").siblings().removeClass("info");
    });

    $('.field-validation-error:visible').each(function () {
        $(this).next().addClass("input-validation-error");
    });

    $('.field-validation-error').not(':visible').each(function () {
        $(this).next().removeClass("input-validation-error");
    });

    setValidate();

    $("#menu_items a").removeClass("active");
    $("a[href='" + location.pathname + "']").addClass("active");

});

/*
*/
function bindAllDatepickers() {

    var options = {
        showAnim: "slideDown",
        dateFormat: "dd-mm-yy",
        yearRange: "-150:+0",
        changeMonth: true,
        changeYear: true
    };

    $(".datepicker").datepicker(options, $.datepicker.regional['pt']);
}