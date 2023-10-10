using System;
using System.Configuration;
using System.Web.Mvc;

namespace MBP.CE.Web.Controllers
{
    [Authorize]
    public class EntityController : Controller
    {
        public ActionResult Search()
        {
            return View("Search");
        }

        public ActionResult Edit(Guid id, string type)
        {
            ViewBag.Title = Resources.EditClient;
            return View("Edit");
        }

        public ActionResult Create(string type)
        {
            ViewBag.Title = Resources.CreateClient;
            return View("Edit");
        }

        [HttpGet]
        public JsonResult ValidateCardName(string name)
        {
            var fontName = ConfigurationManager.AppSettings["StarSelectionCardFontName"];
            var fontSize = StringToFloat(ConfigurationManager.AppSettings["StarSelectionCardFontSize"]);
            var maxWidth = StringToFloat(ConfigurationManager.AppSettings["StarSelectionCardMaxWidth"]);

            var size = Common.Utils.GraphicsHelper.MeasureString(name, fontName, fontSize, System.Drawing.GraphicsUnit.Millimeter);
            return Json((size.Width <= maxWidth), JsonRequestBehavior.AllowGet);
        }

        private float StringToFloat(string value)
        {
            var result = 0.0f;

            if (!string.IsNullOrEmpty(value)) { 
                value = value.Replace(".", ",");
                float.TryParse(value, out result);
            }

            return result;
        }
    }
}