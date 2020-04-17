using System;
using System.Collections.Generic;
using DmsCore.Dms;

namespace DmsCore.Predmeti
{
    public class Predmet
    {
        public long? IdPredmeta { get; set; }

        public string NazivPredmeta { get; set; }

        public int BrojPredmeta { get; set; }

        public short IdOkruga { get; set; }

        public string NazivOkruga { get; set; }

        public string OznakaOkruga { get; set; }

        public short IdOrgana { get; set; }

        public string OznakaOrgana { get; set; }

        public string NazivOrgana { get; set; }

        public short IdKlase { get; set; }

        public string OznakaKlase { get; set; }

        public string NazivKlase { get; set; }

        public short IdJedinice { get; set; }

        public string OznakaJedinice { get; set; }

        public string NazivJedinice { get; set; }

        public short? IdOpstine { get; set; }

        public string NazivOpstine { get; set; }

        public int IdKreator { get; set; }

        public string NazivKreatora { get; set; }

        public bool PodnosilacJeInspektor { get; set; }

        public string PodnosilacJedinstveniBroj { get; set; }

        public string Podnosilac { get; set; }

        public string LiceKontroleJedinstveniBroj { get; set; }

        public string LiceKontrole { get; set; }

        public DateTime VremeKreiranja { get; set; }

        public DateTime VremeRezervacije { get; set; }

        public DateTime StvarnoVremeKreiranja { get; set; }

        public short? IdVrstePredmeta { get; set; }

        public int? IdInspektora { get; set; }

        public string NazivInspektora { get; set; }

        public string Prilog { get; set; }

        public string Sadrzaj { get; set; }

        public short? IdTakse { get; set; }

        public string StraniBroj { get; set; }

        public string Napomena { get; set; }

        public char Status { get; set; }

        public string NazivStatusa { get; set; }

        public string PutanjaArhiviranjaDokumenata { get; set; }

        public int Godina { get; set; }

        public int Mesec { get; set; }

        public string SifraPredmeta { get; set; }

        public int BrojIstorijePredmeta { get; set; }

        public int BrojIstorijePredmetaUGodini { get; set; }

        public string NapomenaIstorijePredmeta { get; set; }

        public string OpisIstorijePredmeta { get; set; }

        public string OpisNapomenaZaStampu { get; set; }

        public List<IstorijaPredmeta> Istorija { get; set; }

        public List<IstorijaPredmeta> Kretanje { get; set; }

        public DMSPredmeta DMS { get; set; }

        public string Primedba { get; set; }

        public long? IdNadredjenogPredmeta { get; set; }

        public string BrojNadredjenogPredmeta { get; set; }

        public List<PovezaniPredmet> PovezaniPredmeti { get; set; }

        public int? IdMesta { get; set; }

        public string NazivMesta { get; set; }

        public string NazivVrstePredmeta { get; set; }

        public bool StrogoPoverljiv { get; set; }
    }
}
