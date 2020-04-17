using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;
using DmsCore.Pretrage.PretrageObrisanih;

namespace DmsCore.Pretrage
{
    public static class PretrageData
    {
        public static PretragaPredmetaViewModel VratiPretrageViewModel(UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                var vm =  new PretragaPredmetaViewModel
                {
                    Okruzi = context.okrug_VratiOkruge(korisnik.IdOkruga, null).Select(okrug => new Element
                    {
                        IdElementa = string.Format(@"{0}", okrug.IdOkruga),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", okrug.Oznaka, okrug.Naziv))
                    }).ToList(),
                    Organi = korisnik.Inspektor ? context.organ_VratiOrganeInspektora(null, null, korisnik.IdKorisnika).Select(organ => new Element
                    {
                        IdElementa = string.Format(@"{0}", organ.IdOrgana),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                    }).ToList() : context.organ_VratiOrgane(null, null).Select(organ => new Element
                    {
                        IdElementa = string.Format(@"{0}", organ.IdOrgana),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                    }).ToList(),
                    Klase = context.klasa_VratiSveKlaseInspektora(korisnik.IdOkruga, korisnik.IdKorisnika).Select(klasa => new Element
                    {
                        IdElementa = klasa.Oznaka,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", klasa.Oznaka, klasa.Naziv))
                    }).ToList(),
                    Jedinice = context.jedinica_VratiSveJedinice().Select(jedinica => new Element
                    {
                        IdElementa = jedinica.Oznaka,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", jedinica.Oznaka, jedinica.Naziv))
                    }).ToList(),
                    Takse = context.taksa_VratiTakse(null, null).Select(taksa => new Element
                    {
                        IdElementa = string.Format(@"{0}", taksa.IdTakse),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, taksa.Naziv)
                    }).ToList(),
                    VrstePredmeta = context.vrsta_pred_VratiVrstePredmeta(null, null).Select(vrstaPredmeta => new Element
                    {
                        IdElementa = string.Format(@"{0}", vrstaPredmeta.IdVrstePredmeta),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", vrstaPredmeta.Oznaka, vrstaPredmeta.Naziv))
                    }).ToList(),
                    KretanjaPredmeta = context.kret_pred_VratiKretanjaPredmeta(null, null).Select(vrstaKretanja => new Element
                    {
                        IdElementa = string.Format(@"{0}", vrstaKretanja.IdKretanjaPredmeta),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, vrstaKretanja.Naziv)
                    }).ToList(),
                    Godine = context.predmet_VratiGodine().Select(god => new Element
                    {
                        IdElementa = string.Format(@"{0}", god.Godina),
                        Naziv = string.Format(@"{0}", god.Godina)
                    }).ToList(),
                    Inspektori = korisnik.IdOkruga != null ? context.korisnik_VratiInspektore(korisnik.IdOkruga, null).Select(ins => new Element
                    {
                        IdElementa = string.Format(@"{0}", ins.IdKorisnika),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0} ({1})", ins.ImeIPrezime, ins.KorisnickoIme))
                    }).ToList() : null,
                    Statusi = PretragaPredmetaViewModel.VratiStatuse(korisnik),
                    BrisanjePredmeta = korisnik.BrisanjePredmeta,
                    RazvodjenjeAkata = PretragaPredmetaViewModel.VratiRazvodjenjeAkata(korisnik),
                    RazvodjenjeAkata2 = PretragaPredmetaViewModel.VratiRazvodjenjeAkata2(korisnik),
                    Opstine = korisnik.IdOkruga != null ? context.opstina_VratiOpstine(korisnik.IdOkruga, null, true).Select(op => new Element
                    {
                        IdElementa = string.Format(@"{0}", op.IdOpstine),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, op.Naziv)
                    }).ToList() : null,
                };

                var godina = DateTime.Now.Year.ToString(CultureInfo.InvariantCulture);
                if (vm.Godine.All(g => g.IdElementa != godina))
                {
                    vm.Godine.Add(new Element
                        {
                            IdElementa = godina,
                            Naziv = godina
                        });
                    vm.Godine = vm.Godine.OrderBy(g => g.IdElementa).ToList();
                }

                return vm;
            }
        }

        public static List<Element> VratiKlase(UlogovaniKorisnik korisnik, short idOkruga, short idOrgana)
        {
            using (var context = DmsData.GetContext())
            {
                return context.klasa_VratiKlaseInspektora(idOkruga, idOrgana, null, true, korisnik.IdKorisnika).Select(klasa => new Element
                {
                    IdElementa = string.Format(@"{0}", klasa.IdKlase),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", klasa.Oznaka, klasa.Naziv))
                }).ToList();
            }
        }

        public static List<Element> VratiSveKlase(UlogovaniKorisnik korisnik, short idOkruga)
        {
            using (var context = DmsData.GetContext())
            {
                return context.klasa_VratiSveKlaseInspektora(idOkruga, korisnik.IdKorisnika).Select(klasa => new Element
                {
                    IdElementa = klasa.Oznaka,
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", klasa.Oznaka, klasa.Naziv))
                }).ToList();
            }
        }

        public static List<Element> VratiJedinice(UlogovaniKorisnik korisnik, short idOrgana)
        {
            using (var context = DmsData.GetContext())
            {
                return context.jedinica_VratiJedinice(idOrgana, null, true).Select(jedinica => new Element
                {
                    IdElementa = string.Format(@"{0}", jedinica.IdJedinice),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", jedinica.Oznaka, jedinica.Naziv))
                }).ToList();
            }
        }

        public static List<Element> VratiSveJedinice(UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.jedinica_VratiSveJedinice().Select(jedinica => new Element
                {
                    IdElementa = jedinica.Oznaka,
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", jedinica.Oznaka, jedinica.Naziv))
                }).ToList();
            }
        }

        public static List<Element> VratiOpstine(UlogovaniKorisnik korisnik, short idOkruga)
        {
            using (var context = DmsData.GetContext())
            {
                return context.opstina_VratiOpstine(idOkruga, null, true).Select(o => new Element
                {
                    IdElementa = string.Format(@"{0}", o.IdOpstine),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}", o.Naziv))
                }).ToList();
            }
        }

        public static List<Element> VratiMestaOpstine(UlogovaniKorisnik korisnik, short idOkruga, short idOpstine)
        {
            using (var context = DmsData.GetContext())
            {
                return context.mesta_VratiMesta(idOkruga, idOpstine, null, true).Select(m => new Element
                {
                    IdElementa = string.Format(@"{0}", m.IdMesta),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}", m.Naziv))
                }).ToList();
            }
        }

        public static List<Element> VratiInspektoreOkruga(UlogovaniKorisnik korisnik, short idOkruga)
        {
            using (var context = DmsData.GetContext())
            {
                return context.korisnik_VratiInspektore(idOkruga, null).Select(ins => new Element
                {
                    IdElementa = string.Format(@"{0}", ins.IdKorisnika),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", ins.ImeIPrezime, ins.KorisnickoIme))
                }).ToList();
            }
        }

        public static List<Predmet> VratiPredmetePretrage(UlogovaniKorisnik korisnik, ElementPretrage pretraga)
        {
            using (var context = DmsData.GetContext())
            {
                return context.pretraga_VratiPredmete(pretraga.IdOkruga, pretraga.IdOrgana, pretraga.IdKlase, pretraga.BrojPredmeta, pretraga.Godina,
                                                      pretraga.OdDatuma, pretraga.DoDatuma, pretraga.IdJedinice, pretraga.Status, pretraga.IdVrstePredmeta, pretraga.IdInspektora,
                                                      Konverzija.KonvertujULatinicu(pretraga.Podnosilac.SrediZaPretragu()), Konverzija.KonvertujULatinicu(pretraga.LiceKontrole.SrediZaPretragu()),
                                                      Konverzija.KonvertujULatinicu(pretraga.Sadrzaj.SrediZaPretragu()), pretraga.IdTakse, Konverzija.KonvertujULatinicu(pretraga.StraniBroj.SrediZaPretragu()),
                                                      pretraga.Rok, pretraga.PreRoka, pretraga.DatumKretanja, pretraga.IdKretanjaPredmeta, Konverzija.KonvertujULatinicu(pretraga.OpisKretanja.SrediZaPretragu()),
                                                      korisnik.IdKorisnika, pretraga.IdOpstine, pretraga.OznakaOrgana.SrediZaPretragu(3), pretraga.OznakaKlase.SrediZaPretragu(3),
                                                      pretraga.OznakaJedinice.SrediZaPretragu(3), pretraga.GledanjeDatumaKreiranja, pretraga.IdMestaOpstine, pretraga.RokCuvanja.SrediZaPretragu()).
                                                      Select(pred => new Predmet
                                                          {
                                                              IdVrstePredmeta = pred.IdVrstePredmeta,
                                                              IdPredmeta = pred.IdPredmeta,
                                                              Podnosilac = Konverzija.VratiString(korisnik.Jezik, pred.Podnosilac),
                                                              NazivInspektora = Konverzija.VratiString(korisnik.Jezik, pred.NazivInspektora),
                                                              Sadrzaj = Konverzija.VratiString(korisnik.Jezik, pred.Sadrzaj),
                                                              LiceKontrole = Konverzija.VratiString(korisnik.Jezik, pred.LiceKontrole),
                                                              SifraPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", pred.OznakaOkruga, pred.OznakaOrgana, pred.OznakaKlase,
                                                                                                string.Format(@"{0}", pred.BrojPredmeta).PadLeft(6, '0'), pred.Godina.GetValueOrDefault(), pred.OznakaJedinice)
                                                          }).ToList();
            }
        }

        #region Pretraga obrisanih

        public static PretragaObrisanihViewModel VratiPretragaObrisanihViewModel(UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return new PretragaObrisanihViewModel
                    {
                        Okruzi = context.okrug_VratiOkruge(korisnik.IdOkruga, null).Select(okrug => new Element
                        {
                            IdElementa = string.Format(@"{0}", okrug.IdOkruga),
                            Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", okrug.Oznaka, okrug.Naziv))
                        }).ToList(),
                        Organi = context.organ_VratiOrgane(null, null).Select(organ => new Element
                        {
                            IdElementa = string.Format(@"{0}", organ.IdOrgana),
                            Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                        }).ToList(),
                        Klase = context.klasa_VratiSveKlaseInspektora(korisnik.IdOkruga, korisnik.IdKorisnika).Select(klasa => new Element
                        {
                            IdElementa = klasa.Oznaka,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", klasa.Oznaka, klasa.Naziv))
                        }).ToList(),
                        Jedinice = context.jedinica_VratiSveJedinice().Select(jedinica => new Element
                        {
                            IdElementa = jedinica.Oznaka,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", jedinica.Oznaka, jedinica.Naziv))
                        }).ToList(),
                        Godine = context.predmet_VratiGodine().Select(god => new Element
                        {
                            IdElementa = string.Format(@"{0}", god.Godina),
                            Naziv = string.Format(@"{0}", god.Godina)
                        }).ToList(),
                    };
            }
        }

        public static List<Predmet> VratiObrisanePredmete(UlogovaniKorisnik korisnik, short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice)
        {
            using (var context = DmsData.GetContext())
            {
                return context.pretraga_VratiObrisanePredmete(idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina,
                                                             idJedinice, oznakaJedinice, korisnik.IdKorisnika)
                              .Select(pred => new Predmet
                              {
                                  IdPredmeta = pred.IdPredmeta,
                                  Podnosilac = Konverzija.VratiString(korisnik.Jezik, pred.Podnosilac),
                                  NazivInspektora = Konverzija.VratiString(korisnik.Jezik, pred.NazivInspektora),
                                  Sadrzaj = Konverzija.VratiString(korisnik.Jezik, pred.Sadrzaj),
                                  SifraPredmeta =
                                      string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", pred.OznakaOkruga, pred.OznakaOrgana,
                                                    pred.OznakaKlase,
                                                    string.Format(@"{0}", pred.BrojPredmeta).PadLeft(6, '0'),
                                                    pred.Godina.GetValueOrDefault(), pred.OznakaJedinice)
                              }).ToList();
            }
        }

        #endregion

        #region Pretraga - Rokovnik

        public static object VratiPredmeteRokovnika(UlogovaniKorisnik korisnik, short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice)
        {
            using (var context = DmsData.GetContext())
            {
                return context.pretraga_VratiPredmeteRokovnika(idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice, korisnik.IdKorisnika)
                              .Select(pred => new Predmet
                              {
                                  IdPredmeta = pred.IdPredmeta,
                                  Podnosilac = Konverzija.VratiString(korisnik.Jezik, pred.Podnosilac),
                                  NazivInspektora = Konverzija.VratiString(korisnik.Jezik, pred.NazivInspektora),
                                  Sadrzaj = Konverzija.VratiString(korisnik.Jezik, pred.Sadrzaj),
                                  SifraPredmeta =
                                      string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", pred.OznakaOkruga, pred.OznakaOrgana,
                                                    pred.OznakaKlase,
                                                    string.Format(@"{0}", pred.BrojPredmeta).PadLeft(6, '0'),
                                                    pred.Godina.GetValueOrDefault(), pred.OznakaJedinice)
                              }).ToList();
            }
        }

        #endregion
    }
}