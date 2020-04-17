using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class KlaseModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            List<PodaciZaIzbor> izborOkruga;

            using (var context = DmsData.GetContext())
            {
                izborOkruga = context.okrug_VratiOkruge(korisnik.IdOkruga, true).Select(p => new PodaciZaIzbor
                {
                    IdPodatka = string.Format(@"{0}", p.IdOkruga),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", p.Oznaka, p.Naziv))
                }).ToList();
            }

            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Klase"),
                DodavanjeIdeNaRoot = true,
                DozvoljenoDodavanje = true,
                DozvoljenaIzmena = true,
                DozvoljenoBrisanje = true,
                PrikaziStablo = true,
                NazivKriterijuma1 = Konverzija.VratiString(korisnik.Jezik, "Okrug"),
                PodaciKriterijuma1 = izborOkruga,
                NazivKriterijuma2 = Konverzija.VratiString(korisnik.Jezik, "Organ"),
                ZavisniKriterijum2 = true,
                PodaciKriterijuma2 = new List<PodaciZaIzbor>(),
                Elementi = new List<ElementSifarnika>()
            };
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.klasa_VratiKlase(Int16.Parse(kriterijum1), Int16.Parse(kriterijum2), null, null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}-{1}-{2}", element.IdOkruga, element.IdOrgana, element.IdKlase),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format("{0}-{1}", element.Oznaka, element.Naziv)),
                    Aktivan = element.Aktivan,
                    DozvoljenoDodavanje = false,
                    DozvoljenaIzmena = true,
                    DozvoljenoBrisanje = true,
                    IdNadredjenogElementa = null,
                }).ToList();
            }
        }

        public List<PodatakElementaSifarnika> VratiPodatkeElementa(string idElementa, string idNadredjenogElementa, string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                if (!string.IsNullOrEmpty(idElementa))
                {
                    var idKlase = idElementa.Split('-')[2];

                    var kljucevi = idElementa.Split('-');
                    if (kljucevi.Length != 3)
                    {
                        throw new ApplicationException("Klasa ne postoji.");
                    }

                    var klasa = context.klasa_VratiKlase(Int16.Parse(kriterijum1), Int16.Parse(kriterijum2), Int16.Parse(kljucevi[2]), null).SingleOrDefault();

                    if (klasa == null)
                    {
                        throw new ApplicationException("Klasa ne postoji.");
                    }

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, klasa.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, klasa.Oznaka)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 4,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Inspekcija"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                            IzborniPodaci = context.inspekcije_VratiInspekcije(null).Select(x => new PodaciZaIzbor
                            {
                                IdPodatka = string.Format(@"{0}", x.IdInspekcije),
                                Naziv = x.Naziv
                            }).ToList(),
                            Vrednost = string.Format(@"{0}", klasa.IdInspekcije)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, klasa.Napomena)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 8,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Izuzmi iz provere"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = klasa.IzuzmiIzProvere.GetValueOrDefault().ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 9,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, ""),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                            Vrednost = ""
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = klasa.Aktivan.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 7,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Nadležnost"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Nadležnost"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstEditor,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, klasa.Nadleznost)
                        }
                    };
                }

                return new List<PodatakElementaSifarnika>
                {
                    new PodatakElementaSifarnika
                    {
                        Id = 0,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 1,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 4,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Inspekcija"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                        IzborniPodaci = context.inspekcije_VratiInspekcije(null).Select(x => new PodaciZaIzbor
                        {
                            IdPodatka = string.Format(@"{0}", x.IdInspekcije),
                            Naziv = x.Naziv
                        }).ToList(),
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 3,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 8,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Izuzmi iz provere"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 9,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, ""),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 2,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"True"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 5,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Izabrani okrug"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        Vrednost = kriterijum1
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 6,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Izabrani organ"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        Vrednost = kriterijum2
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 7,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Nadležnost"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Nadležnost"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstEditor,
                        Vrednost = null
                    }
                };
            }
        }

        public ElementSifarnika SnimiPodatkeElementa(string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                var noviElement = new ElementSifarnika();

                short? idOkruga = null;
                short? idOrgana = null;
                short? idKlase = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    var kljucevi = idElementa.Split('-');
                    if (kljucevi.Length == 3)
                    {
                        idOkruga = Int16.Parse(kljucevi[0]);
                        idOrgana = Int16.Parse(kljucevi[1]);
                        idKlase = Int16.Parse(kljucevi[2]);
                    }
                }

                try
                {
                    string naziv = null;
                    string oznaka = null;
                    string napomena = null;
                    var aktivan = false;
                    string nadleznost = null;
                    short? idInspekcije = null;
                    bool izuzmiIzProvere = false;

                    foreach (PodatakElementaSifarnika element in podaci)
                    {
                        switch (element.Id)
                        {
                            case 0:
                                naziv = element.Vrednost;
                                break;
                            case 1:
                                oznaka = element.Vrednost;
                                break;
                            case 2:
                                aktivan = bool.Parse(element.Vrednost);
                                break;
                            case 3:
                                napomena = element.Vrednost;
                                break;
                            case 4:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    idInspekcije = short.Parse(element.Vrednost);
                                }
                                break;
                            case 5:
                                idOkruga = short.Parse(element.Vrednost);
                                break;
                            case 6:
                                idOrgana = short.Parse(element.Vrednost);
                                break;
                            case 7:
                                nadleznost = element.Vrednost;
                                break;
                            case 8:
                                izuzmiIzProvere = bool.Parse(element.Vrednost);
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(naziv))
                    {
                        throw new ApplicationException("Naziv klase nije unet.");
                    }

                    if (naziv != null && naziv.Length > 200)
                    {
                        throw new ApplicationException("Naziv klase ima više od 200 karaktera.");
                    }

                    if (string.IsNullOrEmpty(oznaka))
                    {
                        throw new ApplicationException("Oznaka klase nije uneta.");
                    }

                    if (oznaka != null && oznaka.Length > 3)
                    {
                        throw new ApplicationException("Oznaka klase ima više od 3 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                    {
                        throw new ApplicationException("Napomena klase ima više od 2000 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(nadleznost) && nadleznost.Length > 4000)
                    {
                        throw new ApplicationException("Nadležnost klase ima više od 4000 karaktera.");
                    }

                    context.klasa_SnimiKlasu(idOkruga, idOrgana, ref idKlase, Konverzija.KonvertujULatinicu(oznaka).SrediZaSnimanje(3),
                                            Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200), Konverzija.KonvertujULatinicu(napomena).SrediZaSnimanje(2000),
                                            aktivan, korisnik.IdKorisnika, Konverzija.KonvertujULatinicu(nadleznost).SrediZaSnimanje(4000), idInspekcije, izuzmiIzProvere);

                    noviElement.IdElementa = string.Format(@"{0}-{1}-{2}", idOkruga, idOrgana, idKlase);
                    noviElement.Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", oznaka, naziv));
                    noviElement.Aktivan = aktivan;
                    noviElement.DozvoljenoBrisanje = true;
                    noviElement.DozvoljenoDodavanje = false;
                    noviElement.DozvoljenaIzmena = true;
                    noviElement.IdNadredjenogElementa = null;

                    context.Transaction.Commit();
                }
                catch (Exception)
                {
                    context.Transaction.Rollback();
                    throw;
                }
                finally
                {
                    context.Connection.Close();
                }

                return noviElement;

            }
        }

        public bool ObrisiElement(string idElementa, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                var kljucevi = idElementa.Split('-');
                if (kljucevi.Length == 3)
                {
                    context.klasa_ObrisiKlasu(Int16.Parse(kljucevi[0]), Int16.Parse(kljucevi[1]), Int16.Parse(kljucevi[2]), korisnik.IdKorisnika);
                    return true;
                }

                return false;
            }
        }

        public List<PodaciZaIzbor> VratiPodatkeKriterijuma2(string kriterijum1, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.organ_VratiOrgane(null, true).Select(o => new PodaciZaIzbor
                {
                    IdPodatka = string.Format(@"{0}", o.IdOrgana),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", o.Oznaka, o.Naziv))
                }).ToList();
            }
        }

        public List<PodaciZaIzbor> VratiPodatkeKriterijuma3(string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return null;
        }

        public List<PodaciZaIzbor> VratiPodatkeZavisnogElementa(string idElementa, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return null;
        }

        public List<PodatakElementaSifarnika> VratiZavisnePodatkeElementa(string idElementa, string idElementaPodatka, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return null;
        }
    }
}
