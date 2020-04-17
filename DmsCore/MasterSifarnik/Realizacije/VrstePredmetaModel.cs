using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class VrstePredmetaModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Vrste predmeta"),
                DodavanjeIdeNaRoot = true,
                DozvoljenoDodavanje = true,
                DozvoljenaIzmena = true,
                DozvoljenoBrisanje = true,
                PrikaziStablo = true,
                Elementi = VratiPodatke(null, null, null, korisnik),
            };
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.vrsta_pred_VratiVrstePredmeta(null, null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}", element.IdVrstePredmeta),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, element.Naziv),
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
                    var vrstaPredmeta = context.vrsta_pred_VratiVrstePredmeta(Int16.Parse(idElementa), null).SingleOrDefault();

                    if (vrstaPredmeta == null)
                    {
                        throw new ApplicationException("Vrsta predmeta ne postoji.");
                    }

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, vrstaPredmeta.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, vrstaPredmeta.Oznaka)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = vrstaPredmeta.Aktivan.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 4,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Rok"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                            Vrednost = vrstaPredmeta.Rok.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 5,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka za štampu"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, vrstaPredmeta.OznakaZaStampu)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, vrstaPredmeta.Napomena)
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
                        Id = 4,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Rok"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 5,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka za štampu"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 3,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                        Vrednost = ""
                    }
                };
            }
        }

        public ElementSifarnika SnimiPodatkeElementa(string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                var noviElement = new ElementSifarnika();

                short? idVrstePredmeta = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    idVrstePredmeta = Int16.Parse(idElementa);
                }

                try
                {
                    string naziv = null;
                    string napomena = null;
                    string oznaka = null;
                    bool aktivan = false;
                    short? rok = null;
                    string oznakaZaStampu = null;

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
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    rok = Int16.Parse(element.Vrednost);
                                }
                                break;
                            case 5:
                                oznakaZaStampu = element.Vrednost;
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(naziv))
                    {
                        throw new ApplicationException("Naziv vrste predmeta nije unet.");
                    }

                    if (naziv != null && naziv.Length > 200)
                    {
                        throw new ApplicationException("Naziv vrste predmeta ima više od 200 karaktera.");
                    }

                    if (string.IsNullOrEmpty(oznaka))
                    {
                        throw new ApplicationException("Oznaka vrste predmeta nije uneta.");
                    }

                    if (oznaka != null && oznaka.Length > 3)
                    {
                        throw new ApplicationException("Oznaka vrste predmeta ima više od 3 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                    {
                        throw new ApplicationException("Napomena vrste predmeta ima više od 2000 karaktera.");
                    }

                    if (rok == null)
                    {
                        throw new ApplicationException("Rok vrste predmeta nije unet.");
                    }

                    context.vrsta_pred_SnimiVrstuPredmeta(ref idVrstePredmeta, Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200), 
                        Konverzija.KonvertujULatinicu(oznaka).SrediZaSnimanje(3), Konverzija.KonvertujULatinicu(napomena).SrediZaSnimanje(2000),
                        aktivan, korisnik.IdKorisnika, rok, Konverzija.KonvertujULatinicu(oznakaZaStampu).SrediZaSnimanje(30));

                    noviElement.IdElementa = string.Format(@"{0}", idVrstePredmeta);
                    noviElement.Naziv = Konverzija.VratiString(korisnik.Jezik, naziv);
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
                context.vrsta_pred_ObrisiVrstuPredmeta(Int16.Parse(idElementa), korisnik.IdKorisnika);
                return true;
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
