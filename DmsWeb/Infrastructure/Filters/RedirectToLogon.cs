using System;
using System.Web;
using System.Web.Mvc;

namespace DmsWeb.Infrastructure.Filters
{
    public class RedirectToLogon : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            var data = RuntimeDataHelpers.GetRuntimeData(httpContext.Request);
            if (data != null)
            {
                var cookie = new HttpCookie(RuntimeDataHelpers.LogKey, data.Guid) { Expires = DateTime.Now.AddHours(4) };
                httpContext.Response.Cookies.Add(cookie);
            }
            return data != null;
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.HttpContext.Response.StatusCode = 901;
            filterContext.HttpContext.Response.End();
        }
    }
}
