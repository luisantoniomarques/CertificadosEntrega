using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;

namespace MBP.CE.Web.Models
{
    public class ProxyResponseModel
    {
        public HttpStatusCode StatusCode { get; set; }
        public object ResponseData { get; set; }
    }
}