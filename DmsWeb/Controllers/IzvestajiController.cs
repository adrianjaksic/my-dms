using System;
using System.Collections.Generic;
using System.Globalization;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using DmsCore.Izvestaji;
using DmsCore.Podesavanja;
using DmsCore.Pretrage;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;

namespace DmsWeb.Controllers
{
    [RedirectToLogon]
    public class IzvestajiController : Controller
    {
        public ActionResult Index(byte tipIzvestaja)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            ViewData["vm"] = IzvestajiData.VratiIzvestajPredmetaViewModel(korisnik);

            ViewData["tipIzvestaja"] = tipIzvestaja;

            ViewData["tekucaGodina"] = DateTime.Now.Year.ToString(CultureInfo.InvariantCulture);

            return View();
        }

        [HttpGet]
        public JsonResult VratiStampePredmeta(long idPredmeta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = IzvestajiData.VratiStampePredmeta(korisnik, idPredmeta);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonNetResult VratiPredmetePretrage(byte tipIzvestaja, bool sintetika, string pretragaJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var pretraga = ser.Deserialize<ElementPretrage>(pretragaJ);
                res.Data = IzvestajiData.VratiPredmetePretrage(korisnik, tipIzvestaja, sintetika, pretraga);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult { Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        [HttpPost]
        public JsonResult VratiStampeSintetikePredmeta(string stavkeJ, byte tipIzvestaja)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var stavke = ser.Deserialize<List<StavkaPretrage>>(stavkeJ);
                res.Data = IzvestajiData.VratiStampeSintetikePredmeta(korisnik, stavke, tipIzvestaja);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        #region Izvestaj po roku

        public ActionResult PredmetiSaRokom()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            if (korisnik.Inspektor && !korisnik.Administracija)
            {
                Response.StatusCode = 903;
                Response.End();
            }

            ViewData["vm"] = PretrageData.VratiPretragaObrisanihViewModel(korisnik);

            return View();
        }

        [HttpGet]
        public JsonNetResult VratiPredmeteSaRokom(short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = IzvestajiData.VratiPredmeteSaRokom(korisnik, idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult {Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
        }

        [HttpPost]
        public JsonResult VratiStampePredmetaSaRokom(string stavkeJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var stavke = ser.Deserialize<List<PredmetSaRokom>>(stavkeJ);
                res.Data = IzvestajiData.VratiStampePredmetaSaRokom(korisnik, stavke);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        #endregion

        #region Izvestaj po razvodnjavanju

        public ActionResult IzvestajPoRazvodnjavanju()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            ViewData["tekucaGodina"] = DateTime.Now.Year.ToString(CultureInfo.InvariantCulture);

            ViewData["vm"] = IzvestajiData.VratiIzvestajPoRazvodnjavanjuViewModel(korisnik);

            return View();
        }

        [HttpGet]
        public JsonNetResult VratiPredmetePoRazvodjenju(short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice, string odDatumaJ, string doDatumaJ, int? idArhivatora)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                DateTime odDatuma = ser.Deserialize<DateTime>(odDatumaJ);
                DateTime doDatuma = ser.Deserialize<DateTime>(doDatumaJ);
                res.Data = IzvestajiData.VratiPredmetePoRazvodjenju(korisnik, idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice, odDatuma, doDatuma, idArhivatora);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult { Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        [HttpGet]
        public JsonNetResult VratiStampePredmetaPoRazvodjenju(short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice, string odDatumaJ, string doDatumaJ, int? idArhivatora)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                DateTime odDatuma = ser.Deserialize<DateTime>(odDatumaJ);
                DateTime doDatuma = ser.Deserialize<DateTime>(doDatumaJ);
                res.Data = IzvestajiData.VratiStampePredmetaPoRazvodjenju(korisnik, idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice, odDatuma, doDatuma, idArhivatora);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult { Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        #endregion

        #region Izveštaj po opštinama

        public ActionResult IzvestajPoOpstinama()
        {
            return View();
        }

        [HttpGet]
        public JsonNetResult VratiPredmetePoOpstinama(string odDatumaJ, string doDatumaJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                DateTime odDatuma = ser.Deserialize<DateTime>(odDatumaJ);
                DateTime doDatuma = ser.Deserialize<DateTime>(doDatumaJ);
                res.Data = IzvestajiData.VratiPredmetePoOpstinama(korisnik, odDatuma, doDatuma);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult { Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        [HttpGet]
        public JsonNetResult VratiStampePredmetaPoOpstinama(string odDatumaJ, string doDatumaJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                DateTime odDatuma = ser.Deserialize<DateTime>(odDatumaJ);
                DateTime doDatuma = ser.Deserialize<DateTime>(doDatumaJ);
                res.Data = IzvestajiData.VratiStampePredmetaPoOpstinama(korisnik, odDatuma, doDatuma);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult { Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        #endregion
    }
}
