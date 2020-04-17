using System.Collections.Generic;

namespace DmsCore.MasterSifarnik
{
    public class Kolona
    {
        public string Naziv { get; set; }

        /*
         * 0 - link treba ikonica u tabeli da se napravi
         * 1 - string
         * 2 - date
         * 3 - money
         * 4 - checkbox
         * 99 - combobox
         * 199 - tekuci racun
         * 200 - img
         */

        public byte TipPodatka { get; set; }

        public bool DozvoljenUnos { get; set; }

        public bool PrikaziPodatkeOKomitentu { get; set; }

        public bool PrikaziPodatkeODokumentu { get; set; }

        public string Sirina { get; set; }

        public bool IzborPodataka { get; set; }

        public List<PodaciZaIzbor> PodaciKoloneZaIzbor { get; set; }
    }
}
