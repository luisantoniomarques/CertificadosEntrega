using MBP.CE.Web.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Mvc;

namespace MBP.CE.Web.Controllers
{
    public class MBPMenuController : Controller
    {
        [ChildActionOnly]
        public ActionResult List(string userName = "", string usage = "")
        {
            var rd = ControllerContext.ParentActionViewContext.RouteData;
            var currentAction = rd.GetRequiredString("action");
            var currentController = rd.GetRequiredString("controller");

            ViewBag.Controller = currentController;
            ViewBag.Action = currentAction;

            List<PortalActions.PortalActionApplications> portalActionApplications = null;
            WebRequest request = null;
            WebResponse response = null;
            Stream dataStream = null;
            StreamReader reader = null;
            string responseFromServer = null;

            PortalActions.ModelList output = null;

            try
            {
                request = WebRequest.Create(string.Format(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetPortalMenuApplications?username={0}&usage={1}&languageId=pt", new object[] { userName, usage }));

                response = request.GetResponse();
                dataStream = response.GetResponseStream();
                reader = new StreamReader(dataStream);
                responseFromServer = reader.ReadToEnd();

                portalActionApplications = JsonConvert.DeserializeObject<List<PortalActions.PortalActionApplications>>(responseFromServer);

                reader.Close();
                response.Close();

                List<PortalActions.ApplicationModules> appMods = new List<PortalActions.ApplicationModules>();

                foreach (var app in portalActionApplications)
                {

                    PortalActions.ApplicationModules auxAppMod = new PortalActions.ApplicationModules();
                    auxAppMod.application = app;

                    // BEGIN: Get Portal Action Application Modules
                    request = WebRequest.Create(string.Format(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetPortalMenuModules?username={0}&applicationId={1}&languageId=pt", new object[] { userName, app.applicationID }));
                    response = request.GetResponse();
                    dataStream = response.GetResponseStream();
                    reader = new StreamReader(dataStream);
                    responseFromServer = reader.ReadToEnd();

                    auxAppMod.modules = new List<PortalActions.PortalActionModules>();
                    var aa = JsonConvert.DeserializeObject<List<PortalActions.PortalActionModules>>(responseFromServer).Where(pam => app.applicationID == pam.applicationID).ToArray();
                    auxAppMod.modules.AddRange(JsonConvert.DeserializeObject<List<PortalActions.PortalActionModules>>(responseFromServer).Where(pam => app.applicationID == pam.applicationID));

                    appMods.Add(auxAppMod);

                    // END: Get Portal Action Application Modules

                }
                // END: Get Portal Action Applications

                output = new PortalActions.ModelList();
                output.ItemList = appMods;

            }
            catch (Exception)
            {
                throw;
            }

            return PartialView("_MBPDynoMenu", output);
        }
    }
}
