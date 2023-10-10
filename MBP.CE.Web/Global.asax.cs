using System;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using MBP.CE.Web.Models;

namespace MBP.CE.Web {

	public class MvcApplication : System.Web.HttpApplication {

		protected void Application_Start() {

            System.Web.Http.GlobalConfiguration.Configure(WebApiConfig.Register);

			AreaRegistration.RegisterAllAreas();
			RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

		    //WebApiConfig.Register()
		}

        void Application_Error(Object sender, EventArgs e) 
        { 
            var exception = Server.GetLastError();
            if (exception == null)
                return;

            // Clear the error
            Server.ClearError();

            Logger.Fatal(exception);

            Response.Redirect("/error");
	    }
    }
}
