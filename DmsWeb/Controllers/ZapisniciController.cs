using System;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using DmsCore.Podesavanja;
using DmsCore.Zapisnici;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;

namespace DmsWeb.Controllers
{
    [RedirectToLogon]
    public class ZapisniciController : Controller
    {
        #region PPZ

        public ActionResult PPZ()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            if (korisnik.IdOkruga == null)
            {
                Response.StatusCode = 903;
                Response.End();
            }

            ViewData["vm"] = ZapisniciData.VratiZapisnikViewModel(korisnik);
            return View();
        }

        [HttpGet]
        public JsonResult VratiPredmetePretrage(short? idOrgana, short? idKlase, string oznakaKlase, short? idJedinice, string oznakaJedinice, string datumJ, int? idKreatora, bool samoArhivirani)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var datum = ser.Deserialize<DateTime>(datumJ);
                res.Data = ZapisniciData.VratiPredmetePretrage(korisnik, idOrgana, idKlase, oznakaKlase, idJedinice, oznakaJedinice, datum, idKreatora, samoArhivirani);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult VratiStampePrimopredajnogZapisnika(string datumJ, short? idOrgana, short? idKlase, string oznakaKlase, short? idJedinice, string oznakaJedinice, int? idKreatora, string nazivOrgana, string nazivKlase, string nazivJedinice, string nazivKreatora, bool samoArhivirani)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var datum = ser.Deserialize<DateTime>(datumJ);
                res.Data = ZapisniciData.VratiStampePrimopredajnogZapisnika(korisnik, idOrgana, idKlase, oznakaKlase, idJedinice, oznakaJedinice, datum, idKreatora, nazivOrgana, nazivKlase, nazivJedinice, nazivKreatora, samoArhivirani);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        #endregion

        #region Aktivni predmeti

        public ActionResult AktivniPredmeti()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            if (korisnik.IdOkruga == null)
            {
                Response.StatusCode = 903;
                Response.End();
            }

            ViewData["vm"] = ZapisniciData.VratiAktivnePredmete(korisnik, DateTime.Now);
            return View();
        }

        [HttpGet]
        public JsonNetResult VratiAktivnePredmete(string datumJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var datum = ser.Deserialize<DateTime>(datumJ);
                res.Data = ZapisniciData.VratiAktivnePredmete(korisnik, datum);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult {Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
        }

        [HttpPost]
        public JsonResult VratiStampeAktivnihPredmeta(string datumJ, string vmJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var datum = ser.Deserialize<DateTime>(datumJ);
                var vm = ser.Deserialize<AktivniPredmetiViewModel>(vmJ);
                res.Data = ZapisniciData.VratiStampeAktivnihPredmeta(korisnik, datum, vm);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        #endregion
    }
}
