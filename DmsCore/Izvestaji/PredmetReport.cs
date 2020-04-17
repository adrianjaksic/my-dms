using DevExpress.XtraReports.UI;

namespace DmsCore.Izvestaji
{
    public partial class PredmetReport : XtraReport
    {
        public PredmetReport()
        {
            InitializeComponent();
        }

        public void PostaviPodatke(PredmetiZaglavlje zaglavlje)
        {
            if (zaglavlje != null)
            {
                bindingSource.DataSource = zaglavlje;
                DataSource = bindingSource;
            }
            else
            {
                bindingSource.DataSource = typeof (PredmetiZaglavlje);
            }
        }

    }
}
