using DevExpress.XtraReports.UI;

namespace DmsCore.Izvestaji
{
    public partial class PregledRezervacijeReport : XtraReport
    {public PregledRezervacijeReport()
        {
            InitializeComponent();
        }


        public void PostaviPodatke(PregledRezervacijaZaglavlje zaglavlje)
        {
            if (zaglavlje != null)
            {
                bindingSource.DataSource = zaglavlje;
                DataSource = bindingSource;
            }
            else
            {
                bindingSource.DataSource = typeof(PregledRezervacijaZaglavlje);
            }
        }
    }
}
