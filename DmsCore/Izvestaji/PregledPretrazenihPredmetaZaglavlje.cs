using System;
using System.Collections.Generic;
using DmsCore.Predmeti;

namespace DmsCore.Izvestaji
{
    public class PregledPretrazenihPredmetaZaglavlje
    {
        public List<Predmet> Predmeti { get; private set; }

        public PregledPretrazenihPredmetaZaglavlje()
        {
            Predmeti = new List<Predmet>();
        }

        public DateTime Datum { get; set; }

        public string NazivJedinice { get; set; }

        public string NazivKlase { get; set; }

        public string NazivKreatora { get; set; }

        public string NazivOrgana { get; set; }
    }
}
