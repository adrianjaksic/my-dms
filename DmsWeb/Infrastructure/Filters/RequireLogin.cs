using System.Web.Mvc;

namespace DmsWeb.Infrastructure.Filters
{
    public class RequireLogin : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(System.Web.HttpContextBase httpContext)
        {
            var data = RuntimeDataHelpers.GetRuntimeData(httpContext.Request);
            return data != null;
        }
    }
}