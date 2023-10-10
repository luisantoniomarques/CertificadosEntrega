using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;

namespace MBP.CE.Web.Helpers.Menu
{
    public class CultureHelper
    {
        public static int GetCurrentLCID()
        {
            return Thread.CurrentThread.CurrentCulture.TextInfo.LCID;
        }
    }
}