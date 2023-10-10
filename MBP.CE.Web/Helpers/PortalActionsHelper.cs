using System.Configuration;
using System.IO;
using System.Net;
using Newtonsoft.Json;

namespace MBP.CE.Web.Helpers
{
    public static class PortalActionsHelper
    {
        public static string GetModuleUrl(string module, string applicationid = null, string userName = "")
        {
            var url = "";
            WebRequest request = null;
            WebResponse response = null;
            Stream dataStream = null;
            StreamReader reader = null;
            string responseFromServer = null;

            request = WebRequest.Create(string.Format(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetModuleUrl?module={0}&username={1}&applicationid={2}", new object[] { module, userName, applicationid }));

            response = request.GetResponse();
            dataStream = response.GetResponseStream();
            reader = new StreamReader(dataStream);
            responseFromServer = reader.ReadToEnd();

            var gems = ConfigurationManager.AppSettings["GemsAuthentication"];

            var urlCulture = $"/{CultureHelper.GetCurrentCulture()}/";

            string configuredUrl = JsonConvert.DeserializeObject<string>(responseFromServer);

            if (string.IsNullOrWhiteSpace(configuredUrl))
                return "#";

            if (configuredUrl.ToLower().Contains(".pdf") || applicationid == "23")
                urlCulture = "/";

            string[] modList = configuredUrl.Split(new char[] { '/' }, 2);

            if (modList[0].Contains("http") || modList[0].Contains("https"))
                return configuredUrl;

            //no gems
            if (gems == "0")
            {
                switch (applicationid)
                {
                    case "23":
                        url = ConfigurationManager.AppSettings["BaseUrlAppCertificados"] + urlCulture + modList[1];
                        break;
                    case "25":
                        url = ConfigurationManager.AppSettings["BaseUrlAppLeads"] + urlCulture + modList[1];
                        break;
                    case "30":
                        url = ConfigurationManager.AppSettings["BaseUrlAppNetDeclarations"] + urlCulture + modList[1];
                        break;
                    case "31":
                        url = ConfigurationManager.AppSettings["BaseUrlAppConsents"] + urlCulture + modList[1];
                        break;
                    case "32":
                        url = ConfigurationManager.AppSettings["BaseUrlAppPropostaVenda"] + urlCulture + modList[1];
                        break;
                    case "33":
                        url = ConfigurationManager.AppSettings["BaseUrlAppPCC"] + urlCulture + modList[1];
                        break;
                    case "34":
                        url = ConfigurationManager.AppSettings["BaseUrlAppServiceActions"] + urlCulture + modList[1];
                        break;
                    case "35":
                        url = ConfigurationManager.AppSettings["BaseUrlAppCustomerFleet"] + urlCulture + modList[1];
                        break;
                    default:
                        url = ConfigurationManager.AppSettings["BaseUrlApp"] + modList[0] + urlCulture + modList[1];
                        break;
                }
            }
            else
            {
                url = ConfigurationManager.AppSettings["BaseUrlApp"] + modList[0] + urlCulture + modList[1];
            }

            return url;
        }
    }
}