using System.Web.Mvc;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;

namespace DmsWeb.Controllers
{
    [RedirectToLogon]
    public class MeniController : Controller
    {
        public ActionResult Meni()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            if (korisnik != null)
            {
                ViewData["korisnik"] = korisnik;
            }

            return View();
        }

    }
}
