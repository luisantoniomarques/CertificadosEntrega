using MBP.CE.Web.Models;
using MBP.CE.Web.Services;
using MBP.CE.Web.Services.Implementation;
using System.Net.Http;
using System.Web.Http;

namespace MBP.CE.Web.Controllers
{
    public class ProxyController : ApiController
    {
        [Authorize]
        [HttpPost]
        public HttpResponseMessage Post(ProxyRequestModel model)
        {
            IProxyService proxySvc = new ProxyService();
            ProxyResponseModel response = proxySvc.ExecuteMWRequest(model.Url, proxySvc.HttpVerbsToHttpMethod(model.Verb), model.RequestData, RequestContext.Principal.Identity.Name);
            HttpResponseMessage httpResponseMessage = Request.CreateResponse(response.StatusCode, response);
            return httpResponseMessage;
        }
    }
}
