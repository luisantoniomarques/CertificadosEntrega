using MBP.CE.Web.Services.Implementation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Services
{
    public interface IUserAccountService
    {
        IEnumerable<UserAuthorizationData> SignInUser(string username, string password, bool externalAuth = false);
        void SignOff();
        bool ForgotPassword(string username);
        UserChangePasswordResult ChangePassword(string username, string oldPassword, string newPassword);
    }
}