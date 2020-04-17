using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DevExpress.XtraPrinting;
using DevExpress.XtraRichEdit.Model.History;
using DmsCore.Data;
using DmsCore.Izvestaji;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;
using DmsCore.Predmeti;

namespace DmsCore.Zapisnici
{
    public static class ZapisniciData
    {
        #region PPZ

        public static ZapisnikViewModel VratiZapisnikViewModel(UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return new ZapisnikViewModel
                {
                    Kreatori = context.korisnik_VratiKorisnike(null, true, korisnik.IdOkruga).Select(kr => new Element
                            {
                                IdElementa = string.Format(@"{0}", kr.IdKorisnika),
                                Naziv = Konverzija.VratiString(korisnik.Jezik, string.Format(@"{0} ({1})", kr.ImeIPrezime, kr.KorisnickoIme))
                            }).ToList(),
                    Organi = context.organ_VratiOrgane(korisnik.IdOrgana, true).Select(organ => new Element
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
                    IdOkruga = korisnik.IdOkruga
                };
            }
        }
 
        public static List<Predmet> VratiPredmetePretrage(UlogovaniKorisnik korisnik, short? idOrgana, short? idKlase, string oznakaKlase, short? idJedinice, string oznakaJedinice, DateTime datum, int? idKreatora, bool samoArhivirani)
        {
            using (var context = DmsData.GetContext())
            {
                return context.zapisnik_VratiPredmetePretrage(korisnik.IdOkruga, idOrgana, idKlase, oznakaKlase, idJedinice, oznakaJedinice, idKreatora, datum, 1, korisnik.IdKorisnika, samoArhivirani).Select(p => new Predmet
                {
                    IdPredmeta = p.IdPredmeta,
                    BrojPredmeta = p.BrojPredmeta,
                    NazivInspektora = Konverzija.VratiString(korisnik.Jezik, p.NazivInspektora),
                    Sadrzaj = Konverzija.VratiString(korisnik.Jezik, p.Sadrzaj),
                    Podnosilac = Konverzija.VratiString(korisnik.Jezik, p.Podnosilac),
                    OznakaOkruga = p.OznakaOkruga,
                    NazivOrgana = p.NazivOrgana,
                    OznakaOrgana = p.OznakaOrgana,
                    NazivKlase = p.NazivKlase,
                    NazivJedinice = p.NazivJedinice,
                    OznakaJedinice = p.OznakaJedinice,
                    SifraPredmeta = string.Format(@"{0}-{1}-{2}-{3}/{4}-{5}", p.OznakaOkruga, p.OznakaOrgana, p.OznakaKlase, string.Format(@"{0}", p.BrojPredmeta).PadLeft(6, '0'), p.Godina, p.OznakaJedinice),
                    BrojIstorijePredmeta = p.Broj.GetValueOrDefault(),
                    BrojIstorijePredmetaUGodini = p.BrojUGodini.GetValueOrDefault(),
                    OpisIstorijePredmeta = Konverzija.VratiString(korisnik.Jezik, p.Opis),
                    NapomenaIstorijePredmeta = Konverzija.VratiString(korisnik.Jezik, p.Napomena),
                    NazivKreatora = Konverzija.VratiString(korisnik.Jezik, p.KreatorIstorije),
                    Primedba = p.Primedba
                }).ToList();
            }
        }

        public static List<DefinisanaStampa> VratiStampePrimopredajnogZapisnika(UlogovaniKorisnik korisnik, short? idOrgana, short? idKlase, string oznakaKlase, short? idJedinice, string oznakaJedinice, DateTime datum, int? idKreatora, string nazivOrgana, string nazivKlase, string nazivJedinice, string nazivKreatora, bool samoArhiviran)
        {
            DirectoryInfo dir = null;
            if (samoArhiviran)
            {
                dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledZapisnikaArhivirani);
            }
            else
            {
                dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledZapisnika);
            }
            var stampe = new List<DefinisanaStampa>();
            var guid = Guid.NewGuid().ToString();

            var zaglavlje = new PregledPretrazenihPredmetaZaglavlje
                {
                    Datum = datum,
                    NazivJedinice = nazivJedinice,
                    NazivKlase = nazivKlase,
                    NazivKreatora = nazivKreatora,
                    NazivOrgana = nazivOrgana
                };

            var predmeti = VratiPredmetePretrage(korisnik, idOrgana, idKlase, oznakaKlase, idJedinice, oznakaJedinice, datum, idKreatora, samoArhiviran);
            if (predmeti.Count > 0)
            {
                zaglavlje.Predmeti.AddRange(predmeti);
            }

            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa();
                stampa.Naziv = file.Name.TrimEnd(".repx".ToArray());
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
                var opt = new XlsExportOptions();
                opt.ShowGridLines = true;
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        }

        #endregion

        #region Aktivni predmeti

        public static AktivniPredmetiViewModel VratiAktivnePredmete(UlogovaniKorisnik korisnik, DateTime datum)
        {
            using (var context = DmsData.GetContext())
            {
                var vm = new AktivniPredmetiViewModel();

                var aktivni = context.izvestaj_AktivniPredmeti(datum, korisnik.IdKorisnika).Select(x => new AktivniPredmetOsnovno
                {
                    Inspekcija = x.Inspekcija,
                    BrojPredmeta = x.BrojPredmeta.GetValueOrDefault(),
                    Godina = x.Godina.GetValueOrDefault(),
                }).ToList();

                var novaLista = new List<AktivniPredmet>();

                var inspekcije = aktivni.GroupBy(x => x.Inspekcija).ToList();

                foreach(var ins in inspekcije)
                {
                    var noviPredmet = new AktivniPredmet
                    {
                        Inspekcija = ins.Key,
                    };

                    var ukupno = 0;

                    foreach (var predmet in ins.ToList())
                    {
                        var razlika = 11 - (datum.Year - predmet.Godina);
                        ukupno += predmet.BrojPredmeta;
                        typeof(AktivniPredmet).GetProperty(string.Format("Godina{0}", razlika)).SetValue(noviPredmet, predmet.BrojPredmeta, null);
                    }

                    noviPredmet.Ukupno = ukupno;

                    novaLista.Add(noviPredmet);
                }

                vm.AktivniPredmeti = novaLista;

                var brojac = 1;
                for (var i = datum.Year - 10; i <= datum.Year; i++)
                {
                    typeof(AktivniPredmetiViewModel).GetProperty(string.Format("NazivKolone{0}", brojac)).SetValue(vm, string.Format(@"{0}", i), null);
                    brojac++;
                }

                return vm;
            }
        }

        public static List<DefinisanaStampa> VratiStampeAktivnihPredmeta(UlogovaniKorisnik korisnik, DateTime datum, AktivniPredmetiViewModel vm)
        {
            var dir = Directory.CreateDirectory(PutanjaAplikacije.PutanjaReportPregledAktivnihPredmeta);

            var stampe = new List<DefinisanaStampa>();
            var guid = Guid.NewGuid().ToString();

            var zaglavlje = new PregledAktivnihPredmetaZaglavlje
            {
                Datum = datum,
                NazivUstanove = DmsData.Naziv,
            };

            //var vm = VratiAktivnePredmete(korisnik, datum);
            if (vm != null)
            {
                zaglavlje.NazivKolone1 = vm.NazivKolone1;
                zaglavlje.NazivKolone2 = vm.NazivKolone2;
                zaglavlje.NazivKolone3 = vm.NazivKolone3;
                zaglavlje.NazivKolone4 = vm.NazivKolone4;
                zaglavlje.NazivKolone5 = vm.NazivKolone5;
                zaglavlje.NazivKolone6 = vm.NazivKolone6;
                zaglavlje.NazivKolone7 = vm.NazivKolone7;
                zaglavlje.NazivKolone8 = vm.NazivKolone8;
                zaglavlje.NazivKolone9 = vm.NazivKolone9;
                zaglavlje.NazivKolone10 = vm.NazivKolone10;
                zaglavlje.NazivKolone11 = vm.NazivKolone11;
                if (vm.AktivniPredmeti != null && vm.AktivniPredmeti.Count > 0)
                {
                    zaglavlje.Predmeti.AddRange(vm.AktivniPredmeti);
                }
            }

            foreach (var file in dir.GetFiles())
            {
                var stampa = new DefinisanaStampa();
                stampa.Naziv = file.Name.TrimEnd(".repx".ToArray());
                stampa.Link = string.Format("{0}/{1}/{2}.pdf", PutanjaAplikacije.PutanjaStampeWeb, guid, stampa.Naziv);
                var report = new PregledAktivnihPredmetaReport();
                report.LoadLayout(file.FullName);
                report.PostaviPodatke(zaglavlje);
                report.CreateDocument();
                if (!Directory.Exists(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid)))
                {
                    Directory.CreateDirectory(string.Format("{0}{1}", PutanjaAplikacije.PutanjaStampe, guid));
                }
                report.ExportToPdf(string.Format("{0}{1}\\{2}.pdf", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv));
                var opt = new XlsExportOptions();
                opt.ShowGridLines = true;
                report.ExportToXls(string.Format("{0}{1}\\{2}.xls", PutanjaAplikacije.PutanjaStampe, guid, stampa.Naziv), opt);
                stampe.Add(stampa);
            }

            return stampe;
        } 

        #endregion
    }
}
