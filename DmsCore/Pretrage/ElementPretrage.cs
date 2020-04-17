using System;

namespace DmsCore.Pretrage
{
    public class ElementPretrage
    {
        public short? IdOkruga { get; set; }

        public short? IdOpstine { get; set; }

        public short? IdOrgana { get; set; }

        public short? IdKlase { get; set; }

        public int? BrojPredmeta { get; set; }

        public int? Godina { get; set; }

        public DateTime? OdDatuma { get; set; }

        public DateTime? DoDatuma { get; set; }

        public short? IdJedinice { get; set; }

        public char? Status { get; set; }

        public short? IdVrstePredmeta { get; set; }

        public int? IdInspektora { get; set; }

        public string Podnosilac { get; set; }

        public string LiceKontrole { get; set; }

        public string Sadrzaj { get; set; }

        public short? IdTakse { get; set; }

        public string StraniBroj { get; set; }

        public short? Rok { get; set; }

        public bool? PreRoka { get; set; }

        public DateTime? DatumKretanja { get; set; }

        public short? IdKretanjaPredmeta { get; set; }

        public string OpisKretanja { get; set; }

        public int? IdKreatora { get; set; }

        public string OznakaOrgana { get; set; }

        public string OznakaKlase { get; set; }

        public string OznakaJedinice { get; set; }

        public bool GledanjeDatumaKreiranja { get; set; }

        public short? IdMestaOpstine { get; set; }

        public string RokCuvanja { get; set; }
    }
}
