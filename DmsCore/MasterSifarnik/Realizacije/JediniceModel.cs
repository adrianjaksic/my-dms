using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class JediniceModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            var izborOrgana = new List<PodaciZaIzbor>();

            using (var context = DmsData.GetContext())
            {
                izborOrgana = context.organ_VratiOrgane(null, true).Select(p => new PodaciZaIzbor
                {
                    IdPodatka = string.Format(@"{0}", p.IdOrgana),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", p.Oznaka, p.Naziv))
                }).ToList();

            }

            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Jedinice"),
                DodavanjeIdeNaRoot = true,
                DozvoljenoDodavanje = true,
                DozvoljenaIzmena = true,
                DozvoljenoBrisanje = true,
                PrikaziStablo = true,
                NazivKriterijuma1 = Konverzija.VratiString(korisnik.Jezik, "Organ"),
                PodaciKriterijuma1 = izborOrgana,
                Elementi = new List<ElementSifarnika>()
            };
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.jedinica_VratiJedinice(Int16.Parse(kriterijum1), null, true).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}-{1}", element.IdOrgana, element.IdJedinice),
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
                    var kljucevi = idElementa.Split('-');
                    if (kljucevi.Length != 2)
                    {
                        throw new ApplicationException("Jedinica ne postoji.");
                    }

                    var jedinica = context.jedinica_VratiJedinice(Int16.Parse(kriterijum1), Int16.Parse(kljucevi[1]), null).SingleOrDefault();

                    if (jedinica == null)
                    {
                        throw new ApplicationException("Jedinica ne postoji.");
                    }

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, jedinica.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, jedinica.Oznaka)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = jedinica.Aktivan.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, jedinica.Napomena)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 5,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Nadležnost"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Nadležnost"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstEditor,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, jedinica.Nadleznost)
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
                        Id = 2,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"True"
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
                        Id = 4,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Izabrani organ"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        Vrednost = kriterijum1
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 5,
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

                short? idOrgana = null;
                short? idJedinice = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    var kljucevi = idElementa.Split('-');
                    if (kljucevi.Length == 2)
                    {
                        idOrgana = Int16.Parse(kljucevi[0]);
                        idJedinice = Int16.Parse(kljucevi[1]);
                    }
                }

                try
                {
                    string naziv = null;
                    string oznaka = null;
                    string napomena = null;
                    bool aktivan = false;
                    string nadleznost = null;

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
                                aktivan = Boolean.Parse(element.Vrednost);
                                break;
                            case 3:
                                napomena = element.Vrednost;
                                break;
                            case 4:
                                idOrgana = Int16.Parse(element.Vrednost);
                                break;
                            case 5:
                                nadleznost = element.Vrednost;
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(naziv))
                    {
                        throw new ApplicationException("Naziv jedinice nije unet.");
                    }

                    if (naziv != null && naziv.Length > 200)
                    {
                        throw new ApplicationException("Naziv jedinice ima više od 200 karaktera.");
                    }

                    if (string.IsNullOrEmpty(oznaka))
                    {
                        throw new ApplicationException("Oznaka jedinice nije uneta.");
                    }

                    if (oznaka != null && oznaka.Length > 3)
                    {
                        throw new ApplicationException("Oznaka jedinice ima više od 3 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                    {
                        throw new ApplicationException("Napomena jedinice ima više od 2000 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(nadleznost) && nadleznost.Length > 4000)
                    {
                        throw new ApplicationException("Nadležnost jedinice ima više od 4000 karaktera.");
                    }

                    context.jedinica_SnimiJedinicu(idOrgana, ref idJedinice, Konverzija.KonvertujULatinicu(oznaka).SrediZaSnimanje(3), Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200),
                                                    Konverzija.KonvertujULatinicu(napomena).SrediZaSnimanje(2000), aktivan, korisnik.IdKorisnika,
                                                    Konverzija.KonvertujULatinicu(nadleznost).SrediZaSnimanje(4000));

                    noviElement.IdElementa = string.Format(@"{0}-{1}", idOrgana, idJedinice);
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
                if (kljucevi.Length == 2)
                {
                    context.jedinica_ObrisiJedinicu(Int16.Parse(kljucevi[0]), Int16.Parse(kljucevi[1]), korisnik.IdKorisnika);
                    return true;
                }

                return false;
            }
        }

        public List<PodaciZaIzbor> VratiPodatkeKriterijuma2(string kriterijum1, UlogovaniKorisnik korisnik)
        {
            return null;
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
