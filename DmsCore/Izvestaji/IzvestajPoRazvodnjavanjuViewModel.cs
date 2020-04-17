using System.Collections.Generic;
using DmsCore.Predmeti;

namespace DmsCore.Izvestaji
{
    public class IzvestajPoRazvodnjavanjuViewModel
    {
        public List<Element> Okruzi { get; set; }

        public List<Element> Organi { get; set; }

        public List<Element> Godine { get; set; }

        public List<Element> Arhivatori { get; set; }

        public List<Element> Klase { get; set; }

        public List<Element> Jedinice { get; set; }
    }
}
