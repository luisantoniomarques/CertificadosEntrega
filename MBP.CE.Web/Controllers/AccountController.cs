using System;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using MBP.CE.Web.Models;
using MBP.CE.Web.Services;
using MBP.CE.Web.Services.Implementation;
using Newtonsoft.Json;

namespace MBP.CE.Web.Controllers
{
    public class AccountController : Controller
    {
        [AllowAnonymous]
        public ActionResult Login(string returnUrl)
        {
            DeleteAllCookies();

            // var gemsIdentity = Request.ServerVariables["HTTP_SM_USER"];
            //  var isAuthenticatedViaGems = !string.IsNullOrEmpty(Request.ServerVariables["HTTP_SM_USER"]);
            //var gemsIdentity = "BRETESS";
            var gemsIdentity = "anlouro";      //Por user de quem pede a munaça de estado (usado -> novo)
            var isAuthenticatedViaGems = true;

            if (isAuthenticatedViaGems)
            {
                IUserAccountService loginSvc = new UserAccountService();

                var response = loginSvc.SignInUser(gemsIdentity, string.Empty, true);
                if (response != null && response.Any())
                {
                    var cookie = new HttpCookie("userPermissions")
                    {
                        Value = Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(response))),
                        Expires = DateTime.Now.AddDays(1)
                    };
                    Response.Cookies.Add(cookie);

                    return RedirectReturnUrl(returnUrl);
                }
            }

            ViewBag.ReturnUrl = returnUrl;
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        public ActionResult Login(LoginModel model, string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            IUserAccountService loginSvc = new UserAccountService();
            var response = loginSvc.SignInUser(model.UserName, model.Password);
            if (response != null && response.Any())
            {
                var cookie = new HttpCookie("userPermissions") {
                    Value   = Convert.ToBase64String(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(response))),
                    Expires = DateTime.Now.AddDays(1)
                };
                Response.Cookies.Add(cookie);

                return RedirectReturnUrl(returnUrl);
            }

            ModelState.AddModelError(string.Empty, Resources.IncorrectPassword);
            return View();
        }

        [AllowAnonymous]
        public ActionResult LogOff(string returnUrl)
        {
            IUserAccountService loginSvc = new UserAccountService();
            loginSvc.SignOff();
            DeleteAllCookies();
            //return RedirectReturnUrl("http://login.e.corpintra.net/internal/logout");
            return RedirectReturnUrl(WebConfigurationManager.AppSettings["LogoutUrl"]);
        }


        [Authorize]
        public ActionResult ChangePassword(string returnUrl)
        {
            return View();
        }

        [Authorize]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePassword(ChangePasswordViewModel model, string returnUrl)
        {
            if (ModelState.IsValid)
            {
                if (model.NewPassword != model.ConfirmPassword)
                {
                    ModelState.AddModelError(string.Empty, Resources.PasswordsDoNotMatch);
                    return View();
                }
                IUserAccountService loginSvc = new UserAccountService();
                var result = loginSvc.ChangePassword(User.Identity.Name, model.OldPassword, model.NewPassword);
                if (result.Ok)
                {
                    //return RedirectReturnUrl(returnUrl);
                    return View("ChangePasswordSuccess");
                }
                else
                {
                    switch (result.ChangePasswordFailReason.Value)
                    {
                        case UserChangePasswordFailEnum.LoginFailed:
                            ModelState.AddModelError(string.Empty, Resources.WrongOldPassword);
                            break;
                        case UserChangePasswordFailEnum.SavePasswordReturnedFalse:
                            ModelState.AddModelError(string.Empty, Resources.CannotSavePassword);
                            break;
                        case UserChangePasswordFailEnum.ErrorSavingNewPassword:
                            ModelState.AddModelError(string.Empty, Resources.ErrorSavingNewPassword);
                            break;
                        default:
                            ModelState.AddModelError(string.Empty, Resources.UnspecifiedError);
                            break;
                    }
                    return View();
                }
            }
            return View();
        }


        [AllowAnonymous]
        public ActionResult ForgotPassword(string returnUrl)
        {
            return View();
        }

        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public ActionResult ForgotPassword(ForgotPasswordViewModel model, string returnUrl)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            var service = new UserAccountService();

            if (!service.ForgotPassword(model.Username))
            {
                ModelState.AddModelError(string.Empty, Resources.ErrorSendNewPassword);
                return View();
            }

            return View("Login");
        }

        private ActionResult RedirectReturnUrl(string returnUrl)
        {
            if (!string.IsNullOrEmpty(returnUrl))
                return Redirect(returnUrl);

            return Redirect("~/");
        }

        private void DeleteAllCookies()
        {
            string[] cookies = Request.Cookies.AllKeys;
            foreach (string cookie in cookies)
            {
                var httpCookie = Response.Cookies[cookie];
                if (httpCookie != null && httpCookie.Name.IndexOf("__", StringComparison.Ordinal) == -1)
                    httpCookie.Expires = DateTime.Now.AddDays(-1);
            }
        }
    }
}