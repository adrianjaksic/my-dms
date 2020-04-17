using System;

namespace DmsCore.Predmeti
{
    public class IstorijaPredmeta
    {
        public short IdKretanja { get; set; }

        public DateTime Vreme { get; set; }

        public string Opis { get; set; }

        public string Napomena { get; set; }

        public string Korisnik { get; set; }

        public DateTime? DatumBrisanja { get; set; }

        public string Obrisao { get; set; }

        public DateTime? DatumRoka { get; set; }

        public string Status { get; set; }
    }
}
