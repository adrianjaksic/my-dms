using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using DmsCore.Data;
using DmsCore.Dms;
using DmsCore.Helperi;
using DmsCore.Izvestaji;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.Predmeti
{
    public static class PredmetiData
    {
        #region Unos, Izmena i Rezervisanje predmeta

        public static PredmetViewModel VratiPredmetViewModel(UlogovaniKorisnik korisnik, long? idPredmeta)
        {
            using (var context = DmsData.GetContext())
            {
                if (idPredmeta != null)
                {
                    var predmet = VratiPredmet(korisnik, (long) idPredmeta);

                    if (predmet != null && predmet.StrogoPoverljiv && !korisnik.StrogoPoverljivi)
                    {
                        throw new Exception(Konverzija.VratiString(korisnik.Jezik, "Izabrani predmet je označen kao strogo poverljiv. Samo korisnici koji mogu da pregledaju strogo poverljive predmete mogu pregledati izabrani predmet."));
                    }

                    if (predmet != null)
                    {
                        return new PredmetViewModel
                        {
                            Predmet = predmet,
                            Datum = predmet.VremeKreiranja,
                            DozvoljenoMenjanjeDatuma = DmsData.PromenaDatumaDozvoljena,
                            Okrug = context.okrug_VratiOkruge(predmet.IdOkruga, true).Select(okrug => new Element
                            {
                                IdElementa = string.Format(@"{0}", okrug.IdOkruga),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", okrug.Oznaka, okrug.Naziv))
                            }).SingleOrDefault(),
                            Organi = context.organ_VratiOrgane(predmet.IdOrgana, true).Select(organ => new Element
                            {
                                IdElementa = string.Format(@"{0}", organ.IdOrgana),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                            }).ToList(),
                            Klase = context.klasa_VratiKlaseInspektora(predmet.IdOkruga, predmet.IdOrgana, null, true, korisnik.IdKorisnika).Select(klasa => new Element
                            {
                                IdElementa = string.Format(@"{0}", klasa.IdKlase),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", klasa.Oznaka, klasa.Naziv))
                            }).ToList(),
                            Jedinice = context.jedinica_VratiJedinice(predmet.IdOrgana, null, true).Select(jed => new Element
                            {
                                IdElementa = string.Format(@"{0}", jed.IdJedinice),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", jed.Oznaka, jed.Naziv))
                            }).ToList(),
                            Takse = context.taksa_VratiTakse(null, true).Select(taksa => new Element
                            {
                                IdElementa = string.Format(@"{0}", taksa.IdTakse),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, taksa.Naziv)
                            }).ToList(),
                            VrstePredmeta = context.vrsta_pred_VratiVrstePredmeta(null, true).Select(vrstaPredmeta => new Element
                            {
                                IdElementa = string.Format(@"{0}", vrstaPredmeta.IdVrstePredmeta),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", vrstaPredmeta.Oznaka, vrstaPredmeta.Naziv)),
                                Rok = vrstaPredmeta.Rok
                            }).ToList(),
                            Inspektori = context.korisnik_VratiInspektore(korisnik.IdOkruga, idPredmeta).Select(ins => new Element
                            {
                                IdElementa = string.Format(@"{0}", ins.IdKorisnika),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0} ({1})", ins.ImeIPrezime, ins.KorisnickoIme))
                            }).ToList(),
                            VrsteKretanjaPredmeta = context.kret_pred_VratiKretanjaPredmeta(null, true).Select(kret => new Element
                            {
                                IdElementa = string.Format(@"{0}", kret.IdKretanjaPredmeta),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", kret.Oznaka, kret.Naziv)),
                                UnosRoka = kret.UnosRoka
                            }).ToList(),
                            Precice = context.precica_VratiPreciceKorisnika(korisnik.IdKorisnika).Select(prec => new Element
                            {
                                IdElementa = string.Format(@"{0}", prec.Tekst.SrediZaSnimanje(50)),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, prec.Tekst)
                            }).ToList(),
                            Opstine = context.opstina_VratiOpstine(predmet.IdOkruga, null, true).Select(op => new Element
                            {
                                IdElementa = string.Format(@"{0}", op.IdOpstine),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, op.Naziv)
                            }).ToList(),
                            Mesta = predmet.IdOpstine != null ? context.mesta_VratiMesta(korisnik.IdOkruga, predmet.IdOpstine, null, true).Select(m => new Element
                            {
                                IdElementa = string.Format(@"{0}", m.IdMesta),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, m.Naziv)
                            }).ToList() : new List<Element>()
                        }; 
                    }
                    
                }

                return new PredmetViewModel
                {
                    Datum = DateTime.Now,
                    DozvoljenoMenjanjeDatuma = DmsData.PromenaDatumaDozvoljena,
                    Okrug = context.okrug_VratiOkruge(korisnik.IdOkruga, true).Select(okrug => new Element
                    {
                        IdElementa = string.Format(@"{0}", okrug.IdOkruga),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", okrug.Oznaka, okrug.Naziv))
                    }).SingleOrDefault(),
                    Organi = context.organ_VratiOrgane(null, true).Select(organ => new Element
                    {
                        IdElementa = string.Format(@"{0}", organ.IdOrgana),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                    }).ToList(),
                    Takse = context.taksa_VratiTakse(null, true).Select(taksa => new Element
                    {
                        IdElementa = string.Format(@"{0}", taksa.IdTakse),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, taksa.Naziv)
                    }).ToList(),
                    VrstePredmeta = context.vrsta_pred_VratiVrstePredmeta(null, true).Select(vrstaPredmeta => new Element
                    {
                        IdElementa = string.Format(@"{0}", vrstaPredmeta.IdVrstePredmeta),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", vrstaPredmeta.Oznaka, vrstaPredmeta.Naziv)),
                        Rok = vrstaPredmeta.Rok
                    }).ToList(),
                    Inspektori = context.korisnik_VratiInspektore(korisnik.IdOkruga, idPredmeta).Select(ins => new Element
                    {
                        IdElementa = string.Format(@"{0}", ins.IdKorisnika),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0} ({1})", ins.ImeIPrezime, ins.KorisnickoIme))
                    }).ToList(),
                    Precice = context.precica_VratiPreciceKorisnika(korisnik.IdKorisnika).Select(prec => new Element
                    {
                        IdElementa = string.Format(@"{0}", prec.Tekst.SrediZaSnimanje(50)),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, prec.Tekst)
                    }).ToList(),
                    Opstine = context.opstina_VratiOpstine(korisnik.IdOkruga, null, true).Select(op => new Element
                    {
                        IdElementa = string.Format(@"{0}", op.IdOpstine),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, op.Naziv)
                    }).ToList()
                };
            }
        }

        public static string VratiNazivStatusa(string jezik, char status, bool imaNadredjeni)
        {
            if (status == 'R')
            {
                return Konverzija.VratiString(jezik, "Rezervisan");
            }
            else if (status == 'O')
            {
                return Konverzija.VratiString(jezik, "Aktivan");
            }
            else if (status == 'B')
            {
                return Konverzija.VratiString(jezik, "Obrisan");
            }
            else if (status == 'D')
            {
                return Konverzija.VratiString(jezik, "U rokovniku");
            }
            else if (status == 'Z')
            {
                return Konverzija.VratiString(jezik, "Arhiviran");
            }
            else if (status == 'P')
            {
                return Konverzija.VratiString(jezik, "Prezaveden");
            }
            else if (status == 'E')
            {
                return Konverzija.VratiString(jezik, "Prezaveden-Arhiviran");
            }
            return Konverzija.VratiString(jezik, "Nepoznat");
        }

        private static Predmet VratiPredmet(UlogovaniKorisnik korisnik, long idPredmeta)
        {
            // upisivanje loga - pregleda predmeta u aktivnosti
            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    context.predmet_SnimiAktivnostPredmeta(idPredmeta, korisnik.IdKorisnika, "Pregled predmeta.");

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
            }

            using (var context = DmsData.GetContext())
            {
                var p = context.predmet_VratiPredmet(idPredmeta).Select(predmet => new Predmet
                {
                    IdPredmeta = predmet.IdPredmeta,
                    BrojPredmeta = predmet.BrojPredmeta,
                    IdJedinice = predmet.IdJedinice,
                    IdKlase = predmet.IdKlase,
                    IdKreator = predmet.IdKreatora,
                    IdOkruga = predmet.IdOkruga,
                    IdOrgana = predmet.IdOrgana,
                    IdTakse = predmet.IdTakse,
                    IdVrstePredmeta = predmet.IdVrstePredmeta,
                    NazivVrstePredmeta = string.Format(@"{0}-{1}", predmet.OznakaVrstePredmeta, predmet.NazivVrstePredmeta),
                    IdInspektora = predmet.IdInspektora,
                    NazivInspektora = predmet.NazivInspektora,
                    Podnosilac = predmet.Podnosilac,
                    PodnosilacJedinstveniBroj = predmet.PodnosilacJedinstveniBroj,
                    LiceKontrole = predmet.LiceKontrole,
                    LiceKontroleJedinstveniBroj = predmet.LiceKontroleJedinstveniBroj,
                    Napomena = predmet.Napomena,
                    PodnosilacJeInspektor = predmet.PodnosilacJeInspektor,
                    Prilog = predmet.Prilog,
                    PutanjaArhiviranjaDokumenata = predmet.PutanjaArhiviranjaDokumenata,
                    Sadrzaj = predmet.Sadrzaj,
                    Status = predmet.Status,
                    NazivStatusa = VratiNazivStatusa(korisnik.Jezik, predmet.Status, predmet.IdNadredjenogPredmeta.HasValue),
                    StraniBroj = predmet.StraniBroj,
                    VremeRezervacije = predmet.VremeRezervacije,
                    VremeKreiranja = predmet.VremeKreiranja,
                    StvarnoVremeKreiranja = predmet.StvarnoVremeKreiranja,
                    NazivOkruga = string.Format(@"{0}-{1}", predmet.OznakaOkruga, predmet.NazivOkruga),
                    OznakaOkruga = predmet.OznakaOkruga,
                    OznakaKlase = predmet.OznakaKlase,
                    OznakaOrgana = predmet.OznakaOrgana,
                    OznakaJedinice = predmet.OznakaJedinice,
                    NazivKreatora = predmet.NazivKreatora,
                    Godina = predmet.Godina.GetValueOrDefault(),
                    IdOpstine = predmet.IdOpstine,
                    NazivOpstine = predmet.NazivOpstine,
                    IdNadredjenogPredmeta = predmet.IdNadredjenogPredmeta,
                    IdMesta = predmet.IdMesta,
                    NazivMesta = predmet.NazivMesta,
                    StrogoPoverljiv = predmet.StrogoPoverljiv.GetValueOrDefault(),
                }).SingleOrDefault();

                if (p != null)
                {
                    p.Istorija = context.istorija_VratiIstorijuPredmeta(idPredmeta, null, korisnik.IdKorisnika).Select(i => new IstorijaPredmeta
                    {
                        Vreme = i.Vreme,
                        Korisnik = i.NazivKorisnika,
                        Napomena = i.Napomena,
                        Opis = i.Opis,
                        Obrisao = i.Obrisao,
                        DatumBrisanja = i.DatumBrisanja
                    }).ToList();

                    p.Kretanje = context.istorija_VratiIstorijuPredmeta(idPredmeta, true, korisnik.IdKorisnika).Select(i => new IstorijaPredmeta
                    {
                        Vreme = i.Vreme,
                        Korisnik = i.NazivKorisnika,
                        Napomena = i.Napomena,
                        Opis = i.Opis,
                        IdKretanja = i.IdKretanja,
                        DatumRoka = i.DatumRoka
                    }).ToList();

                    p.DMS = new DMSPredmeta
                    {
                        IdPredmeta = idPredmeta,
                        DozvoljeneEkstenzije = DMSData.ContentTypes.Keys.ToList(),
                        // Dokumenti = DMSData.VratiDokumentePredmeta(korisnik, idPredmeta), ovo ce se pozivati svaki put kad se klikne na tab
                        DozvoljenoVracanjeObrisanog = korisnik.Administracija,
                        MaksimalnaVelicina = 1024 * 100 // 100 mb
                    };

                    if (p.IdNadredjenogPredmeta.HasValue)
                    {
                        var pred = context.predmet_VratiBrojPredmeta(p.IdNadredjenogPredmeta).SingleOrDefault();

                        if (pred != null)
                        {
                            p.BrojNadredjenogPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", pred.OznakaOkruga, pred.OznakaOrgana,
                                          pred.OznakaKlase,
                                          string.Format(@"{0}", pred.BrojPredmeta).PadLeft(6, '0'),
                                          pred.Godina.GetValueOrDefault(), pred.OznakaJedinice);
                        }
                    }

                    p.PovezaniPredmeti =
                        context.predmet_VratiPovezanePredmete(p.IdPredmeta).Select(x => new PovezaniPredmet
                            {
                                IdPredmeta = x.IdPredmeta,
                                BrojPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", x.OznakaOkruga, x.OznakaOrgana,
                                                             x.OznakaKlase,
                                                             string.Format(@"{0}", x.BrojPredmeta).PadLeft(6, '0'),
                                                             x.Godina.GetValueOrDefault(), x.OznakaJedinice)
                            }).ToList();

                    return p;
                }

                return null;
            }
        }

        public static List<Element> VratiMestaOpstine(UlogovaniKorisnik korisnik, short idOpstine)
        {
            using (var context = DmsData.GetContext())
            {
                return context.mesta_VratiMesta(korisnik.IdOkruga, idOpstine, null, true).Select(m => new Element
                {
                    IdElementa = string.Format(@"{0}", m.IdMesta),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, m.Naziv)
                }).ToList();
            }
        }

        public static List<Element> VratiKlaseOrgana(UlogovaniKorisnik korisnik, short idOrgana)
        {
            using (var context = DmsData.GetContext())
            {
                return context.klasa_VratiKlaseInspektora(korisnik.IdOkruga, idOrgana, null, true, korisnik.IdKorisnika).Select(k => new Element
                {
                    IdElementa = string.Format(@"{0}", k.IdKlase),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", k.Oznaka, k.Naziv))
                }).ToList();
            }
        }

        public static List<Element> VratiJediniceOrgana(UlogovaniKorisnik korisnik, short idOrgana)
        {
            using (var context = DmsData.GetContext())
            {
                return context.jedinica_VratiJedinice(idOrgana, null, true).Select(j => new Element
                {
                    IdElementa = string.Format(@"{0}", j.IdJedinice),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", j.Oznaka, j.Naziv)),
                }).ToList();
            }
        }

        public static PregledRezervacijaZaglavlje SnimiPredmet(UlogovaniKorisnik korisnik, short tipDokumenta, Predmet predmet, short? kolicina)
        {
            var zaglavlje = new PregledRezervacijaZaglavlje {RezervisaniBrojevi = new List<Element>()};
            
            long? idPredmetaZaUcitavanje = null;
            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                   
                    if (tipDokumenta == 2)
                    {
                        if (kolicina != null)
                        {
                            if (kolicina > 100)
                            {
                                throw new ApplicationException("Maksimalni broj predmeta za rezervaciju je 100.");
                            }

                            if (korisnik.DozvolaRezervisanja)
                            {
                                long? idPredmeta = null;
                                var elementi = context.predmet_RezervacijaPredmeta(ref idPredmeta, predmet.IdOkruga, predmet.IdOrgana,
                                    predmet.IdKlase, predmet.IdJedinice,
                                    predmet.PodnosilacJeInspektor,
                                    predmet.IdVrstePredmeta, predmet.IdInspektora,
                                    Konverzija.KonvertujULatinicu(predmet.Prilog.SrediZaSnimanje(200)),
                                    Konverzija.KonvertujULatinicu(predmet.Sadrzaj.SrediZaSnimanje(2000)),
                                    predmet.IdTakse,
                                    Konverzija.KonvertujULatinicu(predmet.StraniBroj), null, korisnik.IdKorisnika,
                                    Konverzija.KonvertujULatinicu(predmet.Podnosilac.SrediZaSnimanje(300)),
                                    Konverzija.KonvertujULatinicu(predmet.PodnosilacJedinstveniBroj.SrediZaSnimanje(30)),
                                    Konverzija.KonvertujULatinicu(predmet.LiceKontroleJedinstveniBroj.SrediZaSnimanje(30)),
                                    Konverzija.KonvertujULatinicu(predmet.LiceKontrole.SrediZaSnimanje(300)),
                                    predmet.IdOpstine,
                                    predmet.IdMesta, predmet.VremeKreiranja, kolicina).Select(x => new Element
                                    {
                                        IdElementa = string.Format(@"{0}", x.IdPredmeta),
                                        Naziv = x.BrojPredmeta
                                    }).ToList();

                                if (elementi.Count > 0)
                                {
                                    idPredmetaZaUcitavanje = idPredmeta;
                                    zaglavlje.RezervisaniBrojevi.AddRange(elementi);
                                }
                            }
                        }
                    }
                    else
                    {
                        if ((predmet.IdPredmeta != null && korisnik.IzmenaPredmeta) || (predmet.IdPredmeta == null && korisnik.UnosNovogPredmeta))
                        {
                            idPredmetaZaUcitavanje = predmet.IdPredmeta;
                            var brojPredmeta =
                                context.predmet_SnimiPredmet(ref idPredmetaZaUcitavanje, predmet.IdOkruga, predmet.IdOrgana,
                                                             predmet.IdKlase, predmet.IdJedinice,
                                                             predmet.PodnosilacJeInspektor,
                                                             predmet.IdVrstePredmeta, predmet.IdInspektora,
                                                             Konverzija.KonvertujULatinicu(predmet.Prilog.SrediZaSnimanje(200)),
                                                             Konverzija.KonvertujULatinicu(predmet.Sadrzaj.SrediZaSnimanje(2000)), predmet.IdTakse, Konverzija.KonvertujULatinicu(predmet.StraniBroj),
                                                             null, false, korisnik.IdKorisnika,
                                                             Konverzija.KonvertujULatinicu(predmet.Podnosilac.SrediZaSnimanje(300)),
                                                             Konverzija.KonvertujULatinicu(predmet.PodnosilacJedinstveniBroj.SrediZaSnimanje(30)),
                                                             Konverzija.KonvertujULatinicu(predmet.LiceKontroleJedinstveniBroj.SrediZaSnimanje(30)),
                                                             Konverzija.KonvertujULatinicu(predmet.LiceKontrole.SrediZaSnimanje(300)), predmet.IdOpstine, 
                                                             predmet.IdNadredjenogPredmeta, predmet.IdMesta, predmet.VremeKreiranja, korisnik.StrogoPoverljivi && predmet.StrogoPoverljiv)
                                       .Select(a => a.BrojPredmeta)
                                       .Single();
                            var element = new Element
                            {
                                IdElementa = string.Format(@"{0}", idPredmetaZaUcitavanje),
                                Naziv = string.Format(@"{0}", brojPredmeta)
                            };

                            zaglavlje.RezervisaniBrojevi.Add(element);
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
            }

            if (zaglavlje.Predmet == null && idPredmetaZaUcitavanje != null)
            {
                zaglavlje.Predmet = VratiPredmet(korisnik, idPredmetaZaUcitavanje.GetValueOrDefault());
            }

            return zaglavlje;
        }

        public static void ObrisiPredmete(UlogovaniKorisnik korisnik, List<long> predmeti, string razlogBrisanja)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    if (korisnik.BrisanjePredmeta && (predmeti != null && predmeti.Count > 0))
                    {
                        foreach (var idPredmeta in predmeti)
                        {
                            context.predmet_ObrisiPredmet(idPredmeta, korisnik.IdKorisnika, razlogBrisanja.SrediZaSnimanje(2000));
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
            }
        }

        public static Predmet VratiInfoOPredmetu(UlogovaniKorisnik korisnik, long idPredmeta)
        {
            return VratiPredmet(korisnik, idPredmeta);
        }

        public static IstorijaPredmeta SnimiIstorijuPredmeta(UlogovaniKorisnik korisnik, long idPredmeta, short vrstaKretanja, string napomena, DateTime? datumRoka)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                short? idKretanja = null;
                var istorija = new IstorijaPredmeta();
                try
                {
                    if (!string.IsNullOrEmpty(napomena) && napomena.Length > 2000)
                    {
                        throw new ApplicationException("Napomena kretanja predmeta ima više od 2000 karaktera.");
                    }

                    if (korisnik.IzmenaPredmeta && korisnik.IdOkruga != null)
                    {
                        idKretanja = context.istorija_SnimiKretanjePredmeta(idPredmeta, korisnik.IdKorisnika, vrstaKretanja, Konverzija.KonvertujULatinicu(napomena), datumRoka).Single().IdKretanja;
                    }

                    istorija.Korisnik = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0} ({1})", korisnik.KorisnickoIme,korisnik.ImeIPrezime));
                    istorija.Napomena = napomena;
                    istorija.Vreme = DateTime.Now;
                    istorija.IdKretanja = idKretanja.GetValueOrDefault();
                    istorija.DatumRoka = datumRoka;

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

                istorija.Status = VratiPredmet(korisnik, idPredmeta).NazivStatusa;
                return istorija;
            }
        }

        public static void ObrisiKretanjePredmeta(UlogovaniKorisnik korisnik, long idPredmeta, short idKretanja)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    context.istorija_ObrisiKretanjePredmeta(idPredmeta, idKretanja, korisnik.IdKorisnika);

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
            }
        }

        public static List<IstorijaPredmeta> VratiIstorijuPredmeta(UlogovaniKorisnik korisnik, long idPredmeta, bool? kretanje)
        {
            using (var context = DmsData.GetContext())
            {
                return context.istorija_VratiIstorijuPredmeta(idPredmeta, kretanje, korisnik.IdKorisnika).Select(i => new IstorijaPredmeta
                {
                    Vreme = i.Vreme,
                    Korisnik = i.NazivKorisnika,
                    Napomena = i.Napomena,
                    Opis = i.Opis,
                    Obrisao = i.Obrisao,
                    DatumBrisanja = i.DatumBrisanja
                }).ToList();}
        }

        public static List<ArhiviranPredmet> ArhivirajPredmete(UlogovaniKorisnik korisnik, List<long> predmeti, List<Element> aktovi, string napomena)
        {
            //listu predmeta Id, Broj, Napomena
            var arhiviraniPredmeti = new List<ArhiviranPredmet>();

            if (predmeti != null && predmeti.Count > 0)
            {
                var aktoviNapomena = string.Empty;
                if (aktovi != null && aktovi.Count > 0)
                {
                    aktoviNapomena = aktovi.Aggregate(aktoviNapomena, (current, akt) => current + (akt.IdElementa + ","));
                }

                var novaNapomena = string.Format(@"{0} {1}", aktoviNapomena.TrimEnd(','), napomena);
                foreach (var idPredmeta in predmeti)
                {
                    using (var context = DmsData.GetContextWithTransaction())
                    {
                        try
                        {
                            var predmet = context.predmet_ArhivirajPredmet(idPredmeta, korisnik.IdKorisnika, novaNapomena.SrediZaSnimanje(2000)).Single();
                            context.Transaction.Commit();
                            //dodati u listu uspesnih (bez napomene, null)
                            arhiviraniPredmeti.Add(new ArhiviranPredmet
                            {
                                IdPredmeta = idPredmeta,
                                BrojPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", predmet.OznakaOkruga, predmet.OznakaOrgana,
                                                             predmet.OznakaKlase, string.Format(@"{0}", predmet.BrojPredmeta).PadLeft(6, '0'),
                                                             predmet.Godina.GetValueOrDefault(), predmet.OznakaJedinice),
                                Arhiviran = true,
                            });
                        }
                        catch (Exception exc)
                        {
                            context.Transaction.Rollback();
                            arhiviraniPredmeti.Add(new ArhiviranPredmet
                            {
                                IdPredmeta = idPredmeta,
                                Napomena = exc.Message,
                                Arhiviran = false,
                            });
                        }
                        finally
                        {
                            context.Connection.Close();
                        }
                    }
                }
            }

            return arhiviraniPredmeti;
        }

        public static bool PredmetPripadaKlasiInspektora(long? idPredmeta, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.predmet_PredmetPripadaKlasiInspektora(idPredmeta, korisnik.IdKorisnika).Single().Pripada.GetValueOrDefault();
            }
        }

        public static int VratiSledeciSlobodanBrojPredmeta(UlogovaniKorisnik korisnik, short idOrgana, short idKlase)
        {
            using (var context = DmsData.GetContext())
            {
                return context.predmet_VratiSledeciSlobodanBrojPredmeta(korisnik.IdOkruga, idOrgana, idKlase).Select(b => b.SledeciBroj).SingleOrDefault();
            }
        }

        public static void SnimiAktivnostPredmeta(UlogovaniKorisnik korisnik, long idPredmeta, string naziv)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    context.predmet_SnimiAktivnostPredmeta(idPredmeta, korisnik.IdKorisnika, string.Format(@"Pregled dokumenta predmeta sa nazivom: {0}.", naziv));

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
            }
        }

        public static void AktivirajPredmet(UlogovaniKorisnik korisnik, long idPredmeta)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    context.predmet_AktivirajPredmet(idPredmeta, korisnik.IdKorisnika);

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
            }
        }

        public static long? VratiIdPredmetaPrekoBroja(UlogovaniKorisnik korisnik, string brojPredmeta)
        {
            brojPredmeta = brojPredmeta.SrediZaPretragu();
            if (brojPredmeta != null)
            {
                using (var context = DmsData.GetContext())
                {
                    long? id = context.predmet_VratiIdPredmetaPrekoBroja(brojPredmeta).Select(b => b.IdPredmeta).SingleOrDefault();
                    if (id == 0)
                    {
                        return null;
                    }
                    return id;
                }
            }
            return null;
        }

        #endregion

        #region Prijava greske

        public static void PrijaviGresku(UlogovaniKorisnik korisnik, string greska, string url)
        {
            if (string.IsNullOrEmpty(greska))
            {
                throw new ApplicationException("Opis greške nije unet.");
            }

            using (var context = DmsData.GetContext())
            {
                context.korisnik_PrijaviGresku(korisnik.IdKorisnika, greska, url);
            }

            SendTicket(korisnik, greska, url);
        }

        public static void SendTicket(UlogovaniKorisnik korisnik, string description, string url)
        {
            string tempjiraUrl;
            if (DmsData.JiraUrl.Split(':')[0] == "http")
            {
                tempjiraUrl = DmsData.JiraUrl + "/rest/api/latest/issue";
            }
            else
            {
                tempjiraUrl = "http://" + DmsData.JiraUrl + "/rest/api/latest/issue";

            }
            var request = (HttpWebRequest)WebRequest.Create(tempjiraUrl);
            
            var naslov = string.Format("{0} - Prijava greške korisnika {1}", DmsData.Naziv, korisnik.KorisnickoIme);
            var nazivFirme = string.Format("{0}", DmsData.Naziv);

            request.Method = "POST";
            request.ContentType = "application/json;";

            var username = DmsData.JiraUsername;
            var password = DmsData.JiraPassword;

            var byteCredentials = Encoding.UTF8.GetBytes(string.Format(@"{0}:{1}", username, password));
            var base64Credentials = Convert.ToBase64String(byteCredentials);

            request.Headers.Add("Authorization", "Basic " + base64Credentials);

            request.Method = "POST";
            request.ContentType = "application/json;";

            using (var streamWriter = new StreamWriter(request.GetRequestStream()))
            {
                var opis = description.Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t").Replace("\"", string.Empty).Replace("'", string.Empty) + "\\n" + "Transakcija: " + url;

                var json = "{\"fields\": {\"project\": {\"key\": \"PISARNICA\"},\"summary\": \"" + naslov + "\",\"issuetype\": {\"name\": \"Bug\"},\"description\": \"" + opis + "\", \"customfield_10000\": \"" + nazivFirme + "\"}}";

                streamWriter.Write(json);
                streamWriter.Flush();
                streamWriter.Close();

                var httpResponse = (HttpWebResponse)request.GetResponse();
            }
        }

        #endregion
    }
}
