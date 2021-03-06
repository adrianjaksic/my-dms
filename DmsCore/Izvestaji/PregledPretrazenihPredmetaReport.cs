﻿using DevExpress.XtraReports.UI;

namespace DmsCore.Izvestaji
{
    public partial class PregledPretrazenihPredmetaReport : XtraReport
    {
        public PregledPretrazenihPredmetaReport()
        {
            InitializeComponent();
        }

        public void PostaviPodatke(PregledPretrazenihPredmetaZaglavlje zaglavlje)
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
