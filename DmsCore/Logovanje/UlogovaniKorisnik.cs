namespace DmsCore.Logovanje
{
    public class UlogovaniKorisnik
    {
        public int IdKorisnika { get; set; }

        public string KorisnickoIme { get; set; }

        public bool Inspektor { get; set; }

        public short? IdOkruga { get; set; }

        public short? IdOrgana { get; set; }

        public bool UnosNovogPredmeta { get; set; }

        public bool DozvolaRezervisanja { get; set; }

        public bool IzmenaPredmeta { get; set; }

        public bool BrisanjePredmeta { get; set; }

        public bool Administracija { get; set; }

        public bool PregledIzvestaja { get; set; }

        public bool SamoSvojePredmete { get; set; }

        public string Email { get; set; }

        public string Telefon { get; set; }

        public string Jmbg { get; set; }

        public string ImeIPrezime { get; set; }

        public string Napomena { get; set; }

        public string Guid { get; set; }

        public string NapomenaOkruga { get; set; }

        public string Jezik { get; set; }

        public string Lozinka { get; set; }

        public bool StrogoPoverljivi { get; set; }
    }
}
