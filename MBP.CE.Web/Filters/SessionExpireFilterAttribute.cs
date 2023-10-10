using System;
using System.Web;
using System.Web.Mvc;

namespace MBP.CE.Web.Filters
{
    public class SessionExpireFilterAttribute : ActionFilterAttribute {
        
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            var ctx = HttpContext.Current;

            // check if session is supported
            if (ctx.Session != null && ctx.Session.IsNewSession) {
                
                // If it says it is a new session, but an existing cookie exists, then it must have timed out
                string sessionCookie = ctx.Request.Headers["Cookie"];

                if ((null != sessionCookie) &&
                    (sessionCookie.IndexOf("ASP.NET_SessionId", System.StringComparison.Ordinal) >= 0)) 
                {
                    //ctx.Response.Redirect("/Account/LogOff");
                    ctx.Response.Redirect(new Uri(string.Format("{0}{1}", ctx.Request.Url.GetLeftPart(UriPartial.Authority), "/Account/Login")).ToString());
                }
            }

            base.OnActionExecuted(filterContext);
        }
    }
}
