using System;

namespace DmsCore.Dms
{
    public class PodaciDokumenta
    {
        public short IdDokumenta { get; set; }

        public string Kreator { get; set; }

        public string KreatorBrisanja { get; set; }

        public string Naziv { get; set; }

        public DateTime? VremeBrisanja { get; set; }

        public DateTime VremeUnosa { get; set; }

        public string Putanja { get; set; }

        public string Hashcode { get; set; }

        public string Napomena { get; set; }

        public bool Obrisan { get; set; }

        public string Ekstenzija { get; set; }

        public string Link { get; set; }
    }
}
