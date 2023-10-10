using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Services
{
    public class UserChangePasswordResult
    {
        public bool Ok { get; set; }
        public UserChangePasswordFailEnum? ChangePasswordFailReason { get; set; }
    }
}