using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsCore.Pretrage;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class VrsteKretanjaPredmetaModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Vrste kretanja predmeta"),
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
                return context.kret_pred_VratiKretanjaPredmeta(null, null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}", element.IdKretanjaPredmeta),
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
                    var kretanjePredmeta = context.kret_pred_VratiKretanjaPredmeta(Int16.Parse(idElementa), null).SingleOrDefault();

                    if (kretanjePredmeta == null)
                    {
                        throw new ApplicationException("Vrsta kretanja predmeta ne postoji.");
                    }

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, kretanjePredmeta.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 8,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv za istoriju"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = kretanjePredmeta.NazivZaIstoriju
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 7,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = kretanjePredmeta.Oznaka
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 5,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Primedba"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = kretanjePredmeta.Primedba
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 6,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Unos roka"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = kretanjePredmeta.UnosRoka.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Status"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                            IzborniPodaci = PretragaPredmetaViewModel.VratiStatuse(korisnik).Where(x => x.IdElementa != "P").Select(izbor => new PodaciZaIzbor
                                {
                                    IdPodatka = izbor.IdElementa,
                                    Naziv = izbor.Naziv
                                }).ToList(),
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}", kretanjePredmeta.Status))
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 4,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Zapisnik"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = kretanjePredmeta.Zapisnik.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, kretanjePredmeta.Napomena)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = kretanjePredmeta.Aktivan.ToString()
                        },
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
                        Id = 8,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv za istoriju"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 7,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 5,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Primedba"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 6,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Unos roka"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 2,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Status"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                        IzborniPodaci = PretragaPredmetaViewModel.VratiStatuse(korisnik).Where(x => x.IdElementa != "P").Select(izbor => new PodaciZaIzbor
                            {
                                IdPodatka = izbor.IdElementa,
                                Naziv = izbor.Naziv
                            }).ToList(),
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 4,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Zapisnik"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
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
                        Id = 1,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"True"
                    },
                };
            }
        }

        public ElementSifarnika SnimiPodatkeElementa(string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                var noviElement = new ElementSifarnika();

                short? idKretanjaPredmeta = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    idKretanjaPredmeta = Int16.Parse(idElementa);
                }

                try
                {
                    string naziv = null;
                    string napomena = null;
                    var aktivan = false;
                    char? status = null;
                    var zapisnik = false;
                    string primedba = null;
                    var unosRoka = false;
                    string oznaka = null;
                    string nazivZaIstoriju = null;

                    foreach (var element in podaci)
                    {
                        switch (element.Id)
                        {
                            case 0:
                                naziv = element.Vrednost;
                                break;
                            case 1:
                                aktivan = Boolean.Parse(element.Vrednost);
                                break;
                            case 2:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    status = Char.Parse(element.Vrednost);
                                }
                                break;
                            case 3:
                                napomena = element.Vrednost;
                                break;
                            case 4:
                                zapisnik = Boolean.Parse(element.Vrednost);
                                break;
                            case 5:
                                primedba = element.Vrednost;
                                break;
                            case 6:
                                unosRoka = Boolean.Parse(element.Vrednost);
                                break;
                            case 7:
                                oznaka = element.Vrednost;
                                break;
                            case 8:
                                nazivZaIstoriju = element.Vrednost;
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(naziv))
                    {
                        throw new ApplicationException("Naziv kretanja predmeta nije unet.");
                    }

                    if (!string.IsNullOrEmpty(naziv) && naziv.Length > 200)
                    {
                        throw new ApplicationException("Naziv kretanja predmeta ima više od 200 karaktera.");
                    }

                    if (string.IsNullOrEmpty(oznaka))
                    {
                        throw new ApplicationException("Oznaka kretanja predmeta nije unet.");
                    }

                    if (!string.IsNullOrEmpty(oznaka) && oznaka.Length > 3)
                    {
                        throw new ApplicationException("Oznaka kretanja predmeta ima više od 3 karaktera.");
                    }

                    if (string.IsNullOrEmpty(nazivZaIstoriju))
                    {
                        throw new ApplicationException("Naziv za istoriju kretanja predmeta nije unet.");
                    }

                    if (!string.IsNullOrEmpty(nazivZaIstoriju) && nazivZaIstoriju.Length > 200)
                    {
                        throw new ApplicationException("Naziv za istoriju kretanja predmeta ima više od 200 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                    {
                        throw new ApplicationException("Napomena kretanja predmeta ima više od 2000 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(primedba) && primedba.Length > 100)
                    {
                        throw new ApplicationException("Primedba kretanja predmeta ima više od 100 karaktera.");
                    }

                    if (status == null)
                    {
                        throw new ApplicationException("Status kretanja predmeta nije izabran.");
                    }

                    context.kret_pred_SnimiKretanjePredmeta(ref idKretanjaPredmeta, Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200),
                        Konverzija.KonvertujULatinicu(napomena).SrediZaSnimanje(2000), aktivan, korisnik.IdKorisnika, status, zapisnik, 
                        primedba.SrediZaSnimanje(100), unosRoka, oznaka, nazivZaIstoriju);

                    noviElement.IdElementa = string.Format(@"{0}", idKretanjaPredmeta);
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
                context.kret_pred_ObrisiKretanjePredmeta(Int16.Parse(idElementa), korisnik.IdKorisnika);
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
