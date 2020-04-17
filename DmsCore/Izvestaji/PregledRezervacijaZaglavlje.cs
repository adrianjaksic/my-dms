using System.Collections.Generic;
using DmsCore.Predmeti;

namespace DmsCore.Izvestaji
{
    public class PregledRezervacijaZaglavlje
    {
        public Predmet Predmet { get; set; }

        public List<Element> RezervisaniBrojevi { get; set; }

        public DefinisanaStampa Stampa { get; set; }
    }
}
