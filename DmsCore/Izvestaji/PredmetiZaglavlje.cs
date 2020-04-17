using System;
using System.Collections.Generic;

namespace DmsCore.Izvestaji
{
    public class PredmetiZaglavlje
    {
        public long IdPredmeta { get; set; }

        public long? IdNadredjenogPredmeta { get; set; }

        public string OznakaOkruga { get; set; }

        public string NazivOkruga { get; set; }

        public string OznakaOrgana { get; set; }

        public string NazivOrgana { get; set; }

        public string OznakaKlase { get; set; }

        public string NazivKlase { get; set; }

        public int BrojPredmeta { get; set; }

        public string DetaljanBrojPredmeta { get; set; }

        public string DetaljanBrojPredmetaSa000000 { get; set; }

        public string OznakaJedinice { get; set; }

        public string NazivJedinice { get; set; }

        public string ImeIPrezimeKreatora { get; set; }

        public string KorisnickoImeKreatora { get; set; }

        public bool PodnosilacJeInspektor { get; set; }

        public string Podnosilac { get; set; }

        public string PodnosilacJedinstveniBroj { get; set; }

        public string LiceKontrole { get; set; }

        public string LiceKontroleJedinstveniBroj { get; set; }

        public DateTime VremeKreiranja { get; set; }

        public string OznakaVrstePredmeta { get; set; }

        public string NazivVrstePredmeta { get; set; }

        public string OznakaVrstePredmetaZaStampu { get; set; }

        public string KorisnickoImeInspektora { get; set; }

        public string ImeIPrezimeInspektora { get; set; }

        public string Prilog { get; set; }

        public string Sadrzaj { get; set; }

        public string NazivTakse { get; set; }

        public string OznakaTakseZaStampu { get; set; }

        public string StraniBroj { get; set; }

        public string Napomena { get; set; }

        public char Status { get; set; }

        public List<StavkaIstorijePredmeta> StavkeIstorije { get; set; }

        public DateTime Datum { get; set; }

        public string Mesto { get; set; }

        public short Rok { get; set; }

        public DateTime DatumIstekaRoka { get; set; }

        public DateTime VremeRezervacije { get; set; }

        public string NazivStatusa { get; set; }        
    }
}
