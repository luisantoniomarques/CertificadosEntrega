using System.Collections.Generic;
using System.Web.Optimization;
using MBP.CE.Web.Helpers;

namespace MBP.CE.Web
{
    public class BundleConfig
    {
        private const string ScriptVersion = "1.89";

        public static void RegisterBundles(BundleCollection bundles)
        {
            CreateScriptBundle(bundles, "jquery", new[] {"jquery-{version}.js"});

            CreateScriptBundle(bundles, "jqueryui", new[] {"jquery-ui-{version}.js"});

            CreateScriptBundle(bundles, "i18n",
                new[] {"i18next.js", "i18n/jquery-ui.datepicker.pt.js", "i18n/defaults-pt_PT.js"});

            CreateScriptBundle(bundles, "daterangepicker", 
                new[] {"bootstrap-daterangepicker/moment.js",  "bootstrap-daterangepicker/daterangepicker.js"});            

            CreateScriptBundle(bundles, "jqueryval", new[] {"jquery.validate.js"});

            CreateScriptBundle(bundles, "bootstrap", new[] {"bootstrap.js", "bootstrap-select.js"});

            CreateScriptBundle(bundles, "handlebars", new[] {"handlebars.js", "handlebars.helpers.js"});
            
            CreateScriptBundle(bundles, "custom",
                new[] {"base64.js", "customization.js", "cookie.js", "generic.js", "jquery-plugin.js", "Shared/enums.js"});

            CreateScriptBundle(bundles, "editEntity",
                new[] {"Entity/edit.js", "Entity/nif.js", "Entity/address.js", "Entity/contact.js"});

            CreateScriptBundle(bundles, "pdflist", new[] {"Certificate/pdflist.js"});

            CreateScriptBundle(bundles, "searchEntity", new[] {"Entity/search.js"});

            CreateScriptBundle(bundles, "editCertificate",
                new[]
                {
                    "Vehicle/starselection.js", "Certificate/warranty.js", "Certificate/certificate.js",
                    "Vehicle/details.js", "Vehicle/completedetails.js", "Certificate/step1.js", "Certificate/step2.js",
                    "Certificate/step3.js"
                });

            CreateScriptBundle(bundles, "newCorrectionRequest",
                new[] {"Certificate/certificate.js", "Vehicle/completedetails.js", "CorrectionRequest/submit.js"});

            CreateScriptBundle(bundles, "searchCorrectionRequest",
                new[] {"Shared/filterbox.js", "CorrectionRequest/search.js"});

            CreateScriptBundle(bundles, "createVehicle",
                new[] {"Vehicle/starselection.js", "Vehicle/create.js"});

            CreateScriptBundle(bundles, "reassignVehicle",
                new[] {"Certificate/certificate.js", "Vehicle/details.js", "Vehicle/reassign.js"});

            CreateScriptBundle(bundles, "searchVehicle",
                new[] {"Vehicle/starselection.js", "Certificate/certificate.js", "Shared/filterbox.js", "Vehicle/search.js"});

            CreateScriptBundle(bundles, "kendogrid",
                new[] {"Kendo/kendo.all.js", "Kendo/kendo.culture.pt-PT.js", "Kendo/kendo.messages.pt-PT.js", "Shared/grid.js"}, false);

            CreateStyleBundle(bundles, "css",
                new[] {"bootstrap.css", "bootstrap-select.css", "site.css", "spinner.css", "themes/base/datepicker.css"});

            CreateStyleBundle(bundles, "base",
                new[]
                {
                    "themes/base/theme.css", "themes/base/core.css",
                    "themes/base/accordion.css", "themes/base/autocomplete.css",
                    "themes/base/button.css", "themes/base/datepicker.css",
                    "themes/base/dialog.css", "themes/base/draggable.css", "themes/base/menu.css",
                    "themes/base/progressbar.css",
                    "themes/base/resizable.css", "themes/base/selectable.css", "themes/base/selectmenu.css",
                    "themes/base/sortable.css",
                    "themes/base/slider.css", "themes/base/spinner.css", "themes/base/spinner.css",
                    "themes/base/tabs.css", "themes/base/tooltip.css"
                });

            CreateStyleBundle(bundles, "kendobootstrap",
                new[]
                {
                    "Kendo/kendo.common-bootstrap.css", "Kendo/kendo.bootstrap.css", "Kendo/kendo.custom.pager.css",
                    "Kendo/kendo.custom.grid.css"
                });
        }

        private static void CreateScriptBundle(BundleCollection bundles, string bundleName, IEnumerable<string> paths, bool transformUrl = true)
        {
            var scriptBundle = new ScriptBundle("~/bundles/" + bundleName);

            foreach (var path in paths)
            {
                if (transformUrl)
                    scriptBundle.Include(ScriptPath(path), new CssRewriteUrlTransformWrapper());
                else
                    scriptBundle.Include(ScriptPath(path));
            }

            bundles.Add(scriptBundle);
        }

        private static void CreateStyleBundle(BundleCollection bundles, string bundleName, IEnumerable<string> paths)
        {
            var styleBundle = new StyleBundle("~/stylebundles/" + bundleName);

            foreach (var path in paths)
            {
                styleBundle.Include("~/Content/" + path, new CssRewriteUrlTransformWrapper());
            }

            bundles.Add(styleBundle);
        }

        private static string ScriptPath(string partialPath)
        {
            return string.Format("~/Scripts/v{0}/{1}", ScriptVersion, partialPath);
        }
    }
}