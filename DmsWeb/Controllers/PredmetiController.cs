using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using DmsCore.Data;
using DmsCore.Izvestaji;
using DmsCore.NBS;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;
using DmsWeb.Infrastructure;
using DmsWeb.Infrastructure.Filters;

namespace DmsWeb.Controllers
{
    [RedirectToLogon]
    public class PredmetiController : Controller
    {
        public ActionResult Index(short tipDokumenta, long? idPredmeta, bool? dms, bool? close, bool? stampa)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);

            var poruka = string.Empty;

            try
            {
                switch (tipDokumenta)
                {
                    case 1:
                        if (korisnik.IdOkruga == null || !korisnik.UnosNovogPredmeta)
                        {
                            Response.StatusCode = 903;
                            Response.End();
                        }
                        else
                        {
                            ViewData["vm"] = PredmetiData.VratiPredmetViewModel(korisnik, null);
                        }
                        break;
                    case 2:
                        if (korisnik.IdOkruga == null || !korisnik.DozvolaRezervisanja)
                        {
                            return RedirectToAction("Index", "Predmeti", new {tipDokumenta = 1});
                        }
                        ViewData["vm"] = PredmetiData.VratiPredmetViewModel(korisnik, null);
                        break;
                    case 3:
                        if (idPredmeta != null)
                        {
                            var predmetViewModel = PredmetiData.VratiPredmetViewModel(korisnik, idPredmeta);

                            if (korisnik.SamoSvojePredmete)
                            {
                                if (predmetViewModel.Predmet.IdKreator != korisnik.IdKorisnika &&
                                    predmetViewModel.Predmet.IdInspektora != korisnik.IdKorisnika &&
                                    (!PredmetiData.PredmetPripadaKlasiInspektora(idPredmeta, korisnik)))
                                {
                                    Response.StatusCode = 903;
                                    Response.End();
                                }
                                else
                                {
                                    ViewData["vm"] = predmetViewModel;
                                }
                            }
                            else
                            {
                                if (!PredmetiData.PredmetPripadaKlasiInspektora(idPredmeta, korisnik))
                                {
                                    Response.StatusCode = 903;
                                    Response.End();
                                }
                                else
                                {
                                    ViewData["vm"] = predmetViewModel;
                                }
                            }

                        }
                        else
                        {
                            Response.StatusCode = 903;
                            Response.End();
                        }

                        break;
                    case 4:
                        if (korisnik.IdOkruga == null || !korisnik.IzmenaPredmeta || korisnik.Inspektor)
                        {
                            if (idPredmeta != null)
                            {
                                return RedirectToAction("Index", "Predmeti",
                                    new {tipDokumenta = 3, idPredmeta = idPredmeta});
                            }
                            Response.StatusCode = 903;
                            Response.End();
                        }
                        else
                        {
                            var predmetViewModel = PredmetiData.VratiPredmetViewModel(korisnik, idPredmeta);

                            if (korisnik.SamoSvojePredmete)
                            {
                                if (predmetViewModel.Predmet.IdKreator != korisnik.IdKorisnika &&
                                    predmetViewModel.Predmet.IdInspektora != korisnik.IdKorisnika)
                                {
                                    Response.StatusCode = 903;
                                    Response.End();
                                }
                                else
                                {
                                    ViewData["vm"] = predmetViewModel;
                                }
                            }
                            else
                            {
                                ViewData["vm"] = predmetViewModel;
                            }
                        }
                        break;
                }

            }
            catch (Exception ex)
            {
                poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            ViewData["tipDokumenta"] = tipDokumenta;

            ViewData["korisnik"] = korisnik;

            ViewData["dms"] = dms;

            ViewData["stampa"] = stampa;

            ViewData["close"] = close;

            ViewData["poruka"] = poruka;

            return View();
        }

        [HttpGet]
        public JsonResult VratiKlaseOrgana(short idOrgana)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PredmetiData.VratiKlaseOrgana(korisnik, idOrgana);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiJediniceOrgana(short idOrgana)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PredmetiData.VratiJediniceOrgana(korisnik, idOrgana);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult SnimiPredmet(short tipDokumenta, string predmetJ, short? kolicina, bool? bezStampe)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var predmet = ser.Deserialize<Predmet>(predmetJ);

                if (korisnik.IdOkruga != null)
                {
                    predmet.IdOkruga = (short) korisnik.IdOkruga;
                }

                var zaglavlje = PredmetiData.SnimiPredmet(korisnik, tipDokumenta, predmet, kolicina);
                if (bezStampe != true)
                {
                    if (tipDokumenta == 2)
                    {
                        zaglavlje.Stampa = IzvestajiData.VratiStampeRezervisanihBrojevaPredmeta(korisnik, zaglavlje);
                    }
                    res.Data = zaglavlje;
                }
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpPost]
        public JsonResult ObrisiPredmete(string predmetiJ, string razlogBrisanja)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var predmeti = ser.Deserialize<List<long>>(predmetiJ);
                PredmetiData.ObrisiPredmete(korisnik, predmeti, razlogBrisanja);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        public HtmlString VratiInfoOPredmetu(long idPredmeta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var info = PredmetiData.VratiInfoOPredmetu(korisnik, idPredmeta);
            return new HtmlString(MyHelpers.NapraviHoverPopupPredmeti(info, korisnik));
        }

        [HttpPost]
        public JsonResult SnimiIstorijuPredmeta(long idPredmeta, short vrstaKretanja, string napomena, string datumRokaJ)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                DateTime? datumRoka = null;

                if (!string.IsNullOrEmpty(datumRokaJ))
                {
                    datumRoka = ser.Deserialize<DateTime>(datumRokaJ);
                }

                res.Data = PredmetiData.SnimiIstorijuPredmeta(korisnik, idPredmeta, vrstaKretanja, napomena, datumRoka);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpGet]
        public JsonNetResult VratiMestaOpstine(short idOpstine)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PredmetiData.VratiMestaOpstine(korisnik, idOpstine);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult {Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
        }

        [HttpPost]
        public JsonResult ObrisiKretanjePredmeta(long idPredmeta, short idKretanja)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                PredmetiData.ObrisiKretanjePredmeta(korisnik, idPredmeta, idKretanja);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpGet]
        public JsonResult PretraziNbsKlijente(string pib, long? maticniBroj, string naziv, string mesto, long? banka, long? brojRacuna, int? kontrolniBroj)
        {
            var res = new MyResponse();
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            try
            {
                res.Data = NbsData.PretraziNbsKlijente(maticniBroj, pib, banka, brojRacuna, kontrolniBroj, naziv, mesto);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }
            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult VratiIstorijuPredmeta(long idPredmeta, bool? kretanje)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PredmetiData.VratiIstorijuPredmeta(korisnik, idPredmeta, kretanje);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult ArhiviranjePredmeta(string predmetiJ, string aktoviJ, string napomena)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var ser = new JavaScriptSerializer();
                var predmeti = ser.Deserialize<List<long>>(predmetiJ);
                var aktovi = ser.Deserialize<List<Element>>(aktoviJ);
                res.Data = PredmetiData.ArhivirajPredmete(korisnik, predmeti, aktovi, napomena);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpPost]
        public JsonResult SnimiAktivnostPredmeta(long idPredmeta, string naziv)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                PredmetiData.SnimiAktivnostPredmeta(korisnik, idPredmeta, naziv);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpGet]
        public JsonResult VratiSledeciSlobodanBrojPredmeta(short idOrgana, short idKlase)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PredmetiData.VratiSledeciSlobodanBrojPredmeta(korisnik, idOrgana, idKlase);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult AktivirajPredmet(long idPredmeta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                PredmetiData.AktivirajPredmet(korisnik, idPredmeta);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return Json(res, JsonRequestBehavior.DenyGet);
        }

        [HttpGet]
        public JsonNetResult VratiIdPredmetaPrekoBroja(string brojPredmeta)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                res.Data = PredmetiData.VratiIdPredmetaPrekoBroja(korisnik, brojPredmeta);
            }
            catch (Exception ex)
            {
                res.Greska = true;
                res.Poruka = ExceptionParser.Parsiraj(korisnik, ex);
            }

            return new JsonNetResult {Data = res, JsonRequestBehavior = JsonRequestBehavior.AllowGet};
        }

        #region Prijava greske

        [HttpPost]
        public JsonResult PrijaviGresku(string greska, string url, string slika)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                var msg = greska;

                try
                {
                    var urlSlike = slika.Split(',')[1];
                    var imgByte = Convert.FromBase64String(urlSlike);
                    var guid = Guid.NewGuid().ToString();
                    var fileName = Path.GetFileName(guid + ".jpg");
                
                    Directory.CreateDirectory(Server.MapPath("~/Content/DMS/GreskeslikeGresaka/"));
                    string putanjaFajla = Path.Combine(Server.MapPath("~/Content/DMS/GreskeslikeGresaka/"), fileName);

                    using (var file = new FileStream(putanjaFajla, FileMode.CreateNew))
                    {
                        file.Write(imgByte, 0, imgByte.Length);
                    }
                    
                    var rek = Request.UrlReferrer.AbsoluteUri;
                    var put2 = putanjaFajla.Replace(Path.Combine(Server.MapPath("~")), rek);
                    var bss = "\\";
                    put2 = put2.Replace(bss, "/");
                    msg = string.Format("{0}\n\nSlika: {1}", msg, put2);
                }
                catch (Exception e) { }

                var descBuilder = new StringBuilder(msg);
                descBuilder.AppendLine();

                var description = descBuilder.ToString();

                PredmetiData.PrijaviGresku(korisnik, description, url);//description je umesto greska
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
