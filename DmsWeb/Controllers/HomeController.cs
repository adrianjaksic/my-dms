using System;
using System.Web.Mvc;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;

namespace DmsWeb.Controllers
{
    //[RedirectToLogon]
    [RequireLogin]
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            if (korisnik != null)
            {
                ViewData["korisnik"] = korisnik;
            }
            
            return View();
        }

        [HttpGet]
        public JsonResult PodesiJezik(string jezik)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                korisnik.Jezik = jezik;
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult PromeniLozinku(string novaSifra)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                LogovanjeData.PromeniLozinkuKorisnika(korisnik, "123456", Konverzija.KonvertujULatinicu(novaSifra));
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

    }
}
