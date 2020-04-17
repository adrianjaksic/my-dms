using System.IO;

namespace DmsCore.Data
{
    public static class PutanjaAplikacije
    {
        public static string Putanja;

        public static string PutanjaPredmeta;

        public static string PutanjaOkruga;

        public static string PutanjaDMSa;

        public static string PutanjaStampe;

        public static string PutanjaReportPredmet;

        public static string PutanjaReportIzvestaji;

        public static string PutanjaOkrugaWeb = "/Content/Okruzi/";

        public static string PutanjaPredmetaWeb = "/Content/Predmeti/";

        public static string PutanjaDMSaWeb = "/Content/DMS/";

        public static string PutanjaStampeWeb = "/Content/Reports/";

        public static string PutanjaReportPregledBrojeva;

        public static string PutanjaReportPregledPretrazenih;

        public static string PutanjaReportPregledSintetike;

        public static string PutanjaReportPregledZapisnika;

        public static string PutanjaReportPregledZapisnikaArhivirani;

        public static string PutanjaReportPregledPredmetaSaRokom;

        public static string PutanjaReportPregledPredmetaPoRazvodnjavanju;

        public static string PutanjaReportPregledPredmetaPoOpstinama;

        public static string PutanjaReportPregledAktivnihPredmeta;

        public static void Inicijalizacija(string putanjaAplikacije)
        {
            Putanja = putanjaAplikacije;

            Directory.CreateDirectory(string.Format("{0}Content\\", putanjaAplikacije));

            PutanjaOkruga = string.Format("{0}Content\\Okruzi\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaOkruga);

            PutanjaPredmeta = string.Format("{0}Content\\Predmeti\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaPredmeta);

            PutanjaDMSa = string.Format("{0}Content\\DMS\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaDMSa);

            PutanjaStampe = string.Format("{0}Content\\Reports\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaStampe);

            PutanjaReportPredmet = string.Format("{0}Reports\\Predmet\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPredmet);

            PutanjaReportIzvestaji = string.Format("{0}Reports\\Izvestaji\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportIzvestaji);

            PutanjaReportPregledBrojeva = string.Format("{0}Reports\\PregledBrojeva\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledBrojeva);

            PutanjaReportPregledPretrazenih = string.Format("{0}Reports\\PregledPretrazenih\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledPretrazenih);

            PutanjaReportPregledSintetike = string.Format("{0}Reports\\PregledSintetike\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledSintetike);

            PutanjaReportPregledZapisnika = string.Format("{0}Reports\\PregledZapisnika\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledZapisnika);

            PutanjaReportPregledZapisnikaArhivirani = string.Format("{0}Reports\\PregledArhiviranih\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledZapisnikaArhivirani);

            PutanjaReportPregledPredmetaSaRokom = string.Format("{0}Reports\\PregledPredmetaSaRokom\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledPredmetaSaRokom);

            PutanjaReportPregledPredmetaPoRazvodnjavanju = string.Format("{0}Reports\\PregledPredmetaPoRazvodnjavanju\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledPredmetaPoRazvodnjavanju);

            PutanjaReportPregledPredmetaPoOpstinama = string.Format("{0}Reports\\PregledPredmetaPoOpstinama\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledPredmetaPoOpstinama);

            PutanjaReportPregledAktivnihPredmeta = string.Format("{0}Reports\\PregledAktivnih\\", putanjaAplikacije);
            Directory.CreateDirectory(PutanjaReportPregledAktivnihPredmeta);
        }
    }
}
