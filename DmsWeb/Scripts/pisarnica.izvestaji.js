//#region Sintetika - Analitika
(function(qIzvestaji, $, undefined) {

    var vm,
        tipIzvestaja,
        $grupisanje,
        $sintetikaRadioWrap,
        $okruzi,
        $opstine,
        $mestaOpstine,
        $organi,
        $klase,
        $godine,
        $predmet,
        $jedinice,
        $datumOd,
        $datumDo,
        $rokRadioWrap,
        $statusi,
        $podnosilac,
        $liceKontrole,
        $sadrzaj,
        $vrstePredmeta,
        $rok,
        $takse,
        $straniBroj,
        $datumKretanja,
        $vrsteKretanja,
        $opisKretanja,
        $inspektori,
        $kreatori,
        $oznakaOrgana,
        $oznakaKlase,
        $oznakaJedinice,
        $datumiRadioWrap,
        width = 150,
        width1 = 100,
        width2 = 70,
        width3 = 254,
        listWidth = 300,
        tekucaGodina,
        url_VratiOpstine,
        url_VratiKlase,
        url_VratiJedinice,
        url_VratiInspektoreOkruga,
        url_BrisanjePredmeta,
        url_VratiPredmetePretrage,
        url_VratiStampePretrazenihPredmeta,
        url_VratiStampeSintetikePredmeta,
        url_VratiMestaOpstine;

    var _scrTabelaOduzimac = 360;
    
    var columnFiltersAnalitika = {};
    var gridAnalitika;

    var dataViewAnalitika;

    var optionsAnalitika = {
        editable: false,
        enableCellNavigation: true,
        showHeaderRow: true,
        headerRowHeight: 30,
        explicitInitialization: true,
        rowHeight: 20
    };
    
    var columnFiltersSintetika = {};
    var gridSintetika;

    var dataViewSintetika;

    var optionsSintetika = {
        editable: false,
        enableCellNavigation: true,
        showHeaderRow: true,
        showFooterRow: true,
        headerRowHeight: 30,
        explicitInitialization: true,
        rowHeight: 20
    };
    
    /**********************************************
    ******** Funkcije za SLICKGRID  BEGIN *********
    ***********************************************/

    function filterAnalitika(item) {
        for (var columnId in columnFiltersAnalitika) {
            if (columnId !== undefined && columnFiltersAnalitika[columnId] !== "") {

                var c = gridAnalitika.getColumns()[gridAnalitika.getColumnIndex(columnId)];
                if (item[c.field] == undefined) {
                    return false;
                }
                else if (!item[c.field].toLowerCase().contains(columnFiltersAnalitika[columnId].toLowerCase())) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function filterSintetika(item) {
        for (var columnId in columnFiltersSintetika) {
            if (columnId !== undefined && columnFiltersSintetika[columnId] !== "") {

                //  0 - string,
                //  2 - money
                var tip = 2;

                if (columnId == 1) {
                    tip = 0;
                }

                var c = gridSintetika.getColumns()[gridSintetika.getColumnIndex(columnId)];
                if (item[c.field] == undefined) {
                    return false;
                }
                else if (tip == 0) {
                    if (!item[c.field].toLowerCase().contains(columnFiltersSintetika[columnId].toLowerCase())) {
                        return false;
                    }
                } else if (tip == 2) {
                    if (item[c.field] != columnFiltersSintetika[columnId].toDecimal()) {
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
        return '<div title="' + nonull(value) + '">' + nonull(value) + '</div>';
    }
    
    function RedniBrojFormatter(row, cell, value, columnDef, dataContext) {
        return row + 1;
    }

    /**********************************************
    ******** Funkcije za SLICKGRID  END ***********
    **********************************************/

    function ClickBtnReset() {

        if (vm.Okruzi && vm.Okruzi.length > 1) {
            $okruzi.quiComboBox('clearSelection');
        }

        $organi.quiComboBox('clearSelection');
        $opstine.quiComboBox('clearSelection');
        $mestaOpstine.quiComboBox('clearSelection');
        $klase.quiComboBox('clearSelection');
        $godine.quiComboBox('selectItemByData', tekucaGodina);
        $predmet.val('');
        $jedinice.quiComboBox('clearSelection');
        $datumOd.quiDate('clearDate');
        $datumDo.quiDate('clearDate');
        $rokRadioWrap.find('input[value="0"]').prop('checked', true);
        $statusi.quiComboBox('clearSelection');
        $kreatori.quiComboBox('clearSelection');
        $podnosilac.val('');
        $liceKontrole.val('');
        $sadrzaj.val('');
        $vrstePredmeta.quiComboBox('clearSelection');
        $rok.val('');
        $takse.quiComboBox('clearSelection');
        $straniBroj.val('');
        $datumKretanja.quiDate('clearDate');
        $vrsteKretanja.quiComboBox('clearSelection');
        $opisKretanja.val('');
        $inspektori.quiComboBox('clearSelection');
        
        $sintetikaRadioWrap.find('input[value="0"]').prop('checked', true);
        
        $datumiRadioWrap.find('input[value="0"]').prop('checked', true);

        $('#izvestajiNemaRez').hide();
        
        $('#izvestajiAnalitikaSlickGrid').empty();
        $('#izvestajiAnalitikaSlickGridPager').empty();
        $('#izvestajiSintetikaSlickGrid').empty();
        $('#izvestajiSintetikaSlickGridPager').empty();

        gridAnalitika = undefined;
        gridSintetika = undefined;
        columnFiltersAnalitika = {};
        columnFiltersSintetika = {};

        $('#izvestajiSintetikaSlickGridWrap').hide();
        $('#izvestajiAnalitikaSlickGridWrap').hide();
    }
    
    function ClickBtnResetZaAnalitikuKlasa() {
        if (vm.Okruzi && vm.Okruzi.length > 1) {
            $okruzi.quiComboBox('clearSelection');
        }

        $klase.quiComboBox('clearSelection');
        $godine.quiComboBox('selectItemByData', tekucaGodina);
        $predmet.val('');
        $jedinice.quiComboBox('clearSelection');
        $datumOd.quiDate('clearDate');
        $datumDo.quiDate('clearDate');
        $rokRadioWrap.find('input[value="0"]').prop('checked', true);
        $statusi.quiComboBox('clearSelection');
        $kreatori.quiComboBox('clearSelection');
        $podnosilac.val('');
        $liceKontrole.val('');
        $sadrzaj.val('');
        $vrstePredmeta.quiComboBox('clearSelection');
        $rok.val('');
        $takse.quiComboBox('clearSelection');
        $straniBroj.val('');
        $datumKretanja.quiDate('clearDate');
        $vrsteKretanja.quiComboBox('clearSelection');
        $opisKretanja.val('');
        $inspektori.quiComboBox('clearSelection');

        $sintetikaRadioWrap.find('input[value="0"]').prop('checked', true);

        $('#izvestajiNemaRez').hide();
        
        $('#izvestajiSintetikaSlickGrid').empty();
        $('#izvestajiSintetikaSlickGridPager').empty();

        $('#izvestajiAnalitikaSlickGrid').empty();
        $('#izvestajiAnalitikaSlickGridPager').empty();

        
        $('#izvestajiSintetikaSlickGridWrap').hide();
        $('#izvestajiAnalitikaSlickGridWrap').hide();
    }

    function ClickBtnPretrazi() {
        var $btn = $('#izvestajiBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var elementPretrage = PreuzmiPodatkeZaPretragu();
        var izabranaSintetika = $sintetikaRadioWrap.find('input[value="0"]').prop('checked');

        $('#izvestajiSintetikaSlickGrid').empty();
        $('#izvestajiSintetikaSlickGridPager').empty();
        
        $('#izvestajiAnalitikaSlickGrid').empty();
        $('#izvestajiAnalitikaSlickGridPager').empty();
        
        $('#izvestajiSintetikaSlickGridWrap').hide();
        $('#izvestajiAnalitikaSlickGridWrap').hide();
        
        gridAnalitika = undefined;
        gridSintetika = undefined;
        columnFiltersAnalitika = {};
        columnFiltersSintetika = {};
        
        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'GET',
            url: url_VratiPredmetePretrage,
            data: {
                pretragaJ: JSON.stringify(elementPretrage),
                sintetika: izabranaSintetika,
                tipIzvestaja: tipIzvestaja
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data,
                    html = '';

                if (predmeti && predmeti.length > 0) {
                    if (izabranaSintetika) {
                        PopuniTabeluSintetike(predmeti);
                    } else {
                        PopuniTabeluAnalitike(predmeti);
                    }
                    
                    $('#izvestajiNemaRez').hide();
                } else {
                    $('#izvestajiNemaRez').show();
                }
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }
    
    function PopuniTabeluSintetike(predmeti) {
        $('#izvestajiSintetikaSlickGridWrap').show();

        var dataGrid = [];
        
        for (var i = 0; i < predmeti.length; ++i) {
            var predmet = predmeti[i];
            var d = $.extend({}, predmet);

            d["id"] = i;

            dataGrid.push(d);
        }
        
        var columns = [
            {
                field: "RedniBroj",
                name: qKonverzija.VratiLokalizovaniTekst('R. br.'),
                id: 0,
                width: 45,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: RedniBrojFormatter
            },
            {
                field: "Grupisanje",
                name: qKonverzija.VratiLokalizovaniTekst('Grupisanje'),
                id: 1,
                width: 220,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "UkupanBrojPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Ukupan broj'),
                id: 2,
                width: 85,
                sortable: true,
                headerCssClass: "qTabelaHeadTd ukupno",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojRezervisanihPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Rezervisani'),
                id: 3,
                width: 85,
                sortable: true,
                headerCssClass: "qTabelaHeadTd rezervisani",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojAktivnihPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Aktivni'),
                id: 4,
                width: 85,
                sortable: true,
                headerCssClass: "qTabelaHeadTd aktivni",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojZatvorenihPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Zatvoreni'),
                id: 5,
                width: 85,
                sortable: true,
                headerCssClass: "qTabelaHeadTd zatvoreni",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojPrezavedenihPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Prezavedeni'),
                id: 6,
                width: 85,
                sortable: true,
                headerCssClass: "qTabelaHeadTd prezavedeni",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojPredmetaURokovniku",
                name: qKonverzija.VratiLokalizovaniTekst('U rokovniku'),
                id: 7,
                width: 85,
                sortable: true,
                headerCssClass: "qTabelaHeadTd rokovnik",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojObrisanihhPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Obrisani'),
                id: 8,
                width: 85,
                sortable: true,
                headerCssClass: "qTabelaHeadTd obrisani",
                cssClass: "qTabelaTd"
            },
{
                field: "BrojRezervisanihPredmetaPrekoRoka",
                name: qKonverzija.VratiLokalizovaniTekst('Rezervisani preko roka'),
                id: 9,
                width: 150,
                sortable: true,
                headerCssClass: "qTabelaHeadTd rezervisaniPrekoRoka",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojOtvorenihPredmetaPrekoRoka",
                name: qKonverzija.VratiLokalizovaniTekst('Otvoreni preko roka'),
                id: 10,
                width: 140,
                sortable: true,
                headerCssClass: "qTabelaHeadTd otvoreniPrekoRoka",
                cssClass: "qTabelaTd"
            }
        ];
        
        dataViewSintetika = new Slick.Data.DataView();
        gridSintetika = new Slick.Grid("#izvestajiSintetikaSlickGrid", dataViewSintetika, columns, optionsSintetika);
        gridSintetika.setSelectionModel(new Slick.RowSelectionModel());
        var pager = new Slick.Controls.Pager(dataViewSintetika, gridSintetika, $("#izvestajiSintetikaSlickGridPager"));
        var columnpicker = new Slick.Controls.ColumnPicker(columns, gridSintetika, optionsSintetika);

        dataViewSintetika.onRowCountChanged.subscribe(function (e, args) {
            gridSintetika.updateRowCount();
            gridSintetika.render();

            SracunajTotalGridSintetike();
        });
        dataViewSintetika.onRowsChanged.subscribe(function (e, args) {
            gridSintetika.invalidateRows(args.rows);
            gridSintetika.render();

            SracunajTotalGridSintetike();
        });
        $(gridSintetika.getHeaderRow()).delegate(":input", "change keyup", function (e) {
            var columnId = $(this).data("columnId");
            if (columnId != null) {
                columnFiltersSintetika[columnId] = $.trim($(this).val());
                dataViewSintetika.refresh();
            }
        });
        gridSintetika.onHeaderRowCellRendered.subscribe(function (e, args) {
            $(args.node).empty();
            if (args.column.id != 0) {
                var $text = $("<input type='text'>");
                $text.data("columnId", args.column.id).val(columnFiltersSintetika[args.column.id]);
                $text.appendTo(args.node);
            } else {
                $(args.node).addClass('no-filter');
            }

            SracunajTotalGridSintetike();
        });
        gridSintetika.onColumnsReordered.subscribe(function(e, args) {
            SracunajTotalGridSintetike();
        });
        gridSintetika.onColumnsResized.subscribe(function (e, args) {
            $('.slick-header-columns.ui-sortable:eq(0)').find('.qTabelaHeadTd').each(function (index) {
                $('.slick-footer-columns:eq(0)').find('.qTabelaHeadTd:eq(' + index + ')').width($(this).width());
            });
        });
        gridSintetika.onSort.subscribe(function (e, args) {

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

            dataViewSintetika.sort(comparer);
        });
        gridSintetika.onSelectedRowsChanged.subscribe(function (e, args) {
            if (args.rows.length > 0) {
                var sintetika = args.grid.getDataItem(args.rows[0]);
                SkokNaAnalitiku(sintetika);
            }
        });

        gridSintetika.init();

        dataViewSintetika.beginUpdate();
        dataViewSintetika.setItems(dataGrid);
        dataViewSintetika.setFilter(filterSintetika);
        dataViewSintetika.endUpdate();
    }

    function PopuniTabeluAnalitike(predmeti) {
        $('#izvestajiAnalitikaSlickGridWrap').show();

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
                field: "RedniBroj",
                name: qKonverzija.VratiLokalizovaniTekst('Redni broj'),
                id: 1,
                width: 75,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: RedniBrojFormatter
            },
            {
                field: "SifraPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Šifra predmeta'),
                id: 2,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: SifraPredmetaFormatter
            },
            {
                field: "Podnosilac",
                name: qKonverzija.VratiLokalizovaniTekst('Podnosilac'),
                id: 3,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "NazivInspektora",
                name: qKonverzija.VratiLokalizovaniTekst('Inspektor'),
                id: 4,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "Sadrzaj",
                name: qKonverzija.VratiLokalizovaniTekst('Sadržaj'),
                id: 5,
                width: 260,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "LiceKontrole",
                name: qKonverzija.VratiLokalizovaniTekst('Lice kontrole'),
                id: 6,
                width: 160,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            }
        ];

        dataViewAnalitika = new Slick.Data.DataView();
        gridAnalitika = new Slick.Grid("#izvestajiAnalitikaSlickGrid", dataViewAnalitika, columns, optionsAnalitika);
        gridAnalitika.setSelectionModel(new Slick.RowSelectionModel());
        var pager = new Slick.Controls.Pager(dataViewAnalitika, gridAnalitika, $("#izvestajiAnalitikaSlickGridPager"));
        var columnpicker = new Slick.Controls.ColumnPicker(columns, gridAnalitika, optionsAnalitika);

        dataViewAnalitika.onRowCountChanged.subscribe(function (e, args) {
            gridAnalitika.updateRowCount();
            gridAnalitika.render();
        });
        dataViewAnalitika.onRowsChanged.subscribe(function (e, args) {
            gridAnalitika.invalidateRows(args.rows);
            gridAnalitika.render();
        });
        $(gridAnalitika.getHeaderRow()).delegate(":input", "change keyup", function (e) {
            var columnId = $(this).data("columnId");
            if (columnId != null) {
                columnFiltersAnalitika[columnId] = $.trim($(this).val());
                dataViewAnalitika.refresh();
            }
        });
        gridAnalitika.onHeaderRowCellRendered.subscribe(function (e, args) {
            $(args.node).empty();

            if (args.column.id != 0 && args.column.id != 1) {
                var $text = $("<input type='text'>");
                $text.data("columnId", args.column.id).val(columnFiltersAnalitika[args.column.id]);
                $text.appendTo(args.node);
            } else {
                $(args.node).addClass('no-filter');
            }
        });
        gridAnalitika.onSort.subscribe(function (e, args) {

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

                var result;

                var val1 = value1.toLowerCase(),
                        val2 = value2.toLowerCase();
                result = (val1 == val2 ? 0 : (val1 > val2 ? 1 : -1)) * sign;
                
                if (result != 0) {
                    return result;
                }
                return 0;
            };

            dataViewAnalitika.sort(comparer);
        });

        gridAnalitika.onClick.subscribe(function (e, args) {
            var row = args.row;
            if ($(e.target).hasClass("link")) {
                e.stopImmediatePropagation();

                var predmetLink = gridAnalitika.getDataItem(row);

                var mask = '&idPredmeta=' + predmetLink.IdPredmeta + '&close=true';

                var hash = '#./Predmeti?tipDokumenta=3' + mask;
                window.open(location.origin + hash, '_blank');
            }
        });

        gridAnalitika.init();

        dataViewAnalitika.beginUpdate();
        dataViewAnalitika.setItems(dataGrid);
        dataViewAnalitika.setFilter(filterAnalitika);
        dataViewAnalitika.endUpdate();
    }

    function SracunajTotalGridSintetike() {
        var brojPredmeta = 0,
            brojRezervisanihPredmeta = 0,
            brojAktivnihPredmeta = 0,
            brojZatvorenihPredmeta = 0,
            brojObrisanihPredmeta = 0,
            brojrokovnik = 0,
            brojprezavedeni = 0,
            brojZatvorenihPredmetaPrekoRoka = 0,
            brojOtvorenihPredmetaPrekoRoka = 0;
        
        for (var i = 0; i < dataViewSintetika.getLength() ; ++i) {
            var p = dataViewSintetika.getItem(i);

            brojPredmeta += p.UkupanBrojPredmeta;
            brojRezervisanihPredmeta += p.BrojRezervisanihPredmeta;
            brojAktivnihPredmeta += p.BrojAktivnihPredmeta;
            brojZatvorenihPredmeta += p.BrojZatvorenihPredmeta;
            brojprezavedeni += p.BrojPrezavedenihPredmeta;
            brojrokovnik += p.BrojPredmetaURokovniku;
            brojObrisanihPredmeta += p.BrojObrisanihhPredmeta;
            brojZatvorenihPredmetaPrekoRoka += p.BrojRezervisanihPredmetaPrekoRoka;
            brojOtvorenihPredmetaPrekoRoka += p.BrojOtvorenihPredmetaPrekoRoka;          
        }
        
        var $footer = $('.slick-footer-columns:eq(0)');
        $footer.find('.qTabelaHeadTd.ukupno span').text(brojPredmeta);
        $footer.find('.qTabelaHeadTd.rezervisani span').text(brojRezervisanihPredmeta);
        $footer.find('.qTabelaHeadTd.aktivni span').text(brojAktivnihPredmeta);
        $footer.find('.qTabelaHeadTd.zatvoreni span').text(brojZatvorenihPredmeta);
        $footer.find('.qTabelaHeadTd.prezavedeni span').text(brojprezavedeni);
        $footer.find('.qTabelaHeadTd.rokovnik span').text(brojrokovnik);
        $footer.find('.qTabelaHeadTd.obrisani span').text(brojObrisanihPredmeta);
        $footer.find('.qTabelaHeadTd.rezervisaniPrekoRoka span').text(brojZatvorenihPredmetaPrekoRoka);
        $footer.find('.qTabelaHeadTd.otvoreniPrekoRoka span').text(brojOtvorenihPredmetaPrekoRoka);
    };

    function PreuzmiPodatkeZaPretragu() {
        var idOrgana = $organi.quiComboBox('getSelectedItemData');
        var idKlase = $klase.quiComboBox('getSelectedItemData');
        var oznakaKlase = $oznakaKlase.val().trimnull();
        var idJedinice = $jedinice.quiComboBox('getSelectedItemData');
        var oznakaJedinice = $oznakaJedinice.val().trimnull();

        if (idOrgana == undefined) {
            if (idKlase != undefined) {
                oznakaKlase = idKlase;
                idKlase = undefined;
            }

            if (idJedinice != undefined) {
                oznakaJedinice = idJedinice;
                idJedinice = undefined;
            }
        }

        var element = {
            IdOkruga: $okruzi.quiComboBox('getSelectedItemData'),
            IdOrgana: $organi.quiComboBox('getSelectedItemData'),
            IdKlase: idKlase,
            BrojPredmeta: $predmet.val().trimnull(),
            Godina: $godine.quiComboBox('getSelectedItemData'),
            OdDatuma: $datumOd.quiDate('getJSONDateNoTZ'),
            DoDatuma: $datumDo.quiDate('getJSONDateNoTZ'),
            IdJedinice: idJedinice,
            Status: $statusi.quiComboBox('getSelectedItemData'),
            IdKreatora: $kreatori.quiComboBox('getSelectedItemData'),
            IdVrstePredmeta: $vrstePredmeta.quiComboBox('getSelectedItemData'),
            IdInspektora: $inspektori.quiComboBox('getSelectedItemData'),
            Podnosilac: $podnosilac.val().trimnull(),
            LiceKontrole: $liceKontrole.val().trimnull(),
            Sadrzaj: $sadrzaj.val().trimnull(),
            IdTakse: $takse.quiComboBox('getSelectedItemData'),
            StraniBroj: $straniBroj.val().trimnull(),
            Rok: $rok.val().trimnull(),
            //ako je prvi selektovan onda je pre roka true
            PreRoka: $('#izvestajiRokRadioWrap').find('input:eq(0)').prop('checked'),
            DatumKretanja: $datumKretanja.quiDate('getJSONDateNoTZ'),
            IdKretanjaPredmeta: $vrsteKretanja.quiComboBox('getSelectedItemData'),
            OpisKretanja: $opisKretanja.val().trimnull(),
            IdOpstine: $opstine.quiComboBox('getSelectedItemData'),
            OznakaOrgana: $oznakaOrgana.val().trimnull(),
            OznakaKlase: oznakaKlase,
            OznakaJedinice: oznakaJedinice,
            GledanjeDatumaKreiranja: $datumiRadioWrap.find('input:eq(0)').prop('checked'),
            IdMestaOpstine: $mestaOpstine.quiComboBox('getSelectedItemData')
        };

        return element;
    }
    
    function ClickBtnStampa() {
        var $btn = $('#izvestajiBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;
        
        var izabranaSintetika = $sintetikaRadioWrap.find('input[value="0"]').prop('checked');
        
        $btn.addClass('teloDugmeIskljuceno');
        if (izabranaSintetika) {
            var stavke = PreuzmiPodatkeZaStampuSintetike();

            if (stavke && stavke.length > 0) {
                var dataObjS = {
                    stavkeJ: JSON.stringify(stavke),
                    tipIzvestaja: tipIzvestaja
                };
                qStampa.PrikaziDijalogStampe(url_VratiStampeSintetikePredmeta, dataObjS, false, false, 'POST');
            }

            $btn.removeClass('teloDugmeIskljuceno');
        } else {
            var predmeti = PreuzmiPodatkeZaStampuAnalitike();
            if (predmeti && predmeti.length > 0) {
                var dataObjA = {
                    listaPredmetaJ: JSON.stringify(predmeti)
                };

                qStampa.PrikaziDijalogStampe(url_VratiStampePretrazenihPredmeta, dataObjA, false, false, 'POST');
            }

            $btn.removeClass('teloDugmeIskljuceno');
        }
    }
    
    function PreuzmiPodatkeZaStampuSintetike() {
        if (gridSintetika == undefined || dataViewSintetika == undefined) return undefined;
        
        var stavke = [];
        
        var predmetiPretrage = dataViewSintetika.getItems();

        for (var i = 0; i < predmetiPretrage.length; ++i) {
            var p = predmetiPretrage[i];

            var stavka = {
                Grupisanje: qKonverzija.VratiLokalizovaniTekst(p.Grupisanje),
                UkupanBrojPredmeta: p.UkupanBrojPredmeta,
                BrojRezervisanihPredmeta: p.BrojRezervisanihPredmeta,
                BrojAktivnihPredmeta: p.BrojAktivnihPredmeta,
                BrojZatvorenihPredmeta: p.BrojZatvorenihPredmeta,
                BrojObrisanihhPredmeta: p.BrojObrisanihhPredmeta,
                BrojOtvorenihPredmetaPrekoRoka: p.BrojOtvorenihPredmetaPrekoRoka
            };

            stavke.push(stavka);
        }

        return stavke;
    }
    
    function PreuzmiPodatkeZaStampuAnalitike() {
        if (gridAnalitika == undefined || dataViewAnalitika == undefined) return undefined;

        var predmeti = [];
        
        var predmetiPretrage = dataViewAnalitika.getItems();

        for (var i = 0; i < predmetiPretrage.length; ++i) {
            var p = predmetiPretrage[i];

            predmeti.push(p.IdPredmeta);
        }

        return predmeti;
    }

    function InicijalizujDogadjajeNaInputCeoBrojPozivan($inputCeoBrojPozitivan) {
        $inputCeoBrojPozitivan.css('text-align', 'right');

        $inputCeoBrojPozitivan.on('click', function () {
            $inputCeoBrojPozitivan.select();
        });

        $inputCeoBrojPozitivan.on('focus', function () {
            $inputCeoBrojPozitivan.val($inputCeoBrojPozitivan.val()).css('text-align', 'left');
        });

        $inputCeoBrojPozitivan.on('blur', function () {
            $inputCeoBrojPozitivan.css('text-align', 'right');

            var izmenjenText = $inputCeoBrojPozitivan.val().trim();

            if (izmenjenText === "") {
                $inputCeoBrojPozitivan.val(izmenjenText);
                $inputCeoBrojPozitivan.attr('data-val', izmenjenText);
                return;
            }

            var text = parseInt(izmenjenText);

            if (isNaN(text) || text < 0) {
                $inputCeoBrojPozitivan.val($inputCeoBrojPozitivan.attr('data-val'));
                return;
            }

            if (text == $inputCeoBrojPozitivan.attr('data-val')) {
                $inputCeoBrojPozitivan.val(text);
                return;
            }

            $inputCeoBrojPozitivan.val(text);
            $inputCeoBrojPozitivan.attr('data-val', text);
        });

        $inputCeoBrojPozitivan.on('keypress', function (event) {
            if (event.keyCode == 13) {
                $inputCeoBrojPozitivan.blur();
            }
        });
    }

    function VratiOpstineAjax(idOkruga) {
        $.ajax({
            type: 'GET',
            url: url_VratiOpstine,
            data: {
                idOkruga: idOkruga
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $opstine.quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function () {;
            }
        });
    }

    function VratiKlaseAjax(idOkruga, idOrgana, idKlase) {
        $.ajax({
            type: 'GET',
            url: url_VratiKlase,
            data: {
                idOkruga: idOkruga,
                idOrgana: idOrgana
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $klase.quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
                if (idKlase != undefined) {
                    // kad se prosledi kalsa - slucaj skoka na analitiku ako je grupisanje po klasi
                    $klase.quiComboBox('selectItemByData', idKlase);
                    // zbog toga treba da se okine pretraga
                    ClickBtnPretrazi();
                }
            },
            complete: function () {;
            }
        });
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

                $jedinice.quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function () {;
            }
        });
    }

    function VratiInspektoreAjax(idOkruga) {
        $.ajax({
            type: 'GET',
            url: url_VratiInspektoreOkruga,
            data: {
                idOkruga: idOkruga
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $inspektori.quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function () {
            }
        });
    }
    
    function SkokNaAnalitiku(sintetika) {
        $sintetikaRadioWrap.find('input[value="1"]').prop('checked', true);

        var idGrupisanja = sintetika.IdGrupisanja;

        switch(tipIzvestaja) {
            case 1:
                $kreatori.quiComboBox('selectItemByData', idGrupisanja);
                ClickBtnPretrazi();
                break;
            case 2:
                $inspektori.quiComboBox('selectItemByData', idGrupisanja);
                ClickBtnPretrazi();
                break;
            case 3:
                $organi.quiComboBox('selectItemByData', idGrupisanja);
                ClickBtnPretrazi();
                break;
            case 4:
                if (idGrupisanja.contains('|')) {
                    var kljucevi = idGrupisanja.split('|');
                    if (kljucevi.length == 2) {
                        var idOrgana = kljucevi[0];
                        var idKlase = kljucevi[1];

                        $organi.quiComboBox('selectItemByDataNoTrigger', idOrgana);
                        var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
                        VratiKlaseAjax(idOkruga, idOrgana, idKlase);
                    }
                }
                break;
            case 5:
                $sadrzaj.val(idGrupisanja);
                ClickBtnPretrazi();
                break;
            case 6:
                $statusi.quiComboBox('selectItemByData', idGrupisanja);
                ClickBtnPretrazi();
                break;
        }
    }

    function VratiMestaOpstineAjax(idOkruga, idOpstine) {
        $.ajax({
            type: 'GET',
            url: url_VratiMestaOpstine,
            data: {
                idOkruga: idOkruga,
                idOpstine: idOpstine
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $mestaOpstine.quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function () {
            }
        });
    }

    qIzvestaji.Init = function() {
        vm = qUtils.IzvuciVM("#vm", true);

        $('#izvestajiNaslov').text($('#meniIzvestaji').find('.hederMeniDugme.meniDugmeKliknuto .hederMeniDugmeText').text());
        
        columnFiltersAnalitika = {};
        gridAnalitika = undefined;
        dataViewAnalitika = undefined;
        
        columnFiltersSintetika = {};
        gridSintetika = undefined;
        dataViewSintetika = undefined;

        tipIzvestaja = parseInt($('#tipIzvestaja').text().trimnull());

        tekucaGodina = $("#tekucaGodina").text().trimnull();

        url_VratiOpstine = $('#url_VratiOpstine').text();
        url_VratiKlase = $('#url_VratiKlase').text();
        url_VratiJedinice = $('#url_VratiJedinice').text();
        url_VratiInspektoreOkruga = $('#url_VratiInspektoreOkruga').text();
        url_BrisanjePredmeta = $('#url_BrisanjePredmeta').text();
        url_VratiPredmetePretrage = $('#url_VratiPredmetePretrage').text();
        url_VratiStampePretrazenihPredmeta = $('#url_VratiStampePretrazenihPredmeta').text();
        url_VratiStampeSintetikePredmeta = $('#url_VratiStampeSintetikePredmeta').text();
        url_VratiMestaOpstine = $('#url_VratiMestaOpstine').text();

        $oznakaOrgana = $('#izvestajiOznakaOrgana');
        $oznakaKlase = $('#izvestajiOznakaKlase');
        $oznakaJedinice = $('#izvestajiOznakaJedinice');

        $grupisanje = $('#izvestajiGrupisanje');
        $sintetikaRadioWrap = $('#izvestajiSintetikaRadioWrap');

        $okruzi = $('#izvestajiOkruzi');
        $opstine = $('#izvestajiOpstine');
        $mestaOpstine = $('#izvestajiMestaOpstine');
        $organi = $('#izvestajiOrgani');
        $klase = $('#izvestajiKlase');
        $godine = $('#izvestajiGodine');
        $predmet = $('#izvestajiPredmet');

        $jedinice = $('#izvestajiJedinice');
        $datumOd = $('#izvestajiOdDatuma');
        $datumDo = $('#izvestajiDoDatuma');
        $rokRadioWrap = $('#izvestajiRokRadioWrap');
        $statusi = $('#izvestajiStatusi');
        $kreatori = $('#izvestajiKreatori');
        $podnosilac = $('#izvestajiPodnosilac');
        $liceKontrole = $('#izvestajiLiceKontrole');
        $sadrzaj = $('#izvestajiSadrzaj');
        $vrstePredmeta = $('#izvestajiVrstePredmeta');
        $rok = $('#izvestajiRok');
        $takse = $('#izvestajiTakse');
        $straniBroj = $('#izvestajiStraniBroj');
        
        $datumiRadioWrap = $('#izvestajiDatumRadioWrap');

        $inspektori = $('#izvestajiInspektori');

        $datumKretanja = $('#izvestajiDatumKretanja');
        $vrsteKretanja = $('#izvestajiVrsteKretanja');
        $opisKretanja = $('#izvestajiOpisKretanja');

        // ---------------------------- INICIJALIZACIJA KOMPONENTI --------------------------
        $grupisanje.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $grupisanje.quiComboBox('setItemsFromBinding', vm.Grupisanja, 'Naziv', 'IdElementa');
        $grupisanje.quiComboBox('selectItemByData', tipIzvestaja);
        $grupisanje.quiComboBox('enable', false);

        $okruzi.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $okruzi.quiComboBox('setItemsFromBinding', vm.Okruzi, 'Naziv', 'IdElementa');
        
        $opstine.quiComboBox({ listWidth: listWidth, width: width3, showX: true });
        $mestaOpstine.quiComboBox({ listWidth: listWidth, width: width3, showX: true });


        if (vm.Okruzi && vm.Okruzi.length == 1) {
            $okruzi.quiComboBox('selectItemByIndex', 0);
            $okruzi.quiComboBox('enable', false);
            
            // popuniti cmb opstine ako postoji samo jedan okrug
            if (vm.Opstine != undefined) {
                $opstine.quiComboBox('setItemsFromBinding', vm.Opstine, 'Naziv', 'IdElementa');
            } else {
                VratiOpstineAjax(vm.Okruzi[0].IdElementa);
            }
        }

        $organi.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $organi.quiComboBox('setItemsFromBinding', vm.Organi, 'Naziv', 'IdElementa');

        $klase.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $klase.quiComboBox('setItemsFromBinding', vm.Klase, 'Naziv', 'IdElementa');

        $godine.quiComboBox({ listWidth: listWidth, width: width1, showX: true });
        $godine.quiComboBox('setItemsFromBinding', vm.Godine, 'Naziv', 'IdElementa');
        $godine.quiComboBox('selectItemByData', tekucaGodina);

        $jedinice.quiComboBox({ listWidth: listWidth, width: width1, showX: true });
        $jedinice.quiComboBox('setItemsFromBinding', vm.Jedinice, 'Naziv', 'IdElementa');

        $datumOd.quiDate({ width: width3, showX: true });
        $datumOd.quiDate('clearDate');

        $datumDo.quiDate({ width: width3, showX: true });
        $datumDo.quiDate('clearDate');

        $statusi.quiComboBox({ listWidth: listWidth, width: width3, showX: true });
        $statusi.quiComboBox('setItemsFromBinding', vm.Statusi, 'Naziv', 'IdElementa');
        
        $kreatori.quiComboBox({ listWidth: listWidth, width: width3, showX: true });
        $kreatori.quiComboBox('setItemsFromBinding', vm.Kreatori, 'Naziv', 'IdElementa');

        $vrstePredmeta.quiComboBox({ listWidth: listWidth, width: width3, showX: true });
        $vrstePredmeta.quiComboBox('setItemsFromBinding', vm.VrstePredmeta, 'Naziv', 'IdElementa');

        $takse.quiComboBox({ listWidth: listWidth, width: width3, showX: true });
        $takse.quiComboBox('setItemsFromBinding', vm.Takse, 'Naziv', 'IdElementa');

        $datumKretanja.quiDate({ width: width3, showX: true });
        $datumKretanja.quiDate('clearDate');

        $vrsteKretanja.quiComboBox({ listWidth: width3, width: width3, showX: true });
        $vrsteKretanja.quiComboBox('setItemsFromBinding', vm.KretanjaPredmeta, 'Naziv', 'IdElementa');

        $inspektori.quiComboBox({ listWidth: width3, width: width3, showX: true });
        if (vm.Inspektori && vm.Inspektori.length > 0) {
            $inspektori.quiComboBox('setItemsFromBinding', vm.Inspektori, 'Naziv', 'IdElementa');
        }
        // ------------------------ REGISTROVANJE DOGADJAJA---------------------------------

        $okruzi.on('select', function () {
            var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
            var idOrgana = $organi.quiComboBox('getSelectedItemData');

            $klase.quiComboBox('clearItems');
            $opstine.quiComboBox('clearItems');
            $mestaOpstine.quiComboBox('clearItems');
            $jedinice.quiComboBox('clearItems');

            if (idOkruga != undefined) {
                VratiKlaseAjax(idOkruga, idOrgana);
                VratiJediniceAjax(idOrgana);
                VratiInspektoreAjax(idOkruga);
                VratiOpstineAjax(idOkruga);
            }
        });

        $organi.on('select', function () {
            var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
            var idOrgana = $organi.quiComboBox('getSelectedItemData');

            $klase.quiComboBox('clearItems');
            $jedinice.quiComboBox('clearItems');

            if (idOkruga != undefined) {
                VratiKlaseAjax(idOkruga, idOrgana);
                VratiJediniceAjax(idOrgana);
            }
        });
        
        $opstine.on('select', function () {
            var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
            var idOpstine = $opstine.quiComboBox('getSelectedItemData');

            $mestaOpstine.quiComboBox('clearItems');

            if (idOkruga != undefined && idOpstine != undefined) {
                VratiMestaOpstineAjax(idOkruga, idOpstine);
            }
        });

        InicijalizujDogadjajeNaInputCeoBrojPozivan($rok);

        $('#izvestajiBtnPretrazi').click(ClickBtnPretrazi);
        $('#izvestajiBtnReset').click(ClickBtnReset);

        $('#detaljiPretrage').click(function () {
            var $this = $(this);

            if ($this.hasClass('manjaPretraga')) {
                $this.removeClass('manjaPretraga');

                $('.nijeDetaljna').show();
                $('#izvestajiPodnosilac').css('width', '254px');
                $('#izvestajiSadrzaj').css('width', '250px');

                $this.attr('title', qKonverzija.VratiLokalizovaniTekst("Detaljna pretraga"));

                _scrTabelaOduzimac = 510;
                
                $('#izvestajiAnalitikaSlickGrid').css('height', '100vh').css('height', '-=' + _scrTabelaOduzimac + 'px');
                $('#izvestajiSintetikaSlickGrid').css('height', '100vh').css('height', '-=' + _scrTabelaOduzimac + 'px');
            } else {
                $this.addClass('manjaPretraga');

                $('.nijeDetaljna').hide();
                $('#izvestajiPodnosilac').css('width', '1043px');
                $('#izvestajiSadrzaj').css('width', '1039px');

                $this.attr('title', qKonverzija.VratiLokalizovaniTekst("Opšta pretraga"));
                
                _scrTabelaOduzimac = 370;
                
                $('#izvestajiAnalitikaSlickGrid').css('height', '100vh').css('height', '-=' + _scrTabelaOduzimac + 'px');
                $('#izvestajiSintetikaSlickGrid').css('height', '100vh').css('height', '-=' + _scrTabelaOduzimac + 'px');
            }
        });

        $('#izvestajiBtnStampa').click(ClickBtnStampa);
        
        $(window).on('resize.slickgrid', function () {
            if (gridAnalitika != undefined) {
                gridAnalitika.resizeCanvas();
            }
            
            if (gridSintetika != undefined) {
                gridSintetika.resizeCanvas();
                $('.slick-header-columns.ui-sortable:eq(0)').find('.qTabelaHeadTd').each(function (index) {
                    $('.slick-footer-columns:eq(0)').find('.qTabelaHeadTd:eq(' + index + ')').width($(this).width());
                });
            }
        });
    };

}(window.qIzvestaji = window.qIzvestaji || {}, jQuery));
//#endregion

// ==================================================================================================================================================

//#region Predmeti sa rokom
(function(qPredmetiSaRokom, $, undefined) {
    var vm,
        $okruzi,
        $organi,
        $klase,
        $godine,
        $jedinice,
        $predmet,
        danas,
        width = 150,
        width1 = 100,
        listWidth = 300,
        url_VratiKlaseJedinice,
        url_VratiPredmeteSaRokom,
        url_VratiStampePredmetaSaRokom;

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

                var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                if (item[c.field] == undefined) {
                    return false;
                }
                else if (!item[c.field].toLowerCase().contains(columnFilters[columnId].toLowerCase())) {
                    return false;
                }
                
                //  0 - string,
                //  1- date
                var tip = 0;

                if (columnId == 6) {
                    tip = 1;
                }

                var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                if (item[c.field] == undefined) {
                    return false;
                }
                else if (tip == 0) {
                    if (!item[c.field].toLowerCase().contains(columnFilters[columnId].toLowerCase())) {
                        return false;
                    }
                } else if (tip == 1) {
                    if (!qUtils.IzvuciDatumIzDataSaServera(item[c.field]).contains(columnFilters[columnId].toLowerCase())) {
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

    function RedniBrojFormatter(row, cell, value, columnDef, dataContext) {
        return row + 1;
    }
    
    function DatumFormatter(row, cell, value, columnDef, dataContext) {
        return qUtils.IzvuciDatumIzDataSaServera(value);
    }

    /**********************************************
    ******** Funkcije za SLICKGRID  END ***********
    **********************************************/
    
    function ClickBtnReset() {
        if (vm.Okruzi && vm.Okruzi.length > 1) {
            $okruzi.quiComboBox('clearSelection');
        }

        $organi.quiComboBox('clearSelection');
        $klase.quiComboBox('clearSelection');
        $godine.quiComboBox('selectItemByData', danas.getFullYear());
        $predmet.val('');
        $jedinice.quiComboBox('clearSelection');

        $('#predmetiSaRokomNemaRez').hide();

        $('#predmetiSaRokomSlickGrid').empty();
        $('#predmetiSaRokomSlickGridPager').empty();

        columnFilters = {};
        grid = undefined;
    }
    
    function ClickBtnPretrazi() {
        var $btn = $('#predmetiSaRokomBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        grid = undefined;

        $('#predmetiSaRokomSlickGrid').empty();
        $('#predmetiSaRokomSlickGridPager').empty();

        var idOrgana = $organi.quiComboBox('getSelectedItemData');
        var idKlase = $klase.quiComboBox('getSelectedItemData');
        var oznakaKlase = undefined;
        var idJedinice = $jedinice.quiComboBox('getSelectedItemData');
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
            url: url_VratiPredmeteSaRokom,
            data: {
                idOkruga: $okruzi.quiComboBox('getSelectedItemData'),
                idOrgana: idOrgana,
                idKlase: idKlase,
                brojPredmeta: $predmet.val().trimnull(),
                godina: $godine.quiComboBox('getSelectedItemData'),
                idJedinice: idJedinice,
                oznakaKlase: oznakaKlase,
                oznakaJedinice: oznakaJedinice
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data;

                if (predmeti && predmeti.length > 0) {

                    PopuniTabeluRezultata(predmeti);

                    $('#predmetiSaRokomNemaRez').hide();
                } else {
                    $('#predmetiSaRokomNemaRez').show();
                }
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }
    
    function PopuniTabeluRezultata(predmeti) {
        columnFilters = {};

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
                field: "RedniBroj",
                name: qKonverzija.VratiLokalizovaniTekst('Redni broj'),
                id: 1,
                width: 75,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: RedniBrojFormatter
            },
            {
                field: "SifraPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Šifra predmeta'),
                id: 2,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: SifraPredmetaFormatter
            },
            {
                field: "DatumRoka",
                name: qKonverzija.VratiLokalizovaniTekst('Rok'),
                id: 6,
                width: 90,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: DatumFormatter
            },
            {
                field: "Podnosilac",
                name: qKonverzija.VratiLokalizovaniTekst('Podnosilac'),
                id: 3,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "NazivInspektora",
                name: qKonverzija.VratiLokalizovaniTekst('Inspektor'),
                id: 4,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "Sadrzaj",
                name: qKonverzija.VratiLokalizovaniTekst('Sadržaj'),
                id: 5,
                width: 310,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            }
        ];

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#predmetiSaRokomSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());
        var pager = new Slick.Controls.Pager(dataView, grid, $("#predmetiSaRokomSlickGridPager"));
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
                if (idCol == 6) {
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
    
    function VratiKlaseJedinice(idOkruga, idOrgana) {
        $.ajax({
            type: 'GET',
            url: url_VratiKlaseJedinice,
            data: {
                idOkruga: idOkruga,
                idOrgana: idOrgana
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var lista = data.Data;
                if (lista != undefined) {
                    if (lista.Klase && lista.Klase.length > 0) {
                        $klase.quiComboBox('setItemsFromBinding', lista.Klase, 'Naziv', 'IdElementa');
                    }

                    if (lista.Jedinice && lista.Jedinice.length > 0) {
                        $jedinice.quiComboBox('setItemsFromBinding', lista.Jedinice, 'Naziv', 'IdElementa');
                    }
                }
            },
            complete: function () {;
            }
        });
    }
    
    function ClickBtnStampa() {
        var $btn = $('#predmetiSaRokomBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;
        

        $btn.addClass('teloDugmeIskljuceno');
        var stavke = PreuzmiPodatkeZaStampu();

        if (stavke && stavke.length > 0) {
            var dataObjS = {
                stavkeJ: JSON.stringify(stavke)
            };
            qStampa.PrikaziDijalogStampe(url_VratiStampePredmetaSaRokom, dataObjS, false, false, 'POST');
        }

        $btn.removeClass('teloDugmeIskljuceno');
    }
    
    function PreuzmiPodatkeZaStampu() {
        if (grid == undefined || dataView == undefined) return undefined;

        var stavke = [];

        var predmetiPretrage = dataView.getItems();

        for (var i = 0; i < predmetiPretrage.length; ++i) {
            var p = predmetiPretrage[i];

            var x = qUtils.IzvuciDateObjIzDataSaServera(p.DatumRoka);
            var datum = (new Date(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0))).toJSON();
            
            var stavka = {
                IdPredmeta: p.IdPredmeta,
                Podnosilac: p.Podnosilac,
                NazivInspektora: p.NazivInspektora,
                Sadrzaj: p.Sadrzaj,
                SifraPredmeta: p.SifraPredmeta,
                DatumRoka: datum
            };

            stavke.push(stavka);
        }

        return stavke;
    }

    qPredmetiSaRokom.Init = function() {
        vm = qUtils.IzvuciVM("#vm", true);

        danas = new Date();

        columnFilters = {};
        grid = undefined;

        url_VratiKlaseJedinice = $('#url_VratiKlaseJedinice').text();
        url_VratiPredmeteSaRokom = $('#url_VratiPredmeteSaRokom').text();
        url_VratiStampePredmetaSaRokom = $('#url_VratiStampePredmetaSaRokom').text();

        $okruzi = $('#predmetiSaRokomOkruzi');
        $organi = $('#predmetiSaRokomOrgani');
        $klase = $('#predmetiSaRokomKlase');
        $predmet = $('#predmetiSaRokomPredmet');
        $godine = $('#predmetiSaRokomGodine');
        $jedinice = $('#predmetiSaRokomJedinice');

        $okruzi.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $okruzi.quiComboBox('setItemsFromBinding', vm.Okruzi, 'Naziv', 'IdElementa');

        if (vm.Okruzi && vm.Okruzi.length == 1) {
            $okruzi.quiComboBox('selectItemByIndex', 0);
            $okruzi.quiComboBox('enable', false);
        }

        $organi.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $organi.quiComboBox('setItemsFromBinding', vm.Organi, 'Naziv', 'IdElementa');

        $klase.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $klase.quiComboBox('setItemsFromBinding', vm.Klase, 'Naziv', 'IdElementa');

        $godine.quiComboBox({ listWidth: listWidth, width: width1, showX: true });
        $godine.quiComboBox('setItemsFromBinding', vm.Godine, 'Naziv', 'IdElementa');
        $godine.quiComboBox('selectItemByData', danas.getFullYear());

        $jedinice.quiComboBox({ listWidth: listWidth, width: width1, showX: true });
        $jedinice.quiComboBox('setItemsFromBinding', vm.Jedinice, 'Naziv', 'IdElementa');

        //events

        $organi.on('select', function () {
            var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
            var idOrgana = $organi.quiComboBox('getSelectedItemData');

            $klase.quiComboBox('clearItems');
            $jedinice.quiComboBox('clearItems');

            if (idOkruga != undefined) {
                VratiKlaseJedinice(idOkruga, idOrgana);
            }
        });

        $('#predmetiSaRokomBtnReset').click(ClickBtnReset);
        $('#predmetiSaRokomBtnPretrazi').click(ClickBtnPretrazi);
        
        $('#predmetiSaRokomBtnStampa').click(ClickBtnStampa);

        $(window).on('resize.slickgrid', function () {
            if (grid != undefined) {
                grid.resizeCanvas();
            }
        });
    };

}(window.qPredmetiSaRokom = window.qPredmetiSaRokom || {}, jQuery));
//#endregion

// ==================================================================================================================================================

//#region Izvestaj po razvodnjavanju
(function (qIzvestajPoRazvodjenju, $, undefined) {
    var vm,
        $okruzi,
        $organi,
        $klase,
        $godine,
        $predmet,
        $jedinice,
        tekucaGodina,
        $odDatuma,
        $doDatuma,
        $arhivatori,
        width = 150,
        width1 = 100,
        listWidth = 300,
        url_VratiKlaseJedinice,
        url_VratiKlase,
        url_VratiPredmetePoRazvodjenju,
        url_VratiStampePredmetaPoRazvodjenju;
    
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

                //  0 - string,
                //  2 - money
                var tip = 0;

                if (columnId == 2) {
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

    function SifraPredmetaFormatter(row, cell, value, columnDef, dataContext) {
        if (dataContext.IdPredmeta != undefined) {
            return '<div class="qTdPopupPredmeti" data-idPredmeta="' + dataContext.IdPredmeta + '">' + nonull(value) + '</div>';
        }

        return "";
    }

    function NoNullFormatter(row, cell, value, columnDef, dataContext) {
        return nonull(value);
    }

    function RedniBrojFormatter(row, cell, value, columnDef, dataContext) {
        return row + 1;
    }

    /**********************************************
    ******** Funkcije za SLICKGRID  END ***********
    **********************************************/
    
    function ClickBtnReset() {
        if (vm.Okruzi && vm.Okruzi.length > 1) {
            $okruzi.quiComboBox('clearSelection');
        }

        $organi.quiComboBox('clearSelection');
        $klase.quiComboBox('clearSelection');
        $arhivatori.quiComboBox('clearSelection');
        $godine.quiComboBox('selectItemByData', tekucaGodina);
        $predmet.val('');
        $jedinice.quiComboBox('clearSelection');
        
        $('#izvPoRazSlickGrid').empty();
        $('#izvPoRazSlickGridPager').empty();

        $odDatuma.quiDate('setSpecialDate', 'firstDayOfYear');
        $doDatuma.quiDate('setDate', new Date());

        columnFilters = {};
        grid = undefined;
    }

    function ClickBtnPretrazi() {
        var $btn = $('#pretragaBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;
        
        grid = undefined;

        $('#izvPoRazSlickGrid').empty();
        $('#izvPoRazSlickGridPager').empty();

        var idOrgana = $organi.quiComboBox('getSelectedItemData');
        var idKlase = $klase.quiComboBox('getSelectedItemData');
        var oznakaKlase = undefined;
        var idJedinice = $jedinice.quiComboBox('getSelectedItemData');
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
            url: url_VratiPredmetePoRazvodjenju,
            data: {
                idOkruga: $okruzi.quiComboBox('getSelectedItemData'),
                idOrgana: idOrgana,
                idKlase: idKlase,
                brojPredmeta: $predmet.val().trimnull(),
                godina: $godine.quiComboBox('getSelectedItemData'),
                idJedinice: idJedinice,
                odDatumaJ: $odDatuma.quiDate('getJSONDateNoTZStringify'),
                doDatumaJ: $doDatuma.quiDate('getJSONDateNoTZStringify'),
                idArhivatora: $arhivatori.quiComboBox('getSelectedItemData'),
                oznakaKlase: oznakaKlase,
                oznakaJedinice: oznakaJedinice
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data;

                PopuniTabeluPredmetaPoRazvodjenju(predmeti);
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }
    
    function PopuniTabeluPredmetaPoRazvodjenju(predmeti) {
        columnFilters = {};

        var dataGrid = [];

        for (var i = 0; i < predmeti.length; ++i) {
            var predmet = predmeti[i];
            var d = $.extend({}, predmet);

            d["id"] = i;

            dataGrid.push(d);
        }

        var columns = [
            {
                field: "RedniBroj",
                name: qKonverzija.VratiLokalizovaniTekst('Redni broj'),
                id: 0,
                width: 75,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: RedniBrojFormatter
            },
            {
                field: "RazvodjenjeAkata",
                name: qKonverzija.VratiLokalizovaniTekst('Razvođenje akata'),
                id: 1,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "BrojPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Broj predmeta'),
                id: 2,
                width: 200,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            }
        ];

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#izvPoRazSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }));
        var pager = new Slick.Controls.Pager(dataView, grid, $("#izvPoRazSlickGridPager"));
        var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();

            grid.setSelectedRows([]);
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

            if (args.column.id != 0) {
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
        var $btn = $('#izvPoRazBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        if (grid == undefined || dataView == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nema pretraženih predmeta.'), 'greska');
            return;
        }

        $btn.addClass('teloDugmeIskljuceno');

        var idOrgana = $organi.quiComboBox('getSelectedItemData');
        var idKlase = $klase.quiComboBox('getSelectedItemData');
        var oznakaKlase = undefined;
        var idJedinice = $jedinice.quiComboBox('getSelectedItemData');
        var oznakaJedinice = undefined;

        if (idOrgana == undefined) {
            oznakaKlase = idKlase;
            idKlase = undefined;

            oznakaJedinice = idJedinice;
            idJedinice = undefined;
        }

        var dataObj = {
            idOkruga: $okruzi.quiComboBox('getSelectedItemData'),
            idOrgana: idOrgana,
            idKlase: idKlase,
            brojPredmeta: $predmet.val().trimnull(),
            godina: $godine.quiComboBox('getSelectedItemData'),
            idJedinice: idJedinice,
            odDatumaJ: $odDatuma.quiDate('getJSONDateNoTZStringify'),
            doDatumaJ: $doDatuma.quiDate('getJSONDateNoTZStringify'),
            idArhivatora: $arhivatori.quiComboBox('getSelectedItemData'),
            oznakaKlase: oznakaKlase,
            oznakaJedinice: oznakaJedinice
        };

        qStampa.PrikaziDijalogStampe(url_VratiStampePredmetaPoRazvodjenju, dataObj, false, false, 'GET');

        $btn.removeClass('teloDugmeIskljuceno');
    }
    
    function VratiKlaseJedinice(idOkruga, idOrgana) {
        $.ajax({
            type: 'GET',
            url: url_VratiKlaseJedinice,
            data: {
                idOkruga: idOkruga,
                idOrgana: idOrgana
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var lista = data.Data;
                if (lista != undefined) {
                    if (lista.Klase && lista.Klase.length > 0) {
                        $klase.quiComboBox('setItemsFromBinding', lista.Klase, 'Naziv', 'IdElementa');
                    }

                    if (lista.Jedinice && lista.Jedinice.length > 0) {
                        $jedinice.quiComboBox('setItemsFromBinding', lista.Jedinice, 'Naziv', 'IdElementa');
                    }
                }
            },
            complete: function () {;
            }
        });
    }
    
    function VratiKlaseAjax(idOkruga, idOrgana) {
        $.ajax({
            type: 'GET',
            url: url_VratiKlase,
            data: {
                idOkruga: idOkruga,
                idOrgana: idOrgana
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $klase.quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function () {;
            }
        });
    }
    
    qIzvestajPoRazvodjenju.Init = function () {
        vm = qUtils.IzvuciVM("#vm", true);

        columnFilters = {};
        grid = undefined;
        dataView = undefined;
        
        tekucaGodina = $("#tekucaGodina").text().trimnull();
        
        url_VratiKlaseJedinice = $('#url_VratiKlaseJedinice').text();
        url_VratiKlase = $('#url_VratiKlase').text();
        url_VratiPredmetePoRazvodjenju = $('#url_VratiPredmetePoRazvodjenju').text();
        url_VratiStampePredmetaPoRazvodjenju = $('#url_VratiStampePredmetaPoRazvodjenju').text();
        
        $okruzi = $('#izvPoRazOkruzi');
        $organi = $('#izvPoRazOrgani');
        $klase = $('#izvPoRazKlase');
        $godine = $('#izvPoRazGodine');
        $predmet = $('#izvPoRazPredmet');
        $jedinice = $('#izvPoRazJedinice');

        $odDatuma = $('#izvPoRazOdDatuma');
        $doDatuma = $('#izvPoRazDoDatuma');
        $arhivatori = $('#izvPoRazArhivatori');
        
        $okruzi.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $okruzi.quiComboBox('setItemsFromBinding', vm.Okruzi, 'Naziv', 'IdElementa');

        if (vm.Okruzi && vm.Okruzi.length == 1) {
            $okruzi.quiComboBox('selectItemByIndex', 0);
            $okruzi.quiComboBox('enable', false);
        }
        
        $organi.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $organi.quiComboBox('setItemsFromBinding', vm.Organi, 'Naziv', 'IdElementa');

        $klase.quiComboBox({ listWidth: listWidth, width: width, showX: true });
        $klase.quiComboBox('setItemsFromBinding', vm.Klase, 'Naziv', 'IdElementa');

        $godine.quiComboBox({ listWidth: listWidth, width: width1, showX: true });
        $godine.quiComboBox('setItemsFromBinding', vm.Godine, 'Naziv', 'IdElementa');
        $godine.quiComboBox('selectItemByData', tekucaGodina);

        $jedinice.quiComboBox({ listWidth: listWidth, width: width1, showX: true });
        $jedinice.quiComboBox('setItemsFromBinding', vm.Jedinice, 'Naziv', 'IdElementa');
        
        $arhivatori.quiComboBox({ listWidth: listWidth, width: 245, showX: true });
        $arhivatori.quiComboBox('setItemsFromBinding', vm.Arhivatori, 'Naziv', 'IdElementa');

        $odDatuma.quiDate({ width: 160, showX: false });
        $odDatuma.quiDate('setSpecialDate', 'firstDayOfYear');

        $doDatuma.quiDate({ width: 160, showX: false });
        $doDatuma.quiDate('setDate', new Date());
        
        //events
        
        $okruzi.on('select', function () {
            var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
            var idOrgana = $organi.quiComboBox('getSelectedItemData');

            $klase.quiComboBox('clearItems');

            if (idOkruga != undefined && idOrgana != undefined) {
                VratiKlaseAjax(idOkruga, idOrgana);
            }
        });

        $organi.on('select', function () {
            var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
            var idOrgana = $organi.quiComboBox('getSelectedItemData');

            $klase.quiComboBox('clearItems');
            $jedinice.quiComboBox('clearItems');

            if (idOkruga != undefined) {
                VratiKlaseJedinice(idOkruga, idOrgana);
            }
        });
        
        $('#izvPoRazBtnPretrazi').click(ClickBtnPretrazi);
        $('#izvPoRazBtnReset').click(ClickBtnReset);
        
        $('#izvPoRazBtnStampa').click(ClickBtnStampa);

        $(window).on('resize.slickgrid', function () {
            if (grid != undefined) {
                grid.resizeCanvas();
            }
        });
    };

}(window.qIzvestajPoRazvodjenju = window.qTest || {}, jQuery));
//#endregion

// ==================================================================================================================================================

//#region Izvestaj po opstinama
(function (qIzvestajPoOpstinama, $, undefined) {
    var $odDatuma,
        $doDatuma,
        url_VratiPredmetePoOpstinama,
        url_VratiStampePredmetaPoOpstinama;
    
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
    
    function filter(item) {
        for (var columnId in columnFilters) {
            if (columnId !== undefined && columnFilters[columnId] !== "") {

                //  0 - string,
                //  2 - money
                var tip = 0;

                if (columnId == 6) {
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

    function ClickBtnReset() {
        $odDatuma.quiDate('setSpecialDate', 'firstDayOfYear');
        $doDatuma.quiDate('setDate', new Date());

        dataView.beginUpdate();
        dataView.setItems([]);
        dataView.endUpdate();

        columnFilters = {};
        grid = undefined;
    }

    function ClickBtnPretrazi() {
        var $btn = $('#izvPoOpsBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;
        
        grid = undefined;

        $('#izvPoOpsSlickGrid').empty();
        $('#izvPoOpsSlickGridPager').empty();

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'GET',
            url: url_VratiPredmetePoOpstinama,
            data: {
                odDatumaJ: $odDatuma.quiDate('getJSONDateNoTZStringify'),
                doDatumaJ: $doDatuma.quiDate('getJSONDateNoTZStringify')
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data;

                NapraviTabelu(predmeti);
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }
    
    function NapraviTabelu(predmeti) {
        columnFilters = {};

        var dataGrid = [];

        for (var i = 0; i < predmeti.length; ++i) {
            var predmet = predmeti[i];
            var d = $.extend({}, predmet);

            d["id"] = i;

            d.NazivJedinice = d.Jedinica + '-' + d.NazivJedinice;
            d.NazivKlase = d.Klasa + '-' + d.NazivKlase;
            d.NazivOrgana = d.Organ + '-' + d.NazivOrgana;
            d.NazivVrstePredmeta = d.VrstaPredmeta + '-' + d.NazivVrstePredmeta;

            dataGrid.push(d);
        }

        var columns = [
            {
                field: "PostanskiBrojOpstine",
                name: qKonverzija.VratiLokalizovaniTekst('Poštanski broj'),
                id: 0,
                width: 100,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            {
                field: "NazivOpstine",
                name: qKonverzija.VratiLokalizovaniTekst('Opština'),
                id: 1,
                width: 100,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
            },
            {
                field: "NazivOrgana",
                name: qKonverzija.VratiLokalizovaniTekst('Organ'),
                id: 2,
                width: 200,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            {
                field: "NazivKlase",
                name: qKonverzija.VratiLokalizovaniTekst('Klasa'),
                id: 3,
                width: 200,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            {
                field: "NazivJedinice",
                name: qKonverzija.VratiLokalizovaniTekst('Jedinica'),
                id: 4,
                width: 200,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            //{
            //    field: "NazivVrstePredmeta",
            //    name: qKonverzija.VratiLokalizovaniTekst('Vrsta predmeta'),
            //    id: 5,
            //    width: 200,
            //    sortable: false,
            //    headerCssClass: "qTabelaHeadTd",
            //    cssClass: "qTabelaTd"
            //},
            {
                field: "BrojPredmeta0",
                name: qKonverzija.VratiLokalizovaniTekst('Vrsta predmeta 0'),
                id: 7,
                width: 120,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojPredmeta2",
                name: qKonverzija.VratiLokalizovaniTekst('Vrsta predmeta 2'),
                id: 8,
                width: 120,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojPredmeta3",
                name: qKonverzija.VratiLokalizovaniTekst('Vrsta predmeta 3'),
                id: 9,
                width: 120,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojPredmetaO",
                name: qKonverzija.VratiLokalizovaniTekst('Ostale vrste'),
                id: 10,
                width: 120,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            },
            {
                field: "BrojPredmeta",
                name: qKonverzija.VratiLokalizovaniTekst('Broj predmeta'),
                id: 6,
                width: 100,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd"
            }
        ];

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#izvPoOpsSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }));
        var pager = new Slick.Controls.Pager(dataView, grid, $("#izvPoOpsSlickGridPager"));
        var columnpicker = new Slick.Controls.ColumnPicker(columns, grid, options);

        dataView.onRowCountChanged.subscribe(function (e, args) {
            grid.updateRowCount();
            grid.render();

            grid.setSelectedRows([]);
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

           // if (args.column.id != 0) {
                var $text = $("<input type='text'>");
                $text.data("columnId", args.column.id).val(columnFilters[args.column.id]);
                $text.appendTo(args.node);
            //} else {
            //    $(args.node).addClass('no-filter');
            //}
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
                if (idCol == 6 || idCol == 7 || idCol == 8 || idCol == 9 || idCol == 10) {//7 - 10
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
            };

            dataView.sort(comparer);
        });

        grid.init();

        dataView.beginUpdate();
        dataView.setItems(dataGrid);
        dataView.setFilter(filter);
        dataView.endUpdate();
    }

    function ClickBtnStampa() {
        var $btn = $('#izvPoRazBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        if (grid == undefined || dataView == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nema pretraženih predmeta.'), 'greska');
            return;
        }

        $btn.addClass('teloDugmeIskljuceno');

        var dataObj = {
            odDatumaJ: $odDatuma.quiDate('getJSONDateNoTZStringify'),
            doDatumaJ: $doDatuma.quiDate('getJSONDateNoTZStringify'),
        };

        qStampa.PrikaziDijalogStampe(url_VratiStampePredmetaPoOpstinama, dataObj, false, false, 'GET');

        $btn.removeClass('teloDugmeIskljuceno');
    }
   
    qIzvestajPoOpstinama.Init = function () {
        columnFilters = {};
        grid = undefined;
        dataView = undefined;
        
        url_VratiPredmetePoOpstinama = $('#url_VratiPredmetePoOpstinama').text();
        url_VratiStampePredmetaPoOpstinama = $('#url_VratiStampePredmetaPoOpstinama').text();
        
        $odDatuma = $('#izvPoOpsOdDatuma');
        $doDatuma = $('#izvPoOpsDoDatuma');
        
        $odDatuma.quiDate({ width: 300, showX: false });
        $odDatuma.quiDate('setSpecialDate', 'firstDayOfYear');

        $doDatuma.quiDate({ width: 300, showX: false });
        $doDatuma.quiDate('setDate', new Date());
        
        $('#izvPoOpsBtnPretrazi').click(ClickBtnPretrazi);
        $('#izvPoOpsBtnReset').click(ClickBtnReset);
        
        $('#izvPoOpsBtnStampa').click(ClickBtnStampa);

        $(window).on('resize.slickgrid', function () {
            if (grid != undefined) {
                grid.resizeCanvas();
            }
        });
    };

}(window.qIzvestajPoOpstinama = window.qIzvestajPoOpstinama || {}, jQuery));
//#endregion

// ==================================================================================================================================================