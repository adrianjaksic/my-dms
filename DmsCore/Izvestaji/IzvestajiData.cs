using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using DevExpress.XtraPrinting;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;
using DmsCore.Pretrage;

namespace DmsCore.Izvestaji
{
    public static class IzvestajiData
    {
        public static IzvestajPredmetaViewModel VratiIzvestajPredmetaViewModel(UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                var vm = new IzvestajPredmetaViewModel
                {
                    Okruzi = context.okrug_VratiOkruge(korisnik.IdOkruga, true).Select(okrug => new Element
                    {
                        IdElementa = string.Format(@"{0}", okrug.IdOkruga),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", okrug.Oznaka, okrug.Naziv))
                    }).ToList(),
                    Organi = korisnik.Inspektor ? context.organ_VratiOrganeInspektora(null, true, korisnik.IdKorisnika).Select(organ => new Element
                    {
                        IdElementa = string.Format(@"{0}", organ.IdOrgana),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                    }).ToList() : context.organ_VratiOrgane(null, true).Select(organ => new Element
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
                    Takse = context.taksa_VratiTakse(null, true).Select(taksa => new Element{
                        IdElementa = string.Format(@"{0}", taksa.IdTakse),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, taksa.Naziv)
                    }).ToList(),
                    VrstePredmeta = context.vrsta_pred_VratiVrstePredmeta(null, true).Select(vrstaPredmeta => new Element
                    {
                        IdElementa = string.Format(@"{0}", vrstaPredmeta.IdVrstePredmeta),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", vrstaPredmeta.Oznaka, vrstaPredmeta.Naziv))
                    }).ToList(),
                    KretanjaPredmeta = context.kret_pred_VratiKretanjaPredmeta(null, true).Select(vrstaKretanja => new Element
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
                    Statusi = IzvestajPredmetaViewModel.VratiStatuse(korisnik),
                    Grupisanja = IzvestajPredmetaViewModel.VratiGrupisanja(korisnik),
                    Kreatori = context.korisnik_VratiKorisnike(null, true, korisnik.IdOkruga).Select(kr => new Element
                    {
                        IdElementa = string.Format(@"{0}", kr.IdKorisnika),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0} ({1})", kr.ImeIPrezime, kr.KorisnickoIme))
                    }).ToList(),
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
        
        public static List<DefinisanaStampa> VratiStampePredmeta(UlogovaniKorisnik korisnik, long idPredmeta)
        {
            var zaglavljeLat = VratiPodatkePredmetaZaglavlja(korisnik, idPredmeta, false);
			var zaglavljeCir = VratiPodatkePredmetaZaglavlja(korisnik, idPredmeta, true);

			var dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPredmet + zaglavljeLat.Status + "\\");

            var stampe = new List<DefinisanaStampa>();

            var guid = Guid.NewGuid().ToString();
            
            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa {Naziv = file.Name.TrimEnd(".repx".ToArray())};
                stampa.Link = string.Format("{0}/{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
                var report = new PredmetReport();
                report.LoadLayout(file.FullName);
				if (stampa.Naziv.Contains("RS-C"))
				{
					report.PostaviPodatke(zaglavljeCir);
				}
				else
				{
					report.PostaviPodatke(zaglavljeLat);
				}
                report.CreateDocument();
                if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
                {
                    Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
                }
                report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
                var opt = new XlsExportOptions {ShowGridLines = true};
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        }

        private static PredmetiZaglavlje VratiPodatkePredmetaZaglavlja(UlogovaniKorisnik korisnik, long idPredmeta, bool cirilica)
        {
            // upisivanje loga - pregleda predmeta u aktivnosti
            using (var context = DmsData.GetContextWithTransaction())
            {
                try
                {
                    context.predmet_SnimiAktivnostPredmeta(idPredmeta, korisnik.IdKorisnika, "Štampanje predmeta.");

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
			var jezik = "0";
			if (cirilica)
			{
				jezik = "1";
			}

            using (var context = DmsData.GetContext())
            {
                var zaglavlje = context.izvestaj_VratiDetaljePredmeta(idPredmeta).Select(p => new PredmetiZaglavlje
                {
                    IdPredmeta = p.IdPredmeta,
                    IdNadredjenogPredmeta = p.IdNadredjenogPredmeta,
                    OznakaOkruga = p.OznakaOkruga,
                    NazivOkruga = Konverzija.VratiString(jezik, p.NazivOkruga),
                    OznakaOrgana = p.OznakaOrgana,
                    NazivOrgana = Konverzija.VratiString(jezik, p.NazivOrgana),
                    OznakaKlase = p.OznakaKlase,
                    NazivKlase = Konverzija.VratiString(jezik, p.NazivKlase),
                    BrojPredmeta = p.BrojPredmeta,
                    OznakaJedinice = p.OznakaJedinice,
                    NazivJedinice = Konverzija.VratiString(jezik, p.NazivJedinice),
                    ImeIPrezimeKreatora = Konverzija.VratiString(jezik, p.ImeIPrezimeKreatora),
                    KorisnickoImeKreatora = Konverzija.VratiString(jezik, p.KorisnickoImeKreatora),
                    PodnosilacJeInspektor = p.PodnosilacJeInspektor,
                    Podnosilac = Konverzija.VratiString(jezik, p.Podnosilac),
                    PodnosilacJedinstveniBroj = p.PodnosilacJedinstveniBroj,
                    LiceKontrole = Konverzija.VratiString(jezik, p.LiceKontrole),
                    LiceKontroleJedinstveniBroj = p.LiceKontroleJedinstveniBroj,
                    VremeKreiranja = p.VremeKreiranja,
                    VremeRezervacije = p.VremeRezervacije,
                    OznakaVrstePredmeta = p.OznakaVrstePredmeta,
                    NazivVrstePredmeta = Konverzija.VratiString(jezik, p.NazivVrstePredmeta),
                    OznakaVrstePredmetaZaStampu = p.OznakaVrstePredmetaZaStampu,
                    KorisnickoImeInspektora = p.KorisnickoImeInspektora,
                    ImeIPrezimeInspektora = Konverzija.VratiString(jezik, p.ImeIPrezimeInspektora),
                    Prilog = Konverzija.VratiString(jezik, p.Prilog),
                    Sadrzaj = Konverzija.VratiString(jezik, p.Sadrzaj),
                    NazivTakse = Konverzija.VratiString(jezik, p.NazivTakse),
                    OznakaTakseZaStampu = p.OznakaTakseZaStampu,
                    StraniBroj = p.StraniBroj,
                    Napomena = Konverzija.VratiString(jezik, p.Napomena),
                    Status = p.Status,
                    NazivStatusa = PredmetiData.VratiNazivStatusa(korisnik.Jezik, p.Status, p.IdNadredjenogPredmeta.HasValue),
                    Datum = DateTime.Now,
                    DetaljanBrojPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", p.OznakaOkruga, p.OznakaOrgana, p.OznakaKlase, p.BrojPredmeta, p.VremeRezervacije.Year, p.OznakaJedinice),
                    DetaljanBrojPredmetaSa000000 = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", p.OznakaOkruga, p.OznakaOrgana, p.OznakaKlase, string.Format(@"{0}", p.BrojPredmeta).PadLeft(6, '0'), p.VremeRezervacije.Year, p.OznakaJedinice),
                    DatumIstekaRoka = p.VremeIstekaRoka.GetValueOrDefault(),
                    Rok = p.Rok.GetValueOrDefault(),
                    Mesto = Konverzija.VratiString(jezik, p.Mesto),
                }).SingleOrDefault();
                if (zaglavlje != null)
                {
                    zaglavlje.StavkeIstorije = VratiStavkeIstorijePredmeta(idPredmeta, jezik);
                }
                return zaglavlje;
            }
        }

        private static List<StavkaIstorijePredmeta> VratiStavkeIstorijePredmeta(long idPredmeta, string jezik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.izvestaj_VratiStavkeIstorijePredmeta(idPredmeta).Select(id => new StavkaIstorijePredmeta
                {
                    ImeIPrezimeKorisnika = Konverzija.VratiString(jezik, id.ImeIPrezimeKorisnika),
                    KorisnickoImeKorisnika = id.KorisnickoImeKorisnika,
                    Napomena = Konverzija.VratiString(jezik, id.Napomena),
                    NazivKretanjaPredmeta = Konverzija.VratiString(jezik, id.NazivKretanjaPredmeta),
                    Opis = Konverzija.VratiString(jezik, id.Opis),
                    Vreme = id.Vreme
                }).ToList();
            }
        }

        public static List<StavkaPretrage> VratiPredmetePretrage(UlogovaniKorisnik korisnik, byte tipIzvestaja, bool sintetika, ElementPretrage pretraga)
        {
            using (var context = DmsData.GetContext())
            {
                if (sintetika)
                {
					var stavkeSintetike = context.izvestaji_VratiSintetikaPredmeta(tipIzvestaja, pretraga.IdOkruga, pretraga.IdOrgana,
																	pretraga.IdKlase, pretraga.BrojPredmeta,
																	pretraga.Godina, pretraga.OdDatuma,
																	pretraga.DoDatuma, pretraga.IdJedinice,
																	pretraga.Status,
																	pretraga.IdVrstePredmeta,
																	pretraga.IdInspektora,
																	Konverzija.KonvertujULatinicu(pretraga.Podnosilac.SrediZaPretragu()),
																	Konverzija.KonvertujULatinicu(pretraga.LiceKontrole.SrediZaPretragu()),
																	Konverzija.KonvertujULatinicu(pretraga.Sadrzaj.SrediZaPretragu()),
																	pretraga.IdTakse,
																	Konverzija.KonvertujULatinicu(pretraga.StraniBroj.SrediZaPretragu()),
																	pretraga.Rok, pretraga.PreRoka,
																	pretraga.DatumKretanja,
																	pretraga.IdKretanjaPredmeta,
																	Konverzija.KonvertujULatinicu(pretraga.OpisKretanja.SrediZaPretragu()),
																	pretraga.IdKreatora, korisnik.IdKorisnika, pretraga.IdOpstine,
																	pretraga.OznakaOrgana.SrediZaPretragu(3), pretraga.OznakaKlase.SrediZaPretragu(3), pretraga.OznakaJedinice.SrediZaPretragu(3),
																	korisnik.IdKorisnika, pretraga.GledanjeDatumaKreiranja, pretraga.IdMestaOpstine)
				.Select(s => new StavkaPretrage
				{
					Grupisanje = tipIzvestaja == 6 ? IzvestajPredmetaViewModel.VratiStatuse(korisnik).Where(ss => ss.IdElementa == s.IdGrupisanja).Select(ss => ss.Naziv).Single() : s.Grupisanje,
					IdGrupisanja = s.IdGrupisanja,
					UkupanBrojPredmeta = s.UkupanBrojPredmeta.GetValueOrDefault(),
					BrojAktivnihPredmeta = s.BrojAktivnihPredmeta.GetValueOrDefault(),
					BrojObrisanihhPredmeta = s.BrojObrisanihhPredmeta.GetValueOrDefault(),
					BrojRezervisanihPredmeta = s.BrojRezervisanihPredmeta.GetValueOrDefault(),
					BrojPrezavedenihPredmeta = s.BrojPrezavedenihPredmeta.GetValueOrDefault() + s.BrojPrezavedenihArhiviranihPredmeta.GetValueOrDefault(),
					BrojPredmetaURokovniku = s.BrojURokovnikuPredmeta.GetValueOrDefault(),
					BrojZatvorenihPredmeta = s.BrojZatvorenihPredmeta.GetValueOrDefault(),
					BrojRezervisanihPredmetaPrekoRoka = s.BrojRezervisanihPredmetaPrekoRoka.GetValueOrDefault(),
					BrojOtvorenihPredmetaPrekoRoka = s.BrojOtvorenihPredmetaPrekoRoka.GetValueOrDefault(),
				}).ToList();

					return stavkeSintetike.GroupBy(x => x.IdGrupisanja).Select(xx => new StavkaPretrage
					{
						Grupisanje =
								tipIzvestaja == 6
									? IzvestajPredmetaViewModel.VratiStatuse(korisnik)
															   .Where(ss => ss.IdElementa == xx.Key)
															   .Select(ss => ss.Naziv)
															   .Single()
									: xx.First().Grupisanje,
						IdGrupisanja = xx.Key,
						UkupanBrojPredmeta = xx.Sum(xxx => xxx.UkupanBrojPredmeta),
						BrojAktivnihPredmeta = xx.Sum(xxx => xxx.BrojAktivnihPredmeta),
						BrojObrisanihhPredmeta = xx.Sum(xxx => xxx.BrojObrisanihhPredmeta),
						BrojRezervisanihPredmeta = xx.Sum(xxx => xxx.BrojRezervisanihPredmeta),
						BrojPrezavedenihPredmeta = xx.Sum(xxx => xxx.BrojPrezavedenihPredmeta),
						BrojPredmetaURokovniku = xx.Sum(xxx => xxx.BrojPredmetaURokovniku),
						BrojZatvorenihPredmeta = xx.Sum(xxx => xxx.BrojZatvorenihPredmeta),
						BrojRezervisanihPredmetaPrekoRoka = xx.Sum(xxx => xxx.BrojRezervisanihPredmetaPrekoRoka),
						BrojOtvorenihPredmetaPrekoRoka = xx.Sum(xxx => xxx.BrojOtvorenihPredmetaPrekoRoka),
					}).ToList();
                }
                //Godina je sa vremena rezervacije
                return context.izvestaji_VratiAnalitikuPredmeta(tipIzvestaja, pretraga.IdOkruga, pretraga.IdOrgana,
                                                                pretraga.IdKlase, pretraga.BrojPredmeta,
                                                                pretraga.Godina, pretraga.OdDatuma,
                                                                pretraga.DoDatuma, pretraga.IdJedinice,
                                                                pretraga.Status,
                                                                pretraga.IdVrstePredmeta,
                                                                pretraga.IdInspektora,
                                                                Konverzija.KonvertujULatinicu(pretraga.Podnosilac.SrediZaPretragu()),
                                                                Konverzija.KonvertujULatinicu(pretraga.LiceKontrole.SrediZaPretragu()),
                                                                Konverzija.KonvertujULatinicu(pretraga.Sadrzaj.SrediZaPretragu()),
                                                                pretraga.IdTakse,
                                                                Konverzija.KonvertujULatinicu(pretraga.StraniBroj.SrediZaPretragu()),
                                                                pretraga.Rok, pretraga.PreRoka,
                                                                pretraga.DatumKretanja,
                                                                pretraga.IdKretanjaPredmeta,
                                                                Konverzija.KonvertujULatinicu(pretraga.OpisKretanja.SrediZaPretragu()),
                                                                pretraga.IdKreatora, korisnik.IdKorisnika, pretraga.IdOpstine,
                                                                pretraga.OznakaOrgana.SrediZaPretragu(3), pretraga.OznakaKlase.SrediZaPretragu(3), pretraga.OznakaJedinice.SrediZaPretragu(3),
                                                                korisnik.IdKorisnika, pretraga.GledanjeDatumaKreiranja, pretraga.IdMestaOpstine)
                .Select(s => new StavkaPretrage
                {
                    Grupisanje = s.Grupisanje,
                    IdPredmeta = s.IdPredmeta,
                    Podnosilac = Konverzija.VratiString(korisnik.Jezik, s.Podnosilac),
                    NazivInspektora = Konverzija.VratiString(korisnik.Jezik, s.NazivInspektora),
                    Sadrzaj = Konverzija.VratiString(korisnik.Jezik, s.Sadrzaj),
                    SifraPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", s.OznakaOkruga, s.OznakaOrgana, s.OznakaKlase,
                                                string.Format(@"{0}", s.BrojPredmeta).PadLeft(6, '0'), s.Godina.GetValueOrDefault(), s.OznakaJedinice),
                    LiceKontrole = Konverzija.VratiString(korisnik.Jezik, s.LiceKontrole),
                }).ToList();
            }
        }

        public static DefinisanaStampa VratiStampeRezervisanihBrojevaPredmeta(UlogovaniKorisnik korisnik, PregledRezervacijaZaglavlje zaglavlje)
        {
            var guid = Guid.NewGuid().ToString();

            var stampa = new DefinisanaStampa {Naziv = "Pregled rezervacija"};
            stampa.Link = string.Format("{0}{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
            var report = new PregledRezervacijeReport();


            report.LoadLayout(PutanjaAplikacije.PutanjaReportPregledBrojeva + "\\PregledRezervacijeReport.repx");
            report.PostaviPodatke(zaglavlje);

            report.CreateDocument();
            if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
            {
                Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
            }
            report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
            var opt = new XlsExportOptions {ShowGridLines = true};
            report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
            return stampa;
        }

        public static List<DefinisanaStampa> VratiStampePretrazenihPredmeta(UlogovaniKorisnik korisnik, List<long> listaIdPredmeta)
        {
            var zaglavlje = new PregledPretrazenihPredmetaZaglavlje();

            using (var context = DmsData.GetContext())
            {
                if (listaIdPredmeta != null && listaIdPredmeta.Count > 0)
                {
                    var inspektori = context.korisnik_VratiInspektore(korisnik.IdOkruga, null).ToDictionary(d => d.IdKorisnika, r => r.ImeIPrezime);

                    foreach (var idPredmeta in listaIdPredmeta)
                    {
                        //godina je vreme rezervacije
                        var predmet = context.predmet_VratiPredmet(idPredmeta).Select(p => new Predmet
                        {
                            IdPredmeta = p.IdPredmeta,
                            BrojPredmeta = p.BrojPredmeta,
                            IdJedinice = p.IdJedinice,
                            IdKlase = p.IdKlase,
                            IdKreator = p.IdKreatora,
                            IdOkruga = p.IdOkruga,
                            IdOpstine = p.IdOpstine,
                            NazivOpstine = p.NazivOpstine,
                            IdOrgana = p.IdOrgana,
                            IdTakse = p.IdTakse,
                            IdVrstePredmeta = p.IdVrstePredmeta,
                            IdInspektora = p.IdInspektora,
                            Podnosilac = p.Podnosilac,
                            PodnosilacJedinstveniBroj = p.PodnosilacJedinstveniBroj,
                            LiceKontrole = p.LiceKontrole,
                            LiceKontroleJedinstveniBroj = p.LiceKontroleJedinstveniBroj,
                            Napomena = p.Napomena,
                            PodnosilacJeInspektor = p.PodnosilacJeInspektor,
                            Prilog = p.Prilog,
                            PutanjaArhiviranjaDokumenata = p.PutanjaArhiviranjaDokumenata,
                            Sadrzaj = p.Sadrzaj,
                            Status = p.Status,
                            NazivStatusa = PredmetiData.VratiNazivStatusa(korisnik.Jezik, p.Status, p.IdNadredjenogPredmeta.HasValue),
                            StraniBroj = p.StraniBroj,
                            VremeRezervacije = p.VremeRezervacije,
                            StvarnoVremeKreiranja = p.StvarnoVremeKreiranja,
                            VremeKreiranja = p.VremeKreiranja,
                            NazivOkruga = string.Format(@"{0}-{1}", p.OznakaOkruga, p.NazivOkruga),
                            OznakaOkruga = p.OznakaOkruga,
                            OznakaKlase = p.OznakaKlase,
                            OznakaOrgana = p.OznakaOrgana,
                            OznakaJedinice = p.OznakaJedinice,
                            NazivKreatora = p.NazivKreatora,
                            Godina = p.Godina.GetValueOrDefault(),
                            NazivPredmeta =
                                    string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", p.OznakaOkruga, p.OznakaOrgana,
                                                  p.OznakaKlase, string.Format(@"{0}", p.BrojPredmeta).PadLeft(6, '0'), p.Godina, p.OznakaJedinice),



                            NazivInspektora = null,
                            Mesec = p.VremeKreiranja.Month,
                            SifraPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", p.OznakaOkruga, p.OznakaOrgana,
                                                  p.OznakaKlase, string.Format(@"{0}", p.BrojPredmeta).PadLeft(6, '0'), p.Godina, p.OznakaJedinice),
                        }).Single();

                        if (predmet.IdInspektora.HasValue && inspektori.ContainsKey(predmet.IdInspektora.Value))
                        {
                            predmet.NazivInspektora = inspektori[predmet.IdInspektora.Value];
                        }

                        zaglavlje.Predmeti.Add(predmet);
                    }
                }}

            var dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledPretrazenih);
            var stampe = new List<DefinisanaStampa>();
            var guid = Guid.NewGuid().ToString();

            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa {Naziv = file.Name.TrimEnd(".repx".ToArray())};
                stampa.Link = string.Format("{0}/{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
                var report = new PregledPretrazenihPredmetaReport();
                report.LoadLayout(file.FullName);
                report.PostaviPodatke(zaglavlje);
                report.CreateDocument();
                if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
                {
                    Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
                }
                report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
                var opt = new XlsExportOptions {ShowGridLines = true};
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        }

        public static List<DefinisanaStampa> VratiStampeSintetikePredmeta(UlogovaniKorisnik korisnik, List<StavkaPretrage> stavke, byte tipIzvestaja)
        {
            var zaglavlje = new PregledSintetikePredmetaZaglavlje
                {
                    Stavke = stavke,
                    NazivPrveKolone =
                        IzvestajPredmetaViewModel.VratiGrupisanja(korisnik)
                                                 .Where(g => g.IdElementa == string.Format(@"{0}", tipIzvestaja))
                                                 .Select(g => g.Naziv)
                                                 .Single()
                };

            var dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledSintetike);
            var stampe = new List<DefinisanaStampa>();
            var guid = Guid.NewGuid().ToString();

            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa {Naziv = file.Name.TrimEnd(".repx".ToArray())};
                stampa.Link = string.Format("{0}/{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
                var report = new PregledSintetikePredmetaReport();
                report.LoadLayout(file.FullName);
                report.PostaviPodatke(zaglavlje);
                report.CreateDocument();
                if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
                {
                    Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
                }
                report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
                var opt = new XlsExportOptions {ShowGridLines = true};
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        }

        #region Predmeti sa rokom

        public static List<PredmetSaRokom> VratiPredmeteSaRokom(UlogovaniKorisnik korisnik, short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice)
        {
            using (var context = DmsData.GetContext())
            {
                //Godina predmeta je sa vremena rezervacije
                return
                    context.izvestaji_VratiPredmeteSaRokom(idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice,
                                                           korisnik.IdKorisnika).Select(pred => new PredmetSaRokom
                                                               {
                                                                   IdPredmeta = pred.IdPredmeta,
                                                                   Podnosilac = Konverzija.VratiString(korisnik.Jezik, pred.Podnosilac),
                                                                   NazivInspektora = Konverzija.VratiString(korisnik.Jezik, pred.NazivInspektora),
                                                                   Sadrzaj = Konverzija.VratiString(korisnik.Jezik, pred.Sadrzaj),
                                                                   SifraPredmeta =
                                                                       string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}",
                                                                                     pred.OznakaOkruga, pred.OznakaOrgana,
                                                                                     pred.OznakaKlase, string.Format(@"{0}", pred.BrojPredmeta).PadLeft(6, '0'),
                                                                                     pred.Godina.GetValueOrDefault(), pred.OznakaJedinice),
                                                                    DatumRoka = pred.DatumRoka.GetValueOrDefault()
                                                               }).ToList();
            }
        }

        public static List<DefinisanaStampa> VratiStampePredmetaSaRokom(UlogovaniKorisnik korisnik, List<PredmetSaRokom> stavke)
        {
            var zaglavlje = new PregledPredmetaSaRokomZaglavlje {Stavke = stavke};

            var dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledPredmetaSaRokom);
            var stampe = new List<DefinisanaStampa>();
            var guid = Guid.NewGuid().ToString();

            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa {Naziv = file.Name.TrimEnd(".repx".ToArray())};
                stampa.Link = string.Format("{0}/{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
                var report = new PregledPredmetaSaRokomReport();
                report.LoadLayout(file.FullName);
                report.PostaviPodatke(zaglavlje);
                report.CreateDocument();
                if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
                {
                    Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
                }
                report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
                var opt = new XlsExportOptions {ShowGridLines = true};
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        }

        #endregion

        #region Izvestaj po razvodnjavanju

        public static IzvestajPoRazvodnjavanjuViewModel VratiIzvestajPoRazvodnjavanjuViewModel(UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                var vm = new IzvestajPoRazvodnjavanjuViewModel
                {
                    Okruzi = context.okrug_VratiOkruge(korisnik.IdOkruga, true).Select(okrug => new Element
                    {
                        IdElementa = string.Format(@"{0}", okrug.IdOkruga),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", okrug.Oznaka, okrug.Naziv))
                    }).ToList(),
                    Organi = korisnik.Inspektor ? context.organ_VratiOrganeInspektora(null, true, korisnik.IdKorisnika).Select(organ => new Element
                    {
                        IdElementa = string.Format(@"{0}", organ.IdOrgana),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0}-{1}", organ.Oznaka, organ.Naziv))
                    }).ToList() : context.organ_VratiOrgane(null, true).Select(organ => new Element
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
                    Arhivatori = context.korisnik_VratiArhivatore(korisnik.IdOkruga).Select(a => new Element
                    {
                        IdElementa = string.Format(@"{0}", a.IdKorisnika),
                        Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0} ({1})", a.ImeIPrezime, a.KorisnickoIme))
                    }).ToList()
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

        public static List<PredmetPoRazvodjenju> VratiPredmetePoRazvodjenju(UlogovaniKorisnik korisnik, short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice, DateTime odDatuma, DateTime doDatuma, int? idArhivatora)
        {
            using (var context = DmsData.GetContext())
            {
                return
                    context.izvestaji_VratiPredmetePoRazvodjenju(idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice,
                                                           korisnik.IdKorisnika, odDatuma, doDatuma, idArhivatora).Select(pred => new PredmetPoRazvodjenju
                                                           {
                                                               RazvodjenjeAkata = pred.RazvodjenjeAkata,
                                                               BrojPredmeta = pred.BrojPredmeta.GetValueOrDefault()
                                                           }).ToList();
            }
        }

        public static List<DefinisanaStampa> VratiStampePredmetaPoRazvodjenju(UlogovaniKorisnik korisnik, short idOkruga, short? idOrgana, short? idKlase, string oznakaKlase, int? brojPredmeta, int? godina, short? idJedinice, string oznakaJedinice, DateTime odDatuma, DateTime doDatuma, int? idArhivatora)
        {
            var zaglavlje = new PregledPredmetaPoRazvodjenjuZaglavlje
            {
                    Stavke = VratiPredmetePoRazvodjenju(korisnik, idOkruga, idOrgana, idKlase, oznakaKlase, brojPredmeta, godina, idJedinice, oznakaJedinice, odDatuma, doDatuma, idArhivatora),
                    OdDatuma = odDatuma,
                    DoDatuma = doDatuma
                };

            var dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledPredmetaPoRazvodnjavanju);
            var stampe = new List<DefinisanaStampa>();
            var guid = Guid.NewGuid().ToString();

            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa { Naziv = file.Name.TrimEnd(".repx".ToArray()) };
                stampa.Link = string.Format("{0}/{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
                var report = new PregledPredmetaPoRazvodjenjuReport();
                report.LoadLayout(file.FullName);
                report.PostaviPodatke(zaglavlje);
                report.CreateDocument();
                if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
                {
                    Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
                }
                report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
                var opt = new XlsExportOptions { ShowGridLines = true };
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        }

        #endregion
        
        #region Izveštaj po opštinima

        public static List<PredmetPoOpstinama> VratiPredmetePoOpstinama(UlogovaniKorisnik korisnik, DateTime odDatuma, DateTime doDatuma)
        {
            using (var context = DmsData.GetContext())
            {
                var list = 
                    context.izvestaji_VratiPredmetePoOpstinama(odDatuma, doDatuma, korisnik.IdKorisnika)
                        .Select(p => new PredmetPoOpstinama
                        {
                            BrojPredmeta = p.BrojPredmeta, //count
                            Jedinica = p.Jedinica,
                            Klasa = p.Klasa,
                            NazivJedinice = p.NazivJedinice,
                            NazivKlase = p.NazivKlase,
                            NazivOpstine = p.NazivOpstine,
                            NazivOrgana = p.NazivOrgana,
                            NazivVrstePredmeta = p.NazivVrstePredmeta,
                            Organ = p.Organ,
                            PostanskiBrojOpstine = p.PostanskiBrojOpstine,
                            VrstaPredmeta = p.VrstaPredmeta.Trim()
                        }).ToList();

                var list2 = list.GroupBy(
                        s =>
                            new
                            {
                                s.Jedinica,
                                s.Klasa,
                                s.NazivJedinice,
                                s.NazivKlase,
                                s.NazivOpstine,
                                s.NazivOrgana,
                                s.Organ,
                                s.PostanskiBrojOpstine
                            })
                        .Select(p => new PredmetPoOpstinama
                        {
                            NazivOrgana = p.Key.NazivOrgana,
                            PostanskiBrojOpstine = p.Key.PostanskiBrojOpstine,
                            Organ = p.Key.Organ,
                            Jedinica = p.Key.Jedinica,
                            Klasa = p.Key.Klasa,
                            NazivKlase = p.Key.NazivKlase,
                            NazivJedinice = p.Key.NazivJedinice,
                            NazivOpstine = p.Key.NazivOpstine,
                            BrojPredmeta0 = p.ToList().Sum(b => b.VrstaPredmeta == "0" ? b.BrojPredmeta : 0),
                            BrojPredmeta2 = p.ToList().Sum(b => b.VrstaPredmeta == "2" ? b.BrojPredmeta : 0),
                            BrojPredmeta3 = p.ToList().Sum(b => b.VrstaPredmeta == "3" ? b.BrojPredmeta : 0),
                            BrojPredmeta = p.ToList().Sum(b => b.BrojPredmeta),
                            BrojPredmetaO = p.ToList().Sum(b => (b.VrstaPredmeta != "0" && b.VrstaPredmeta != "2" && b.VrstaPredmeta != "3") ? b.BrojPredmeta : 0)
                        }).ToList();

                return list2;
            }
        }

        public static List<DefinisanaStampa> VratiStampePredmetaPoOpstinama(UlogovaniKorisnik korisnik, DateTime odDatuma, DateTime doDatuma)
        {
            var zaglavlje = new PregledPretmetaPoOpstinamaZaglavlje
            {
                Stavke = VratiPredmetePoOpstinama(korisnik, odDatuma, doDatuma),
                OdDatuma = odDatuma,
                DoDatuma = doDatuma
            };

            var dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledPredmetaPoOpstinama);
            var stampe = new List<DefinisanaStampa>();
            var guid = Guid.NewGuid().ToString();

            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa { Naziv = file.Name.TrimEnd(".repx".ToArray()) };
                stampa.Link = string.Format("{0}/{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
                var report = new PregledPredmetaPoOpstinamaReport();
                report.LoadLayout(file.FullName);
                report.PostaviPodatke(zaglavlje);
                report.CreateDocument();
                if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
                {
                    Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
                }
                report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
                var opt = new XlsExportOptions { ShowGridLines = true };
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        }
        
        #endregion
    }
}
