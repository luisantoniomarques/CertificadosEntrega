using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace MBP.CE.BackOffice.Models
{
    public class ProxyRequestModel
    {
        public HttpVerbs Verb { get; set; }
        public string Url { get; set; }
        public object RequestData { get; set; }
    }
}