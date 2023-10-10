using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace MBP.CE.Web {

	public class RouteConfig {

		public static void RegisterRoutes(RouteCollection routes) {
			routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "ErrorHandler",
                url: "error",
                defaults: new { controller = "Error", action = "Index", type = UrlParameter.Optional }
            );

			routes.MapRoute(
				name: "CreateEntity",
				url: "entity/create/{type}",
				defaults: new { controller = "Entity", action = "Create", type = UrlParameter.Optional }
			);

            routes.MapRoute(
                name: "NewCertificate",
                url: "certificate/new/{step}",
                defaults: new { controller = "Certificate", action = "New", type = UrlParameter.Optional }
            );

			routes.MapRoute(
				name: "Default",
				url: "{controller}/{action}/{id}",
				defaults: new { controller = "Vehicle", action = "Search", id = UrlParameter.Optional }
			);
		}

	}
}
