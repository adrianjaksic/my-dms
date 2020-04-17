using System;
using System.IO;
using System.Web.Mvc;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Podesavanja;
using DmsWeb.Infrastructure;

namespace DmsWeb.Controllers
{
    public class AppGlobalController : Controller
    {
        [HttpPost]
        public JsonResult PosaljiStampuNaMail(string email, string subject, string text, string file, string replyTo)
        {
            var korisnik = RuntimeDataHelpers.GetRuntimeData(Request);
            var res = new MyResponse();
            try
            {
                MailHelper.PosaljiEMailSaFajlom(email, subject, text, string.Format(@"{0}{1}", PutanjaAplikacije.Putanja, file), replyTo);
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
