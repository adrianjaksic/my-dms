using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.MasterSifarnik.Realizacije.Inspekcije;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class InspekcijeModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Inspekcije"),
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
                return context.inspekcije_VratiInspekcije(null).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}", element.IdInspekcije),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, element.Naziv.SrediZaSnimanje(50)),
                    Aktivan = true,
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
                inspekcije_VratiInspekcijeResult inspekcija = null;

                List<PodaciZaIzbor> klaseIJedinice = null;

                var organi = context.organ_VratiOrgane(null, true).Select(organ => new PodaciZaIzbor
                {
                    IdPodatka = string.Format(@"{0}", organ.IdOrgana),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                }).ToList();

                if (!string.IsNullOrEmpty(idElementa))
                {
                    var idInspekcije = short.Parse(idElementa);
                    inspekcija = context.inspekcije_VratiInspekcije(idInspekcije).SingleOrDefault();

                    if (inspekcija == null)
                    {
                        throw new ApplicationException("Inspekcija ne postoji.");
                    }

                    klaseIJedinice = context.inspekcije_VratiKlaseIJedinice(idInspekcije, korisnik.IdOkruga).Select(x => new PodaciZaIzbor
                    {
                        IdPodatka = string.Format(@"{0}-{1}-{2}", x.IdOrgana, x.IdKlase, x.IdJedinice),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, x.NazivOrgana),
                        Podatak1 = Konverzija.VratiString(korisnik.Jezik, x.NazivKlase),
                        Podatak2 = Konverzija.VratiString(korisnik.Jezik, x.NazivJedinice),
                    }).ToList();
                }

                return new List<PodatakElementaSifarnika>
                {
                    new PodatakElementaSifarnika
                    {
                        Id = 0,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Naziv"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = inspekcija != null ? Konverzija.VratiString(korisnik.Jezik, inspekcija.Naziv) : null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 1,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Organ"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Klase i jedinice"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                        IzborniPodaci = organi,
                        ImaZavisneElemente = true,
                        IdNadredjenogElementa = 4,
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 2,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Klasa"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Klase i jedinice"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                        IdNadredjenogElementa = 4,
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 3,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Jedinica"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Klase i jedinice"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                        IdNadredjenogElementa = 4,
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 4,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Klase i jedinice"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Klase i jedinice"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tabela,
                        IzborniPodaci = inspekcija != null ? klaseIJedinice : new List<PodaciZaIzbor>(),
                        Heder = new List<Kolona>
                        {
                            new Kolona
                            {
                                Naziv = Konverzija.VratiString(korisnik.Jezik, "Organ"),
                                TipPodatka = 1,
                                Sirina = "200px",
                            },
                            new Kolona
                            {
                                Naziv = Konverzija.VratiString(korisnik.Jezik, "Klasa"),
                                TipPodatka = 1,
                                Sirina = "200px",
                            },
                            new Kolona
                            {
                                Naziv = Konverzija.VratiString(korisnik.Jezik, "Jedinica"),
                                TipPodatka = 1,
                                Sirina = "200px",
                            },
                        }
                    }
                };
            }
        }

        public ElementSifarnika SnimiPodatkeElementa(string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            var noviElement = new ElementSifarnika();

            short? idInspekcije = null;
            if (!string.IsNullOrEmpty(idElementa))
            {
                idInspekcije = short.Parse(idElementa);
            }

            List<Inspekcija> klaseIJedinice = new List<Inspekcija>();

            string naziv = null;

            foreach (var podatak in podaci)
            {
                switch (podatak.Id)
                {
                    case 0:
                        naziv = podatak.Vrednost;
                        break;
                    case 4:
                        if (podatak.IzborniPodaci != null && podatak.IzborniPodaci.Count > 0)
                        {
                            foreach (var podaciZaIzbor in podatak.IzborniPodaci)
                            {
                                if (podaciZaIzbor != null && !string.IsNullOrEmpty(podaciZaIzbor.IdPodatka))
                                {
                                    var kljucevi = podaciZaIzbor.IdPodatka.Split('-');

                                    if (kljucevi.Length == 3)
                                    {
                                        if (!string.IsNullOrEmpty(kljucevi[0]) && !string.IsNullOrEmpty(kljucevi[1]))
                                        {
                                            var klasaIJedinica = new Inspekcija
                                            {
                                                IdOrgana = short.Parse(kljucevi[0]),
                                                IdKlase = short.Parse(kljucevi[1]),
                                                IdJedinice = string.IsNullOrEmpty(kljucevi[2]) ? (short) 0 : short.Parse(kljucevi[2]),
                                            };

                                            klaseIJedinice.Add(klasaIJedinica);
                                        }
                                    }
                                }
                            }
                        }
                        break;
                }
            }

            if (string.IsNullOrEmpty(naziv))
            {
                throw new ApplicationException("Naziv inspekcije nije unet.");
            }

            if (naziv != null && naziv.Length > 100)
            {
                throw new ApplicationException("Naziv inspekcije ima više od 100 karaktera.");
            }

            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    context.inspekcije_SnimiInspekciju(ref idInspekcije, naziv.SrediZaSnimanje(100), korisnik.IdKorisnika, korisnik.IdOkruga);

                    context.inspekcija_ObrisiKlaseIJedinice(idInspekcije, korisnik.IdOkruga, korisnik.IdKorisnika);

                    foreach (var klasaIJedinica in klaseIJedinice.GroupBy(x => new { x.IdOrgana, x.IdKlase, x.IdJedinice }))
                    {
                        context.inspekcija_SacuvajKlasuIJedinicu(idInspekcije, klasaIJedinica.Key.IdOrgana,
                            klasaIJedinica.Key.IdKlase, klasaIJedinica.Key.IdJedinice, korisnik.IdOkruga,
                            korisnik.IdKorisnika);
                    }

                    noviElement.IdElementa = string.Format(@"{0}", idInspekcije);
                    noviElement.Naziv = Konverzija.VratiString(korisnik.Jezik, naziv.SrediZaSnimanje(100));
                    noviElement.Aktivan = true;
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
                if (!string.IsNullOrEmpty(idElementa))
                {
                    context.inspekcije_ObrisiInspekciju(short.Parse(idElementa), korisnik.IdKorisnika, korisnik.IdOkruga);
                    context.inspekcija_ObrisiKlaseIJedinice(short.Parse(idElementa), korisnik.IdOkruga, korisnik.IdKorisnika);
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
            // ako je organ
            if (idElementaPodatka == "1")
            {
                if (string.IsNullOrEmpty(kriterijum1))
                {
                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            IzborniPodaci = null,
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            IzborniPodaci = null,
                        },
                    };
                }

                var idOrgana = short.Parse(kriterijum1);

                using (var context = DmsData.GetContext())
                {
                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 2,
                            IzborniPodaci = context.klasa_VratiKlase(korisnik.IdOkruga, idOrgana, null, true).Select(x => new PodaciZaIzbor
                            {
                                IdPodatka = string.Format(@"{0}", x.IdKlase),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", x.Oznaka, x.Naziv)),
                            }).ToList(),
                        },
                        new PodatakElementaSifarnika
                        {
                            Id = 3,
                            IzborniPodaci = context.jedinica_VratiJedinice(idOrgana, null, true).Select(x => new PodaciZaIzbor
                            {
                                IdPodatka = string.Format(@"{0}", x.IdJedinice),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", x.Oznaka, x.Naziv)),
                            }).ToList(),
                        },
                    };
                }
            }

            return null;
        }
    }
}
