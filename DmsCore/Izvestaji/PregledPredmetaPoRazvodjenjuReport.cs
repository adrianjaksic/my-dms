using DevExpress.XtraReports.UI;

namespace DmsCore.Izvestaji
{
    public partial class PregledPredmetaPoRazvodjenjuReport : XtraReport
    {
        public PregledPredmetaPoRazvodjenjuReport()
        {
            InitializeComponent();
        }

        public void PostaviPodatke(PregledPredmetaPoRazvodjenjuZaglavlje zaglavlje)
        {
            if (zaglavlje != null)
            {
                objectDataSource1.DataSource = zaglavlje;
                DataSource = objectDataSource1;
            }
            else
            {
                objectDataSource1.DataSource = typeof(PregledPredmetaPoRazvodjenjuZaglavlje);
            }
        }

    }
}
