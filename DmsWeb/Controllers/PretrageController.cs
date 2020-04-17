using System;
using System.Collections.Generic;
using System.Globalization;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using DmsCore.Izvestaji;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;
using DmsCore.Pretrage;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;

namespace DmsWeb.Controllers
{
    [RedirectToLogon]
    public class PretrageController : Controller
    {
        public ActionResult Index(short tipPretrage)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            if (tipPretrage == 3)
            {
                if (korisnik.IdOkruga == null || !korisnik.BrisanjePredmeta)
                {
                    Response.StatusCode = 903;
                    Response.End();
                }
            }

            if (tipPretrage == 4)
            {
                if (korisnik.IdOkruga == null || korisnik.Inspektor)
                {
                    Response.StatusCode = 903;
                    Response.End();
                }
            }

            ViewData["vm"] = PretrageData.VratiPretrageViewModel(korisnik);

            ViewData["tipPretrage"] = tipPretrage;

            ViewData["tekucaGodina"] = DateTime.Now.Year.ToString(CultureInfo.InvariantCulture);

            return View();
        }

        [HttpGet]
        public JsonResult VratiKlase(short idOkruga, short? idOrgana)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                if (idOrgana.HasValue)
                {
                    res.Data = PretrageData.VratiKlase(korisnik, idOkruga, idOrgana.Value);
                }
                else
                {
                    res.Data = PretrageData.VratiSveKlase(korisnik, idOkruga);
                }
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiJedinice(short? idOrgana)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                if (idOrgana.HasValue)
                {
                    res.Data = PretrageData.VratiJedinice(korisnik, idOrgana.Value);
                }
                else
                {
                    res.Data = PretrageData.VratiSveJedinice(korisnik);
                }
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiOpstine(short idOkruga)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PretrageData.VratiOpstine(korisnik, idOkruga);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiMestaOpstine(short idOkruga, short idOpstine)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PretrageData.VratiMestaOpstine(korisnik, idOkruga, idOpstine);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiInspektoreOkruga(short idOkruga)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PretrageData.VratiInspektoreOkruga(korisnik, idOkruga);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonNetResult VratiPredmetePretrage(string pretragaJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var pretraga = ser.Deserialize<ElementPretrage>(pretragaJ);
                res.Data = PretrageData.VratiPredmetePretrage(korisnik, pretraga);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult { Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        [HttpPost]
        public JsonResult VratiStampePretrazenihPredmeta(string listaPredmetaJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var listaPredmeta = ser.Deserialize<List<long>>(listaPredmetaJ);
                res.Data = IzvestajiData.VratiStampePretrazenihPredmeta(korisnik, listaPredmeta);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        #region Pretraga obrisanih

        public ActionResult PretragaObrisanih()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            if (korisnik.IdOkruga == null || !korisnik.Administracija)
            {
                Response.StatusCode = 903;
                Response.End();
            }

            ViewData["vm"] = PretrageData.VratiPretragaObrisanihViewModel(korisnik);

            return View();
        }

        [HttpGet]
        public JsonNetResult VratiKlaseJedinice(short idOkruga, short? idOrgana)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                List<Element> klase = null;
                List<Element> jedinice = null;

                if (idOrgana.HasValue)
                {
                    klase = PretrageData.VratiKlase(korisnik, idOkruga, idOrgana.Value);
                    jedinice = PretrageData.VratiJedinice(korisnik, idOrgana.Value);
                }
                else
                {
                    klase = PretrageData.VratiSveKlase(korisnik, idOkruga);
                    jedinice = PretrageData.VratiSveJedinice(korisnik);
                }

                res.Data = new
                    {
                        Klase = klase,
                        Jedinice = jedinice
                    };
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult {Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
        }

        [HttpGet]
        public JsonNetResult VratiObrisanePredmete(short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PretrageData.VratiObrisanePredmete(korisnik, idOkruga, idOrgana, idKlase, oznakaKlase,  brojPredmeta, godina, idJedinice, oznakaJedinice);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult {Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
        }

        #endregion

        #region Rokovnik

        public ActionResult Rokovnik()
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            if (korisnik.IdOkruga == null || !korisnik.Administracija)
            {
                Response.StatusCode = 903;
                Response.End();
            }

            ViewData["vm"] = PretrageData.VratiPretragaObrisanihViewModel(korisnik);

            return View();
        }

        [HttpGet]
        public JsonNetResult VratiPredmeteRokovnika(short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PretrageData.VratiPredmeteRokovnika(korisnik, idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice);
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