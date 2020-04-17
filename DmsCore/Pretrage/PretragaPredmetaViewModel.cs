using System.Collections.Generic;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;

namespace DmsCore.Pretrage
{
    public class PretragaPredmetaViewModel
    {
        public List<Element> Okruzi { get; set; }

        public List<Element> Opstine { get; set; }

        public List<Element> Organi { get; set; }

        public List<Element> Klase { get; set; }

        public List<Element> Godine { get; set; }

        public List<Element> VrstePredmeta { get; set; }
 
        public List<Element> Takse { get; set; }
 
        public List<Element> KretanjaPredmeta { get; set; }

        public List<Element> Statusi { get; set; }

        public List<Element> Meseci { get; set; }

        public List<Element> Jedinice { get; set; } 

        public List<Element> Inspektori { get; set; } 

        public List<Element> RazvodjenjeAkata { get; set; }

        public List<Element> RazvodjenjeAkata2 { get; set; }

        public bool BrisanjePredmeta { get; set; }

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

        public static List<Element> VratiRazvodjenjeAkata(UlogovaniKorisnik korisnik)
        {
            return new List<Element>
                {
                    new Element
                        {
                            IdElementa = "1",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "1 - Zahtev rešen u roku od mesec dana"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "2",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "2 - Zahtev rešen u roku od dva meseca"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "3",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "3 - Zahtev rešen po isteku dva meseca"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "4",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "4 - Zahtev je odbačen"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "5",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "5 - Zahtev je odbijen"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "6",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "6 - Zhtev je usvojen"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "7",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "7 - Postupak obustavljen"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "8",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "8 - Žalba odbačena"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "9",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, " 9 - Prvostepena odluka je zamenjena"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "10",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "10 - Donet je zaključak o dozvoli izvršenja"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "11",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "11 - Izvršeno rešenje"),
                            Izabran = false
                        },
                    new Element
                        {
                            IdElementa = "12",
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "12 - Izvršenje sprovedeno prinudnim putem"),
                            Izabran = false
                        },
                };
        }

        public static List<Element> VratiRazvodjenjeAkata2(UlogovaniKorisnik korisnik)
        {
            return new List<Element>
            {
                new Element
                {
                    IdElementa = "1",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "1 - Zahtev rešen u roku od mesec dana"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "2",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "2 - Zahtev rešen u roku od dva meseca"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "3",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "3 - Zahtev rešen po isteku dva meseca"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "4",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "4 - Postupak obustavljen"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "5",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "5 - Žalba odbačena"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "6",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "6 - Prvostepena odluka je zamenjena"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "7",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "7 - Donet je zaključak o dozvoli izvršenja"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "8",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, " 8 - Izvršeno rešenje"),
                    Izabran = false
                },
                new Element
                {
                    IdElementa = "9",
                    Naziv = Konverzija.VratiString(korisnik.Jezik, " 9 -Izvršenje sprovedeno prinudnim putem"),
                    Izabran = false
                },
            };
        }
    }
}
