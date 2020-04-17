using DevExpress.XtraReports.UI;

namespace DmsCore.Izvestaji
{
    public partial class PregledAktivnihPredmetaReport : XtraReport
    {
        public PregledAktivnihPredmetaReport()
        {
            InitializeComponent();
        }

        public void PostaviPodatke(PregledAktivnihPredmetaZaglavlje zaglavlje)
        {
            if (zaglavlje != null)
            {
                objectDataSource1.DataSource = zaglavlje;
                DataSource = objectDataSource1;
            }
            else
            {
                objectDataSource1.DataSource = typeof(PregledPretrazenihPredmetaZaglavlje);
            }
        }

    }
}
