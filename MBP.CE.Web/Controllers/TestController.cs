using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Configuration;

namespace MBP.CE.Web.Controllers
{
    public class TestController : Controller
    {
        private string _serviceUrl = ConfigurationManager.AppSettings["ServiceUrl"];

        public ActionResult Index()
        {
            return View();
        }

        [AllowAnonymous]
        public ActionResult VehicleInfo(int certificateNumber)
        {
            var requestMsg = new HttpRequestMessage(HttpMethod.Get, _serviceUrl + "/SigaGD.svc/rest/VehicleInfo?certificateNumber=" + certificateNumber);

            SendRequest(requestMsg);

            return View("Index");
        }

        [AllowAnonymous]
        public ActionResult Observation(int certificateNumber, string message)
        {
            string postBody = ObjectToJson(new { CertificateNumber = certificateNumber, Observation = message });

            var content = new StringContent(postBody, Encoding.UTF8, "application/json");

            var requestMsg = new HttpRequestMessage(HttpMethod.Post, _serviceUrl + "/SigaGD.svc/rest/Observation")
            {
                Content = content
            };

            SendRequest(requestMsg);

            return View("Index"); 
        }

        [AllowAnonymous]
        public ActionResult ScanningInfo(int certificateNumber, bool daimler, bool daimlermbr, bool asdaimler, bool asdaimlermbr, string pdflink, string user, DateTime date)
        {
            var data = new
            {
                certificateNumber,
                daimlerAuth = daimler,
                mbrAuth = daimlermbr,
                daimlerAfertSalesAuth = asdaimler,
                mbrAfterSalesAuth = asdaimlermbr,
                pdfLink = pdflink,
                username = user,
                date
            };

            string postBody = ObjectToJson(data);
            var content = new StringContent(postBody, Encoding.UTF8, "application/json");

            var requestMsg = new HttpRequestMessage(HttpMethod.Post, _serviceUrl + "/SigaGD.svc/rest/ScanningInfo")
            {
                Content = content
            };

            SendRequest(requestMsg);
            
            return View("Index");
        }

        private void SendRequest(HttpRequestMessage requestMsg)
        {
            var handler = new HttpClientHandler { UseDefaultCredentials = true };

            using (var httpClient = new HttpClient(handler))
            {
                var responseMessage = httpClient.SendAsync(requestMsg).Result;
                var responseMessageContent = responseMessage.Content.ReadAsStringAsync().Result;

                TempData["message"] = responseMessageContent;
                TempData["code"] = responseMessage.StatusCode == HttpStatusCode.OK
                    ? "OK"
                    : "NOK";
            }
        }

        private static string ObjectToJson<TObjectToSerialize>(TObjectToSerialize objectToSerialize)
        {
            var json = new JsonSerializer
            {
                DateFormatHandling = DateFormatHandling.MicrosoftDateFormat,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };

            var textWriter = new StringWriter();
            json.Serialize(textWriter, objectToSerialize);
            return textWriter.ToString();
        }
    }
}