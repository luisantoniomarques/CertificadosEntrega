using MBP.CE.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using MBP.CE.Web.Services.Implementation;

namespace MBP.CE.Web.Services
{
    public interface IProxyService
    {
        ProxyResponseModel ExecuteMWRequest(string webServiceUrl, HttpMethod httpMethod, object data, string username, ResponseFormatEnum responseFormat = ResponseFormatEnum.Json);
        HttpMethod HttpVerbsToHttpMethod(System.Web.Mvc.HttpVerbs verb);
    }
}
