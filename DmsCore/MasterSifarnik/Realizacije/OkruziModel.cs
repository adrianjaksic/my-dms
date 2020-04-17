using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Policy;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class OkruziModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            if (korisnik != null && korisnik.Administracija)
            {
                return new MasterSifarnikViewModel
                {
                    Naziv = Konverzija.VratiString(korisnik.Jezik, "Okruzi"),
                    DodavanjeIdeNaRoot = true,
                    DozvoljenoDodavanje = korisnik.IdOkruga == null,
                    DozvoljenaIzmena = true,
                    DozvoljenoBrisanje = korisnik.IdOkruga == null,
                    PrikaziStablo = true,
                    Elementi = VratiPodatke(string.Format(@"{0}", korisnik.IdOkruga), null, null, korisnik),
                };
            }

            return null;
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                var idOkruga = !string.IsNullOrEmpty(kriterijum1) ? Int16.Parse(kriterijum1) : (short?) null;
                return context.okrug_VratiOkruge(idOkruga, null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}", element.IdOkruga),
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
                    var okrug = context.okrug_VratiOkruge(Int16.Parse(idElementa), null).SingleOrDefault();

                    if (okrug == null)
                    {
                        throw new ApplicationException("Okrug ne postoji.");
                    }

                    var putanjaSlike = PutanjaAplikacije.PutanjaOkruga + okrug.IdOkruga + ".jpeg";

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = korisnik.IdOkruga == null ? PodatakElementaSifarnika.TipoviE.Tekst : PodatakElementaSifarnika.TipoviE.TekstDisabled,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, okrug.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = korisnik.IdOkruga == null ? PodatakElementaSifarnika.TipoviE.Tekst : PodatakElementaSifarnika.TipoviE.TekstDisabled,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, okrug.Oznaka)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 5,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Mesto"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = okrug.Mesto
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = okrug.Aktivan.ToString()
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 4,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Baner okruga"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.UploadSlike,
                            Vrednost = File.Exists(putanjaSlike) ? PutanjaAplikacije.PutanjaOkrugaWeb + okrug.IdOkruga + ".jpeg?" + Guid.NewGuid().ToString() : null,
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Napomena"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, okrug.Napomena)
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
                        Id = 1,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Oznaka"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = ""
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 5,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Mesto"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = null
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
                 if (!string.IsNullOrEmpty(idElementa))
                 {
                     idOkruga = Int16.Parse(idElementa);
                 }

                 try
                 {
                     string naziv = null;
                     string oznaka = null;
                     string napomena = null;
                     bool aktivan = false;
                     string mesto = null;

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
                             case 5:
                                 mesto = element.Vrednost;
                                 break;
                         }
                     }

                     if (string.IsNullOrEmpty(naziv))
                     {
                         throw new ApplicationException("Naziv okruga nije unet.");
                     }

                     if (naziv != null && naziv.Length > 200)
                     {
                         throw new ApplicationException("Naziv okruga ima više od 200 karaktera.");
                     }

                     if (string.IsNullOrEmpty(oznaka))
                     {
                         throw new ApplicationException("Oznaka okruga nije uneta.");
                     }

                     if (oznaka != null && oznaka.Length > 3)
                     {
                         throw new ApplicationException("Oznaka okruga ima više od 3 karaktera.");
                     }

                     if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                     {
                         throw new ApplicationException("Napomena okruga ima više od 2000 karaktera.");
                     }

                     if (string.IsNullOrEmpty(mesto))
                     {
                         throw new ApplicationException("MEsto okruga nije uneta.");
                     }

                     if (mesto != null && mesto.Length > 200)
                     {
                         throw new ApplicationException("Mesto okruga ima više od 200 karaktera.");
                     }

                     context.okrug_SnimiOkrug(ref idOkruga, Konverzija.KonvertujULatinicu(oznaka).SrediZaSnimanje(3), Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200),
                         Konverzija.KonvertujULatinicu(mesto).SrediZaSnimanje(200), Konverzija.KonvertujULatinicu(napomena).SrediZaSnimanje(2000), aktivan, korisnik.IdKorisnika);

                     noviElement.IdElementa = string.Format(@"{0}", idOkruga);
                     noviElement.Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", oznaka, naziv));
                     noviElement.Aktivan = aktivan;
                     noviElement.DozvoljenoBrisanje = true;
                     noviElement.DozvoljenoDodavanje = false;
                     noviElement.DozvoljenaIzmena = true;
                     noviElement.IdNadredjenogElementa = null;

                     LogovanjeData.PromeniNapomenuOkrugaUlogovanihKorisnika(napomena);

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
                context.okrug_ObrisiOkrug(Int16.Parse(idElementa), korisnik.IdKorisnika);
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
