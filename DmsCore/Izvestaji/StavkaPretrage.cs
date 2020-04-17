namespace DmsCore.Izvestaji
{
    public class StavkaPretrage
    {
        public string Grupisanje { get; set; }

        public string IdGrupisanja { get; set; }

        public int UkupanBrojPredmeta { get; set; }

        public int BrojRezervisanihPredmeta { get; set; }

        public int BrojAktivnihPredmeta { get; set; }

        public int BrojZatvorenihPredmeta { get; set; }

        public int BrojObrisanihhPredmeta { get; set; }

		public int BrojPrezavedenihPredmeta { get; set; }

		public int BrojPredmetaURokovniku { get; set; }

		public int BrojRezervisanihPredmetaPrekoRoka { get; set; }

		public int BrojOtvorenihPredmetaPrekoRoka { get; set; }

        public long IdPredmeta { get; set; }

        public string SifraPredmeta { get; set; }

        public string Podnosilac { get; set; }

        public string NazivInspektora { get; set; }

        public string Sadrzaj { get; set; }

        public string LiceKontrole { get; set; }		
	}
}
