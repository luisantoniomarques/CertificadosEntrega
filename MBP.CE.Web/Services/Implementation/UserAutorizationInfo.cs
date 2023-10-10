using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MBP.FRW.Core.Extensions;

namespace MBP.CE.Web.Services.Implementation
{
    public class UserAutorizationInfo
    {
        private string _UserIdentityFullName;
        public IEnumerable<UserAuthorizationData> Roles { get; set; }
        public string UserIdentityFullName
        {
            get { return _UserIdentityFullName; }
            set { _UserIdentityFullName = value.TrimString(); }
        }

    }
}