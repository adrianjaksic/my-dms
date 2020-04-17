using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class OpstineModel : IMasterSifarnikModel
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
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Opštine"),
                DodavanjeIdeNaRoot = true,
                DozvoljenoDodavanje = true,
                DozvoljenaIzmena = true,
                DozvoljenoBrisanje = true,
                PrikaziStablo = true,
                NazivKriterijuma1 = Konverzija.VratiString(korisnik.Jezik, "Okrug"),
                PodaciKriterijuma1 = izborOkruga,
                Elementi = new List<ElementSifarnika>()
            };
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.opstina_VratiOpstine(Int16.Parse(kriterijum1), null, null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}-{1}", element.IdOkruga, element.IdOpstine),
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
                    var idOpstine = idElementa.Split('-')[1];
                    var opstina = context.opstina_VratiOpstine(Int16.Parse(kriterijum1), Int16.Parse(idOpstine), null).SingleOrDefault();

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, opstina.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Poštanski broj"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, opstina.PostanskiBroj)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = opstina.Aktivan.ToString()
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
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 1,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Poštanski broj"),
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
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Izabrani okrug"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        Vrednost = kriterijum1
                    }
                };
            }
        }

        public ElementSifarnika SnimiPodatkeElementa(string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            var noviElement = new ElementSifarnika();

            short? idOkruga = null;
            short? idOpstine = null;
            if (!string.IsNullOrEmpty(idElementa))
            {
                var kljucevi = idElementa.Split('-');
                if (kljucevi.Length == 2)
                {
                    idOkruga = Int16.Parse(kljucevi[0]);
                    idOpstine = Int16.Parse(kljucevi[1]);
                }
            }

            string naziv = null;
            string postanskiBroj = null;
            var aktivan = false;

            foreach (PodatakElementaSifarnika element in podaci)
            {
                switch (element.Id)
                {
                    case 0:
                        naziv = element.Vrednost;
                        break;
                    case 1:
                        postanskiBroj = element.Vrednost;
                        break;
                    case 2:
                        aktivan = Boolean.Parse(element.Vrednost);
                        break;
                    case 3:
                        idOkruga = Int16.Parse(element.Vrednost);
                        break;
                }
            }

            if (string.IsNullOrEmpty(naziv))
            {
                throw new ApplicationException("Naziv opštine nije unet.");
            }

            if (naziv != null && naziv.Length > 200)
            {
                throw new ApplicationException("Naziv opštine ima više od 200 karaktera.");
            }

            if (!string.IsNullOrEmpty(postanskiBroj) && postanskiBroj.Length > 5)
            {
                throw new ApplicationException("Poštanski broj ima više od 5 karaktera.");
            }

            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    context.opstina_SnimiOpstinu(idOkruga, ref idOpstine, Konverzija.KonvertujULatinicu(postanskiBroj).SrediZaSnimanje(5),
                                            Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200), aktivan, korisnik.IdKorisnika);

                    noviElement.IdElementa = string.Format(@"{0}-{1}", idOkruga, idOpstine);
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
                var kljucevi = idElementa.Split('-');
                if (kljucevi.Length == 2)
                {
                    context.opstina_ObrisiOpstinu(Int16.Parse(kljucevi[0]), Int16.Parse(kljucevi[1]), korisnik.IdKorisnika);
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
