using MBP.CE.Web.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Web.Helpers;

namespace MBP.CE.Web.Services.Implementation
{
    public class UserAccountService : IUserAccountService
    {
        public IEnumerable<UserAuthorizationData> SignInUser(string username, string password, bool externalAuth = false)
        {
            IProxyService proxySvc = new ProxyService();
            UserAuthenticationData data = new UserAuthenticationData
            {
                Username = FRW.Security.Cryptography.Rijndael.Encrypt(username),
                Password = FRW.Security.Cryptography.Rijndael.Encrypt(password),
                ApplicationId = FRW.Security.Cryptography.Rijndael.Encrypt(ConfigurationManager.AppSettings["ApplicationId"]),
                ExternalAuthentication = externalAuth
            };
            var serviceUrl = ConfigurationManager.AppSettings["ServiceUrl"];
            ProxyResponseModel response = proxySvc.ExecuteMWRequest(serviceUrl + "authentication/login", HttpMethod.Post, data, username);
            if (response != null && response.StatusCode == System.Net.HttpStatusCode.OK && response.ResponseData != null)
            {
                var authData = Json.Decode<IEnumerable<UserAuthorizationData>>(response.ResponseData.ToString());
                System.Web.Security.FormsAuthentication.SetAuthCookie(username, false);
                return authData;
            }

            if (response != null && response.StatusCode == System.Net.HttpStatusCode.InternalServerError)
            {
                Logger.Fatal(new Exception("Cannot connect middleware for authentication"));
            }

            return null;
        }

        public void SignOff()
        {
            System.Web.Security.FormsAuthentication.SignOut();
        }

        public bool ForgotPassword(string username)
        {
            var ok = false;
            var proxy = new ProxyService();
            var serviceUrl = ConfigurationManager.AppSettings["ServiceUrl"];
            var response = proxy.ExecuteMWRequest(serviceUrl + "authentication/forgotpassword", HttpMethod.Post, username, username);

            if (response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                ok = (bool)response.ResponseData;
            }

            return ok;
        }


        public UserChangePasswordResult ChangePassword(string username, string oldPassword, string newPassword)
        {
            UserChangePasswordResult result = new UserChangePasswordResult();
            if (SignInUser(username, oldPassword).Any())
            {
                try
                {
                    IProxyService proxySvc = new ProxyService();
                    UserChangePasswordData data = new UserChangePasswordData
                    {
                        Username = FRW.Security.Cryptography.Rijndael.Encrypt(username),
                        OldPassword = FRW.Security.Cryptography.Rijndael.Encrypt(oldPassword),
                        NewPassword = FRW.Security.Cryptography.Rijndael.Encrypt(newPassword)
                    };
                    var serviceUrl = ConfigurationManager.AppSettings["ServiceUrl"];
                    var proxyResponse = proxySvc.ExecuteMWRequest(serviceUrl + "authentication/changepassword", HttpMethod.Post, data, username);
                    result.Ok = (bool)proxyResponse.ResponseData;
                    if (!result.Ok)
                    {
                        result.ChangePasswordFailReason = UserChangePasswordFailEnum.SavePasswordReturnedFalse;
                    }
                }
                catch
                {
                    result.Ok = false;
                    result.ChangePasswordFailReason = UserChangePasswordFailEnum.ErrorSavingNewPassword;
                }
            }
            else
            {
                result.Ok = false;
                result.ChangePasswordFailReason = UserChangePasswordFailEnum.LoginFailed;
            }
            return result;
        }
    }
}