using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Models
{
    public class EntityEditModel
    {
        public bool Enabled { get; set; }

        public string NifBindingName { get; set; }
        public string FirstnameBindingName { get; set; }
        public string LastnameBindingName { get; set; }
        public string CardnameBindingName { get; set; }
        public string BirthdateBindingName { get; set; }
        public string PostalcodeBindingName { get; set; }
        public string StreetBindingName { get; set; }
        public string DoorBindingName { get; set; }
        public string ContactBindingName { get; set; }
        public string JobBindingName { get; set; }
        
        public bool RenderAddressListLines { get; set; }
        public bool RenderContactListLines { get; set; }
    }
}