using DevExpress.XtraReports.UI;

namespace DmsCore.Izvestaji
{
    public partial class PregledPredmetaSaRokomReport : XtraReport
    {
        public PregledPredmetaSaRokomReport()
        {
            InitializeComponent();
        }

        public void PostaviPodatke(PregledPredmetaSaRokomZaglavlje zaglavlje)
        {
            if (zaglavlje != null)
            {
                objectDataSource1.DataSource = zaglavlje;
                DataSource = objectDataSource1;
            }
            else
            {
                objectDataSource1.DataSource = typeof(PregledPredmetaSaRokomZaglavlje);
            }
        }

    }
}
