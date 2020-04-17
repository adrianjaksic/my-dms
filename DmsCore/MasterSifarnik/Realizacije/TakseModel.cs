
using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class TakseModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Takse"),
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
                return context.taksa_VratiTakse(null, null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}", element.IdTakse),
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
                    var taksa = context.taksa_VratiTakse(Int16.Parse(idElementa), null).SingleOrDefault();

                    if (taksa == null)
                    {
                        throw new ApplicationException("Taksa ne postoji.");
                    }

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, taksa.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = taksa.Aktivan.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka za štampu"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, taksa.OznakaZaStampu)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, taksa.Napomena)
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
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"True"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 3,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka za štampu"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 2,
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

                short? idTakse = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    idTakse = Int16.Parse(idElementa);
                }

                try
                {
                    string naziv = null;
                    string napomena = null;
                    bool aktivan = false;
                    string oznakaZaStampu = null;

                    foreach (PodatakElementaSifarnika element in podaci)
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
                                napomena = element.Vrednost;
                                break;
                            case 3:
                                oznakaZaStampu = element.Vrednost;
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(naziv))
                    {
                        throw new ApplicationException("Naziv takse nije unet.");
                    }

                    if (naziv != null && naziv.Length > 200)
                    {
                        throw new ApplicationException("Naziv takse ima više od 200 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                    {
                        throw new ApplicationException("Napomena takse ima više od 2000 karaktera.");
                    }

                    context.taksa_SnimiTaksu(ref idTakse, Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200),
                        Konverzija.KonvertujULatinicu(napomena).SrediZaSnimanje(2000), aktivan, korisnik.IdKorisnika,
                        Konverzija.KonvertujULatinicu(oznakaZaStampu).SrediZaSnimanje(30));

                    noviElement.IdElementa = string.Format(@"{0}", idTakse);
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
                context.taksa_ObrisiTaksu(Int16.Parse(idElementa), korisnik.IdKorisnika);
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
