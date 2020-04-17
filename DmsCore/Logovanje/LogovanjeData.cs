using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using DmsCore.Data;

namespace DmsCore.Logovanje
{
    public static class LogovanjeData
    {
        private static readonly Dictionary<string, UlogovaniKorisnik> UlogovaniKorisnici = new Dictionary<string, UlogovaniKorisnik>();

        private static readonly Dictionary<string, string> UlogovanihKorisniciPoKorisnickomImenu = new Dictionary<string, string>();

        public static byte[] CalculateMd5Hash(this string input)
        {
            MD5 md5 = MD5.Create();
            byte[] inputBytes = Encoding.Unicode.GetBytes(input);
            byte[] hash = md5.ComputeHash(inputBytes);
            return hash;
        }

        public static UlogovaniKorisnik VratiUlogovanogKorisnika(string guid)
        {
            if (UlogovaniKorisnici.ContainsKey(guid))
            {
                return UlogovaniKorisnici[guid];
            }
            return null;
        }

        public static void UcitajUlogovaneKorisnike()
        {
            lock (UlogovanihKorisniciPoKorisnickomImenu)
            {
                using (var context = DmsData.GetContext())
                {
                    var korisnici = context.logovanje_VratiUlogovaneKorisnike().Select(k => new UlogovaniKorisnik
                    {
                        IdKorisnika = k.IdKorisnika,
                        Lozinka = "učitan korisnik",
                        KorisnickoIme = k.KorisnickoIme,
                        Administracija = k.Administracija,
                        BrisanjePredmeta = k.BrisanjePredmeta,
                        DozvolaRezervisanja = k.DozvolaRezervisanja,
                        Email = k.Email,
                        Guid = k.Guid,
                        IdOkruga = k.IdOkruga,
                        ImeIPrezime = k.ImeIPrezime,
                        Inspektor = k.Inspektor.GetValueOrDefault(),
                        IzmenaPredmeta = k.IzmenaPredmeta,
                        Jmbg = k.Jmbg,
                        Napomena = k.Napomena,
                        PregledIzvestaja = k.PregledIzvestaja,
                        Telefon = k.Telefon,
                        UnosNovogPredmeta = k.UnosNovogPredmeta,
                        NapomenaOkruga = k.NapomenaOkruga,
                        SamoSvojePredmete = k.SamoSvojePredmete,
                        IdOrgana = k.IdOrgana,
                        Jezik = k.Jezik,
                        StrogoPoverljivi = k.StrogoPoverljivi,
                    }).ToList();

                    foreach (var kor in korisnici)
                    {
                        UlogovaniKorisnici.Add(kor.Guid, kor);
                        UlogovanihKorisniciPoKorisnickomImenu.Add(kor.KorisnickoIme, kor.Guid);
                    }          
                }
            }
        }

        public static string UlogujKorisnika(string korisnickoIme, string lozinka, string jezik)
        {
            lock (UlogovanihKorisniciPoKorisnickomImenu)
            {
                if (UlogovanihKorisniciPoKorisnickomImenu.ContainsKey(korisnickoIme))
                {
                    var guid = UlogovanihKorisniciPoKorisnickomImenu[korisnickoIme];
                    UlogovanihKorisniciPoKorisnickomImenu.Remove(korisnickoIme);
                    UlogovaniKorisnici.Remove(guid);
                }
            }

            using (var context = DmsData.GetContext())
            {
                var korisnik = context.logovanje_UlogujKorisnika(korisnickoIme, lozinka.CalculateMd5Hash(), jezik).Select(k => new UlogovaniKorisnik
                {
                    IdKorisnika = k.IdKorisnika,
                    Lozinka = lozinka,
                    KorisnickoIme = korisnickoIme,
                    Administracija = k.Administracija,
                    BrisanjePredmeta = k.BrisanjePredmeta,
                    DozvolaRezervisanja = k.DozvolaRezervisanja,
                    Email = k.Email,
                    Guid = k.Guid,
                    IdOkruga = k.IdOkruga,
                    ImeIPrezime = k.ImeIPrezime,
                    Inspektor = k.Inspektor.GetValueOrDefault(),
                    IzmenaPredmeta = k.IzmenaPredmeta,
                    Jmbg = k.Jmbg,
                    Napomena = k.Napomena,
                    PregledIzvestaja = k.PregledIzvestaja,
                    Telefon = k.Telefon,
                    UnosNovogPredmeta = k.UnosNovogPredmeta,
                    NapomenaOkruga = k.NapomenaOkruga,
                    SamoSvojePredmete = k.SamoSvojePredmete,
                    IdOrgana = k.IdOrgana,
                    StrogoPoverljivi = k.StrogoPoverljivi,
                }).Single();

                korisnik.Jezik = jezik;

                lock (UlogovanihKorisniciPoKorisnickomImenu)
                {
                    UlogovaniKorisnici.Add(korisnik.Guid, korisnik);
                    UlogovanihKorisniciPoKorisnickomImenu.Add(korisnickoIme, korisnik.Guid);
                }

                return korisnik.Guid;
            }
        }

        public static void OdlogujKorisnika(string korisnickoIme)
        {
            lock (UlogovanihKorisniciPoKorisnickomImenu)
            {
                if (UlogovanihKorisniciPoKorisnickomImenu.ContainsKey(korisnickoIme))
                {
                    var guid = UlogovanihKorisniciPoKorisnickomImenu[korisnickoIme];
                    UlogovanihKorisniciPoKorisnickomImenu.Remove(korisnickoIme);
                    UlogovaniKorisnici.Remove(guid);
                }
            }

            using (var context = DmsData.GetContext())
            {
                context.logovanje_OdlogujKorisnika(korisnickoIme);
            }
        }

        public static void PromeniNapomenuOkrugaUlogovanihKorisnika(string napomenaOkruga)
        {
            lock (UlogovanihKorisniciPoKorisnickomImenu)
            {
                foreach (var key in UlogovaniKorisnici.Keys)
                {
                    UlogovaniKorisnici[key].NapomenaOkruga = napomenaOkruga;
                }
            }
        }

        public static void PromeniLozinkuKorisnika(UlogovaniKorisnik korisnik, string staraSifra, string novaSifra)
        {
            if (!string.IsNullOrEmpty(staraSifra) && !string.IsNullOrEmpty(novaSifra))
            {
                using (var context = DmsData.GetContext())
                {
                    context.logovanje_PromeniLozinkuKorisnika(korisnik.IdKorisnika, staraSifra.CalculateMd5Hash(), novaSifra.CalculateMd5Hash());
                    UlogovaniKorisnici[korisnik.Guid].Lozinka = null;
                }
            }
        }
    }
}
