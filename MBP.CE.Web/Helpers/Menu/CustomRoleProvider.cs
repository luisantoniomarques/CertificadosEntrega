using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using MBP.Leads.Model.Model;
using System.Configuration;

using System.Web.Security;


namespace MBP.CE.Web.Helpers.Menu
{
    public class CustomRoleProvider : RoleProvider
    {
        public override bool IsUserInRole(string username, string roleName)
        {
            return GetActionsForUser(username).Any(x => x.Role.Equals(roleName));
        }

        public bool IsUserInRole(string username, string roleName, string GSSNID)
        {
            return GetActionsForUser(username).Any(x => x.Role.Equals(roleName) && x.GSSN_ID.Trim().Equals(GSSNID.Trim()));
        }

        public override void CreateRole(string roleName)
        {
            throw new System.NotImplementedException();
        }
        public override bool DeleteRole(string roleName, bool throwOnPopulatedRole)
        {
            throw new System.NotImplementedException();
        }
        public override bool RoleExists(string roleName)
        {
            throw new System.NotImplementedException();
        }
        public override void AddUsersToRoles(string[] usernames, string[] roleNames)
        {
            throw new System.NotImplementedException();
        }
        public override void RemoveUsersFromRoles(string[] usernames, string[] roleNames)
        {
            throw new System.NotImplementedException();
        }
        public override string[] GetRolesForUser(string username)
        {
            return GetActionsForUser(username).Select(x => x.Role).ToArray<string>();
        }

        public string[] GetModulesForUser(string username)
        {
            return GetActionsForUser(username).Select(x => x.Module).Distinct().ToArray<string>();
        }

        public IEnumerable<PortalAction> GetRolesForUserInOutlet(string username, string GSSNID)
        {
            return GetActionsForUser(username).Where(w => w.GSSN_ID == GSSNID).Distinct();
        }

        public override string[] GetUsersInRole(string roleName)
        {
            throw new System.NotImplementedException();
        }
        public override string[] GetAllRoles()
        {
            var cacheKey = String.Format("{0}#{1}", "MBP", "GetAllRoles");
            var roles = Cache.GetFromSession<string[]>(cacheKey);

            if (roles == null)
            {
                Cache.AddToSession(
                    cacheKey,
                    GetAllRolesAsync(),
                    30);
                roles = Cache.GetFromSession<string[]>(cacheKey);
            }

            return roles;
        }

        public override string[] FindUsersInRole(string roleName, string usernameToMatch)
        {
            throw new System.NotImplementedException();
        }
        public override string ApplicationName { get; set; }

        private List<PortalAction> GetActionsForUser(string username)
        {
            var cacheKey = String.Format("{0}#{1}#{2}", "MBP", username, "UserActions");
            var actions = Cache.GetFromSession<List<PortalAction>>(cacheKey);

            if (actions == null)
            {
                Cache.AddToSession(cacheKey, GetActionsByUserId(username), 60);
                actions = Cache.GetFromSession<List<PortalAction>>(cacheKey);
            }

            return actions;
        }
        private List<PortalAction> GetActionsByUserId(string username)
        {
            using (var client = new WebApiClient())
            {
                //client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", HttpContext.Current.Session[ConstantsHelper.SessionConstants.Token].ToString());
                string response;
                //var response = client.GetStringAsync(new Uri(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/Get?username=" + username)).Result;
                if (!string.IsNullOrEmpty(username))
                {
                    response = client.GetStringAsync(new Uri(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetPortalActionsDb?username=" + username)).Result;
                }
                else
                {
                    response = client.GetStringAsync(new Uri(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/GetPortalActionsDb?username=" + ConfigurationManager.AppSettings["DebugUser"])).Result;
                }

                var result = JsonConvert.DeserializeObject<List<PortalAction>>(response);
                return result;
            }
        }
        private List<PortalAction> GetAllRolesAsync()
        {
            using (var client = new WebApiClient())
            {
                var response = client.GetStringAsync(new Uri(ConfigurationManager.AppSettings["WebApiUrl"] + "/api/PortalAction/Get/")).Result;
                var result = JsonConvert.DeserializeObject<List<PortalAction>>(response);
                return result;
            }
        }
    }
}
