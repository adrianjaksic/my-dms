using System.Collections.Generic;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;

namespace DmsCore.Izvestaji
{
    public class IzvestajPredmetaViewModel
    {
        public List<Element> Okruzi { get; set; }

        public List<Element> Opstine { get; set; }

        public List<Element> Organi { get; set; }

        public List<Element> Godine { get; set; }

        public List<Element> VrstePredmeta { get; set; }

        public List<Element> Takse { get; set; }

        public List<Element> KretanjaPredmeta { get; set; }

        public List<Element> Statusi { get; set; }

        public List<Element> Meseci { get; set; }

        public List<Element> Jedinice { get; set; }

        public List<Element> Inspektori { get; set; }

        public List<Element> Grupisanja { get; set; } 

        public List<Element> Kreatori { get; set; }

        public List<Element> Klase { get; set; }

        public static List<Element> VratiStatuse(UlogovaniKorisnik korisnik)
        {
            return new List<Element>
            {
                new Element
                {
                    IdElementa = "R",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Rezervisan")
                },
                new Element
                {
                    IdElementa = "O",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan")
                },
                new Element
                {
                    IdElementa = "B",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Obrisan")
                },
                new Element
                {
                    IdElementa = "D",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "U rokovniku")
                },
                new Element
                {
                    IdElementa = "Z",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Arhiviran")
                },
                new Element
                {
                    IdElementa = "P",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Prezaveden")
                },
                new Element
                {
                    IdElementa = "E",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Prezaveden-Arhiviran")
                },
            };
        }

        public static List<Element> VratiGrupisanja(UlogovaniKorisnik korisnik)
        {
            return new List<Element>
            {
                new Element
                {
                    IdElementa = "1",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Kreator")
                },
                new Element
                {
                    IdElementa = "2",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Inspektor")
                },
                new Element
                {
                    IdElementa = "3",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Organ")
                },
                new Element
                {
                    IdElementa = "4",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Klasa")
                },
                new Element
                {
                    IdElementa = "5",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Sadržaj")
                },
                new Element
                {
                    IdElementa = "6",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Status")
                }
            };
        }
    }
}
