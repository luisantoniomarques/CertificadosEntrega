using System;
using System.Linq;
using System.Collections.Generic;

using System.Web;
using System.Web.Mvc;

namespace MBP.CE.Web.Controllers
{
    [Authorize]
    public class CorrectionRequestController : Controller
    {

        public ActionResult Submit()
        {
            return View("Submit");
        }

        public ActionResult Search()
        {
            return View("Search");
        }

    }
}