
$(document).ready(function() {

    $(document).on("click", ".pager-mbp > span", function () {
        var currentPage = convertToNumber($(this).closest(".pager-mbp").data("current-page"));
        var jsFunction  = $(this).closest(".pager-mbp").data("function");
        var data        = convertToNumber($(this).data("page"));
        var pageNumber  = 0;

        if (data != null) {
            pageNumber = data;
        } else {
            data = convertToNumber($(this).data("previous-page-to"));
            if (data != null) {
                pageNumber = (data > 0 ? data - 1 : data);
            } else {
                data = convertToNumber($(this).data("next-page-to"));
                if (data != null) {
                    var max = convertToNumber($(this).data("max-page")) - 1;
                    pageNumber = (max > data ? data + 1 : data);
                }
            }
        }

        if (currentPage != pageNumber && window[jsFunction]) {
            window[jsFunction](pageNumber);
        }
    });

    $(document).on("change", "select[data-pager-item='true']", function () {
        var jsFunction = $(this).data("function");

        if (window[jsFunction]) {
            window[jsFunction](0);
        }
    });

});