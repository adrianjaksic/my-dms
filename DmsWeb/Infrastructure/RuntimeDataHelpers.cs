using System.Web;
using DmsCore.Logovanje;

namespace DmsWeb.Infrastructure
{
    public class RuntimeDataHelpers
    {
        public const string LogKey = "pisarnicaID";

        public static UlogovaniKorisnik GetRuntimeData(HttpRequestBase httpRequest)
        {
            var httpCookie = httpRequest.Cookies[LogKey];
            if (httpCookie != null)
            {
                return LogovanjeData.VratiUlogovanogKorisnika(httpCookie.Value);
            }

            return null;
        }
    }
}