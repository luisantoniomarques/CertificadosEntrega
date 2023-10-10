using MBP.CE.BackOffice.Models;
using MBP.FRW.Core.Extensions;
using MBP.FRW.Net.Mail;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace MBP.CE.BackOffice.Controllers
{
    public class UserManagementController : Controller
    {
        private const string UserLogging = "admin";

        private const string NewCertificate = "CE Novo";
        private const string UsedCertificate = "CE Used";
        private const string Used1Certificate = "CE Used1";
        private const string StarSelectionCertificate = "CE StarSelection";

        private static readonly Random Random = new Random((int)DateTime.Now.Ticks);

        public ActionResult Index()
        {
            var usersList = GetUsers();
            ViewBag.outlet = GetOutlets(true);

            return View(usersList);
        }

        [HttpPost]
        public ActionResult Index(string username, string email, string outlet, bool showdetails)
        {
            var usersList = GetUsers(username, email, outlet, showdetails);
            ViewBag.outlet = GetOutlets(true);

            return View(usersList);
        }

        public ActionResult Create()
        {
            var model = new UserViewModel {
                IsActive = true,
                ProfilesList = GetProfiles(),
                ConcessionList = GetConcessions(),
                OutletsList = GetOutlets()
            };

            return View(model);
        }

        [HttpPost]
        public ActionResult Create(UserViewModel model, bool notifyUser)
        {
            try
            {
                ValidateUsername(model.Username);

                if (ModelState.IsValid)
                {
                    bool userNotified;

                    if (CreateUser(model, notifyUser, out userNotified))
                    {
                        if (notifyUser && !userNotified)
                        {
                            TempData["UserCreatedButNotNotified"] = true;
                        }

                        return RedirectToAction("Index");
                    }

                    ModelState.AddModelError(string.Empty, @"Não foi possível criar o utilizador. Tente novamente, por favor.");
                }

                model.ProfilesList = TempData["UserProfiles"] as IEnumerable<SelectListItem>;
                model.OutletsList = TempData["UserOutlets"] as IEnumerable<SelectListItem>;

                return View(model);
            }
            catch
            {
                return View("Error");
            }
        }

        public ActionResult Edit(string username)
        {
            var user = GetUsers(username).FirstOrDefault();

            if (user != null)
            {
                user.Outlets = GetUserOutlets(username);
                user.ConcessionList = GetConcessions();
                user.OutletsList = GetOutlets();
                user.ProfilesList = GetProfiles();
                user.CanViewNewCertificate = HasRolePermission(user.Username, NewCertificate);
                user.CanViewStarSelectionCertificate = HasRolePermission(user.Username, StarSelectionCertificate);
                user.CanViewUsedCertificate = HasRolePermission(user.Username, UsedCertificate);
                user.CanViewUsed1Certificate = HasRolePermission(user.Username, Used1Certificate);

                return View(user);
            }

            return null;
        }

        [HttpPost]
        public ActionResult Edit(UserViewModel model, string currentUsername)
        {
            try
            {
                ValidateUsername(model.Username, currentUsername);

                if (ModelState.IsValid) 
                {
                    if (UpdateUser(model, currentUsername)) {
                        return RedirectToAction("Index");
                    }

                    ModelState.AddModelError(string.Empty, @"Não foi possível actualizar os dados do utilizador. Tente novamente, por favor.");
                }

                model.ProfilesList = TempData["UserProfiles"] as IEnumerable<SelectListItem>;
                model.OutletsList = TempData["UserOutletsLOX"] as IEnumerable<SelectListItem>;

                return View(model);
            }
            catch
            {
                return View("Error");
            }
        }

        public ActionResult ResetPassword(string username, string email)
        {
            int rowsAffected = 0;

            try
            {
                string newPassword = RandomString(5);

                var user = new UserViewModel {Password = newPassword};

                var connectString = GetConnectionString();

                string query = "UPDATE [middleware].[tbEntitysAuth] SET strPassword = '{0}' WHERE strLogin = '{1}' ";
                query = string.Format(query, user.Password, username);

                using (var connection = new SqlConnection(connectString))
                using (var cmd = new SqlCommand(query, connection))
                {
                    connection.Open();
                    rowsAffected = cmd.ExecuteNonQuery();
                }

                TempData["PasswordReseted"] = false;

                if (rowsAffected == 1)
                {
                    SendPasswordByEmail(username, email, newPassword);
                    TempData["PasswordReseted"] = true;
                }
            }
            catch
            {
                TempData["CannotResetPassword"] = (rowsAffected != 1);
                TempData["CannotSendEmail"] = true;
            }

            return RedirectToAction("Edit", new { username });
        }

        private void SendPasswordByEmail(string name, string email, string password)
        {
            var mailService = new MailService();

            var mailMessage = new MailMessage
            {
                Attachments = null,
                Body = string.Format("Caro {0},<br/>A sua nova password para acesso à aplicação de Certificados v2.0 é: <strong>{1}</strong>", name, password),
                Destinations = new[] { new MailRecipient { EmailAddress = email, Name = name } },
                Sender = new MailContact { EmailAddress = "mbp@mbp.pt", Name = "Mercedes-Benz Portugal" },
                Subject = "Acesso à aplicação de Certificados v2.0",
                IsBodyHtml = true
            };

            mailService.SendMessage(mailMessage);
        }

        private void ValidateUsername(string newUsername, string currentUsername = "")
        {
            if (!string.IsNullOrEmpty(newUsername))
            {
                if (!IsUsernameAvailable(newUsername, currentUsername))
                {
                    ModelState.AddModelError(string.Empty, @"Username não está disponível.");
                }
            }
        }

        private string GetConnectionString()
        {
            return ConfigurationManager.ConnectionStrings["DBWORKFLOW"].ConnectionString;
        }

        private string GetCrmConnectionString()
        {
            return ConfigurationManager.ConnectionStrings["MBPCRM"].ConnectionString;
        }

        private int GetApplicationId()
        {
            int applicationId;

            int.TryParse(ConfigurationManager.AppSettings["ApplicationId"], out applicationId);

            return applicationId;
        }
        
        private string RandomString(int size)
        {
            var builder = new StringBuilder();
            for (int i = 0; i < size; i++)
            {
                char ch = Convert.ToChar(Convert.ToInt32(Math.Floor(26 * Random.NextDouble() + 97)));
                builder.Append(ch);
            }

            return builder.ToString();
        }

        private IEnumerable<UserViewModel> GetUsers(string username = null, string email = null, string outlet= null, bool showdetais = false)
        {
            var result = new List<UserViewModel>();

            var connectString = GetConnectionString();

            string query = "SELECT  *, " +
                           "        (SELECT TOP 1 fk_Role FROM tbEntityRole WHERE strLogin = [middleware].[tbEntitysAuth].strLogin AND fk_Application = {0}) as [Profile] " +
                           "FROM    [middleware].[tbEntitysAuth] WHERE strLogin IS NOT NULL";

            if (!string.IsNullOrEmpty(outlet))
            {
                query += " AND strLogin IN (SELECT strLogin FROM [middleware].[tbEntity_Outlet] WHERE outletId = '{1}')";
            }

            if (!string.IsNullOrEmpty(username))
            {
                query += " AND strLogin = '{2}'";
            }

            if (!string.IsNullOrEmpty(email))
            {
                query += " AND strEmail = '{3}'";
            }

            query = string.Format(query, GetApplicationId(), outlet, (username == null ? string.Empty : username.Trim()), (email == null ? string.Empty : email.Trim()));

            using (var connection = new SqlConnection(connectString))
            using (var cmd = new SqlCommand(query, connection))
            {
                connection.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            int isActiveColumn  = reader.GetOrdinal("bStatus");
                            int usernameColumn  = reader.GetOrdinal("strLogin");
                            int emailColumn     = reader.GetOrdinal("strEmail");
                            int profileColumn   = reader.GetOrdinal("Profile");

                            string usern = reader.IsDBNull(usernameColumn) ? string.Empty : reader.GetString(usernameColumn);

                            var item = new UserViewModel
                            {
                                IsActive = !reader.IsDBNull(isActiveColumn) && Convert.ToBoolean(reader.GetBoolean(isActiveColumn)),
                                Username = usern,
                                Email = reader.IsDBNull(emailColumn) ? string.Empty : reader.GetString(emailColumn),
                                Profile = reader.IsDBNull(profileColumn) ? 0 : reader.GetInt32(profileColumn),
                                OutletsList = GetOutlets(),
                                
                            };

                            if (showdetais)
                            {
                                item.Outlets = GetUserOutlets(usern);
                                item.CanViewNewCertificate = HasRolePermission(usern, NewCertificate);
                                item.CanViewStarSelectionCertificate = HasRolePermission(usern, StarSelectionCertificate);
                                item.CanViewUsedCertificate = HasRolePermission(usern, UsedCertificate);
                                item.CanViewUsed1Certificate = HasRolePermission(usern, Used1Certificate);
                            }

                            result.Add(item);
                        }
                    }
                }
            }

            return result;
        }

        private IEnumerable<SelectListItem> GetProfiles()
        {
            var result = new List<SelectListItem>();

            var connectString = GetConnectionString();

            string query = "SELECT	DISTINCT " +
                           "        dbo.tbRoles.id_Role AS RoleId, " +
                           " 		dbo.tbRoles.strRoleName AS RoleName " +
                           "FROM	dbo.tbModules_Roles " +
                           " 		INNER JOIN dbo.tbRoles ON dbo.tbModules_Roles.fk_Role = dbo.tbRoles.id_Role AND tbRoles.bStatus = 1 " +
                           "WHERE	dbo.tbModules_Roles.fk_Application = " + GetApplicationId();

            using (var connection = new SqlConnection(connectString))
            using (var cmd = new SqlCommand(query, connection))
            {
                connection.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            var item = new SelectListItem
                            {
                                Value = reader.GetInt32(reader.GetOrdinal("RoleId")).ToString(CultureInfo.InvariantCulture),
                                Text = reader.GetString(reader.GetOrdinal("RoleName"))
                            };

                            result.Add(item);
                        }
                    }
                }
            }

            //manual removal for unused roles
            var unusedRoles = new[] {NewCertificate, StarSelectionCertificate, UsedCertificate, Used1Certificate};
            result.RemoveAll(x => unusedRoles.Contains(x.Text));

            //add empty item
            result.Insert(0, new SelectListItem());

            return new SelectList(result, "Value", "Text");
        }

        private bool HasRolePermission(string username, string roleDescription)
        {
            var connectString = GetConnectionString();

            string query =
                string.Format(
                    "SELECT COUNT(1) FROM tbEntityRole WHERE strLogin = '{0}' AND fk_Role = (SELECT id_Role FROM tbRoles WHERE strRoleName = '{1}')",
                    username, roleDescription);

            using (var connection = new SqlConnection(connectString))
            using (var cmd = new SqlCommand(query, connection))
            {
                connection.Open();
                var count = (int)cmd.ExecuteScalar();
                return (count > 0);
            }
        }

        private IEnumerable<SelectListItem> GetOutlets(bool addEmptyItem = false, string concessionId = null)
        {
            var result = new List<SelectListItem>();

            var cache = Session["crmOutlets"] as List<SelectListItem>;

            if (cache == null || concessionId != null)
            {
                var connectString = GetCrmConnectionString();

                string query =
                    @"EXECUTE AS USER = 'EMEA\E923_s_CRM'; select noesis_name, noesis_gssnoutletid from dbo.Filterednoesis_outlet where statuscode = 1 and noesis_outlettypename = 'LOC' AND ISNULL(noesis_gssnoutletid, '') <> '' ";

                if (concessionId != null)
                {
                    query += "AND noesis_parentid = '" + concessionId + "' ";
                }

                query += "order by noesis_name";

                using (var connection = new SqlConnection(connectString))
                {
                    using (var cmd = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                while (reader.Read())
                                {
                                    var item = new SelectListItem
                                    {
                                        Value = reader["noesis_gssnoutletid"].ToString(),
                                        Text = reader["noesis_name"].ToString(),
                                    };

                                    result.Add(item);

                                    if (concessionId == null)
                                    {
                                        var cacheOutlets = result.Select(i => i.Clone()).ToList();
                                        Session["crmOutlets"] = cacheOutlets;    
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                result = cache.Select(item => item.Clone()).ToList();
            }

            if (addEmptyItem)
            {
                var emptyItem = new SelectListItem { Value = "", Text = "" };
                result.Insert(0, emptyItem);
            }

            return new SelectList(result, "Value", "Text");
        }

        private IEnumerable<SelectListItem> GetConcessions(bool addEmptyItem = true)
        {
            var result = new List<SelectListItem>();

            var cache = Session["crmConcessions"] as List<SelectListItem>;

            if (cache == null)
            {
                var connectString = GetCrmConnectionString();

                string query =
                    @"EXECUTE AS USER = 'EMEA\E923_s_CRM'; select noesis_name, noesis_outletid from dbo.Filterednoesis_outlet where statuscode = 1 and noesis_outlettypename = 'LE' order by noesis_name";

                using (var connection = new SqlConnection(connectString))
                {
                    using (var cmd = new SqlCommand(query, connection))
                    {
                        connection.Open();
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                while (reader.Read())
                                {
                                    var item = new SelectListItem
                                    {
                                        Value = reader["noesis_outletid"].ToString(),
                                        Text = reader["noesis_name"].ToString(),
                                    };

                                    result.Add(item);

                                    var cacheOutlets = result.Select(i => i.Clone()).ToList();
                                    Session["crmConcessions"] = cacheOutlets;
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                result = cache.Select(item => item.Clone()).ToList();
            }

            if (addEmptyItem)
            {
                var emptyItem = new SelectListItem { Value = "", Text = "" };
                result.Insert(0, emptyItem);
            }

            return new SelectList(result, "Value", "Text");
        }

        private string[] GetUserOutlets(string username)
        {
            var result = new List<string>();

            var connectString = GetConnectionString();

            string query = "SELECT outletId FROM [middleware].[tbEntity_Outlet] WHERE strLogin = '{0}'";
            query = string.Format(query, username);
            
            using (var connection = new SqlConnection(connectString))
            using (var cmd = new SqlCommand(query, connection))
            {
                connection.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows)
                    {
                        while (reader.Read())
                        {
                            var outlet = reader.GetString(reader.GetOrdinal("outletId"));
                            result.Add(outlet);
                        }
                    }
                }
            }

            return result.ToArray();
        }

        private void CreateEntity(SqlConnection db, SqlTransaction transaction, UserViewModel user)
        {
            if (!IsUsernameConfigured(user.Username))
            {
                string query = "INSERT INTO [dbo].[tbEntitys] (strLogin, fk_EntityType, creation_by, creation, modif_by, modif, bStatus) " +
                                "VALUES ('{0}', 3, '{1}', GETDATE(), '{1}', GETDATE(), {2})";
                query = string.Format(query, user.Username, UserLogging, Convert.ToInt32(user.IsActive));
                new SqlCommand(query, db, transaction).ExecuteNonQuery();
            }
        }

        private void CreateEntityAuthentication(SqlConnection db, SqlTransaction transaction, UserViewModel user)
        {
            string query = "INSERT INTO [middleware].[tbEntitysAuth] (strLogin, strPassword, strEmail, creation, creation_by, modif, modif_by, bStatus) " +
                            "VALUES ('{0}', '{1}', '{2}', GETDATE(), '{3}', GETDATE(), '{3}', {4})";
            query = string.Format(query, user.Username, user.Password, user.Email, UserLogging, Convert.ToInt32(user.IsActive));
            new SqlCommand(query, db, transaction).ExecuteNonQuery();
        }

        private void UpdateEntityAuthentication(SqlConnection db, SqlTransaction transaction, UserViewModel user, string currentUsername)
        {
            string query = "UPDATE [middleware].[tbEntitysAuth] SET strLogin='{0}', strEmail='{1}', modif=GETDATE(), modif_by='{2}', bStatus={3} WHERE strLogin='{4}'";
            query = string.Format(query, user.Username, user.Email, UserLogging, Convert.ToInt32(user.IsActive), currentUsername);
            new SqlCommand(query, db, transaction).ExecuteNonQuery();
        }

        private void CreateOutletRelation(SqlConnection db, SqlTransaction transaction, UserViewModel user, string currentUsername = null)
        {
            if (string.IsNullOrEmpty(currentUsername))
            {
                currentUsername = user.Username;
            }

            string query = "DELETE FROM [middleware].[tbEntity_Outlet] WHERE strLogin = '{0}'";
            query = string.Format(query, currentUsername);
            new SqlCommand(query, db, transaction).ExecuteNonQuery();

            foreach (var outlet in user.Outlets)
            {
                query = "INSERT INTO [middleware].[tbEntity_Outlet] (strLogin, outletId) VALUES ('{0}', '{1}')";
                query = string.Format(query, user.Username, outlet);
                new SqlCommand(query, db, transaction).ExecuteNonQuery();
            }
        }

        private void CreateEntityRoles(SqlConnection db, SqlTransaction transaction, UserViewModel user, string currentUsername = null)
        {
            if (string.IsNullOrEmpty(currentUsername))
            {
                currentUsername = user.Username;
            }

            string query = "DELETE FROM dbo.tbEntityRole WHERE strLogin = '{0}' AND fk_Application = {1}";
            query = string.Format(query, currentUsername, GetApplicationId());
            new SqlCommand(query, db, transaction).ExecuteNonQuery();

            if (!user.IsActive)
                return;

            query = "INSERT INTO dbo.tbEntityRole " +
                    "SELECT	'{0}', {1}, fk_Module, {2}, GETDATE(), NULL, GETDATE(), '{3}', GETDATE(), '{3}', 1, 22 " +
                    "FROM	tbModules_Roles " +
                    "WHERE	fk_Application = {2} " +
                    "       AND fk_Role = {1}";
            query = string.Format(query, user.Username, user.Profile, GetApplicationId(), UserLogging);
            new SqlCommand(query, db, transaction).ExecuteNonQuery();

            RoleForCertificateType(db, transaction, user.CanViewNewCertificate, user.Username, NewCertificate);
            RoleForCertificateType(db, transaction, user.CanViewStarSelectionCertificate, user.Username, StarSelectionCertificate);
            RoleForCertificateType(db, transaction, user.CanViewUsedCertificate, user.Username, UsedCertificate);
            RoleForCertificateType(db, transaction, user.CanViewUsed1Certificate, user.Username, Used1Certificate);
        }

        private void RoleForCertificateType(SqlConnection db, SqlTransaction transaction, bool permission, string username, string roleName)
        {
            if (permission)
            {
                string  query = 
                    "INSERT INTO dbo.tbEntityRole " +
                    "SELECT '{0}', " +
                    "(SELECT id_Role FROM tbRoles WHERE strRoleName = '{3}'), " +
                    "(SELECT id_Module FROM tbModules WHERE strModuleName = 'Pesquisa Veículos'), " +
                    "{1}, " +
                    "GETDATE(), NULL, GETDATE(), '{2}', GETDATE(), '{2}', 1, 22";
                query = string.Format(query, username, GetApplicationId(), UserLogging, roleName);
                new SqlCommand(query, db, transaction).ExecuteNonQuery();
            }
        }

        private bool CreateUser(UserViewModel user, bool notifyUser, out bool userNotified)
        {
            SqlConnection db = null;
            SqlTransaction transaction = null;
            bool userCreated = false;

            userNotified = false;
            
            try
            {
                string password = RandomString(5);
                user.Password = password;

                db = new SqlConnection(GetConnectionString());
                db.Open();
                transaction = db.BeginTransaction();

                CreateEntity(db, transaction, user);
                CreateEntityAuthentication(db, transaction, user);
                CreateOutletRelation(db, transaction, user);
                CreateEntityRoles(db, transaction, user);

                transaction.Commit();
                userCreated = true;

                //Notify user by email
                if (notifyUser) {
                    try {
                        SendPasswordByEmail(user.Username, user.Email, password);
                        userNotified = true;
                    }
                    catch {
                        userNotified = false;
                    }
                }
            }
            catch (SqlException)
            {
                if (transaction != null) transaction.Rollback();
            }

            if (db != null) db.Close();

            return userCreated;
        }

        private bool UpdateUser(UserViewModel user, string currentUsername)
        {
            SqlConnection db;
            SqlTransaction transaction = null;

            try
            {
                db = new SqlConnection(GetConnectionString());
                db.Open();

                transaction = db.BeginTransaction();

                CreateEntity(db, transaction, user);
                UpdateEntityAuthentication(db, transaction, user, currentUsername);
                CreateOutletRelation(db, transaction, user, currentUsername);
                CreateEntityRoles(db, transaction, user, currentUsername);

                transaction.Commit();
            }
            catch (SqlException)
            {
                if (transaction != null) transaction.Rollback();
                return false;
            }

            db.Close();

            return true;
        }

        private bool IsUsernameAvailable(string newUsername, string currentUsername)
        {
            if (newUsername == "admin")
                return false;

            var connectString = GetConnectionString();

            string query = "SELECT COUNT(1) FROM [middleware].[tbEntitysAuth] WHERE strLogin = '{0}' AND strLogin <> '{1}'";
            query = string.Format(query, newUsername, currentUsername);

            using (var connection = new SqlConnection(connectString))
            using (var cmd = new SqlCommand(query, connection))
            {
                connection.Open();
                int count = int.Parse(cmd.ExecuteScalar().ToString());

                return count == 0;
            }
        }

        private bool IsUsernameConfigured(string username)
        {
            if (string.IsNullOrEmpty(username))
                return true;

            var connectString = GetConnectionString();

            string query = "SELECT COUNT(1) FROM [dbo].[tbEntitys] WHERE strLogin = '{0}'";
            query = string.Format(query, username);

            using (var connection = new SqlConnection(connectString))
            using (var cmd = new SqlCommand(query, connection))
            {
                connection.Open();
                int count = int.Parse(cmd.ExecuteScalar().ToString());

                return count == 1;
            }
        }

        public JsonResult GetOutletsByConcession(Guid concession)
        {
            var result = GetOutlets(concessionId:concession.ToString());
            return Json(result, JsonRequestBehavior.AllowGet);
        }
    }
}
