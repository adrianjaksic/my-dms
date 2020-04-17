namespace DmsCore.Izvestaji
{
    partial class PregledSintetikePredmetaReport
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
			this.components = new System.ComponentModel.Container();
			DevExpress.XtraReports.UI.XRSummary xrSummary1 = new DevExpress.XtraReports.UI.XRSummary();
			DevExpress.DataAccess.ObjectBinding.ObjectConstructorInfo objectConstructorInfo1 = new DevExpress.DataAccess.ObjectBinding.ObjectConstructorInfo();
			this.xrTableCell1 = new DevExpress.XtraReports.UI.XRTableCell();
			this.DetailReport = new DevExpress.XtraReports.UI.DetailReportBand();
			this.xrLabel1 = new DevExpress.XtraReports.UI.XRLabel();
			this.xrTable1 = new DevExpress.XtraReports.UI.XRTable();
			this.Detail1 = new DevExpress.XtraReports.UI.DetailBand();
			this.xrLabel5 = new DevExpress.XtraReports.UI.XRLabel();
			this.xrTableCell6 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrLabel8 = new DevExpress.XtraReports.UI.XRLabel();
			this.xrTableCell5 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrLabel2 = new DevExpress.XtraReports.UI.XRLabel();
			this.xrLabel7 = new DevExpress.XtraReports.UI.XRLabel();
			this.objectDataSource1 = new DevExpress.DataAccess.ObjectBinding.ObjectDataSource(this.components);
			this.xrTableCell8 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrTableCell7 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrLabel4 = new DevExpress.XtraReports.UI.XRLabel();
			this.xrTableCell3 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrTableCell4 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrLabel6 = new DevExpress.XtraReports.UI.XRLabel();
			this.xrTableCell2 = new DevExpress.XtraReports.UI.XRTableCell();
			this.TopMargin = new DevExpress.XtraReports.UI.TopMarginBand();
			this.BottomMargin = new DevExpress.XtraReports.UI.BottomMarginBand();
			this.xrLabel3 = new DevExpress.XtraReports.UI.XRLabel();
			this.Detail = new DevExpress.XtraReports.UI.DetailBand();
			this.xrTableRow1 = new DevExpress.XtraReports.UI.XRTableRow();
			this.GroupHeader1 = new DevExpress.XtraReports.UI.GroupHeaderBand();
			this.xrPageInfo1 = new DevExpress.XtraReports.UI.XRPageInfo();
			((System.ComponentModel.ISupportInitialize)(this.xrTable1)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.objectDataSource1)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
			// 
			// xrTableCell1
			// 
			this.xrTableCell1.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell1.Name = "xrTableCell1";
			this.xrTableCell1.StylePriority.UseBorders = false;
			this.xrTableCell1.Text = "Red. br.";
			this.xrTableCell1.Weight = 0.282051274226262D;
			// 
			// DetailReport
			// 
			this.DetailReport.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.Detail1,
            this.GroupHeader1});
			this.DetailReport.DataMember = "Stavke";
			this.DetailReport.DataSource = this.objectDataSource1;
			this.DetailReport.Level = 0;
			this.DetailReport.Name = "DetailReport";
			// 
			// xrLabel1
			// 
			this.xrLabel1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
			this.xrLabel1.Name = "xrLabel1";
			this.xrLabel1.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel1.SizeF = new System.Drawing.SizeF(45.83333F, 23F);
			xrSummary1.FormatString = "{0:#.}";
			xrSummary1.Func = DevExpress.XtraReports.UI.SummaryFunc.RecordNumber;
			xrSummary1.Running = DevExpress.XtraReports.UI.SummaryRunning.Report;
			this.xrLabel1.Summary = xrSummary1;
			// 
			// xrTable1
			// 
			this.xrTable1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
			this.xrTable1.Name = "xrTable1";
			this.xrTable1.Rows.AddRange(new DevExpress.XtraReports.UI.XRTableRow[] {
            this.xrTableRow1});
			this.xrTable1.SizeF = new System.Drawing.SizeF(899.5833F, 25F);
			// 
			// Detail1
			// 
			this.Detail1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabel8,
            this.xrLabel7,
            this.xrLabel6,
            this.xrLabel5,
            this.xrLabel4,
            this.xrLabel3,
            this.xrLabel2,
            this.xrLabel1});
			this.Detail1.HeightF = 23F;
			this.Detail1.Name = "Detail1";
			this.Detail1.SortFields.AddRange(new DevExpress.XtraReports.UI.GroupField[] {
            new DevExpress.XtraReports.UI.GroupField("Grupisanje", DevExpress.XtraReports.UI.XRColumnSortOrder.Ascending)});
			// 
			// xrLabel5
			// 
			this.xrLabel5.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Stavke.BrojAktivnihPredmeta")});
			this.xrLabel5.LocationFloat = new DevExpress.Utils.PointFloat(495.8334F, 0F);
			this.xrLabel5.Name = "xrLabel5";
			this.xrLabel5.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel5.SizeF = new System.Drawing.SizeF(89.58328F, 23F);
			this.xrLabel5.Text = "xrLabel5";
			// 
			// xrTableCell6
			// 
			this.xrTableCell6.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell6.Name = "xrTableCell6";
			this.xrTableCell6.StylePriority.UseBorders = false;
			this.xrTableCell6.Text = "Zatvoreni";
			this.xrTableCell6.Weight = 0.59230788870137008D;
			// 
			// xrLabel8
			// 
			this.xrLabel8.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Stavke.BrojOtvorenihPredmetaPrekoRoka")});
			this.xrLabel8.LocationFloat = new DevExpress.Utils.PointFloat(790.6251F, 0F);
			this.xrLabel8.Name = "xrLabel8";
			this.xrLabel8.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel8.SizeF = new System.Drawing.SizeF(108.9582F, 23F);
			this.xrLabel8.Text = "xrLabel8";
			// 
			// xrTableCell5
			// 
			this.xrTableCell5.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell5.Name = "xrTableCell5";
			this.xrTableCell5.StylePriority.UseBorders = false;
			this.xrTableCell5.Text = "Rezervisani";
			this.xrTableCell5.Weight = 0.64102577370854075D;
			// 
			// xrLabel2
			// 
			this.xrLabel2.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Stavke.Grupisanje")});
			this.xrLabel2.LocationFloat = new DevExpress.Utils.PointFloat(45.83333F, 0F);
			this.xrLabel2.Name = "xrLabel2";
			this.xrLabel2.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel2.SizeF = new System.Drawing.SizeF(220.8333F, 23F);
			// 
			// xrLabel7
			// 
			this.xrLabel7.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Stavke.BrojObrisanihhPredmeta")});
			this.xrLabel7.LocationFloat = new DevExpress.Utils.PointFloat(681.6668F, 0F);
			this.xrLabel7.Name = "xrLabel7";
			this.xrLabel7.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel7.SizeF = new System.Drawing.SizeF(108.9583F, 23F);
			this.xrLabel7.Text = "xrLabel7";
			// 
			// objectDataSource1
			// 
			this.objectDataSource1.Constructor = objectConstructorInfo1;
			this.objectDataSource1.DataSource = typeof(DmsCore.Izvestaji.PregledSintetikePredmetaZaglavlje);
			this.objectDataSource1.Name = "objectDataSource1";
			// 
			// xrTableCell8
			// 
			this.xrTableCell8.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell8.Name = "xrTableCell8";
			this.xrTableCell8.StylePriority.UseBorders = false;
			this.xrTableCell8.Text = "Otvoreni preko roka";
			this.xrTableCell8.Weight = 0.67051232950372186D;
			// 
			// xrTableCell7
			// 
			this.xrTableCell7.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell7.Name = "xrTableCell7";
			this.xrTableCell7.StylePriority.UseBorders = false;
			this.xrTableCell7.Text = "Obrisani";
			this.xrTableCell7.Weight = 0.6705127051046893D;
			// 
			// xrLabel4
			// 
			this.xrLabel4.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Stavke.BrojRezervisanihPredmeta")});
			this.xrLabel4.LocationFloat = new DevExpress.Utils.PointFloat(391.6667F, 0F);
			this.xrLabel4.Name = "xrLabel4";
			this.xrLabel4.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel4.SizeF = new System.Drawing.SizeF(104.1667F, 23F);
			this.xrLabel4.Text = "xrLabel4";
			// 
			// xrTableCell3
			// 
			this.xrTableCell3.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell3.Name = "xrTableCell3";
			this.xrTableCell3.StylePriority.UseBorders = false;
			this.xrTableCell3.Text = "Aktivni";
			this.xrTableCell3.Weight = 0.55128191262855264D;
			// 
			// xrTableCell4
			// 
			this.xrTableCell4.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell4.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "NazivPrveKolone")});
			this.xrTableCell4.Name = "xrTableCell4";
			this.xrTableCell4.StylePriority.UseBorders = false;
			this.xrTableCell4.Weight = 1.3589743617114429D;
			// 
			// xrLabel6
			// 
			this.xrLabel6.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Stavke.BrojZatvorenihPredmeta")});
			this.xrLabel6.LocationFloat = new DevExpress.Utils.PointFloat(585.4167F, 0F);
			this.xrLabel6.Name = "xrLabel6";
			this.xrLabel6.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel6.SizeF = new System.Drawing.SizeF(96.25F, 23F);
			this.xrLabel6.Text = "xrLabel6";
			// 
			// xrTableCell2
			// 
			this.xrTableCell2.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
			this.xrTableCell2.Name = "xrTableCell2";
			this.xrTableCell2.StylePriority.UseBorders = false;
			this.xrTableCell2.Text = "Ukupan broj";
			this.xrTableCell2.Weight = 0.76923077475859691D;
			// 
			// TopMargin
			// 
			this.TopMargin.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrPageInfo1});
			this.TopMargin.HeightF = 100F;
			this.TopMargin.Name = "TopMargin";
			this.TopMargin.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 100F);
			this.TopMargin.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
			// 
			// BottomMargin
			// 
			this.BottomMargin.HeightF = 100F;
			this.BottomMargin.Name = "BottomMargin";
			this.BottomMargin.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 100F);
			this.BottomMargin.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
			// 
			// xrLabel3
			// 
			this.xrLabel3.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Stavke.UkupanBrojPredmeta")});
			this.xrLabel3.LocationFloat = new DevExpress.Utils.PointFloat(266.6667F, 0F);
			this.xrLabel3.Name = "xrLabel3";
			this.xrLabel3.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel3.SizeF = new System.Drawing.SizeF(125F, 23F);
			this.xrLabel3.Text = "xrLabel3";
			// 
			// Detail
			// 
			this.Detail.Expanded = false;
			this.Detail.HeightF = 100F;
			this.Detail.Name = "Detail";
			this.Detail.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 100F);
			this.Detail.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
			// 
			// xrTableRow1
			// 
			this.xrTableRow1.Cells.AddRange(new DevExpress.XtraReports.UI.XRTableCell[] {
            this.xrTableCell1,
            this.xrTableCell4,
            this.xrTableCell2,
            this.xrTableCell5,
            this.xrTableCell3,
            this.xrTableCell6,
            this.xrTableCell7,
            this.xrTableCell8});
			this.xrTableRow1.Name = "xrTableRow1";
			this.xrTableRow1.Weight = 1D;
			// 
			// GroupHeader1
			// 
			this.GroupHeader1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrTable1});
			this.GroupHeader1.HeightF = 25F;
			this.GroupHeader1.Name = "GroupHeader1";
			// 
			// xrPageInfo1
			// 
			this.xrPageInfo1.Format = "{0:dd.MM.yyyy}";
			this.xrPageInfo1.LocationFloat = new DevExpress.Utils.PointFloat(800F, 23.91667F);
			this.xrPageInfo1.Name = "xrPageInfo1";
			this.xrPageInfo1.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrPageInfo1.PageInfo = DevExpress.XtraPrinting.PageInfo.DateTime;
			this.xrPageInfo1.SizeF = new System.Drawing.SizeF(100F, 23F);
			// 
			// PregledSintetikePredmetaReport
			// 
			this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.Detail,
            this.TopMargin,
            this.BottomMargin,
            this.DetailReport});
			this.ComponentStorage.AddRange(new System.ComponentModel.IComponent[] {
            this.objectDataSource1});
			this.DataSource = this.objectDataSource1;
			this.Landscape = true;
			this.PageHeight = 850;
			this.PageWidth = 1100;
			this.Version = "15.1";
			((System.ComponentModel.ISupportInitialize)(this.xrTable1)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.objectDataSource1)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this)).EndInit();

        }

		#endregion

		private DevExpress.XtraReports.UI.XRTableCell xrTableCell1;
		private DevExpress.XtraReports.UI.DetailReportBand DetailReport;
		private DevExpress.XtraReports.UI.DetailBand Detail1;
		private DevExpress.XtraReports.UI.XRLabel xrLabel8;
		private DevExpress.XtraReports.UI.XRLabel xrLabel7;
		private DevExpress.XtraReports.UI.XRLabel xrLabel6;
		private DevExpress.XtraReports.UI.XRLabel xrLabel5;
		private DevExpress.XtraReports.UI.XRLabel xrLabel4;
		private DevExpress.XtraReports.UI.XRLabel xrLabel3;
		private DevExpress.XtraReports.UI.XRLabel xrLabel2;
		private DevExpress.XtraReports.UI.XRLabel xrLabel1;
		private DevExpress.XtraReports.UI.GroupHeaderBand GroupHeader1;
		private DevExpress.XtraReports.UI.XRTable xrTable1;
		private DevExpress.XtraReports.UI.XRTableRow xrTableRow1;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell4;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell2;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell5;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell3;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell6;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell7;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell8;
		private DevExpress.DataAccess.ObjectBinding.ObjectDataSource objectDataSource1;
		private DevExpress.XtraReports.UI.TopMarginBand TopMargin;
		private DevExpress.XtraReports.UI.XRPageInfo xrPageInfo1;
		private DevExpress.XtraReports.UI.BottomMarginBand BottomMargin;
		private DevExpress.XtraReports.UI.DetailBand Detail;
	}
}
