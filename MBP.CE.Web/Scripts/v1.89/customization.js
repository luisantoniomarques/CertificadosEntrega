/*menu height*/
function menuHeight() {

    var headerHeight = $(".page-head").height();
    var windowHeight = $(window).height();
    var remainingHeight = windowHeight - headerHeight;
    var containerHeight = $(".mcontent").height();

    if (!$(".mobile-burguer").is(":visible")) {

        if (containerHeight > remainingHeight) {
            var menuTotal = containerHeight;
        } else {
            var menuTotal = remainingHeight;
        }

        $("#mmenu .nav").css("min-height", menuTotal + "px");

    } else {
        $("#mmenu .nav").css("min-height", "");
    }

    //console.log(headerHeight, windowHeight, containerHeight, menuTotal);
}

$(document).ready(function () {

    menuHeight();
    
    var option = {
        lng: "pt",
        resGetPath: LocationPath.getVirtualDirectoryName() + "Scripts/v1.89/i18n/locales/__lng__/__ns__.json",
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
        menuHeight();
        if ($("#loading").length === 0) {
            //$("body").append("<div id='spinner-waiter'><div class='background-loader'></div><img class='loader' src='" + LocationPath.getVirtualDirectoryName() + "Content/themes/base/images/ring-alt.gif' alt='' /></div>");
            $("body").append("<div id='loading'><span class='fa fa-spinner fa-pulse'></span></div>");
        }
    });

    $(document).ajaxComplete(function () {
        if ($.active === 1) {
            //$("#spinner-waiter").remove();
            $("#loading").remove();
        }
        menuHeight();

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

    $(".field-validation-error:visible").each(function () {
        $(this).next().addClass("input-validation-error");
    });

    $(".field-validation-error").not(":visible").each(function () {
        $(this).next().removeClass("input-validation-error");
    });

    setValidate();

    /*
    $("#menu_items a").removeClass("active");
    $("a[href='" + location.pathname + "']").addClass("active");
    */

});

$(window).resize(function () {
    menuHeight();
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

    $(".datepicker").datepicker(options, $.datepicker.regional["pt"]);
}