using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;

namespace MBP.CE.BackOffice
{
    public class Global : System.Web.HttpApplication
    {

        protected void Application_Start()
        {

            System.Web.Http.GlobalConfiguration.Configure(WebApiConfig.Register);

            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //WebApiConfig.Register()
        }

        void Application_Error(Object sender, EventArgs e)
        {
            //var exception = Server.GetLastError();
            //if (exception == null)
            //    return;

            //// Clear the error
            //Server.ClearError();

            //Response.Redirect("/error");
        }
    }
}