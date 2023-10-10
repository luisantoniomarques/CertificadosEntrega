using System;
using System.Text;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NLog;

namespace MBP.CE.Web.Models
{
    public static class Logger
    {
        public static void Fatal(Exception exception)
        {
            var message = string.Format("User: {0}, Message: {1}", GetCurrentUser(),
                exception != null ? exception.Message : null);

            FatalError(message, exception);
        }

        public static void Fatal(string message, int status)
        {
            string logMessage;

            if (!TryReadMessageAsJsonExceptionMessage(message, out logMessage))
            {
                logMessage = message;
            }

            message = string.Format("User: {0}, Status: {1}, Message: {2}", GetCurrentUser(), status, logMessage);

            FatalError(message, null);
        }

        private static void FatalError(string message, Exception exception)
        {
            var logger = LogManager.GetCurrentClassLogger();
            logger.FatalException(message, exception);
        }

        private static bool TryReadMessageAsJsonExceptionMessage(string json, out string result)
        {
            try
            {
                var resultMessage = new StringBuilder("Message: ");
                var jsonObj = JsonConvert.DeserializeObject<dynamic>(json);

                while (jsonObj != default(JObject))
                {
                    resultMessage.Append(string.Format("{0} | ", jsonObj.Message));
                    jsonObj = jsonObj.InnerException;
                }

                result = resultMessage.ToString();
                return true;
            }
            catch
            {
                result = null;
                return false;
            }
        }

        private static string GetCurrentUser()
        {
            if (HttpContext.Current != null && HttpContext.Current.User != null &&
                HttpContext.Current.User.Identity != null)
            {
                return HttpContext.Current.User.Identity.Name;
            }

            return null;
        }
    }
}