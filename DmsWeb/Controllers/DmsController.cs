using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mvc;
using DmsCore.Data;
using DmsCore.Dms;
using DmsCore.Podesavanja;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;
using DmsWeb.Infrastructure.FineUploader;

namespace DmsWeb.Controllers
{
    [RedirectToLogon]
    public class DmsController : Controller
    {
        [HttpPost]
        public FineUploaderResult UploadDokumenta(FineUpload upload, long idPredmeta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            PodaciDokumenta fajl;
            try
            {
                Directory.CreateDirectory(Server.MapPath("~/App_Data/"));
                var replacedFileName = upload.Filename.Replace("&", "_");
                string filePath = Path.Combine(Server.MapPath("~/App_Data/"), replacedFileName);

                upload.SaveAs(filePath);
                fajl = DMSData.SnimiDokumentPredmeta(korisnik, idPredmeta, upload.Filename, filePath);
            }
            catch (Exception ex)
            {
                return new FineUploaderResult(false, error: ExceptionParser.Parsiraj(korisnik, ex));
            }

            return new FineUploaderResult(true, new { file = fajl });
        }

        [HttpPost]
        public JsonResult ObrisiDokument(long idPredmeta, short idDokumenta, string razlogBrisanja)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                DMSData.ObrisiDokumentPredmeta(korisnik, idPredmeta, idDokumenta, razlogBrisanja);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpGet]
        public JsonResult VratiDetaljeDokumenta(long idPredmeta, short idDokumenta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = DMSData.VratiDetaljeDokumenta(korisnik, idPredmeta, idDokumenta);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiDokumentePredmeta(long idPredmeta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = DMSData.VratiDokumentePredmeta(korisnik, idPredmeta);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiLinkDokumentaPredmeta(long idPredmeta, short idDokumenta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = DMSData.VratiLinkDokumentaPredmeta(korisnik, idPredmeta, idDokumenta);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        public HtmlString VratiInfoODokumentu(long idPredmeta, short idDokumenta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var info = DMSData.VratiDetaljeDokumenta(korisnik, idPredmeta, idDokumenta);
            return new HtmlString(MyHelpers.NapraviHoverPopupDokumenti(info, korisnik));
        }

        [HttpPost]
        public JsonResult VratiObrisaniDokument(long idPredmeta, short idDokumenta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                DMSData.VratiObrisaniDokumentPredmeta(korisnik, idPredmeta, idDokumenta);
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
