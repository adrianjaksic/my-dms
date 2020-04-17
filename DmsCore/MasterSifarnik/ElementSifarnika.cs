namespace DmsCore.MasterSifarnik
{
    public class ElementSifarnika
    {
        public string IdElementa { get; set; }

        public string IdNadredjenogElementa { get; set; }

        public string Naziv { get; set; }

        public bool DozvoljenoDodavanje { get; set; }

        public bool DozvoljenaIzmena { get; set; }

        public bool DozvoljenoBrisanje { get; set; }

        public bool Aktivan { get; set; }
    }
}
