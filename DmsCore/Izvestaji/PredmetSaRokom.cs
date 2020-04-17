using System;

namespace DmsCore.Izvestaji
{
    public class PredmetSaRokom
    {
        public long IdPredmeta { get; set; }

        public string Podnosilac { get; set; }

        public string NazivInspektora { get; set; }

        public string Sadrzaj { get; set; }

        public string SifraPredmeta { get; set; }

        public DateTime DatumRoka { get; set; }
    }
}
