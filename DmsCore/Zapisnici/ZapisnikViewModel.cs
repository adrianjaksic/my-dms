using System.Collections.Generic;
using DmsCore.Predmeti;

namespace DmsCore.Zapisnici
{
    public class ZapisnikViewModel
    {
        public List<Element> Kreatori { get; set; }

        public List<Element> Organi { get; set; }
 
        public List<Element> Jedinice { get; set; }

        public List<Element> Klase { get; set; }

        public short? IdOkruga { get; set; }
    }
}
