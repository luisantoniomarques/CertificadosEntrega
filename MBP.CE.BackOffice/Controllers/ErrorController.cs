using System.Web.Mvc;

namespace MBP.CE.BackOffice.Controllers
{
    public class ErrorController : Controller
    {
        public ActionResult Index()
        {
            return View("Error");
        }
    }
}