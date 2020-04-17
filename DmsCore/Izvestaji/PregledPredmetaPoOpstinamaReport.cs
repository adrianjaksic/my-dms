namespace DmsCore.Izvestaji
{
    public partial class PregledPredmetaPoOpstinamaReport : DevExpress.XtraReports.UI.XtraReport
    {
        public PregledPredmetaPoOpstinamaReport()
        {
            InitializeComponent();
        }

        public void PostaviPodatke(PregledPretmetaPoOpstinamaZaglavlje zaglavlje)
        {
            if (zaglavlje != null)
            {
                objectDataSource1.DataSource = zaglavlje;
                DataSource = objectDataSource1;
            }
            else
            {
                objectDataSource1.DataSource = typeof(PregledPretmetaPoOpstinamaZaglavlje);
            }
        }

    }
}
