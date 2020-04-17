using System;
using System.Collections.Generic;

namespace DmsCore.Predmeti
{
    public class PredmetViewModel
    {
        public Element Okrug { get; set; }

        public List<Element> Organi { get; set; }

        public List<Element> Klase { get; set; }

        public List<Element> Jedinice { get; set; }
 
        public DateTime Datum { get; set; }

        public List<Element> Takse { get; set; }

        public List<Element> VrstePredmeta { get; set; }
 
        public List<Element> Inspektori { get; set; }

        public List<Element> VrsteKretanjaPredmeta { get; set; }

        public List<Element> Opstine { get; set; } 

        public Predmet Predmet { get; set; }

        public List<Element> Precice { get; set; }

        public List<Element> Mesta { get; set; }

        public bool DozvoljenoMenjanjeDatuma { get; set; }
    }
}
