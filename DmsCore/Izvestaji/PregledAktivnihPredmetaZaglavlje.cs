using System;
using System.Collections.Generic;
using DmsCore.Zapisnici;

namespace DmsCore.Izvestaji
{
    public class PregledAktivnihPredmetaZaglavlje
    {
        public List<AktivniPredmet> Predmeti { get; private set; }

        public PregledAktivnihPredmetaZaglavlje()
        {
            Predmeti = new List<AktivniPredmet>();
        }

        public DateTime Datum { get; set; }

        public string NazivUstanove { get; set; }

        public string NazivKolone1 { get; set; }

        public string NazivKolone2 { get; set; }

        public string NazivKolone3 { get; set; }

        public string NazivKolone4 { get; set; }

        public string NazivKolone5 { get; set; }

        public string NazivKolone6 { get; set; }

        public string NazivKolone7 { get; set; }

        public string NazivKolone8 { get; set; }

        public string NazivKolone9 { get; set; }

        public string NazivKolone10 { get; set; }
        
        public string NazivKolone11 { get; set; }
    }
}
