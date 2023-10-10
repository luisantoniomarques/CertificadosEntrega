
function KendoGridConfig(baseUrl, editorsFunction, afterCallback, beforeCallback) {
    this.columns = [];

    this.callServiceSuccessAfterCallback = afterCallback;

    this.callServiceSuccessBeforeCallback = beforeCallback;

    this.addColumn = function (field, title, options) {
        var column = {
            field: field,
            title: (title == undefined || title.length === 0 ? " " : title)
        };

        if (options != undefined) {
            if (options.width != undefined) {
                column.width = options.width;
            }

            if (options.minScreenWidth != undefined) {
                column.minScreenWidth = options.minScreenWidth;
            }

            if (options.sortable != undefined) {
                column.sortable = options.sortable;
            }

            if (options.template != undefined) {
                column.template = options.template;
            }
        }

        this.columns.push(column);
    };

    this.verbType = "GET";

    this.baseUrl = baseUrl || "";

    this.getEditors = editorsFunction;

    function initDataSource(verbType, baseUrl, getEditorsValues, beforeCallback, afterCallback) {
        if (verbType === undefined || baseUrl.length === 0) {
            return undefined;
        }

        return new kendo.data.DataSource({
            transport: {
                read: function (option) {
                    var editors = $.isFunction(getEditorsValues) ? getEditorsValues() : {};

                    if (!$.isPlainObject(editors)) {
                        editors = {};
                    }

                    editors.items = option.data.pageSize;
                    editors.page = option.data.page - 1;

                    if (option.data.sort !== undefined && option.data.sort.length > 0) {
                        editors.sort = option.data.sort[0].field;
                        editors.direction = option.data.sort[0].dir;
                    } else {
                        editors.sort = "";
                        editors.direction = "";
                    }

                    var props = {
                        type: verbType,
                        url: baseUrl + "?" + $.param(editors)
                    };

                    callService(props, function (result) {
                        if (beforeCallback) {
                            result = beforeCallback(result);
                        }

                        option.success(result);

                        if (afterCallback) {
                            afterCallback(result);
                        }
                    }, false, function () {
                        var nullObject = {
                            Records: [],
                            TotalRecords: 0
                        };

                        option.success(nullObject);
                    });
                }
            },
            serverSorting: true,
            serverPaging: true,
            pageSize: 10,
            schema: {
                data: "Records",
                total: "TotalRecords"
            }
        });
    }

    this.dataSource = initDataSource(this.verbType, this.baseUrl, this.getEditors, this.callServiceSuccessBeforeCallback, this.callServiceSuccessAfterCallback);

    this.contentPaneId = undefined;

    this.detailInit = undefined;

    this.dataBound = undefined;

    this.drawGrid = function (contentPaneId) {
        this.contentPaneId = contentPaneId;

        $("#" + contentPaneId).kendoGrid({
            dataSource: this.dataSource,
            groupable: false,
            sortable: true,
            scrollable: false,
            filterable: false,
            reorderable: false,
            resizable: false,
            columnMenu: false,
            pageable: {
                refresh: true,
                pageSizes: [10, 25, 50],
                buttonCount: 5
            },
            columns: this.columns,
            detailInit: this.detailInit,
            dataBound: this.dataBound
        });
    };

    this.refresh = function () {
        if (this.contentPaneId != undefined) {
            $("#" + this.contentPaneId).data("kendoGrid").dataSource.page(1);
        }
    };
}