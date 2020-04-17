namespace DmsCore.Izvestaji
{
    partial class PregledPretrazenihPredmetaReport
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
			DevExpress.DataAccess.ObjectBinding.ObjectConstructorInfo objectConstructorInfo1 = new DevExpress.DataAccess.ObjectBinding.ObjectConstructorInfo();
			DevExpress.XtraReports.UI.XRSummary xrSummary1 = new DevExpress.XtraReports.UI.XRSummary();
			this.xrTableCell4 = new DevExpress.XtraReports.UI.XRTableCell();
			this.DetailReport = new DevExpress.XtraReports.UI.DetailReportBand();
			this.xrLabel1 = new DevExpress.XtraReports.UI.XRLabel();
			this.objectDataSource1 = new DevExpress.DataAccess.ObjectBinding.ObjectDataSource(this.components);
			this.xrTableCell3 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrTableRow2 = new DevExpress.XtraReports.UI.XRTableRow();
			this.xrTableCell9 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrTableRow1 = new DevExpress.XtraReports.UI.XRTableRow();
			this.Detail = new DevExpress.XtraReports.UI.DetailBand();
			this.xrTableCell2 = new DevExpress.XtraReports.UI.XRTableCell();
			this.BottomMargin = new DevExpress.XtraReports.UI.BottomMarginBand();
			this.xrTable2 = new DevExpress.XtraReports.UI.XRTable();
			this.xrTableCell8 = new DevExpress.XtraReports.UI.XRTableCell();
			this.Detail1 = new DevExpress.XtraReports.UI.DetailBand();
			this.xrTableCell7 = new DevExpress.XtraReports.UI.XRTableCell();
			this.GroupHeader1 = new DevExpress.XtraReports.UI.GroupHeaderBand();
			this.xrTableCell5 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrTableCell10 = new DevExpress.XtraReports.UI.XRTableCell();
			this.TopMargin = new DevExpress.XtraReports.UI.TopMarginBand();
			this.xrTableCell6 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrTableCell1 = new DevExpress.XtraReports.UI.XRTableCell();
			this.xrLabel6 = new DevExpress.XtraReports.UI.XRLabel();
			this.xrPageInfo1 = new DevExpress.XtraReports.UI.XRPageInfo();
			this.xrTable1 = new DevExpress.XtraReports.UI.XRTable();
			((System.ComponentModel.ISupportInitialize)(this.objectDataSource1)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.xrTable2)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this.xrTable1)).BeginInit();
			((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
			// 
			// xrTableCell4
			// 
			this.xrTableCell4.Multiline = true;
			this.xrTableCell4.Name = "xrTableCell4";
			this.xrTableCell4.Text = "Inspektor\r\n";
			this.xrTableCell4.Weight = 0.85763932239859186D;
			// 
			// DetailReport
			// 
			this.DetailReport.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.Detail1,
            this.GroupHeader1});
			this.DetailReport.DataMember = "Predmeti";
			this.DetailReport.DataSource = this.objectDataSource1;
			this.DetailReport.Level = 0;
			this.DetailReport.Name = "DetailReport";
			// 
			// xrLabel1
			// 
			this.xrLabel1.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Predmeti.Status", "Status:{0}")});
			this.xrLabel1.Font = new System.Drawing.Font("Times New Roman", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(238)));
			this.xrLabel1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
			this.xrLabel1.Name = "xrLabel1";
			this.xrLabel1.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel1.SizeF = new System.Drawing.SizeF(960F, 22.91666F);
			this.xrLabel1.StylePriority.UseFont = false;
			this.xrLabel1.Text = "xrLabel1";
			// 
			// objectDataSource1
			// 
			this.objectDataSource1.Constructor = objectConstructorInfo1;
			this.objectDataSource1.DataSource = typeof(DmsCore.Izvestaji.PregledPretrazenihPredmetaZaglavlje);
			this.objectDataSource1.Name = "objectDataSource1";
			// 
			// xrTableCell3
			// 
			this.xrTableCell3.Multiline = true;
			this.xrTableCell3.Name = "xrTableCell3";
			this.xrTableCell3.Text = "Podnosilac\r\n";
			this.xrTableCell3.Weight = 1.2870367915149747D;
			// 
			// xrTableRow2
			// 
			this.xrTableRow2.Cells.AddRange(new DevExpress.XtraReports.UI.XRTableCell[] {
            this.xrTableCell6,
            this.xrTableCell7,
            this.xrTableCell8,
            this.xrTableCell9,
            this.xrTableCell10});
			this.xrTableRow2.Name = "xrTableRow2";
			this.xrTableRow2.Weight = 0.6D;
			// 
			// xrTableCell9
			// 
			this.xrTableCell9.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Predmeti.NazivInspektora")});
			this.xrTableCell9.Multiline = true;
			this.xrTableCell9.Name = "xrTableCell9";
			this.xrTableCell9.Text = "Inspektor\r\n";
			this.xrTableCell9.Weight = 0.85763932239859186D;
			// 
			// xrTableRow1
			// 
			this.xrTableRow1.Cells.AddRange(new DevExpress.XtraReports.UI.XRTableCell[] {
            this.xrTableCell1,
            this.xrTableCell2,
            this.xrTableCell3,
            this.xrTableCell4,
            this.xrTableCell5});
			this.xrTableRow1.Name = "xrTableRow1";
			this.xrTableRow1.Weight = 0.60000003814697267D;
			// 
			// Detail
			// 
			this.Detail.Expanded = false;
			this.Detail.HeightF = 100F;
			this.Detail.Name = "Detail";
			this.Detail.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 100F);
			this.Detail.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
			// 
			// xrTableCell2
			// 
			this.xrTableCell2.Name = "xrTableCell2";
			this.xrTableCell2.Text = "Šifra predmeta";
			this.xrTableCell2.Weight = 0.95254629810160463D;
			// 
			// BottomMargin
			// 
			this.BottomMargin.HeightF = 40F;
			this.BottomMargin.Name = "BottomMargin";
			this.BottomMargin.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 100F);
			this.BottomMargin.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
			// 
			// xrTable2
			// 
			this.xrTable2.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
			this.xrTable2.Name = "xrTable2";
			this.xrTable2.Rows.AddRange(new DevExpress.XtraReports.UI.XRTableRow[] {
            this.xrTableRow2});
			this.xrTable2.SizeF = new System.Drawing.SizeF(960F, 15F);
			// 
			// xrTableCell8
			// 
			this.xrTableCell8.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Predmeti.Podnosilac")});
			this.xrTableCell8.Multiline = true;
			this.xrTableCell8.Name = "xrTableCell8";
			this.xrTableCell8.Text = "Podnosilac\r\n";
			this.xrTableCell8.Weight = 1.2870367915149747D;
			// 
			// Detail1
			// 
			this.Detail1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrTable2});
			this.Detail1.HeightF = 17.08333F;
			this.Detail1.Name = "Detail1";
			this.Detail1.SortFields.AddRange(new DevExpress.XtraReports.UI.GroupField[] {
            new DevExpress.XtraReports.UI.GroupField("NazivPredmeta", DevExpress.XtraReports.UI.XRColumnSortOrder.Ascending)});
			// 
			// xrTableCell7
			// 
			this.xrTableCell7.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Predmeti.NazivPredmeta")});
			this.xrTableCell7.Name = "xrTableCell7";
			this.xrTableCell7.Weight = 0.95254634048712694D;
			// 
			// GroupHeader1
			// 
			this.GroupHeader1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabel1,
            this.xrTable1});
			this.GroupHeader1.GroupFields.AddRange(new DevExpress.XtraReports.UI.GroupField[] {
            new DevExpress.XtraReports.UI.GroupField("Status", DevExpress.XtraReports.UI.XRColumnSortOrder.Ascending)});
			this.GroupHeader1.HeightF = 37.91666F;
			this.GroupHeader1.KeepTogether = true;
			this.GroupHeader1.Name = "GroupHeader1";
			this.GroupHeader1.RepeatEveryPage = true;
			// 
			// xrTableCell5
			// 
			this.xrTableCell5.Name = "xrTableCell5";
			this.xrTableCell5.Text = "Sadržaj";
			this.xrTableCell5.Weight = 2.0682863994488931D;
			// 
			// xrTableCell10
			// 
			this.xrTableCell10.DataBindings.AddRange(new DevExpress.XtraReports.UI.XRBinding[] {
            new DevExpress.XtraReports.UI.XRBinding("Text", null, "Predmeti.Sadrzaj")});
			this.xrTableCell10.Name = "xrTableCell10";
			this.xrTableCell10.Text = "Sadržaj";
			this.xrTableCell10.Weight = 2.0682863994488931D;
			// 
			// TopMargin
			// 
			this.TopMargin.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabel6,
            this.xrPageInfo1});
			this.TopMargin.HeightF = 40F;
			this.TopMargin.Name = "TopMargin";
			this.TopMargin.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 100F);
			this.TopMargin.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
			// 
			// xrTableCell6
			// 
			this.xrTableCell6.Name = "xrTableCell6";
			xrSummary1.Func = DevExpress.XtraReports.UI.SummaryFunc.RecordNumber;
			xrSummary1.Running = DevExpress.XtraReports.UI.SummaryRunning.Report;
			this.xrTableCell6.Summary = xrSummary1;
			this.xrTableCell6.Weight = 0.16782411779395634D;
			// 
			// xrTableCell1
			// 
			this.xrTableCell1.Name = "xrTableCell1";
			this.xrTableCell1.Text = "R.Br.";
			this.xrTableCell1.Weight = 0.16782416017947863D;
			// 
			// xrLabel6
			// 
			this.xrLabel6.Font = new System.Drawing.Font("Times New Roman", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(238)));
			this.xrLabel6.LocationFloat = new DevExpress.Utils.PointFloat(0F, 17F);
			this.xrLabel6.Name = "xrLabel6";
			this.xrLabel6.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrLabel6.SizeF = new System.Drawing.SizeF(960F, 23F);
			this.xrLabel6.StylePriority.UseFont = false;
			this.xrLabel6.Text = "Pregled pretraženih predmeta";
			// 
			// xrPageInfo1
			// 
			this.xrPageInfo1.Format = "{0:dd.MM.yyyy}";
			this.xrPageInfo1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
			this.xrPageInfo1.Name = "xrPageInfo1";
			this.xrPageInfo1.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
			this.xrPageInfo1.PageInfo = DevExpress.XtraPrinting.PageInfo.DateTime;
			this.xrPageInfo1.SizeF = new System.Drawing.SizeF(960F, 17F);
			this.xrPageInfo1.StylePriority.UseTextAlignment = false;
			this.xrPageInfo1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopRight;
			// 
			// xrTable1
			// 
			this.xrTable1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 22.91666F);
			this.xrTable1.Name = "xrTable1";
			this.xrTable1.Rows.AddRange(new DevExpress.XtraReports.UI.XRTableRow[] {
            this.xrTableRow1});
			this.xrTable1.SizeF = new System.Drawing.SizeF(960F, 15F);
			// 
			// PregledPretrazenihPredmetaReport
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
			this.Margins = new System.Drawing.Printing.Margins(70, 70, 40, 40);
			this.PageHeight = 850;
			this.PageWidth = 1100;
			this.Version = "15.1";
			((System.ComponentModel.ISupportInitialize)(this.objectDataSource1)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.xrTable2)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this.xrTable1)).EndInit();
			((System.ComponentModel.ISupportInitialize)(this)).EndInit();

        }











		#endregion

		private DevExpress.XtraReports.UI.XRTableCell xrTableCell4;
		private DevExpress.XtraReports.UI.DetailReportBand DetailReport;
		private DevExpress.XtraReports.UI.DetailBand Detail1;
		private DevExpress.XtraReports.UI.XRTable xrTable2;
		private DevExpress.XtraReports.UI.XRTableRow xrTableRow2;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell6;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell7;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell8;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell9;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell10;
		private DevExpress.XtraReports.UI.GroupHeaderBand GroupHeader1;
		private DevExpress.XtraReports.UI.XRLabel xrLabel1;
		private DevExpress.XtraReports.UI.XRTable xrTable1;
		private DevExpress.XtraReports.UI.XRTableRow xrTableRow1;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell1;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell2;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell3;
		private DevExpress.XtraReports.UI.XRTableCell xrTableCell5;
		private DevExpress.DataAccess.ObjectBinding.ObjectDataSource objectDataSource1;
		private DevExpress.XtraReports.UI.DetailBand Detail;
		private DevExpress.XtraReports.UI.BottomMarginBand BottomMargin;
		private DevExpress.XtraReports.UI.TopMarginBand TopMargin;
		private DevExpress.XtraReports.UI.XRLabel xrLabel6;
		private DevExpress.XtraReports.UI.XRPageInfo xrPageInfo1;
	}
}
