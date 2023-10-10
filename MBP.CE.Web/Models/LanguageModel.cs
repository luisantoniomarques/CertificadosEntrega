using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MBP.CE.Web.Models
{
    public sealed class LanguageModel
    {
        public string Name { get; set; }
        public string CultureName { get; set; }
        public bool IsCurrent { get; set; }
    }
}
