namespace MBP.CE.Web.Services.Implementation
{
    public class UserAuthenticationData
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string ApplicationId { get; set; }
        public bool ExternalAuthentication { get; set; }
    }
}