using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;

namespace DmsCore.Dms
{
    public static class DMSData
    {
        public static readonly Dictionary<string, string> ContentTypes = new Dictionary<string, string>();

        static DMSData()
        {
            //slike
            ContentTypes.Add(@"png", @"image/png");
            ContentTypes.Add(@"gif", @"image/gif");
            ContentTypes.Add(@"jpg", @"image/jpg");
            ContentTypes.Add(@"jpeg", @"image/jpeg");
            ContentTypes.Add(@"bmp", @"image/bmp");
            //arhive
            ContentTypes.Add(@"zip", @"application/zip");
            ContentTypes.Add(@"rar", @"application/x-rar-compressed");
            ContentTypes.Add(@"7z", @"application/x-7z-compressed");
            //text
            ContentTypes.Add(@"txt", @"text/plain");
            ContentTypes.Add(@"csv", @"text/csv");
            ContentTypes.Add(@"xml", @"text/xml");
            //dokumenti
            ContentTypes.Add(@"pdf", @"application/pdf");
            ContentTypes.Add(@"doc", @"application/msword");
            ContentTypes.Add(@"docx", @"application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            ContentTypes.Add(@"xls", @"application/vnd.ms-excel");
            ContentTypes.Add(@"xlsx", @"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            ContentTypes.Add(@"ppt", @"application/vnd.ms-powerpoint");
            ContentTypes.Add(@"pptx", @"application/vnd.openxmlformats-officedocument.presentationml.presentation");
            //audio/video
            ContentTypes.Add(@"mp3", @"audio/mp3");
            ContentTypes.Add(@"mpeg", @"video/mpeg");
            ContentTypes.Add(@"avi", @"video/msvideo");
        }

        public static PodaciDokumenta SnimiDokumentPredmeta(UlogovaniKorisnik korisnik, long idPredmeta, string naziv, string putanja)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                var noviFajl = new PodaciDokumenta();
                try
                {
                    short? idDokumenta = null;
                    putanja = DmsFileManager.SacuvajFajl(putanja);
                    var hashcode = DmsFileManager.GetMD5(putanja);

                    var novNaziv = Path.GetFileNameWithoutExtension(naziv);
                    var ekstenzija = Path.GetExtension(naziv);
                    if (ekstenzija != null)
                    {
                        ekstenzija = ekstenzija.Substring(1).ToLower();
                        context.dokument_DodajDokument(idPredmeta, ref idDokumenta, korisnik.IdKorisnika, novNaziv, putanja,
                                                       null, hashcode, ekstenzija);

                        context.predmet_SnimiAktivnostPredmeta(idPredmeta, korisnik.IdKorisnika,
                                                               string.Format(@"Dodat dokument {0} na predmet.", naziv));

                        noviFajl.IdDokumenta = idDokumenta.GetValueOrDefault();
                        noviFajl.Naziv = novNaziv;
                        noviFajl.Ekstenzija = ekstenzija;
                        noviFajl.Obrisan = false;
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

                return noviFajl;
            }
        }

        public static void ObrisiDokumentPredmeta(UlogovaniKorisnik korisnik, long idPredmeta, short idDokumenta, string razlogBrisanja)
        {
            using (var context = DmsData.GetContext())
            {
                if (korisnik.IdOkruga != null && korisnik.IzmenaPredmeta)
                {
                    context.dokument_ObrisiDokument(idPredmeta, idDokumenta, korisnik.IdKorisnika, razlogBrisanja.SrediZaSnimanje(2000));
                }
            }
        }

        public static PodaciDokumenta VratiDetaljeDokumenta(UlogovaniKorisnik korisnik, long idPredmeta, short idDokumenta)
        {
            using (var context = DmsData.GetContext())
            {
                return context.dokument_VratiDetaljeDokumenta(idPredmeta, idDokumenta).Select(dok => new PodaciDokumenta
                {
                    IdDokumenta = idDokumenta,
                    Hashcode = dok.Hashcode,
                    Naziv = dok.Naziv,
                    Napomena = dok.Napomena,
                    Kreator = dok.NazivKreatora,
                    Obrisan = dok.VremeBrisanja != null,
                    Putanja = dok.Putanja,
                    VremeBrisanja = dok.VremeBrisanja,
                    VremeUnosa = dok.VremeUnosa,
                    Ekstenzija = dok.Ekstenzija,
                    KreatorBrisanja = dok.NazivKreatoraBrisanja
                }).SingleOrDefault();
            }
        }

        public static List<PodaciDokumenta> VratiDokumentePredmeta(UlogovaniKorisnik korisnik, long idPredmeta)
        {
            using (var context = DmsData.GetContext())
            {
                return context.dokument_VratiDokumentePredmeta(idPredmeta).Select(dok => new PodaciDokumenta
                {
                    IdDokumenta = dok.IdDokumenta,
                    Naziv = dok.Naziv,
                    Obrisan = dok.Obrisan.GetValueOrDefault(),
                    Ekstenzija = dok.Ekstenzija
                }).ToList();
            }
        }

        public static string VratiLinkDokumentaPredmeta(UlogovaniKorisnik korisnik, long idPredmeta, short idDokumenta)
        {
            using (var context = DmsData.GetContext())
            {
                var putanjaDokumenta =
                    context.dokument_VratiDetaljeDokumenta(idPredmeta, idDokumenta)
                           .Select(dok => dok.Putanja)
                           .SingleOrDefault();

                return DmsFileManager.VratiLink(putanjaDokumenta);
            }
        }

        public static void VratiObrisaniDokumentPredmeta(UlogovaniKorisnik korisnik, long idPredmeta, short idDokumenta)
        {
            using (var context = DmsData.GetContext())
            {
                context.dokument_VratiObrisaniDokument(idPredmeta, idDokumenta, korisnik.IdKorisnika);
            }
        }
    }
}
