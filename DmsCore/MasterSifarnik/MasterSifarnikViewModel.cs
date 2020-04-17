using System.Collections.Generic;

namespace DmsCore.MasterSifarnik
{
    public class MasterSifarnikViewModel
    {
        public string Naziv { get; set; }

        public bool DodavanjeIdeNaRoot { get; set; }

        public bool DozvoljenoDodavanje { get; set; }

        public bool DozvoljenaIzmena { get; set; }

        public bool DozvoljenoBrisanje { get; set; }

        public bool PrikaziStablo { get; set; }

        public string NazivKriterijuma1 { get; set; }

        public string NazivKriterijuma2 { get; set; }

        public string NazivKriterijuma3 { get; set; }

        public List<PodaciZaIzbor> PodaciKriterijuma1 { get; set; }

        public List<PodaciZaIzbor> PodaciKriterijuma2 { get; set; }

        public List<PodaciZaIzbor> PodaciKriterijuma3 { get; set; }

        public string PodrazumevanaVrednostKriterijuma1 { get; set; }

        public string PodrazumevanaVrednostKriterijuma2 { get; set; }

        public string PodrazumevanaVrednostKriterijuma3 { get; set; }

        public List<ElementSifarnika> Elementi { get; set; }

        public bool PrikaziFilter { get; set; }

        public bool ZavisniKriterijum2 { get; set; }

        public bool ZavisniKriterijum3 { get; set; }
    }
}
