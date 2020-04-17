using DevExpress.XtraReports.UI;

namespace DmsCore.Izvestaji
{
    public partial class PregledSintetikePredmetaReport : XtraReport
    {
        public PregledSintetikePredmetaReport()
        {
            InitializeComponent();
        }

        public void PostaviPodatke(PregledSintetikePredmetaZaglavlje zaglavlje)
        {
            if (zaglavlje != null)
            {
                objectDataSource1.DataSource = zaglavlje;
                DataSource = objectDataSource1;
            }
            else
            {
                objectDataSource1.DataSource = typeof(PregledSintetikePredmetaZaglavlje);
            }
        }

    }
}
