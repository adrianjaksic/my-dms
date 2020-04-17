using System.Collections.Generic;
using DmsCore.Predmeti;

namespace DmsCore.Pretrage.PretrageObrisanih
{
    public class PretragaObrisanihViewModel
    {
        public List<Element> Okruzi { get; set; }

        public List<Element> Organi { get; set; }

        public List<Element> Godine { get; set; }

        public List<Element> Klase { get; set; }

        public List<Element> Jedinice { get; set; }
    }
}
