using System;
using System.Web;
using System.Web.Mvc;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsWeb.Infrastructure;

namespace DmsWeb.Controllers
{
    public class AccountController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public JsonResult UlogujKorisnika(string korisnickoIme, string lozinka)
        {
            HttpCookie langCookie = Request.Cookies["_lang"];
            var jezik = langCookie != null ? langCookie.Value : "0";

            var res = new MyResponse();
            try
            {
                var guid = LogovanjeData.UlogujKorisnika(Konverzija.KonvertujULatinicu(korisnickoIme), Konverzija.KonvertujULatinicu(lozinka), jezik);
                
                var cookie = new HttpCookie(RuntimeDataHelpers.LogKey, guid) { Expires = DateTime.Now.AddHours(4) };
                HttpContext.Response.Cookies.Add(cookie);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(jezik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult OdlogujKorisnika()
        {
            HttpCookie langCookie = Request.Cookies["_lang"];
            var jezik = langCookie != null ? langCookie.Value : "0";

            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                LogovanjeData.OdlogujKorisnika(korisnik.KorisnickoIme);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult PromeniLozinku(string staraSifra, string novaSifra)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                LogovanjeData.PromeniLozinkuKorisnika(korisnik, Konverzija.KonvertujULatinicu(staraSifra), Konverzija.KonvertujULatinicu(novaSifra));
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
