using System.Web.Mvc;
using MBP.CE.Web.Models;

namespace MBP.CE.Web.Controllers
{
    public class LogController : Controller
    {
        [HttpPost]
        public void LogMessage(string message, int status)
        {
            Logger.Fatal(message, status);
        }
    }
}