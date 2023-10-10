using System.Web.Optimization;

namespace MBP.CE.BackOffice
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/i18n").Include(
                "~/Scripts/i18next.js",
                "~/Scripts/i18n/jquery-ui.datepicker.pt.js",
                "~/Scripts/i18n/defaults-pt_PT.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                "~/Scripts/jquery.validate.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap.js",
                "~/Scripts/bootstrap-select.js"));

            bundles.Add(new ScriptBundle("~/bundles/handlebars").Include(
                "~/Scripts/handlebars.js",
                "~/Scripts/handlebars.helpers.js"));

            bundles.Add(new ScriptBundle("~/bundles/custom").Include(
                "~/Scripts/customization.js",
                "~/Scripts/cookie.js",
                "~/Scripts/generic.js",
                "~/Scripts/Shared/pager.js",
                "~/Scripts/jquery-plugin.js",
                "~/Scripts/Shared/enums.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/bootstrap.css",
                "~/Content/bootstrap-select.css",
                "~/Content/site.css",
                "~/Content/spinner.css",
                "~/Content/themes/base/datepicker.css"));

            bundles.Add(new StyleBundle("~/Content/base").Include(
                "~/Content/themes/base/theme.css",
                "~/Content/themes/base/core.css",
                "~/Content/themes/base/accordion.css",
                "~/Content/themes/base/autocomplete.css",
                "~/Content/themes/base/button.css",
                "~/Content/themes/base/datepicker.css",
                "~/Content/themes/base/dialog.css",
                "~/Content/themes/base/draggable.css",
                "~/Content/themes/base/menu.css",
                "~/Content/themes/base/progressbar.css",
                "~/Content/themes/base/resizable.css",
                "~/Content/themes/base/selectable.css",
                "~/Content/themes/base/selectmenu.css",
                "~/Content/themes/base/sortable.css",
                "~/Content/themes/base/slider.css",
                "~/Content/themes/base/spinner.css",
                "~/Content/themes/base/tabs.css",
                "~/Content/themes/base/tooltip.css"));
         
#if !DEBUG
            BundleTable.EnableOptimizations = true;
#endif
        }
    }
}