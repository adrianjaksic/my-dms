using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class MestaOpstineModel : IMasterSifarnikModel
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
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Mesta"),
                DodavanjeIdeNaRoot = true,
                DozvoljenoDodavanje = true,
                DozvoljenaIzmena = true,
                DozvoljenoBrisanje = true,
                PrikaziStablo = true,
                NazivKriterijuma1 = Konverzija.VratiString(korisnik.Jezik, "Okrug"),
                PodaciKriterijuma1 = izborOkruga,
                NazivKriterijuma2 = Konverzija.VratiString(korisnik.Jezik, "Opština"),
                ZavisniKriterijum2 = true,
                PodaciKriterijuma2 = new List<PodaciZaIzbor>(),
                Elementi = new List<ElementSifarnika>()
            };
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.mesta_VratiMesta(Int16.Parse(kriterijum1), Int16.Parse(kriterijum2), null, null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}-{1}-{2}", kriterijum1, kriterijum2, element.IdMesta),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, element.Naziv),
                    Aktivan = element.Aktivan,
                    DozvoljenoDodavanje = false,
                    DozvoljenaIzmena = true,
                    DozvoljenoBrisanje = true,
                    IdNadredjenogElementa = null,
                }).ToList();
            }
        }

        public List<PodatakElementaSifarnika> VratiPodatkeElementa(string idElementa, string idNadredjenogElementa, string kriterijum1, string kriterijum2,
                                         string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                if (!string.IsNullOrEmpty(idElementa))
                {
                    var kljucevi = idElementa.Split('-');
                    if (kljucevi.Length != 3)
                    {
                        throw new ApplicationException("Mesto opštine ne postoji.");
                    }

                    var mesto = context.mesta_VratiMesta(Int16.Parse(kriterijum1), Int16.Parse(kriterijum2), Int32.Parse(kljucevi[2]), null).SingleOrDefault();

                    if (mesto == null)
                    {
                        throw new ApplicationException("Mesto opštine ne postoji.");
                    }

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, mesto.Naziv)
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 1,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                            Vrednost = mesto.Aktivan.ToString()
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
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Aktivan"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"True"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 2,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Izabrani okrug"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        Vrednost = kriterijum1
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 3,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Izabrana opstina"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        Vrednost = kriterijum2
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
                short? idOpstine = null;
                int? idMesta = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    var kljucevi = idElementa.Split('-');
                    if (kljucevi.Length == 3)
                    {
                        idOkruga = Int16.Parse(kljucevi[0]);
                        idOpstine = Int16.Parse(kljucevi[1]);
                        idMesta = Int32.Parse(kljucevi[2]);
                    }
                }

                try
                {
                    string naziv = null;
                    bool aktivan = false;

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
                                idOkruga = Int16.Parse(element.Vrednost);
                                break;
                            case 3:
                                idOpstine = Int16.Parse(element.Vrednost);
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(naziv))
                    {
                        throw new ApplicationException("Naziv mesta nije unet.");
                    }

                    if (naziv != null && naziv.Length > 200)
                    {
                        throw new ApplicationException("Naziv mesta ima više od 200 karaktera.");
                    }

                    context.mesta_SnimiMesto(idOkruga, idOpstine, ref idMesta,
                                             Konverzija.KonvertujULatinicu(naziv).SrediZaSnimanje(200), aktivan,
                                             korisnik.IdKorisnika);

                    noviElement.IdElementa = string.Format(@"{0}-{1}-{2}", idOkruga, idOpstine, idMesta);
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
                if (kljucevi.Length == 3)
                {
                    context.mesta_ObrisiMesto(Int16.Parse(kljucevi[0]), Int16.Parse(kljucevi[1]), Int32.Parse(kljucevi[2]), korisnik.IdKorisnika);
                    return true;
                }

                return false;
            }
        }

        public List<PodaciZaIzbor> VratiPodatkeKriterijuma2(string kriterijum1, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.opstina_VratiOpstine(Int16.Parse(kriterijum1), null, true).Select(o => new PodaciZaIzbor
                {
                    IdPodatka = string.Format(@"{0}", o.IdOpstine),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, o.Naziv)
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
