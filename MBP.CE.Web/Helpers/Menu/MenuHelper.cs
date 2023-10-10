using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Security;
using MBP.CE.Web.Helpers.Menu;
using Newtonsoft.Json;

namespace MBP.CE.Web.Helpers
{
    public class MenuHelper
    {
        private static bool GetButtonIsVisible(string portalAction, string username)
        {
            var roleProvider = (CustomRoleProvider)Roles.Providers["CustomRoleProvider"];
            var credentials = (Credentials)HttpContext.Current.Session[MenuConstants.SessionConstants.Credentials];
            //return roleProvider != null && roleProvider.IsUserInRole("d5vmacha", portalAction);
            return roleProvider != null && roleProvider.IsUserInRole(username, portalAction);
        }

        private static bool GetButtonIsVisible(string portalAction, string GSSNID, string username)
        {
            var roleProvider = (CustomRoleProvider)Roles.Providers["CustomRoleProvider"];
            return roleProvider != null && roleProvider.IsUserInRole(username, portalAction, GSSNID);
        }

        private static void CheckUsername(ref string username)
        {
            if (string.IsNullOrEmpty(username))
            {
                username = ConfigurationManager.AppSettings["DebugUser"];
            }
        }

        private static bool GetCertificatesIsVisible(string username)
        {
            CheckUsername(ref username);
            using (var client = new WebApiClient(true))
            {
                var response = client.GetStringAsync(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetMenuPortalActionsDb?username=" + username + "&aplication=" + ConfigurationManager.AppSettings["ApplicationId"]).Result;
                return response != "[]";
            }
        }

        private static bool GetLeadsIsVisible(string username)
        {
            CheckUsername(ref username);
            using (var client = new WebApiClient(true))
            {
                var response = client.GetStringAsync(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetMenuPortalActionsDb?username=" + username + "&aplication=" + ConfigurationManager.AppSettings["LeadsAppID"]).Result;
                return response != "[]";
            }
        }

        public static string GetModuleUrl(string module, string username)
        {
            CheckUsername(ref username);
            using (var client = new WebApiClient(true))
            {
                var response = client.GetStringAsync(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetModuleUrl?module=" + module + "&username=" + username).Result;
                return JsonConvert.DeserializeObject<string>(response);
            }
        }

        public static bool GetDashboardVisibility(string portalAction, string username)
        {
            var roleProvider = (CustomRoleProvider)Roles.Providers["CustomRoleProvider"];
            var credentials = (Credentials)HttpContext.Current.Session[MenuConstants.SessionConstants.Credentials];
            //return roleProvider != null && roleProvider.IsUserInRole("d5vmacha", portalAction);
            return roleProvider != null && roleProvider.IsUserInRole(username, portalAction);
        }

        public static bool GetCertificatesVisibility(string username)
        {
            return GetCertificatesIsVisible(username);
        }

        public static bool GetLeadsVisibility(string username)
        {
            return GetLeadsIsVisible(username);
        }

        public static bool GetRouteOptionVisibility(string username)
        {
            return GetAssignManagerButtonIsVisible(null, username) || GetAssignSalesmanButtonIsVisible(null, username);
        }

        public static bool GetAssignManagerButtonIsVisible(string GSSNID = null, string username = null)
        {
            return GSSNID != null ? GetButtonIsVisible(MenuConstants.PortalActions.ReassignManager, GSSNID) : GetButtonIsVisible(MenuConstants.PortalActions.ReassignManager, username);
        }

        public static bool GetAssignSalesmanButtonIsVisible(string GSSNID = null, string username = null)
        {
            return GSSNID != null ? GetButtonIsVisible(MenuConstants.PortalActions.DistributeOpportunities, GSSNID) : GetButtonIsVisible(MenuConstants.PortalActions.ReassignManager, username);
        }

        public static bool GetBiReportsVisibility(string applicationId, string username)
        {
            return GetModuleIsVisible(applicationId, username);
        }

        private static bool GetModuleIsVisible(string ApplicationID, string username)
        {
            using (var client = new WebApiClient(true))
            {
                var response = client.GetStringAsync(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetMenuPortalActionsDb?username=" + username + "&aplication=" + ApplicationID).Result;

                return response != "[]";
            }
        }

        public static bool GetRolesVisibility(string applicationId, string role, string username)
        {
            return GetRoleIsVisible(applicationId, role, username);
        }

        private static bool GetRoleIsVisible(string ApplicationID, string Role, string username)
        {
            using (var client = new WebApiClient(true))
            {

                var response = client.GetStringAsync(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetMenuPortalActionsDb?username=" + username + "&aplication=" + ApplicationID).Result;

                if (response.Contains(Role))
                {
                    return response != "[]";
                }
                return false;
            }
        }
    }
}