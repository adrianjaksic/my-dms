using System.Collections.Generic;

namespace DmsCore.MasterSifarnik
{
    public class PodatakElementaSifarnika
    {
        public enum TipoviE
        {
            TekstSkriven = 0,
            Tekst = 11,
            TekstDisabled = 111,
            TekstArea = 112,
            CeoPozitivanBroj = 2,
            Cekiranje = 13,
            ComboBox = 20,
            MultiSelect = 21,
            Tabela = 70,
            TabelaSaCekiranjem = 73,
            UploadSlike = 1000,
            TekstEditor = 2000
        }

        public int Id { get; set; }

        public string NazivGrupe { get; set; }

        public string Naziv { get; set; }

        public string Vrednost { get; set; }

        public TipoviE TipPodatka { get; set; }

        public List<PodaciZaIzbor> IzborniPodaci { get; set; }

        public int? IdZavisnogElementa { get; set; }

        public string PotrebniPodaci { get; set; }

        public List<Kolona> Heder { get; set; }

        public bool ImaZavisneElemente { get; set; }

        public int? IdNadredjenogElementa { get; set; }
    }
}
