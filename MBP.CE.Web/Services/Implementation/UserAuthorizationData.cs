using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Services.Implementation
{
    public class UserAuthorizationData
    {
        public string Module { get; set; }

        public string Path { get; set; }

        public string Role { get; set; }
    }
}