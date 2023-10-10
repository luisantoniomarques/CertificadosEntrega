using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Services.Implementation
{
    public class UserChangePasswordData
    {
        public string Username { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}