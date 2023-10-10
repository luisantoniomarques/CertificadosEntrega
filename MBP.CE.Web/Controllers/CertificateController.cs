
using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Web.Compilation;
using System.Web.Mvc;
using MBP.CE.Web.Models;
using MBP.CE.Web.Services.Implementation;
using Microsoft.Ajax.Utilities;

namespace MBP.CE.Web.Controllers
{
    [Authorize]
    public class CertificateController : Controller
    {
        

        public ActionResult Type()
        {
            return View("Type");
        }

        public ActionResult Entities()
        {
            return View("Entities");
        }

        public ActionResult Details()
        {
            return View("Details");
        }

        public ActionResult New()
        {
            ViewBag.MaxDateCampaign = ConfigurationManager.AppSettings["Datecampaigns"];
            return View("New");
        }

        public ActionResult PdfList()
        {
            return View("PdfList");
        }

        public ActionResult Edit()
        {
            ViewBag.MaxDateCampaign = ConfigurationManager.AppSettings["Datecampaigns"];
            return View("New");
        }

        public FileContentResult Pdf(Guid certificateId)
        {
            var data = new byte[] { };

            var serviceUrl = ConfigurationManager.AppSettings["ServiceUrl"];
            var proxy = new ProxyService();
            var response = proxy.ExecuteMWRequest(serviceUrl + "certificate/" + certificateId + "/download", HttpMethod.Get, null, User.Identity.Name, ResponseFormatEnum.Xml);
            var result = (string)response.ResponseData;

            var xmlDoc = new System.Xml.XmlDocument();
            xmlDoc.LoadXml(result);

            if (xmlDoc.DocumentElement != null)
                data = Convert.FromBase64String(xmlDoc.DocumentElement.InnerText);

            Response.AppendHeader("Content-Disposition", "inline; filename=certificado.pdf");

            return File(data, "application/pdf");
        }
    }
}