using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Models
{
    //public class ForgotPasswordViewModel
    //{
    //    [Required]
    //    [RegularExpression(@"^(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+)|([A-Za-z0-9]+\++))*[A-Za-z0-9]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6}$")]
    //    [Display(ResourceType = typeof(Resources), Name = "Email")]
    //    public string Email { get; set; }
    //}

    public class ForgotPasswordViewModel
    {
        [Required]
        [Display(ResourceType = typeof(Resources), Name = "UserName")]
        public string Username { get; set; }
    }
}