using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Models
{
    public class PortalActions
    {

        public partial class ModelList
        {
            public List<ApplicationModules> ItemList { get; set; }
        }

        public partial class ApplicationModules
        {
            public PortalActionApplications application { get; set; }
            public List<PortalActionModules> modules { get; set; }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schemas.datacontract.org/2004/07/MBP.Leads.Model.Model")]
        public partial class PortalActionApplications
        {

            private string applicationNameField;

            private byte applicationIDField;

            private string iconUrlField;

            private string langField;

            private string usageField;

            /// <remarks/>
            public string ApplicationName
            {
                get
                {
                    return this.applicationNameField;
                }
                set
                {
                    this.applicationNameField = value;
                }
            }

            /// <remarks/>
            public byte applicationID
            {
                get
                {
                    return this.applicationIDField;
                }
                set
                {
                    this.applicationIDField = value;
                }
            }

            /// <remarks/>
            public string iconUrl
            {
                get
                {
                    return this.iconUrlField;
                }
                set
                {
                    this.iconUrlField = value;
                }
            }

            /// <remarks/>
            public string lang
            {
                get
                {
                    return this.langField;
                }
                set
                {
                    this.langField = value;
                }
            }

            /// <remarks/>
            public string usage
            {
                get
                {
                    return this.usageField;
                }
                set
                {
                    this.usageField = value;
                }
            }
        }

        /// <remarks/>
        [System.Xml.Serialization.XmlTypeAttribute(AnonymousType = true, Namespace = "http://schemas.datacontract.org/2004/07/MBP.Leads.Model.Model")]
        public partial class PortalActionModules
        {

            private string applicationNameField;

            private byte moduleIDField;

            private string moduleNameField;

            private string uRLField;

            private byte applicationIDField;

            private string iconUrlField;

            private string langField;

            private string controllerNameField;

            /// <remarks/>
            public string ApplicationName
            {
                get
                {
                    return this.applicationNameField;
                }
                set
                {
                    this.applicationNameField = value;
                }
            }

            /// <remarks/>
            public string controllerName
            {
                get
                {
                    return this.controllerNameField;
                }
                set
                {
                    this.controllerNameField = value;
                }
            }

            /// <remarks/>
            public byte ModuleID
            {
                get
                {
                    return this.moduleIDField;
                }
                set
                {
                    this.moduleIDField = value;
                }
            }

            /// <remarks/>
            public string ModuleName
            {
                get
                {
                    return this.moduleNameField;
                }
                set
                {
                    this.moduleNameField = value;
                }
            }

            /// <remarks/>
            public string URL
            {
                get
                {
                    return this.uRLField;
                }
                set
                {
                    this.uRLField = value;
                }
            }

            /// <remarks/>
            public byte applicationID
            {
                get
                {
                    return this.applicationIDField;
                }
                set
                {
                    this.applicationIDField = value;
                }
            }

            /// <remarks/>
            public string iconUrl
            {
                get
                {
                    return this.iconUrlField;
                }
                set
                {
                    this.iconUrlField = value;
                }
            }

            /// <remarks/>
            public string lang
            {
                get
                {
                    return this.langField;
                }
                set
                {
                    this.langField = value;
                }
            }
        }

    }
}