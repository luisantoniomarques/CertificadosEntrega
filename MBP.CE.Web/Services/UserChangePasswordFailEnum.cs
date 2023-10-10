using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Services
{
    public enum UserChangePasswordFailEnum
    {
        LoginFailed = 0, //incorrect old password
        SavePasswordReturnedFalse  = 1,
        ErrorSavingNewPassword  = 2,
    }
}