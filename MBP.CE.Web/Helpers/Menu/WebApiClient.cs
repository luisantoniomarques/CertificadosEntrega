using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using MBP.Leads.Model.Model;
using Newtonsoft.Json;
using Thinktecture.IdentityModel.Client;

namespace MBP.CE.Web.Helpers.Menu
{
    public class WebApiClient : HttpClient
    {
        public WebApiClient(bool secure = false)
        {
            var credentials = HttpContext.Current.Session[MenuConstants.SessionConstants.Credentials];
            var token = HttpContext.Current.Session[MenuConstants.SessionConstants.Token];
            if (!secure || credentials == null) return;
            if (token == null)
            {
                Login((Credentials)HttpContext.Current.Session[MenuConstants.SessionConstants.Credentials]);
                DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", HttpContext.Current.Session[MenuConstants.SessionConstants.Token].ToString());
            }
            else
            {
                DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.ToString());
            }
            var userInfo = new UserInformation
            {
                SelectedOutletsIds = ((IEnumerable<string>)HttpContext.Current.Session[MenuConstants.SessionConstants.SelectedOutletsIds]).ToList(),
                OutletIds = ((IEnumerable<string>)HttpContext.Current.Session[MenuConstants.SessionConstants.OutletIds]).Select(Guid.Parse).ToList(),
                Outlets = ((IEnumerable<OutletModel>)HttpContext.Current.Session[MenuConstants.SessionConstants.SelectedOutlets]).ToList(),
                ContactId = HttpContext.Current.Session[MenuConstants.SessionConstants.ContactId].ToString(),
                ContactType = HttpContext.Current.Session[MenuConstants.SessionConstants.ContactType].ToString(),
                LanguageId = CultureHelper.GetCurrentLCID()
            };
            DefaultRequestHeaders.Add("userInfo", JsonConvert.SerializeObject(userInfo));
        }
        #region helpers
        private static void Login(Credentials credentials)
        {
            var token = GetToken(credentials);
            HttpContext.Current.Session[MenuConstants.SessionConstants.Token] = token.AccessToken;
        }

        private static TokenResponse GetToken(Credentials model)
        {
            var client = new OAuth2Client(
                new Uri(ConfigurationManager.AppSettings["WebApiUrl"] + "/Token"));

            return client.RequestResourceOwnerPasswordAsync(HttpUtility.HtmlEncode(model.UserName), HttpUtility.HtmlEncode(model.Password)).Result;
        }
        #endregion helpers
    }
}