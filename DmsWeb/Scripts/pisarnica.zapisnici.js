// #region Primopredajni zapisnik

(function (qPrimopredajniZapisnik, $, undefined) {
    var vm,
        width = 300,
        listWidth = 400,
        url_VratiPredmetePretrage,
        url_VratiJedinice,
        url_VratiKlase,
        url_VratiStampePrimopredajnogZapisnika;
    
    var columnFilters = {};
    var grid;

    var dataView;

    var options = {
        editable: false,
        enableCellNavigation: true,
        showHeaderRow: true,
        headerRowHeight: 30,
        explicitInitialization: true,
        rowHeight: 20
    };

    /**********************************************
    ******** Funkcije za SLICKGRID  BEGIN *********
    ***********************************************/

    function filter(item) {
        for (var columnId in columnFilters) {
            if (columnId !== undefined && columnFilters[columnId] !== "") {

                //  0 - string
                var tip = 0;

                if (columnId == 1) {
                    tip = 2;
                }

                var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                if (item[c.field] == undefined) {
                    return false;
                }
                else if (tip == 0) {
                    if (!item[c.field].toLowerCase().contains(columnFilters[columnId].toLowerCase())) {
                        return false;
                    }
                } else if (tip == 2) {
                    if (item[c.field] != columnFilters[columnId].toDecimal()) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function LinkPredmetFormatter(row, cell, value, columnDef, dataContext) {
        if (dataContext.IdPredmeta != undefined) {
            return '<i class="fa fa-reply link" data-id="' + dataContext.IdPredmeta + '"></i>';
        }

        return "";
    }

    function SifraPredmetaFormatter(row, cell, value, columnDef, dataContext) {
        if (dataContext.IdPredmeta != undefined) {
            return '<div class="qTdPopupPredmeti" data-idPredmeta="' + dataContext.IdPredmeta + '">' + nonull(value) + '</div>';
        }

        return "";
    }

    function NoNullFormatter(row, cell, value, columnDef, dataContext) {
        return nonull(value);
    }

    /**********************************************
    ******** Funkcije za SLICKGRID  END ***********
    **********************************************/

    function ClickBtnReset() {
        $('#ppZapisnikKreatoriCmb').quiComboBox('clearSelection');
        $('#ppZapisnikDatum').quiDate('setDate', new Date());
        $('#ppZapisnikOrganiCmb').quiComboBox('clearSelection');

        $('#ppZapisnikNemaRez').hide();

        $('#ppZapisnikSlickGrid').empty();
        $('#ppZapisnikSlickGridPager').empty();

        columnFilters = {};
        grid = undefined;
    }
    
    function ClickBtnPretrazi() {
        var $btn = $('#ppZapisnikBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var datum = $('#ppZapisnikDatum').quiDate('getJSONDateNoTZStringify');
        
        if (datum == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Datum nije izabran.'), 'greska');
            return;
        }

        $('#ppZapisnikSlickGrid').empty();
        $('#ppZapisnikSlickGridPager').empty();

        grid = undefined;
        columnFilters = {};
        
        var idOrgana = $('#ppZapisnikOrganiCmb').quiComboBox('getSelectedItemData');
        var idKlase = $('#ppZapisnikKlaseCmb').quiComboBox('getSelectedItemData');
        var oznakaKlase = undefined;
        var idJedinice = $('#ppZapisnikJediniceCmb').quiComboBox('getSelectedItemData');
        var oznakaJedinice = undefined;

        if (idOrgana == undefined) {
            oznakaKlase = idKlase;
            idKlase = undefined;

            oznakaJedinice = idJedinice;
            idJedinice = undefined;
        }

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'GET',
            url: url_VratiPredmetePretrage,
            data: {
                idOrgana: idOrgana,
                datumJ: datum,
                idKreatora: $('#ppZapisnikKreatoriCmb').quiComboBox('getSelectedItemData'),
                idKlase: idKlase,
                idJedinice: idJedinice,
                samoArhivirani: $('#ppZapisnikSamoArhivirani').prop('checked'),
                oznakaKlase: oznakaKlase,
                oznakaJedinice: oznakaJedinice
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data;
                
                if (predmeti && predmeti.length > 0) {
                    PopuniTabeluPrimopredajnogZapisnika(predmeti);

                    $('#ppZapisnikNemaRez').hide();
                } else {
                    $('#ppZapisnikNemaRez').show();
                }

            },
            complete: function() {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }
    
    function PopuniTabeluPrimopredajnogZapisnika(predmeti) {
        var dataGrid = [];

        for (var i = 0; i < predmeti.length; ++i) {
            var predmet = predmeti[i];
            var d = $.extend({}, predmet);

            d["id"] = i;

            dataGrid.push(d);
        }

        var columns = [
            {
                field: "IdPredmeta",
                name: '',
                id: 0,
                width: 30,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd tac",
                formatter: LinkPredmetFormatter,
                customPolje: true
            },
            {
                field: "BrojIstorijePredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Broj'),
                id: 1,
                width: 50,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "SifraPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Šifra predmeta'),
                id: 2,
                width: 210,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: SifraPredmetaFormatter
            },
            {
                field: "Podnosilac",
                name: qKonverzija.VratiLokalizovaniTekst('Podnosilac'),
                id: 3,
                width: 165,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "NazivInspektora",
                name: qKonverzija.VratiLokalizovaniTekst('Inspektor'),
                id: 4,
                width: 150,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "Sadrzaj",
                name: qKonverzija.VratiLokalizovaniTekst('Sadržaj'),
                id: 5,
                width: 240,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "OpisIstorijePredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Opis'),
                id: 6,
                width: 135,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "NapomenaIstorijePredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Napomena'),
                id: 7,
                width: 150,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            }
        ];

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#ppZapisnikSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());
        var pager = new Slick.Controls.Pager(dataView, grid, $("#ppZapisnikSlickGridPager"));
        var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();
        });
        dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();
        });
        $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
            var columnId = $(this).data("columnId");
            if (columnId != null) {
                columnFilters[columnId] = $.trim($(this).val());
                dataView.refresh();
            }
        });
        grid.onHeaderRowCellRendered.subscribe(function (e, args) {
            $(args.node).empty();

            if (args.column.id != 0 && args.column.id != 1) {
                var $text = $("<input type='text'>");
                $text.data("columnId", args.column.id).val(columnFilters[args.column.id]);
                $text.appendTo(args.node);
            } else {
                $(args.node).addClass('no-filter');
            }
        });
        grid.onSort.subscribe(function (e, args) {

            var comparer = function (dataRow1, dataRow2) {
                var field = args.sortCol.field;
                var sign = args.sortAsc ? 1 : -1;
                var value1 = dataRow1[field], value2 = dataRow2[field];
                if (value1 != undefined && value2 == undefined) {
                    return 1 * sign;
                } else if (value1 == undefined && value2 != undefined) {
                    return -1 * sign;
                } else if (value1 == undefined && value2 == undefined) {
                    return 0;
                }

                // 0 - string (zbog velikih i malih slova)
                // 1 - ostalo
                var tipPodatka = 0;
                var idCol = args.sortCol.id;
                if (idCol == 1) {
                    tipPodatka = 1;
                }

                var result;

                if (tipPodatka == 1) {
                    result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                } else {
                    var val1 = value1.toLowerCase(),
                        val2 = value2.toLowerCase();
                    result = (val1 == val2 ? 0 : (val1 > val2 ? 1 : -1)) * sign;
                }
                if (result != 0) {
                    return result;
                }
                return 0;
            };

            dataView.sort(comparer);
        });

        grid.onClick.subscribe(function (e, args) {
            var row = args.row;
            if ($(e.target).hasClass("link")) {
                e.stopImmediatePropagation();

                var predmetLink = grid.getDataItem(row);

                var mask = '&idPredmeta=' + predmetLink.IdPredmeta + '&close=true';

                var hash = '#./Predmeti?tipDokumenta=3' + mask;
                window.open(location.origin + hash, '_blank');
            }
        });

        grid.init();

        dataView.beginUpdate();
        dataView.setItems(dataGrid);
        dataView.setFilter(filter);
        dataView.endUpdate();
    }
    
    function ClickBtnStampa() {
        var $btn = $('#ppZapisnikBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var idOrgana = $('#ppZapisnikOrganiCmb').quiComboBox('getSelectedItemData');
        var idKlase = $('#ppZapisnikKlaseCmb').quiComboBox('getSelectedItemData');
        var oznakaKlase = undefined;
        var idJedinice = $('#ppZapisnikJediniceCmb').quiComboBox('getSelectedItemData');
        var oznakaJedinice = undefined;

        if (idOrgana == undefined) {
            oznakaKlase = idKlase;
            idKlase = undefined;

            oznakaJedinice = idJedinice;
            idJedinice = undefined;
        }
        
        var dataObj = {
            datumJ: $('#ppZapisnikDatum').quiDate('getJSONDateNoTZStringify'),
            nazivOrgana: qKonverzija.KonvertujULatinicu($('#ppZapisnikOrganiCmb').quiComboBox('getSelectedItemLabel')),
            nazivKlase: qKonverzija.KonvertujULatinicu($('#ppZapisnikKlaseCmb').quiComboBox('getSelectedItemLabel')),
            nazivJedinice: qKonverzija.KonvertujULatinicu($('#ppZapisnikJediniceCmb').quiComboBox('getSelectedItemLabel')),
            nazivKreatora: qKonverzija.KonvertujULatinicu($('#ppZapisnikKreatoriCmb').quiComboBox('getSelectedItemLabel')),
            idOrgana: idOrgana,
            idKlase: idKlase,
            idJedinice: idJedinice,
            idKreatora: $('#ppZapisnikKreatoriCmb').quiComboBox('getSelectedItemData'),
            samoArhivirani: $('#ppZapisnikSamoArhivirani').prop('checked'),
            oznakaKlase: oznakaKlase,
            oznakaJedinice: oznakaJedinice
        };

        qStampa.PrikaziDijalogStampe(url_VratiStampePrimopredajnogZapisnika, dataObj, false, false, 'POST');

        $btn.removeClass('teloDugmeIskljuceno');
    }
    
    function VratiJediniceAjax(idOrgana) {
        $.ajax({
            type: 'GET',
            url: url_VratiJedinice,
            data: {
                idOrgana: idOrgana
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $('#ppZapisnikJediniceCmb').quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function () {
            }
        });
    }
    
    function VratiKlaseAjax(idOrgana) {
        $.ajax({
            type: 'GET',
            url: url_VratiKlase,
            data: {
                idOkruga: vm.IdOkruga,
                idOrgana: idOrgana
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $('#ppZapisnikKlaseCmb').quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function () {
                
            }
        });
    }

    qPrimopredajniZapisnik.Init = function() {
        vm = qUtils.IzvuciVM();
        
        columnFilters = {};
        grid = undefined;
        dataView = undefined;

        url_VratiPredmetePretrage = $('#url_VratiPredmetePretrage').text();
        url_VratiKlase = $('#url_VratiKlase').text();
        url_VratiJedinice = $('#url_VratiJedinice').text();
        url_VratiStampePrimopredajnogZapisnika = $('#url_VratiStampePrimopredajnogZapisnika').text();

        var $cmbKreatori = $('#ppZapisnikKreatoriCmb');
        $cmbKreatori.quiComboBox({ width: width, listWidth: listWidth, showX: true });
        $cmbKreatori.quiComboBox('setItemsFromBinding', vm.Kreatori, 'Naziv', 'IdElementa');
        
        var $cmbOrgani = $('#ppZapisnikOrganiCmb');
        $cmbOrgani.quiComboBox({ width: width, listWidth: listWidth, showX: true });
        $cmbOrgani.quiComboBox('setItemsFromBinding', vm.Organi, 'Naziv', 'IdElementa');

        var $cmbKlase = $('#ppZapisnikKlaseCmb');
        $cmbKlase.quiComboBox({ width: width, listWidth: listWidth, showX: true });
        $cmbKlase.quiComboBox('setItemsFromBinding', vm.Klase, 'Naziv', 'IdElementa');
        
        var $cmbJedinice = $('#ppZapisnikJediniceCmb');
        $cmbJedinice.quiComboBox({ width: width, listWidth: listWidth, showX: true });
        $cmbJedinice.quiComboBox('setItemsFromBinding', vm.Jedinice, 'Naziv', 'IdElementa');

        var $datum = $('#ppZapisnikDatum');
        $datum.quiDate({ width: width, showX: true });
        
        //events

        $cmbOrgani.on('select', function () {
            var idOrgana = $cmbOrgani.quiComboBox('getSelectedItemData');
            $cmbJedinice.quiComboBox('clearItems');
            $cmbKlase.quiComboBox('clearItems');

            VratiKlaseAjax(idOrgana);
            VratiJediniceAjax(idOrgana);
        });

        $('#ppZapisnikBtnReset').click(ClickBtnReset);
        $('#ppZapisnikBtnPretrazi').click(ClickBtnPretrazi);
        $('#ppZapisnikBtnStampa').click(ClickBtnStampa);
        
        $(window).on('resize.slickgrid', function () {
            if (grid != undefined) {
                grid.resizeCanvas();
            }
        });
    };

}(window.qPrimopredajniZapisnik = window.qPrimopredajniZapisnik || {}, jQuery));

// #endregion

// #region Aktivni predmeti

(function(qAktivniPredmeti, $, undefined) {
    var $datum, pretRez, podaciZaSlickgrid = [],
        url_VratiAktivnePredmete,
        url_VratiStampeAktivnihPredmeta;

    var columnFilters = {};
    var grid;
    var dataView;

    var naziviKolonaSlickgrida = [];

    var options = {
        editable: false,
        enableCellNavigation: true,
        showHeaderRow: true,
        showFooterRow: true,
        headerRowHeight: 30,
        explicitInitialization: true,
        rowHeight: 20
    };

    // #region Metode za slickgrid

    function filter(item) {
        for (var columnId in columnFilters) {
            if (columnId !== undefined && columnFilters[columnId] !== "") {

                //  0 - string
                var tip = 2;

                if (columnId == 1) {
                    tip = 0;
                }

                var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                if (item[c.field] == undefined) {
                    return false;
                }
                else if (tip == 0) {
                    if (!item[c.field].toLowerCase().contains(columnFilters[columnId].toLowerCase())) {
                        return false;
                    }
                } else if (tip == 2) {
                    if (item[c.field] != columnFilters[columnId].toDecimal()) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    function NoNullFormatter(row, cell, value, columnDef, dataContext) {
        return '<div title="' + nonull(value) + '">' + nonull(value) + '</div>';
    }

    function NoNullNumberFormatter(row, cell, value, columnDef, dataContext) {
        return '<div>' + nonull(value) + '</div>';
    }

    function CheckBoxFormatter(row, cell, value, columnDef, dataContext) {
        return "<div style='margin-top:-5px'><div class='chb' id='" + value + "' data-id='" + dataContext.id + "'></div></div>";
    }
    // #endregion

    function ClickBtnIzvoz() {
        if (grid == undefined) {
            return;
        }
        
        var nazivFajla = 'Izvoz';

        var html = '';
        //ovo mora
        html += '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Version>12.00</Version></DocumentProperties><ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel"><ProtectStructure>False</ProtectStructure><ProtectWindows>False</ProtectWindows></ExcelWorkbook> ';

        //stilovi
        html += '<Styles>';
        //stil hedera
        html += '<Style ss:ID="heder" ss:Name="heder"><Alignment ss:Vertical="Center" /><Font ss:Color="#FFFFFF" /><Interior ss:Color="#444444" ss:Pattern="Solid"/></Style>';
        //stil totala - text
        html += '<Style ss:ID="totalTxt" ss:Name="totalTxt"><Alignment ss:Vertical="Center"/><Font ss:Color="#FFFFFF" /><Interior ss:Color="#444444" ss:Pattern="Solid"/></Style>';
        //stil totala - decimal
        html += '<Style ss:ID="totalDecimal" ss:Name="totalDecimal"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/><Font ss:Color="#FFFFFF" /><Interior ss:Color="#444444" ss:Pattern="Solid"/></Style>';
        //stil bodya - text
        html += '<Style ss:ID="bodyTxt" ss:Name="bodyTxt"><Alignment ss:Vertical="Center"/></Style>';
        //stil bodya - decimal
        html += '<Style ss:ID="bodyDecimal" ss:Name="bodyDecimal"><Alignment ss:Vertical="Center" ss:Horizontal="Right"/></Style>';
        html += '</Styles>';

        //sheet
        html += '<Worksheet ss:Name="Sheet1"><Table>';

        var columns = grid.getColumns().filter(function(item) { return item.id != 15; });

        //kolone
        for (var j = 0; j < columns.length; j++) {
            html += '<Column ss:AutoFitWidth="1" ss:Width="65"/>';
        }

        //heder
        html += '<Row>';
        for (var l = 0; l < columns.length; l++) {
            var col = columns[l];
            html += '<Cell ss:StyleID="heder"><Data ss:Type="String">' + col.name + '</Data></Cell>';
        }
        html += '</Row>';

        var predmeti = podaciZaSlickgrid.filter(function (item) { return item.ZaStampu });
        //predmeti
        predmeti.forEach(function(item) {
            //for (var k = 0; k < dataView.getLength(); k++) {// 
            html += '<Row>';
            //var item = dataView.getItem(k);

            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];

                var vrednost = item[column.field];
                var tipPodatkaKolone = "Number";
                if (column.id == 1) {
                    tipPodatkaKolone = "String";
                }
                html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="' + tipPodatkaKolone + '">' + nonull(vrednost) + '</Data></Cell>';
            }

            html += '</Row>';
        });

        html += '</Table></Worksheet></Workbook>';
        var a = document.createElement('a');
        a.download = nazivFajla + '.xls';

        var blob = new Blob([html], { type: 'data:application/vnd.ms-excel' });
        var url = URL.createObjectURL(blob);
        a.href = url;

        //a.click();
        var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
        });
        a.dispatchEvent(clickEvent);
    }

    function ClickBtnPretrazi() {
        var $btn = $(this);
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var datum = $datum.quiDate('getJSONDateNoTZStringify');
        if (datum == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Datum nije izabran.'), 'greska');
            return;
        }

        naziviKolonaSlickgrida = [];

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'GET',
            url: url_VratiAktivnePredmete,
            data: {
                datumJ: datum
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                PopuniTabelu(data.Data);
            },
            complete: function() {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }

    function PopuniTabelu(podaci) {
                pretRez = podaci;
        podaciZaSlickgrid = [];
        if (podaci != undefined && podaci.AktivniPredmeti.length > 0) {
            podaciZaSlickgrid = podaci.AktivniPredmeti;

            for (var k = 0; k < podaciZaSlickgrid.length; ++k) {
                var p = podaciZaSlickgrid[k];
                p.id = k;
                p['RedniBroj'] = k + 1;
                p['ZaStampu'] = true;
            }
        }

        var columns = [
            {
                field: "ZaStampu",
                name: qKonverzija.VratiLokalizovaniTekst(''),
                id: 15,
                width: 30,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: CheckBoxFormatter,
                customPolje: true
            },
            {
                field: "RedniBroj",
                name: qKonverzija.VratiLokalizovaniTekst('Redni broj'),
                id: 0,
                width: 75,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullNumberFormatter
            },
            {
                field: "Inspekcija",
                name: qKonverzija.VratiLokalizovaniTekst('Inspekcija'),
                id: 1,
                width: 300,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            }
        ];

        var idKolone = 2;

        for (var i = 1; i < 12; ++i) {
            var nazivKolone = 'NazivKolone' + i;
            naziviKolonaSlickgrida.push(podaci[nazivKolone]);

            columns.push({
                field: 'Godina' + i,
                name: podaci[nazivKolone],
                id: idKolone,
                width: 42,
                sortable: false,
                headerCssClass: "qTabelaHeadTd " + podaci[nazivKolone],
                cssClass: "qTabelaTd tar",
                formatter: NoNullNumberFormatter
            });

            idKolone++;
        }

        columns.push({
            field: 'Ukupno',
            name: qKonverzija.VratiLokalizovaniTekst('Ukupno'),
            id: idKolone,
            width: 60,
            sortable: false,
            headerCssClass: "qTabelaHeadTd ukupno",
            cssClass: "qTabelaTd tar",
            formatter: NoNullNumberFormatter
        });

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#aktivniPredmetiSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());
        var pager = new Slick.Controls.Pager(dataView, grid, $("#aktivniPredmetiSlickGridPager"));
        var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();

            SracunajTotalGrid();
        });
        dataView.onRowsChanged.subscribe(function (e, args) {
            grid.invalidateRows(args.rows);
            grid.render();

            SracunajTotalGrid();

            $("#aktivniPredmetiSlickGrid").find(".chb").each(function () {
                var $cb = $(this);
                $cb.quiCheckBox({ checked: $cb.attr("id") == "true" });
            });
        });
        $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
            var columnId = $(this).data("columnId");
            if (columnId != null) {
                columnFilters[columnId] = $.trim($(this).val());
                dataView.refresh();
            }
        });
        grid.onHeaderRowCellRendered.subscribe(function (e, args) {
            $(args.node).empty();

            if (args.column.id != 0 && args.column.id != 15) {
                var $text = $("<input type='text'>");
                $text.data("columnId", args.column.id).val(columnFilters[args.column.id]);
                $text.appendTo(args.node);
            } else {
                $(args.node).addClass('no-filter');
            }

            SracunajTotalGrid();
        });
        grid.onColumnsReordered.subscribe(function (e, args) {
            SracunajTotalGrid();
        });
        grid.onColumnsResized.subscribe(function (e, args) {
            $('.slick-header-columns.ui-sortable:eq(0)').find('.qTabelaHeadTd').each(function (index) {
                $('.slick-footer-columns:eq(0)').find('.qTabelaHeadTd:eq(' + index + ')').width($(this).width());
            });
        });
        grid.onSort.subscribe(function (e, args) {
            var comparer = function (dataRow1, dataRow2) {
                var field = args.sortCol.field;
                var sign = args.sortAsc ? 1 : -1;
                var value1 = dataRow1[field], value2 = dataRow2[field];
                if (value1 != undefined && value2 == undefined) {
                    return 1 * sign;
                } else if (value1 == undefined && value2 != undefined) {
                    return -1 * sign;
                } else if (value1 == undefined && value2 == undefined) {
                    return 0;
                }

                // 0 - string (zbog velikih i malih slova)
                // 1 - ostalo
                var tipPodatka = 1;
                var idCol = args.sortCol.id;
                if (idCol == 1) {
                    tipPodatka = 0;
                }

                var result;

                if (tipPodatka == 1) {
                    result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                } else {
                    var val1 = value1.toLowerCase(),
                        val2 = value2.toLowerCase();
                    result = (val1 == val2 ? 0 : (val1 > val2 ? 1 : -1)) * sign;
                }
                if (result != 0) {
                    return result;
                }
                return 0;
            };

            dataView.sort(comparer);

            //$("#aktivniPredmetiSlickGrid").find(".chb").each(function () {
            //    var $cb = $(this);
            //    $cb.quiCheckBox({ checked: $cb.attr("id") == "true" });
            //});
        });
        grid.onScroll.subscribe(function(e, args) {
            $("#aktivniPredmetiSlickGrid").find(".chb").each(function () {
                var $cb = $(this);
                $cb.quiCheckBox({ checked: $cb.attr("id") == "true" });
            });
        });

        grid.init();

        dataView.beginUpdate();
        dataView.setItems(podaciZaSlickgrid);
        dataView.setFilter(filter);
        dataView.endUpdate();
    }

    function SracunajTotalGrid() {
        var $footer = $('.slick-footer-columns:eq(0)');
        var ukupno = 0;

        for (var i = 0; i < naziviKolonaSlickgrida.length; ++i) {
            var nazivKoloneZaKlasu = naziviKolonaSlickgrida[i];

            var broj = 0;
            var kolonaReda = 'Godina' + (i + 1);

            for (var j = 0; j < dataView.getLength(); ++j) {
                var p = dataView.getItem(j);
                if (p.hasOwnProperty(kolonaReda)) {
                    broj += p[kolonaReda] != undefined ? p[kolonaReda] : 0;
                }

                if (i == 0) {
                    ukupno += p['Ukupno'] != undefined ? p['Ukupno'] : 0;
                }
            }

            $footer.find('.qTabelaHeadTd.' + nazivKoloneZaKlasu + ' span').text(broj);
        }

        $footer.find('.qTabelaHeadTd.ukupno span').text(ukupno);
    };

    function PripremiPodatkeZaTabelu(rezultat) {
        // group by po godinama da bi se izvukle kolone
        var kolone = [];
        var podaciZaSlickgrid = [];

        if (rezultat != undefined && rezultat.length > 0) {
            var godine = [], r, kljucGodina;
            for (var i = 0; i < rezultat.length; i++) {
                r = rezultat[i];
                kljucGodina = r.Godina;

                if ($.inArray(kljucGodina, godine) == -1) {
                    godine.push(kljucGodina);
                }
            }

            var minGodina = Math.min.apply(Math, godine);
            var maxGodina = Math.max.apply(Math, godine);

            for (var i = minGodina; i <= maxGodina; ++i) {
                kolone.push(i);
            }

            // group by po inspekciji 
            var inspekcije = {}, inspekcija, kljucInspekcija;
            for (var i = 0; i < rezultat.length; i++) {
                inspekcija = rezultat[i];
                kljucInspekcija = inspekcija.Inspekcija;

                if (!inspekcije[kljucInspekcija]) {
                    inspekcije[kljucInspekcija] = [];
                }
                inspekcije[kljucInspekcija].push(inspekcija);
            }

            var idZaSlickgrid = 0;
            var redniBroj = 1;

            for (var key in inspekcije) {
                if (inspekcije.hasOwnProperty(key)) {
                    var nizInspekcija = inspekcije[key];

                    // objekat [nizInspekcija] predstavlja niz inspekcija grupisanih po nazivu inspekcije
                    if (nizInspekcija != undefined && nizInspekcija.length > 0) {
                        var podatak = {
                            id: idZaSlickgrid,
                            Naziv: key,
                            RedniBroj: redniBroj
                        };

                        var ukupnoZaRed = 0;

                        for (var i = 0; i < nizInspekcija.length; ++i) {
                            var insp = nizInspekcija[i];
                            // da brojevi budu stringovi kako bi se lakse vrsila pretraga
                            if (insp.BrojPredmeta != undefined) {
                                ukupnoZaRed += insp.BrojPredmeta;
                            }
                            podatak[insp.Godina] = insp.BrojPredmeta != undefined ? insp.BrojPredmeta.toString() : "0";
                        }

                        podatak['Ukupno'] = ukupnoZaRed.toString();

                        idZaSlickgrid++;
                        redniBroj++;
                        podaciZaSlickgrid.push(podatak);
                    }
                }
            }
        }

        var pripremljeniPodaci = {
            kolone: kolone,
            podaciZaSlickgrid: podaciZaSlickgrid
        }

        return pripremljeniPodaci;
    }

    function ClickBtnStampa() {
        var $btn = $('#aktivniPredmetiBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var datum = $datum.quiDate('getJSONDateNoTZStringify');

        if (datum == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), dqKonverzija.VratiLokalizovaniTekst('Datum nije izabran.'), 'greska');
            return;
        }

        pretRez.AktivniPredmeti = podaciZaSlickgrid.filter(function (item) { return item.ZaStampu });
            //pretRez.AktivniPredmeti.filter(function (item) { return item.ZaStampu });

        var dataObj = {
            datumJ: datum,
            vmJ: JSON.stringify(pretRez)
        };

        qStampa.PrikaziDijalogStampe(url_VratiStampeAktivnihPredmeta, dataObj, false, false, 'POST');

        $btn.removeClass('teloDugmeIskljuceno');
    }

    qAktivniPredmeti.Init = function () {
        var vm = qUtils.IzvuciVM();

        columnFilters = {};
        grid = undefined;
        dataView = undefined;

        naziviKolonaSlickgrida = [];
        podaciZaSlickgrid = [];

        url_VratiAktivnePredmete = $('#url_VratiAktivnePredmete').text();
        url_VratiStampeAktivnihPredmeta = $('#url_VratiStampeAktivnihPredmeta').text();

        $datum = $('#aktivniPredmetiDatum');

        $datum.quiDate({ width: 200, showX: false });

        $('#aktivniPredmetiBtnPretrazi').click(ClickBtnPretrazi);
        $('#aktivniPredmetiBtnIzvoz').click(ClickBtnIzvoz);
        $('#aktivniPredmetiBtnStampa').click(ClickBtnStampa);

        $(window).on('resize.slickgrid', function () {
            if (grid != undefined) {
                grid.resizeCanvas();
            }

            $("#aktivniPredmetiSlickGrid").find(".chb").each(function () {
                var $cb = $(this);
                $cb.quiCheckBox({ checked: $cb.attr("id") == "true" });
            });
        });

        PopuniTabelu(vm);

        $('#aktivniPredmetiOznaciSve').quiCheckBox({ checked: true });

        $('#aktivniPredmetiSlickGrid').on('change', '.chb', function (e, check) {
            var id = $(this).attr('data-id');

            var stavkaZaTotal = dataView.getItemById(id);
            stavkaZaTotal.ZaStampu = check;
            $(this).attr('id', check);
            dataView.updateItem(stavkaZaTotal.id, stavkaZaTotal);
        });

        $('#aktivniPredmetiOznaciSve').on('change', function(e, check) {
            podaciZaSlickgrid.forEach(function(item) { item.ZaStampu = check; });

            dataView.beginUpdate();
            dataView.setItems(podaciZaSlickgrid);
            dataView.endUpdate();
            grid.invalidateAllRows();

            setTimeout(function () { $(window).trigger('resize'); }, 1);
        });
    };

}(window.qAktivniPredmeti = window.qAktivniPredmeti || {}, jQuery));

// #endregion