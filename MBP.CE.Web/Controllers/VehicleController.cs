using System.Configuration;
using System.Web.Mvc;
using MBP.CE.Web.Filters;

namespace MBP.CE.Web.Controllers
{
    //[SessionExpireFilter]
    [Authorize]
    public class VehicleController : Controller
    {
        public ActionResult Search()
        {
            ViewBag.ShowCertificateTypeFilter = true;
            return View("Search");
        }

        public ActionResult SearchDemo()
        {
            return View("SearchDemo");
        }

        public ActionResult Reassign()
        {
            return View("Reassign");
        }

        public ActionResult Create()
        {
            //welber - 24/10/2019 - Data da Campanha certificado 4 anos
            ViewBag.MaxDateCampaign = ConfigurationManager.AppSettings["Datecampaigns"];
            return View("Create");
        }
    }
}