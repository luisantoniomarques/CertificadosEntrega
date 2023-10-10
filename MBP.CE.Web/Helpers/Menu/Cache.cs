using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MBP.CE.Web.Helpers.Menu
{
    internal class Cache
    {
        internal static void AddToServer(string key, object obj)
        {
            HttpContext.Current.Application[key] = obj;
        }

        internal static T GetFromServer<T>(string key)
        {
            return (T)HttpContext.Current.Application[key];
        }

        internal static void AddToSession(string key, object obj, int expirationMinutes)
        {
            HttpRuntime.Cache.Insert(key, obj, null, DateTime.Now.AddMinutes(expirationMinutes), System.Web.Caching.Cache.NoSlidingExpiration);
        }

        internal static T GetFromSession<T>(string key)
        {
            return (T)HttpRuntime.Cache[key];
        }
        internal static void ClearCache()
        {
            HttpContext.Current.Application.Clear();

            IDictionaryEnumerator enumerator = HttpRuntime.Cache.GetEnumerator();
            while (enumerator.MoveNext())
            {
                HttpRuntime.Cache.Remove((string)enumerator.Key);
            }
        }
    }
}