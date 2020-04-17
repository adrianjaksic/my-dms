using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije{
    public class KorisniciModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Korisnici"),
                DodavanjeIdeNaRoot = true,
                DozvoljenoDodavanje = true,
                DozvoljenaIzmena = true,
                PrikaziStablo = true,
                Elementi = VratiPodatke(null, null, null, korisnik),
                PrikaziFilter = true
            };
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                var idOkruga = korisnik.IdOkruga;

                return context.korisnik_VratiKorisnike(null, null, idOkruga).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}", element.IdKorisnika),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, element.KorisnickoIme),
                    Aktivan = element.Aktivan,
                    DozvoljenoDodavanje = false,
                    DozvoljenaIzmena = true,
                    IdNadredjenogElementa = null,
                }).ToList();
            }
        }

        public List<PodatakElementaSifarnika> VratiPodatkeElementa(string idElementa, string idNadredjenogElementa, string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik admin)
        {
            using (var context = DmsData.GetContext())
            {
                if (!string.IsNullOrEmpty(idElementa))
                {
                    var korisnik = context.korisnik_VratiKorisnike(int.Parse(idElementa), null, null).SingleOrDefault();

                    if (korisnik != null)
                    {
                        return new List<PodatakElementaSifarnika>
                        {
                            new PodatakElementaSifarnika
                            {
                                Id = 0,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Korisničko ime"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.TekstDisabled,
                                Vrednost =
                                    Konverzija.VratiString(admin.Jezik, korisnik.KorisnickoIme)
                                        .SrediZaPretragu()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 1,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Ime i prezime"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                                Vrednost =
                                    Konverzija.VratiString(admin.Jezik, korisnik.ImeIPrezime).SrediZaPretragu()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 2,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Email"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                                Vrednost = korisnik.Email.SrediZaPretragu()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 3,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Jmbg"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                                Vrednost = korisnik.Jmbg.SrediZaPretragu()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 4,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Telefon"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                                Vrednost = korisnik.Telefon.SrediZaPretragu()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 5,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Aktivan"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.Aktivan.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 6,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Okrug"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka =
                                    admin.IdOkruga == null
                                        ? PodatakElementaSifarnika.TipoviE.ComboBox
                                        : PodatakElementaSifarnika.TipoviE.TekstSkriven,
                                IzborniPodaci =
                                    admin.IdOkruga == null
                                        ? context.okrug_VratiOkruge(null, true).Select(o => new PodaciZaIzbor
                                        {
                                            IdPodatka = string.Format(@"{0}", o.IdOkruga),
                                            Naziv = string.Format(@"{0}-{1}", o.Oznaka, o.Naziv)
                                        }).ToList()
                                        : null,
                                Vrednost = string.Format(@"{0}", korisnik.IdOkruga),
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 7,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Inspektor"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.Inspektor.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 18,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Organ"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                                IzborniPodaci =
                                    context.organ_VratiOrgane(null, true).Select(o => new PodaciZaIzbor
                                    {
                                        IdPodatka = string.Format(@"{0}", o.IdOrgana),
                                        Naziv =
                                            Konverzija.VratiString(admin.Jezik,
                                                string.Format(@"{0}-{1}", o.Oznaka,
                                                    o.Naziv))
                                    }).ToList(),
                                Vrednost = korisnik.IdOrgana != null ? korisnik.IdOrgana.ToString() : null
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 8,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Unos novog predmeta"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.UnosNovogPredmeta.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 9,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Dozvola rezervisanja"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.DozvolaRezervisanja.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 10,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Izmena predmeta"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.IzmenaPredmeta.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 11,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Brisanje predmeta"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.BrisanjePredmeta.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 12,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Administracija"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.Administracija.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 13,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Pregled izveštaja"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.PregledIzvestaja.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 17,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Samo svoje predmete"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = korisnik.SamoSvojePredmete.ToString()
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 14,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Napomena"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                                Vrednost = Konverzija.VratiString(admin.Jezik, korisnik.Napomena)
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 16,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Nova lozinka"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                                PotrebniPodaci =
                                    Konverzija.VratiString(admin.Jezik,
                                        "Lozinka korisnika mora sadržati bar jedno veliko slovo, jedno malo slovo i jedan broj."),
                                Vrednost = null
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 19,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Klase"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Klase"),
                                IzborniPodaci =
                                    context.klase_insp_VratiKlaseInspektora(korisnik.IdOkruga, korisnik.IdKorisnika)
                                        .Select(k => new PodaciZaIzbor
                                        {
                                            IdPodatka = string.Format(@"{0}-{1}", k.IdOrgana, k.IdKlase),
                                            Podatak1 =
                                                Konverzija.VratiString(admin.Jezik,
                                                    string.Format(@"{0}-{1}", k.Oznaka, k.Naziv)),
                                            Naziv =
                                                Konverzija.VratiString(admin.Jezik,
                                                    string.Format(@"{0}-{1}", k.OznakaOrgana, k.NazivOrgana)),
                                            Izabran = k.Izabran != null && (bool) k.Izabran
                                        }).ToList(),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.TabelaSaCekiranjem,
                                Heder = new List<Kolona>
                                {
                                    new Kolona
                                    {
                                        Naziv = Konverzija.VratiString(admin.Jezik, "Organ")
                                    },
                                    new Kolona
                                    {
                                        Naziv = Konverzija.VratiString(admin.Jezik, "Klasa")
                                    }
                                }
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 20,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Maks. br. pred."),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                                Vrednost = string.Format(@"{0}", korisnik.MaksimalniBrojPredmeta)
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 21,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Maks. br. rez. pred."),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                                Vrednost = string.Format(@"{0}", korisnik.MaxBrojRezervisanihPredmeta)
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 22,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Maks. br. u godini"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                                Vrednost = string.Format(@"{0}", korisnik.MaksimalniBrojPredmetaGodine)
                            },
                            new PodatakElementaSifarnika
                            {
                                Id = 23,
                                Naziv = Konverzija.VratiString(admin.Jezik, "Vidi strogo poverljive predmete"),
                                NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                                TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                                Vrednost = string.Format(@"{0}", korisnik.StrogoPoverljivi)
                            },
                        };
                    }

                    throw new ApplicationException("Korisnik ne postoji.");
                }

                return new List<PodatakElementaSifarnika>
                {
                    new PodatakElementaSifarnika
                    {
                        Id = 0,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Korisničko ime"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 1,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Ime i prezime"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 2,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Email"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 3,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Jmbg"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 4,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Telefon"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 15,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Lozinka"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Tekst,
                        PotrebniPodaci =
                            Konverzija.VratiString(admin.Jezik,
                                "Lozinka korisnika mora sadržati bar jedno veliko slovo, jedno malo slovo i jedan broj."),
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 5,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Aktivan"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"True"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 6,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Okrug"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka =
                            admin.IdOkruga == null
                                ? PodatakElementaSifarnika.TipoviE.ComboBox
                                : PodatakElementaSifarnika.TipoviE.TekstSkriven,
                        IzborniPodaci =
                            admin.IdOkruga == null
                                ? context.okrug_VratiOkruge(null, true).Select(o => new PodaciZaIzbor
                                {
                                    IdPodatka = string.Format(@"{0}", o.IdOkruga),
                                    Naziv =
                                        Konverzija.VratiString(admin.Jezik,
                                            string.Format(@"{0}-{1}", o.Oznaka, o.Naziv))
                                }).ToList()
                                : null,
                        Vrednost = admin.IdOkruga == null ? null : admin.IdOkruga.ToString(),
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 18,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Organ"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.ComboBox,
                        IzborniPodaci = context.organ_VratiOrgane(null, true).Select(o => new PodaciZaIzbor
                        {
                            IdPodatka = string.Format(@"{0}", o.IdOrgana),
                            Naziv =
                                Konverzija.VratiString(admin.Jezik,
                                    string.Format(@"{0}-{1}", o.Oznaka, o.Naziv)),
                        }).ToList(),
                        Vrednost = null,
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 7,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Inspektor"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 8,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Unos novog predmeta"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 9,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Dozvola rezervisanja"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 10,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Izmena predmeta"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 11,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Brisanje predmeta"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 12,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Administracija"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 13,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Pregled izveštaja"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 17,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Samo svoje predmete"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"True"
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 14,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Napomena"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstArea,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 19,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Klase"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Klase"),
                        IzborniPodaci =
                            context.klase_insp_VratiKlaseInspektora(admin.IdOkruga, null)
                                .Select(k => new PodaciZaIzbor
                                {
                                    IdPodatka = string.Format(@"{0}-{1}", k.IdOrgana, k.IdKlase),
                                    Podatak1 =
                                        Konverzija.VratiString(admin.Jezik,
                                            string.Format(@"{0}-{1}", k.Oznaka,
                                                k.Naziv)),
                                    Naziv =
                                        Konverzija.VratiString(admin.Jezik,
                                            string.Format(@"{0}-{1}", k.OznakaOrgana,
                                                k.NazivOrgana)),
                                    Izabran = k.Izabran != null && (bool) k.Izabran
                                }).ToList(),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TabelaSaCekiranjem,
                        Heder = new List<Kolona>
                        {
                            new Kolona
                            {
                                Naziv = Konverzija.VratiString(admin.Jezik, "Organ")
                            },
                            new Kolona
                            {
                                Naziv = Konverzija.VratiString(admin.Jezik, "Klasa")
                            }
                        }
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 20,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Maks. br. predmeta"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 21,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Maks. br. rez."),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 22,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Maks. br. godine"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.CeoPozitivanBroj,
                        Vrednost = null
                    },
                    new PodatakElementaSifarnika
                    {
                        Id = 23,
                        Naziv = Konverzija.VratiString(admin.Jezik, "Vidi strogo poverljive predmete"),
                        NazivGrupe = Konverzija.VratiString(admin.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.Cekiranje,
                        Vrednost = @"False",
                    },
                };
            }
        }

        public ElementSifarnika SnimiPodatkeElementa(string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                var noviElement = new ElementSifarnika();

                int? idKorisnikaZaUnos = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    idKorisnikaZaUnos = int.Parse(idElementa);
                }

                try
                {
                    string korisnickoIme = null;
                    var inspektor = false;
                    short? idOkruga = null;
                    var unosNovogPredmeta = false;
                    var dozvolaRezervisanja = false;
                    var izmenaPredmeta = false;
                    var brisanjePredmeta = false;
                    var administracija = false;
                    var pregledIzvestaja = false;
                    string email = null;
                    string telefon = null;
                    string jmbg = null;
                    string imeIPrezime = null;
                    string napomena = null;
                    var aktivan = true;
                    string lozinka = null;
                    string novaLozinka = null;
                    var samoSvojePredmete = false;
                    short? idOrgana = null;
                    short? maksimalniBrojPredmeta = null;
                    short? maxBrojRezervisanihPredmeta = null;
                    short? maksimalniBrojPredmetaGodine = null;
                    var strogoPoverljivi = false;

                    PodatakElementaSifarnika klase = null;

                    foreach (PodatakElementaSifarnika element in podaci)
                    {
                        switch (element.Id)
                        {
                            case 0:
                                korisnickoIme = element.Vrednost;
                                break;
                            case 1:
                                imeIPrezime = element.Vrednost;
                                break;
                            case 2:
                                email = element.Vrednost;
                                break;
                            case 3:
                                jmbg = element.Vrednost;
                                break;
                            case 4:
                                telefon = element.Vrednost;
                                break;
                            case 5:
                                aktivan = bool.Parse(element.Vrednost);
                                break;
                            case 6:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    idOkruga = short.Parse(element.Vrednost);
                                }
                                break;
                            case 7:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    inspektor = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 8:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    unosNovogPredmeta = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 9:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    dozvolaRezervisanja = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 10:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    izmenaPredmeta = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 11:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    brisanjePredmeta = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 12:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    administracija = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 13:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    pregledIzvestaja = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 14:
                                napomena = element.Vrednost;
                                break;
                            case 15:
                                lozinka = element.Vrednost;
                                break;
                            case 16:
                                novaLozinka = element.Vrednost;
                                break;
                            case 17:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    samoSvojePredmete = bool.Parse(element.Vrednost);
                                }
                                break;
                            case 18:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    idOrgana = short.Parse(element.Vrednost);
                                }
                                break;
                            case 19:
                                klase = element;
                                break;
                            case 20:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    maksimalniBrojPredmeta = short.Parse(element.Vrednost);
                                }
                                break;
                            case 21:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    maxBrojRezervisanihPredmeta = short.Parse(element.Vrednost);
                                }
                                break;
                            case 22:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    maksimalniBrojPredmetaGodine = short.Parse(element.Vrednost);
                                }
                                break;
                            case 23:
                                if (!string.IsNullOrEmpty(element.Vrednost))
                                {
                                    strogoPoverljivi = bool.Parse(element.Vrednost);
                                }
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(korisnickoIme))
                    {
                        throw new ApplicationException("Korisničko ime korisnika nije uneto.");
                    }

                    if (!string.IsNullOrEmpty(korisnickoIme) && korisnickoIme.Length > 50)
                    {
                        throw new ApplicationException("Korisničko ime korisnika ima više od 50 karaktera.");
                    }

                    if (string.IsNullOrEmpty(email))
                    {
                        throw new ApplicationException("Email korisnika nije unet.");
                    }

                    if (!string.IsNullOrEmpty(email) && email.Length > 200)
                    {
                        throw new ApplicationException("Email korisnika ima više od 200 karaktera.");
                    }

                    if (string.IsNullOrEmpty(telefon))
                    {
                        throw new ApplicationException("Telefon korisnika nije unet.");
                    }

                    if (!string.IsNullOrEmpty(telefon) && telefon.Length > 200)
                    {
                        throw new ApplicationException("Telefon korisnika ima više od 200 karaktera.");
                    }

                    if (string.IsNullOrEmpty(jmbg))
                    {
                        throw new ApplicationException("JMBG korisnika nije unet.");
                    }

                    if (!string.IsNullOrEmpty(jmbg) && jmbg.Length != 13)
                    {
                        throw new ApplicationException("Jmbg korisnika nema 13 karaktera.");
                    }

                    if (string.IsNullOrEmpty(imeIPrezime))
                    {
                        throw new ApplicationException("Ime i prezime korisnika nisu uneti.");
                    }

                    if (!string.IsNullOrEmpty(imeIPrezime) && imeIPrezime.Length > 200)
                    {
                        throw new ApplicationException("Ime i prezime korisnika ima više od 200 karaktera.");
                    }

                    if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                    {
                        throw new ApplicationException("Napomena kretanja predmeta ima više od 2000 karaktera.");
                    }

                    if (klase != null && klase.IzborniPodaci != null && idOkruga == null)
                    {
                        throw new ApplicationException("Okrug korisnika nije izabran.");
                    }

                    if (idElementa == null && string.IsNullOrEmpty(lozinka))
                    {
                        throw new ApplicationException("Lozinka korisnika nije uneta.");
                    }

                    if (string.IsNullOrEmpty(idElementa) && !string.IsNullOrEmpty(lozinka))
                    {
                        if (!(lozinka.Any(char.IsUpper) &&
                            lozinka.Any(char.IsLower) &&
                            lozinka.Any(char.IsDigit)))
                        {
                            throw new ApplicationException("Lozinka ne zadovoljava postavljena pravila kreiranja lozinke.<br> Lozinka korisnika mora sadržati bar jedno veliko slovo, jedno malo slovo i jedan broj.");
                        }
                    }

                    if (!string.IsNullOrEmpty(idElementa) && !string.IsNullOrEmpty(novaLozinka)){
                        if (!(novaLozinka.Any(char.IsUpper) &&
                            novaLozinka.Any(char.IsLower) &&
                            novaLozinka.Any(char.IsDigit)))
                        {
                            throw new ApplicationException("Lozinka ne zadovoljava postavljena pravila kreiranja lozinke.<br> Lozinka korisnika mora sadržati bar jedno veliko slovo, jedno malo slovo i jedan broj.");
                        }
                    }

                    byte[] novaLozinkaZaSnimanje = null;
                    byte[] lozinkaZaSnimanje = null;
                    if (idKorisnikaZaUnos != null)
                    {
                        novaLozinkaZaSnimanje = string.IsNullOrEmpty(novaLozinka) ? null : Konverzija.KonvertujULatinicu(novaLozinka).CalculateMd5Hash();
                    }
                    else
                    {
                        lozinkaZaSnimanje = string.IsNullOrEmpty(lozinka) ? null : Konverzija.KonvertujULatinicu(lozinka).CalculateMd5Hash();
                    }

                    context.korisnik_SnimiKorisnika(ref idKorisnikaZaUnos, Konverzija.KonvertujULatinicu(korisnickoIme).SrediZaSnimanje(50), inspektor, idOkruga, unosNovogPredmeta, dozvolaRezervisanja,
                        izmenaPredmeta, brisanjePredmeta, administracija, pregledIzvestaja, Konverzija.KonvertujULatinicu(email).SrediZaSnimanje(200), telefon.SrediZaSnimanje(200), jmbg.SrediZaSnimanje(13),
                        Konverzija.KonvertujULatinicu(imeIPrezime).SrediZaSnimanje(200), Konverzija.KonvertujULatinicu(napomena).SrediZaSnimanje(2000), aktivan, korisnik.IdKorisnika,
                        lozinkaZaSnimanje, novaLozinkaZaSnimanje, samoSvojePredmete, idOrgana, maksimalniBrojPredmeta, maxBrojRezervisanihPredmeta, maksimalniBrojPredmetaGodine, strogoPoverljivi);
                    noviElement.IdElementa = string.Format(@"{0}", idKorisnikaZaUnos);
                    noviElement.Naziv = Konverzija.VratiString(korisnik.Jezik, korisnickoIme);
                    noviElement.Aktivan = aktivan;
                    noviElement.DozvoljenoDodavanje = false;
                    noviElement.DozvoljenaIzmena = true;
                    noviElement.IdNadredjenogElementa = null;

                    //if (inspektor)
                    //{
                    //    context.klase_insp_ObrisiKlaseInspektora(idKorisnikaZaUnos);

                    //    if (idOkruga != null && idOrgana != null)
                    //    {
                    //        if (klase.Count > 0)
                    //        {
                    //            foreach (var klasaInspektora in klase)
                    //            {
                    //                context.klase_insp_SnimiKlasuInspektora(idKorisnikaZaUnos, idOkruga, idOrgana, Int16.Parse(klasaInspektora.IdPodatka));
                    //            }
                    //        }
                    //    }
                    //}

                    // tipovi dokumenata
                    context.klase_insp_ObrisiKlaseInspektora(idKorisnikaZaUnos);
                    if (klase != null && klase.IzborniPodaci != null)
                    {
                        foreach (var izabran in klase.IzborniPodaci)
                        {
                            if (izabran != null && izabran.Izabran)
                            {
                                var kljucevi = izabran.IdPodatka.Split('-');
                                if (kljucevi.Length == 2)
                                {
                                    var idOrganaKlase = short.Parse(kljucevi[0]);
                                    var idKlaseZaSnimanje = short.Parse(kljucevi[1]);

                                    context.klase_insp_SnimiKlasuInspektora(idKorisnikaZaUnos, idOkruga, idOrganaKlase, idKlaseZaSnimanje);
                                }
                            }
                        }
                    }

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
            return false;
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
            if (string.IsNullOrEmpty(kriterijum1))
            {
                return new List<PodaciZaIzbor>();
            }

            using (var context = DmsData.GetContext())
            {
                int? idInspektora = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    idInspektora = int.Parse(idElementa);
                }

                short? idOkruga = null;

                if (korisnik.IdOkruga == null)
                {
                    if (!string.IsNullOrEmpty(kriterijum2))
                    {
                        idOkruga = short.Parse(kriterijum2.Split('-')[0]);
                    }
                }
                else
                {
                    idOkruga = korisnik.IdOkruga;
                }

                return context.klase_insp_VratiKlaseInspektora(idOkruga, idInspektora).Select(k => new PodaciZaIzbor
                {
                    IdPodatka = string.Format(@"{0}", k.IdKlase),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", k.Oznaka, k.Naziv)),
                    Izabran = k.Izabran != null && (bool) k.Izabran
                }).ToList();
            }
        }

        public List<PodatakElementaSifarnika> VratiZavisnePodatkeElementa(string idElementa, string idElementaPodatka, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return null;
        }
    }
}
