using System;
using System.Collections.Generic;
using System.IO;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using DmsCore.MasterSifarnik;
using DmsCore.Podesavanja;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;
using DmsWeb.Infrastructure.FineUploader;

namespace DmsWeb.Controllers
{
    [RedirectToLogon]
    public class SifarnikController : Controller
    {
        #region Master Sifarnik

        public ActionResult Index(short tip)
        {
            ViewData["tipDokumenta"] = tip;
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            ViewData["korisnik"] = korisnik;

            if (!korisnik.Administracija && !korisnik.UnosNovogPredmeta)
            {
                Response.StatusCode = 903;
                Response.End();
            }

            if (tip == 5 || tip == 6 || tip == 7)
            {
                if (korisnik.IdOkruga != null)
                {
                    Response.StatusCode = 903;
                    Response.End();
                }
            }

            return View(MasterSifarnikData.VratiSifarnikViewModel(tip, korisnik));
        }

        [HttpGet]
        public JsonResult VratiPodatke(short tipDokumenta, string kriterijum1, string kriterijum2, string kriterijum3)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = MasterSifarnikData.VratiPodatke(tipDokumenta, kriterijum1, kriterijum2, kriterijum3, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiPodatkeElementa(short tipDokumenta, string idElementa, string kriterijum1, string kriterijum2, string kriterijum3, string idNadredjenogElementa)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = MasterSifarnikData.VratiPodatkeElementa(tipDokumenta, idElementa, idNadredjenogElementa, kriterijum1, kriterijum2, kriterijum3, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SnimiPodatkeElementa(short tipDokumenta, string idElementa, string podaciJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var s = new JavaScriptSerializer();
                var podaci = s.Deserialize<List<PodatakElementaSifarnika>>(podaciJ);
                res.Data = MasterSifarnikData.SnimiPodatkeElementa(tipDokumenta, idElementa, podaci, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpPost]
        public JsonResult ObrisiElement(short tipDokumenta, string idElementa)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = MasterSifarnikData.ObrisiElement(tipDokumenta, idElementa, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpGet]
        public JsonResult VratiPodatkeKriterijuma2(short tipDokumenta, string kriterijum1)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = MasterSifarnikData.VratiPodatkeKriterijuma2(tipDokumenta, kriterijum1, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiPodatkeKriterijuma3(short tipDokumenta, string kriterijum1, string kriterijum2)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = MasterSifarnikData.VratiPodatkeKriterijuma3(tipDokumenta, kriterijum1, kriterijum2, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        public FineUploaderResult SnimiSlikuElementa(FineUpload upload, short tipDokumenta, string postedFileName, string idElementa)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            Directory.CreateDirectory(Server.MapPath("~/Content/Okruzi/"));
            var filePath = Path.Combine(Server.MapPath("~/Content/Okruzi/"), idElementa + ".jpeg");
            try
            {
                upload.SaveAs(filePath, true);
                ImageHelper.SrediSliku(filePath, 1200, 100, false);
            }
            catch (Exception ex)
            {
                return new FineUploaderResult(false, error: ExceptionParser.Parsiraj(korisnik, ex));
            }
            return new FineUploaderResult(true, new { url = Url.Content("~/Content/Okruzi/" + idElementa + ".jpeg?" + Guid.NewGuid().ToString()) });
        }

        [HttpGet]
        public JsonResult VratiPodatkeZavisnogElementa(short tipDokumenta, string idElementa, string kriterijum1, string kriterijum2)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = MasterSifarnikData.VratiPodatkeZavisnogElementa(tipDokumenta, idElementa, kriterijum1, kriterijum2, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonNetResult VratiZavisnePodatkeElementa(short tipDokumenta, string idElementa, string idElementaPodatka, string kriterijum1, string kriterijum2)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = MasterSifarnikData.VratiZavisnePodatkeElementa(tipDokumenta, idElementa, idElementaPodatka, kriterijum1, kriterijum2, korisnik);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult {Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
        }

        #endregion
    }
}