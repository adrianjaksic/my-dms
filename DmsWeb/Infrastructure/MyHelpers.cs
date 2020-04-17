using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using DmsCore.Dms;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;

namespace DmsWeb.Infrastructure
{
    public static class MyHelpers
    {
        public static string VratiNasOblikDatuma(DateTime datum, bool uVreme = false)
        {
            return string.Format(uVreme ? "{0:dd.MM.yyyy. - HH:mm}" : "{0:dd.MM.yyyy.}", datum);
        }

        public static string JoinList(IEnumerable<string> lista)
        {
            var sb = new StringBuilder();
            foreach (var item in lista)
            {
                sb.Append(item);
            }
            return sb.ToString();
        }

        public static string NapraviHoverPopupPredmeti(Predmet predmet, UlogovaniKorisnik korisnik)
        {
            var s = new List<string>();
            s.Add("<img src='Content/img/b/x.png' alt='' />");
            s.Add("<section class='infoOPredmetu' style='width: 250px;'>");

            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Šifra") + ":</label><a href='#./Predmeti?tipDokumenta=3&idPredmeta=" + predmet.IdPredmeta + "' data-mask='&idPredmeta=" + predmet.IdPredmeta + "' data-tip='1' style='margin-left:-5px'>" + predmet.OznakaOkruga + "-" + predmet.OznakaOrgana + "-" + predmet.OznakaKlase + "-" + string.Format(@"{0}", predmet.BrojPredmeta).PadLeft(6, '0') + "/" + predmet.Godina + "-" + predmet.OznakaJedinice + "</a></div>");
            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Kreator") + ":</label>" + predmet.NazivKreatora + "</div>");

            if (predmet.IdOpstine != null)
            {
                s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Opština") + ":</label>" + predmet.NazivOpstine + "</div>");
            }

            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Status") + ":</label>" + predmet.NazivStatusa + "</div>");

            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Datum rezervacije") + ":</label>" + VratiNasOblikDatuma(predmet.VremeRezervacije) + "</div>");
            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Datum kreiranja") + ":</label>" + VratiNasOblikDatuma(predmet.StvarnoVremeKreiranja) + "</div>");

            if (!string.IsNullOrEmpty(predmet.Podnosilac))
            {
                s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Podnosilac") + ":</label>" + Konverzija.VratiString(korisnik.Jezik, predmet.Podnosilac) + "</div>");
            }

            if (predmet.IdVrstePredmeta != null)
            {
                s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Vrsta predmeta") + ":</label>" + Konverzija.VratiString(korisnik.Jezik, predmet.NazivVrstePredmeta) + "</div>");
            }

            s.Add("</section>");

            return JoinList(s);
        }

        internal static string NapraviHoverPopupDokumenti(PodaciDokumenta dokument, UlogovaniKorisnik korisnik)
        {
            var s = new List<string>();
            s.Add("<img src='Content/img/b/x.png' alt='' />");
            s.Add("<section class='infoODokumentu' style='width: 200px;'>");

            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Naziv") + ":</label>" + Konverzija.VratiString(korisnik.Jezik, dokument.Naziv) + "</div>");
            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Kreator") + ":</label>" + Konverzija.VratiString(korisnik.Jezik, dokument.Kreator) + "</div>");
            s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Vreme unosa") + ":</label>" + VratiNasOblikDatuma(dokument.VremeUnosa) + "</div>");

            if (dokument.VremeBrisanja != null)
            {
                s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Vreme brisanja") + ":</label>" + VratiNasOblikDatuma(dokument.VremeBrisanja.GetValueOrDefault()) + "</div>");
            }

            if (!string.IsNullOrEmpty(dokument.KreatorBrisanja))
            {
                s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Obrisao") + ":</label>" + Konverzija.VratiString(korisnik.Jezik, dokument.KreatorBrisanja) + "</div>");
            }

            if (!string.IsNullOrEmpty(dokument.Napomena))
            {
                if (dokument.Napomena.Length > 50)
                {
                    var napomena = dokument.Napomena.Substring(0, 50) + "...";
                    s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Razlog brisanja") + ":</label>" + napomena + "</div>");
                }
                else
                {
                    s.Add("<div><label>" + Konverzija.VratiString(korisnik.Jezik, "Razlog brisanja") + ":</label>" + dokument.Napomena + "</div>");
                }
            }

            s.Add("</section>");

            return JoinList(s);
        }

        public static Version AppVersion()
        {
            var asm = System.Reflection.Assembly.GetExecutingAssembly();
            var version = asm.GetName().Version;
            var product = asm.GetCustomAttributes(typeof(System.Reflection.AssemblyProductAttribute), true).FirstOrDefault() as System.Reflection.AssemblyProductAttribute;

            if (version != null && product != null)
            {
                return version;
            }
            return null;
        }

        public static HtmlString AppendAppVer(this HtmlHelper helper, string znak = "?")
        {
            var version = AppVersion();
            return version != null ? new HtmlString(string.Format("{0}v={1}.{2}.{3}.{4}", znak, version.Major, version.Minor, version.Build, version.Revision)) : new HtmlString("");
        }
    }
}