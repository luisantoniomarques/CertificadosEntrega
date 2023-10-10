using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using MBP.FRW.Security.Cryptography;

namespace MBP.CE.BackOffice.Models
{
    public class UserViewModel
    {
        private readonly byte[] _salt = Encoding.ASCII.GetBytes("FB42BB4F-1146-4EA0-B074-3D93081BE22A");

        private string _password;

        [Required]
        [Display(Name = @"UserName")]
        public string Username { get; set; }

        [Required]
        [EmailAddress]
        [Display(Name = @"Email")]
        public string Email { get; set; }

        public string Password
        {
            get { return _password; }
            set { _password = Hash.ComputeHash(value, HashAlgoritm.SHA512, _salt); }
        }

        [Required]
        [Display(Name = @"Perfil")]
        public int Profile { get; set; }
        public IEnumerable<SelectListItem> ProfilesList { get; set; }

        [Required]
        public string[] Outlets { get; set; }

        [Display(Name = @"Outlets")]
        public IEnumerable<SelectListItem> OutletsList { get; set; }

        [Display(Name = @"Concessão")]
        public IEnumerable<SelectListItem> ConcessionList { get; set; }

        public IEnumerable<string> OutletsListDescription
        {
            get
            {
                if (Outlets != null)
                {
                    return OutletsList.Where(o => Outlets.Contains(o.Value)).Select(o => o.Text);
                }

                return new List<string>();
            }
        }


        [Required]
        [Display(Name = @"Activo")]
        public bool IsActive { get; set; }

        [Display(Name = @"CE Novo")]
        public bool CanViewNewCertificate { get; set; }

        [Display(Name = @"CE StarSelection")]
        public bool CanViewStarSelectionCertificate { get; set; }

        [Display(Name = @"CE Used")]
        public bool CanViewUsedCertificate { get; set; }

        [Display(Name = @"CE Used1")]
        public bool CanViewUsed1Certificate { get; set; }
    }
}