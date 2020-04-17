//#region Pretraga predmeta

(function (qPretragaPredmeta, $, undefined) {
    var vm,
        tipPretrage,
        brisanjePredmeta,
        $okruzi,
        $organi,
        $klase,
        $godine,
        $predmet,
        $jedinice,
        $opstine,
        $mestaOpstine,
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
        url_ArhiviranjePredmeta,
        url_VratiStampePretrazenihPredmeta,
        url_VratiMestaOpstine;

    var _scrTabelaOduzimac = 325;
    
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
    
    function DeleteFormatter(row, cell, value, columnDef, dataContext) {
        return '<i class="fa fa-remove x" data-id="' + dataContext.IdPredmeta + '"></i>';
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
        
        $datumiRadioWrap.find('input[value="0"]').prop('checked', true);
        
        $('#pretragaNemaRez').hide();
        $('#pretragaBtnBrisanje').hide();
        $('#pretragaBtnArhiviranje').hide();
        
        if (tipPretrage == 2) {
            $statusi.quiComboBox('selectItemByIndex', 0);
        }
        
        $('#pretragaPredmetiSlickGrid').empty();
        $('#pretragaPredmetiSlickGridPager').empty();
        
        columnFilters = {};
        grid = undefined;
    }
    
    function PrikaziProzorZaBrisanje(brisanjeJednog, listaPredmeta, predmetZaBrisanje) {
        var html;
        if (brisanjeJednog) {
            html = '<div class="unosRed">\
	                        <div class="unosRedLbl_taL" style="width: 100px;">' + qKonverzija.VratiLokalizovaniTekst('Šifra') + ':</div>\
	                        <div class="unosRedVr"><div class="unosRedLbl_taL" style="width: 200px;">' + predmetZaBrisanje.SifraPredmeta + ':</div></div>\
                        </div>\
                        <div class="unosRed">\
	                        <div class="unosRedLbl_taL" style="width: 100px;">' + qKonverzija.VratiLokalizovaniTekst('Podnosilac') + ':</div>\
	                        <div class="unosRedVr"><div class="unosRedLbl_taL" style="width: 200px;">' + nonull(predmetZaBrisanje.Podnosilac) + '</div></div>\
                        </div>\
                        <div class="unosRed">\
	                        <div class="unosRedLbl_taL" style="width: 100px;">' + qKonverzija.VratiLokalizovaniTekst('Inspektor') + ':</div>\
	                        <div class="unosRedVr"><div class="unosRedLbl_taL" style="width: 200px;">' + nonull(predmetZaBrisanje.NazivInspektora) + '</div></div>\
                        </div>\
                        <div class="unosRed">\
	                        <div class="unosRedLbl_taL" style="width: 100px;">' + qKonverzija.VratiLokalizovaniTekst('Sadržaj') + ':</div>\
	                        <div class="unosRedVr"><div class="unosRedLbl_taL" style="width: 200px;">' + nonull(predmetZaBrisanje.Sadrzaj) + '</div></div>\
                        </div>\
                        <br><div>\
                            <div>' + qKonverzija.VratiLokalizovaniTekst('Unesite razlog brisanja dokumenta') + ':</div>\
                            <div class="unosRed">\
                                <div class="unosRedVr" style="width: 90%; margin-left: 5%; margin-right: 5%;"><input class="myInput" style="width: 100%;" id="predmetiPretragaRazlogBrisanja"/></div>\
                            </div>\
                        </div>';
            
            PrikaziProzor2(true, true, qKonverzija.VratiLokalizovaniTekst('UPOZORENJE'), qKonverzija.VratiLokalizovaniTekst('U procesu ste brisanja predmeta!') + '<br><br>' + html, 'upozorenje', [
                {
                    labela: qKonverzija.VratiLokalizovaniTekst('Obriši'),
                    callback: function () {
                        var $razlogBrisanja = $('#predmetiPretragaRazlogBrisanja');
                        var razlogBrisanja = $razlogBrisanja.val().trimnull();
                        if (razlogBrisanja == undefined) {
                            qUtils.BlinkiBGColorElementa($razlogBrisanja, 'red', null, 'white');
                            $razlogBrisanja.focus();
                            return;
                        }

                        var predmetZaBrisanjeJ = [];
                        predmetZaBrisanjeJ.push(predmetZaBrisanje.IdPredmeta);
                        
                        var id = predmetZaBrisanje.id;

                        $.ajax({
                            type: 'POST',
                            url: url_BrisanjePredmeta,
                            data: {
                                predmetiJ: JSON.stringify(predmetZaBrisanjeJ),
                                razlogBrisanja: razlogBrisanja
                            },
                            success: function (data) {
                                if (data.Greska) {
                                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                                    return;
                                }
                                
                                dataView.deleteItem(id);

                                PrikaziProzor2(false);
                            },
                            complete: function () {
                            }
                        });
                    }
                },
                {
                    labela: qKonverzija.VratiLokalizovaniTekst('Odustani'),
                    callback: function() {
                        PrikaziProzor2(false);
                    }
                }
            ]);
        } else {
            html = '<table>\
                        <tbody>';

            var listaPredmetaZaBrisanje = [];
            var listaIdPredmetaZaBrisanje = [];
            
            for (var i = 0; i < listaPredmeta.length; i++) {
                var pred = listaPredmeta[i];

                listaPredmetaZaBrisanje.push(pred.IdPredmeta);
                listaIdPredmetaZaBrisanje.push(pred.id);
                
                html += '<tr>\
                            <td class="qTdPopupPredmeti" data-idPredmeta="' + pred.IdPredmeta + '">' + pred.SifraPredmeta + '</td>\
                        </tr>';
            }

            html += '</tbody>\
                    </table>';

            PrikaziProzor2(true, true, qKonverzija.VratiLokalizovaniTekst('UPOZORENJE'), qKonverzija.VratiLokalizovaniTekst('U procesu ste brisanja sledećih predmeta:') + '<br><br>' + html, 'upozorenje', [
                {
                    labela: qKonverzija.VratiLokalizovaniTekst('Obriši predmete'),
                    callback: function () {
                        ClickBtnBrisanje(listaPredmetaZaBrisanje, listaIdPredmetaZaBrisanje);
                    }
                },
                {
                    labela: qKonverzija.VratiLokalizovaniTekst('Odustani'),
                    callback: function () {
                        PrikaziProzor2(false);
                    }
                }
            ]);
        }
        
    }

    function ClickBtnBrisanje(predmetiZaBrisanje, listaIdPredmetaZaBrisanje) {
        var html = '<div>\
                        <div>' + qKonverzija.VratiLokalizovaniTekst('Unesite razlog brisanja dokumenta') + ':</div>\
                        <div class="unosRed">\
                            <div class="unosRedVr" style="width: 90%; margin-left: 5%; margin-right: 5%;"><input class="myInput" style="width: 100%;" id="predmetiPretragaRazlogBrisanja"/></div>\
                        </div>\
                    </div>';

        PrikaziProzor2(true, false, qKonverzija.VratiLokalizovaniTekst('BRISANJE PREDMETA'), html, 'upozorenje', [
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Obriši'),
                callback: function () {
                    var $razlogBrisanja = $('#predmetiPretragaRazlogBrisanja');
                    var razlogBrisanja = $razlogBrisanja.val().trimnull();
                    if (razlogBrisanja == undefined) {
                        qUtils.BlinkiBGColorElementa($razlogBrisanja, 'red', null, 'white');
                        $razlogBrisanja.focus();
                        return;
                    }
                    
                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Brisanje predmeta u toku...') + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');
                    $.ajax({
                        type: 'POST',
                        url: url_BrisanjePredmeta,
                        data: {
                            predmetiJ: JSON.stringify(predmetiZaBrisanje),
                            razlogBrisanja: razlogBrisanja
                        },
                        success: function (data) {
                            if (data.Greska) {
                                PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                                return;
                            }
                            
                            for (var i = 0; i < listaIdPredmetaZaBrisanje.length; ++i) {
                                var idZaBrisanje = listaIdPredmetaZaBrisanje[i];
                                dataView.deleteItem(idZaBrisanje);
                            }
                            
                            PrikaziProzor(false);
                        },
                        complete: function () {
                        }
                    });
                }
            },
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Zatvori'),
                callback: function () {
                    PrikaziProzor2(false);
                }
            }
        ]);
    }
    
    function PrikaziProzorZaArhiviranje(listaPredmeta, idVrstePrvogPredmeta) {
        var $btn = $('#pretragaBtnArhiviranje').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;
        
        $btn.addClass('teloDugmeIskljuceno');
        var html = '<table>\
                        <tbody>';
        
        var listaPredmetaZaArhiviranje = [];
        var listaIdPredmetaZaArhiviranje = [];

        for (var i = 0; i < listaPredmeta.length; i++) {
            var pred = listaPredmeta[i];

            listaPredmetaZaArhiviranje.push(pred.IdPredmeta);
            listaIdPredmetaZaArhiviranje.push(pred.id);

            html += '<tr>\
                            <td class="qTdPopupPredmeti" data-idPredmeta="' + pred.IdPredmeta + '">' + pred.SifraPredmeta + '</td>\
                        </tr>';
        }

        html += '</tbody>\
                    </table>';

        PrikaziProzor2(true, true, qKonverzija.VratiLokalizovaniTekst('UPOZORENJE'), qKonverzija.VratiLokalizovaniTekst('U procesu ste arhiviranja sledećih predmeta:') + '<br><br>' + html, 'upozorenje', [
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Arhiviraj predmete'),
                callback: function () {
                    ClickBtnArhiviranje(listaPredmetaZaArhiviranje, listaIdPredmetaZaArhiviranje, idVrstePrvogPredmeta);
                }
            },
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Odustani'),
                callback: function () {
                    PrikaziProzor2(false);
                    $btn.removeClass('teloDugmeIskljuceno');
                }
            }
        ]);
    }

    function ClickBtnArhiviranje(listaPredmeta, listaIdPredmetaZaArhiviranje, idVrstePrvogPredmeta) {
        var html = '<div style="height: auto;">\
                        <div>' + qKonverzija.VratiLokalizovaniTekst('Unesite razvođenje akata') + ':</div>\
                        <div class="unosRed">\
                            <div class="unosRedVr" style="margin-left: 15px; text-align: left;"><div id="predmetiPretragaRazvodjenjeAkata" style="position: absolute;"></div></div>\
                        </div><br>\
                        <div class="unosRed">\
	                        <div class="unosRedLbl_taL" style="width: 100px; margin-left: 15px;">' + qKonverzija.VratiLokalizovaniTekst('Rok čuvanja') + ':</div>\
	                        <div class="unosRedVr"><input style="width: 245px;" class="myInput" id="predmetiPretragaRazvodjenjeAkataNapomena" /></div>\
                        </div>\
                    </div>';
        
        
        PrikaziProzor2(true, false, qKonverzija.VratiLokalizovaniTekst('UPOZORENJE'), html, 'upozorenje', [
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Arhiviraj predmete'),
                callback: function () {
                    var aktovi = $('#predmetiPretragaRazvodjenjeAkata').quiMultiselect('getSelectedItems');

                    var $napomena = $('#predmetiPretragaRazvodjenjeAkataNapomena');
                    var napomena = $napomena.val().trimnull();
                    
                    if (napomena == undefined) {
                        qUtils.BlinkiBGColorElementa($napomena, 'red', null, 'white');
                        $napomena.focus();
                        return;
                    }

                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Arhiviranje predmeta u toku...') + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');
                    $.ajax({
                        type: 'POST',
                        url: url_ArhiviranjePredmeta,
                        data: {
                            predmetiJ: JSON.stringify(listaPredmeta),
                            aktoviJ: aktovi != undefined ? JSON.stringify(aktovi) : undefined,
                            napomena: napomena
                        },
                        success: function (data) {
                            if (data.Greska) {
                                PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                                return;
                            }

                            var htmlArhiviranih = "",
                                listaNearhiviranih = "",
                                htmlZaGreske = "";

                            var listaPredmetaArhiviranja = data.Data;
                            if (listaPredmetaArhiviranja != undefined && listaPredmetaArhiviranja.length > 0) {
                                for (var i = 0; i < listaPredmetaArhiviranja.length; ++i) {
                                    var p = listaPredmetaArhiviranja[i];

                                    // index predmeta (iz liste sa servera) koji se nalazi u listi odgovara indexu predmeta koji se nalazi u slickgridu
                                    var index = -1;
                                    for (var j = 0; j < listaPredmeta.length; ++j) {
                                        if (listaPredmeta[j] == p.IdPredmeta) {
                                            index = j;
                                            break;
                                        }
                                    }

                                    var item = dataView.getItemById(listaIdPredmetaZaArhiviranje[index]);
                                    if (item != undefined) {
                                        if (p.Arhiviran) {
                                            if (item.IdPredmeta == p.IdPredmeta) {
                                                htmlArhiviranih += '<i class="fa fa-reply link-predmet" data-id="' + p.IdPredmeta + '"></i><b style="margin-left: 5px;">' + p.BrojPredmeta + '</b><br>';
                                                dataView.deleteItem(listaIdPredmetaZaArhiviranje[index]);
                                            }
                                        } else {
                                            listaNearhiviranih += '<i class="fa fa-reply link-predmet" data-id="' + p.IdPredmeta + '"></i><b style="color: red; margin-left: 5px;">' + item.SifraPredmeta + '</b><i title="' + p.Napomena + '" style="font-size: 1.2em;" class="fa fa-info-circle info-arhiviranja" data-placement="right" data-toggle="tooltip" aria-hidden="true"></i><br>';
                                        }
                                    } else {
                                        // ovo ne bi smelo da se desi ali za svaki slucaj
                                        var arhiviran = p.Arhiviran ? qKonverzija.VratiLokalizovaniTekst('Arhiviran: ') : qKonverzija.VratiLokalizovaniTekst('Nearhiviran');
                                        var greska = p.Napomena != undefined && p.Napomena.trimnull() != undefined ? "\n" + qKonverzija.VratiLokalizovaniTekst('Greška: ') + p.Napomena : '';
                                        var titleZaGresku = qKonverzija.VratiLokalizovaniTekst('Id predmeta: ') + p.IdPredmeta + "\n" + qKonverzija.VratiLokalizovaniTekst('Status: ') + arhiviran + greska;
                                        htmlZaGreske += '<i class="fa fa-reply link-predmet" data-id="' + p.IdPredmeta + '"></i><b style="color: red; margin-left: 5px;">' + nonull(p.Broj) + ' ' + p.IdPredmeta + '</b><i style="font-size: 1.2em;" title="' + titleZaGresku + '" class="fa fa-info-circle info-arhiviranja" data-placement="right" data-toggle="tooltip" aria-hidden="true"></i><br>';
                                    }
                                }
                            }

                            var htmlAriviranja = '';
                            if (htmlArhiviranih != '') {
                                htmlAriviranja = '<div>' + qKonverzija.VratiLokalizovaniTekst('Lista arhiviranih predmeta') + ':</div><br>' + htmlArhiviranih + '<br>';
                            }

                            if (listaNearhiviranih != '') {
                                htmlAriviranja += '<div>' + qKonverzija.VratiLokalizovaniTekst('Lista nearhiviranih predmeta') + ':</div><br>' + listaNearhiviranih;
                            }

                            if (htmlZaGreske != '') {
                                htmlAriviranja += '<div>' + qKonverzija.VratiLokalizovaniTekst('Lista grešaka') + ':</div><br>' + htmlZaGreske;
                            }

                            PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), htmlAriviranja, 'difolt');

                            $('.link-predmet').on('click', function() {
                                var idPredmeta = $(this).attr('data-id');

                                var mask = '&idPredmeta=' + idPredmeta + '&close=true';

                                var hash = '#./Predmeti?tipDokumenta=3' + mask;
                                window.open(location.origin + hash, '_blank');
                            });

                            $('.info-arhiviranja').tooltip();
                        },
                        complete: function () {
                            $('#pretragaBtnArhiviranje').find('table').removeClass('teloDugmeIskljuceno');
                        }
                    });
                }
            },
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Odustani'),
                callback: function () {
                    PrikaziProzor2(false);
                    $('#pretragaBtnArhiviranje').find('table').removeClass('teloDugmeIskljuceno');
                }
            }
        ]);
        $('#predmetiPretragaRazvodjenjeAkata').quiMultiselect({ width: 350, listWidth: 350, listHeight: 250 });
        if (idVrstePrvogPredmeta == 4) {
            $('#predmetiPretragaRazvodjenjeAkata').quiMultiselect('setItems', vm.RazvodjenjeAkata2, 'Naziv', 'Izabran');
        } else {
            $('#predmetiPretragaRazvodjenjeAkata').quiMultiselect('setItems', vm.RazvodjenjeAkata, 'Naziv', 'Izabran');
        }
    }

    function ClickBtnPretrazi() {
        var $btn = $('#pretragaBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var elementPretrage = PreuzmiPodatkeZaPretragu();
        
        grid = undefined;

        $('#pretragaPredmetiSlickGrid').empty();
        $('#pretragaPredmetiSlickGridPager').empty();

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'GET',
            url: url_VratiPredmetePretrage,
            data: {
                pretragaJ: JSON.stringify(elementPretrage)
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data;

                if (predmeti && predmeti.length > 0) {

                    PopuniTabeluRezultataPretrage(predmeti);

                    $('#pretragaBtnBrisanje').show();
                    $('#pretragaBtnArhiviranje').show();
                    
                    $('#pretragaNemaRez').hide();
                } else {
                    $('#pretragaNemaRez').show();
                    
                    $('#pretragaBtnBrisanje').hide();
                    $('#pretragaBtnArhiviranje').hide();
                }
            },
            complete: function() {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }
    
    function PopuniTabeluRezultataPretrage(predmeti) {
        columnFilters = {};

        var dataGrid = [];

        for (var i = 0; i < predmeti.length; ++i) {
            var predmet = predmeti[i];
            var d = $.extend({}, predmet);
            
            d["id"] = i;
            
            dataGrid.push(d);
        }

        var columns = [];
        var checkboxSelector;
        
        if (tipPretrage == 4 || (tipPretrage == 3 && brisanjePredmeta)) {
            checkboxSelector = new Slick.CheckboxSelectColumn({
                cssClass: "slick-cell-checkboxsel qTabelaTd tac",
                columnId: -1,
                headerCssClass: "qTabelaHeadTd",
                toolTip: qKonverzija.VratiLokalizovaniTekst('Selektuj sve')
            });

            var checkBoxColumn = checkboxSelector.getColumnDefinition();
            checkBoxColumn['headerCssClass'] = 'qTabelaHeadTd tac';
            checkBoxColumn['customPolje'] = true;
            
            columns.push(checkBoxColumn);
        }

        var sirinaKoloneZaSadrzaj = 265;
        if (tipPretrage == 4) {
            sirinaKoloneZaSadrzaj = 230;
        } else if (tipPretrage == 3 && brisanjePredmeta) {
            sirinaKoloneZaSadrzaj = 200;
        }
        
        columns.push(
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
                width: sirinaKoloneZaSadrzaj,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "LiceKontrole",
                name: qKonverzija.VratiLokalizovaniTekst('Lice kontrole'),
                id: 7,
                width: 160,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            }
        );
        
        if (tipPretrage == 3 && brisanjePredmeta) {
            columns.push({
                field: "IdPredmeta",
                name: '',
                id: 6,
                width: 30,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd tac",
                formatter: DeleteFormatter
            });
        }

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#pretragaPredmetiSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel({ selectActiveRow: false }));
        var pager = new Slick.Controls.Pager(dataView, grid, $("#pretragaPredmetiSlickGridPager"));
        if (tipPretrage == 4 || (tipPretrage == 3 && brisanjePredmeta)) {
            grid.registerPlugin(checkboxSelector);
        }
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

            if (args.column.id != 0 && args.column.id != -1 && args.column.id != 6 && args.column.id != 1) {
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
                
                var result;

                var val1 = value1.toLowerCase(),
                        val2 = value2.toLowerCase();
                result = (val1 == val2 ? 0 : (val1 > val2 ? 1 : -1)) * sign;
                
                if (result != 0) {
                    return result;
                }
                return 0;
            };

            dataView.sort(comparer);
        });
        
        grid.onClick.subscribe(function (e, args) {
            var row = args.row;
            // ako je click na 7. celiju ali ne na slicicu x
            if ((tipPretrage == 3 && brisanjePredmeta) && e.target.className == "fa fa-remove x") {
                e.stopImmediatePropagation();

                var predmetZaBrisanje = grid.getDataItem(row);
                
                PrikaziProzorZaBrisanje(true, undefined, predmetZaBrisanje);
                
            } else if ($(e.target).hasClass("link")) {
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

        var rokCuv = $('#pretragaRokCuvanja').val();
        if (rokCuv) rokCuv = rokCuv.trimnull();

        var element = {
            IdOkruga: $okruzi.quiComboBox('getSelectedItemData'),
            IdOrgana: idOrgana,
            IdKlase: idKlase,
            BrojPredmeta: $predmet.val().trimnull(),
            Godina: $godine.quiComboBox('getSelectedItemData'),
            OdDatuma: $datumOd.quiDate('getJSONDateNoTZ'),
            DoDatuma: $datumDo.quiDate('getJSONDateNoTZ'),
            IdJedinice: idJedinice,
            Status: $statusi.quiComboBox('getSelectedItemData'),
            IdVrstePredmeta: $vrstePredmeta.quiComboBox('getSelectedItemData'),
            IdInspektora: $inspektori.quiComboBox('getSelectedItemData'),
            Podnosilac: $podnosilac.val().trimnull(),
            LiceKontrole: $liceKontrole.val().trimnull(),
            Sadrzaj: $sadrzaj.val().trimnull(),
            IdTakse: $takse.quiComboBox('getSelectedItemData'),
            StraniBroj: $straniBroj.val().trimnull(),
            Rok: $rok.val().trimnull(),
            //ako je prvi selektovan onda je pre roka true
            PreRoka: $('#pretragaRokRadioWrap').find('input:eq(0)').prop('checked'), 
            DatumKretanja: $datumKretanja.quiDate('getJSONDateNoTZ'),
            IdKretanjaPredmeta: $vrsteKretanja.quiComboBox('getSelectedItemData'),
            OpisKretanja: $opisKretanja.val().trimnull(),
            IdOpstine: $opstine.quiComboBox('getSelectedItemData'),
            OznakaOrgana: $oznakaOrgana.val().trimnull(),
            OznakaKlase: oznakaKlase,
            OznakaJedinice: oznakaJedinice,
            GledanjeDatumaKreiranja: $datumiRadioWrap.find('input:eq(0)').prop('checked'),
            IdMestaOpstine: $mestaOpstine.quiComboBox('getSelectedItemData'),
            RokCuvanja: rokCuv
        };

        return element;
    }
    
    function ClickBtnStampa() {
        var $btn = $('#pretragaBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var predmeti = PreuzmiPodatkeZaStampu();
        
        if (predmeti == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nema pretraženih predmeta.'), 'greska');
            return;
        }
        
        $btn.addClass('teloDugmeIskljuceno');
        
        if (predmeti && predmeti.length > 0) {
            var dataObj = {
                listaPredmetaJ: JSON.stringify(predmeti)
            };

            qStampa.PrikaziDijalogStampe(url_VratiStampePretrazenihPredmeta, dataObj, false, false, 'POST');
        }
        
        $btn.removeClass('teloDugmeIskljuceno');
    }
    
    function PreuzmiPodatkeZaStampu() {
        if (grid == undefined || dataView == undefined) return undefined;
        var predmeti = [];
        
        var predmetiPretrage = dataView.getItems();
        
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

    function VratiInspektoreAjax(idOkruga) {
        $.ajax({
            type: 'GET',
            url: url_VratiInspektoreOkruga,
            data: {
                idOkruga: idOkruga
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $inspektori.quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdElementa');
            },
            complete: function() {
            }
        });
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

    qPretragaPredmeta.Init = function() {
        vm = qUtils.IzvuciVM("#vm", true);
        
        columnFilters = {};
        grid = undefined;
        dataView = undefined;

        tipPretrage = parseInt($('#tipPretrage').text().trimnull());
        if (tipPretrage == 3 || tipPretrage == 4) {
            _scrTabelaOduzimac = 350;
        }

        brisanjePredmeta = $('#brisanjePredmeta').text().toLowerCase() == "true";
        
        tekucaGodina = $("#tekucaGodina").text().trimnull();

        // naslov transakcije se uzima sa dugmeta
        $('#pretragaNaslov').text($('#meniPretrage').find('.hederMeniDugme.meniDugmeKliknuto .hederMeniDugmeText').text());

        url_VratiOpstine = $('#url_VratiOpstine').text();
        url_VratiKlase = $('#url_VratiKlase').text();
        url_VratiJedinice = $('#url_VratiJedinice').text();
        url_VratiInspektoreOkruga = $('#url_VratiInspektoreOkruga').text();
        url_BrisanjePredmeta = $('#url_BrisanjePredmeta').text();
        url_VratiPredmetePretrage = $('#url_VratiPredmetePretrage').text();
        url_ArhiviranjePredmeta = $('#url_ArhiviranjePredmeta').text();
        url_VratiStampePretrazenihPredmeta = $('#url_VratiStampePretrazenihPredmeta').text();
        url_VratiMestaOpstine = $('#url_VratiMestaOpstine').text();

        $oznakaOrgana = $('#pretragaOznakaOrgana');
        $oznakaKlase = $('#pretragaOznakaKlase');
        $oznakaJedinice = $('#pretragaOznakaJedinice');

        $okruzi = $('#pretragaOkruzi');
        $organi = $('#pretragaOrgani');
        $klase = $('#pretragaKlase');
        $godine = $('#pretragaGodine');
        $predmet = $('#pretragaPredmet');

        $opstine = $('#pretragaOpstine');
        $mestaOpstine = $('#pretragaMestaOpstine');

        $jedinice = $('#pretragaJedinice');
        $datumOd = $('#pretragaOdDatuma');
        $datumDo = $('#pretragaDoDatuma');
        $rokRadioWrap = $('#pretragaRokRadioWrap');
        $statusi = $('#pretragaStatusi');
        $podnosilac = $('#pretragaPodnosilac');
        $liceKontrole = $('#pretragaLiceKontrole');
        $sadrzaj = $('#pretragaSadrzaj');
        $vrstePredmeta = $('#pretragaVrstePredmeta');
        $rok = $('#pretragaRok');
        $takse = $('#pretragaTakse');
        $straniBroj = $('#pretragaStraniBroj');

        $inspektori = $('#pretragaInspektori');

        $datumKretanja = $('#pretragaDatumKretanja');
        $vrsteKretanja = $('#pretragaVrsteKretanja');
        $opisKretanja = $('#pretragaOpisKretanja');

        $datumiRadioWrap = $('#pretragaDatumRadioWrap');

        // ---------------------------- INICIJALIZACIJA KOMPONENTI --------------------------
        
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
        if (tipPretrage == 2) {
            $statusi.quiComboBox('selectItemByIndex', 0);
        }
        
        if (tipPretrage == 4) {
            $statusi.quiComboBox('selectItemByData', 'O');
        }

        $vrstePredmeta.quiComboBox({ listWidth: listWidth, width: width3, showX: true });
        $vrstePredmeta.quiComboBox('setItemsFromBinding', vm.VrstePredmeta, 'Naziv', 'IdElementa');
        
        $takse.quiComboBox({ listWidth: listWidth, width: width3, showX: true });
        $takse.quiComboBox('setItemsFromBinding', vm.Takse, 'Naziv', 'IdElementa');
        
        $datumKretanja.quiDate({ width: width3, showX: true});
        $datumKretanja.quiDate('clearDate');
        
        $vrsteKretanja.quiComboBox({ listWidth: width3, width: width3, showX: true });
        $vrsteKretanja.quiComboBox('setItemsFromBinding', vm.KretanjaPredmeta, 'Naziv', 'IdElementa');
        
        $inspektori.quiComboBox({ listWidth: width3, width: width3, showX: true });
        if (vm.Inspektori && vm.Inspektori.length > 0) {
            $inspektori.quiComboBox('setItemsFromBinding', vm.Inspektori, 'Naziv', 'IdElementa');
        }
        // ------------------------ REGISTROVANJE DOGADJAJA---------------------------------

        $okruzi.on('select', function() {
            var idOkruga = $okruzi.quiComboBox('getSelectedItemData');
            var idOrgana = $organi.quiComboBox('getSelectedItemData');
            
            $klase.quiComboBox('clearItems');
            $opstine.quiComboBox('clearItems');
            $mestaOpstine.quiComboBox('clearItems');
            
            if (idOkruga != undefined) {
                VratiKlaseAjax(idOkruga, idOrgana);

                VratiJediniceAjax(idOrgana);
            }
            
            if (idOkruga != undefined) {
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

        $('#pretragaBtnPretrazi').click(ClickBtnPretrazi);
        $('#pretragaBtnReset').click(ClickBtnReset);

        $('#detaljiPretrage').click(function() {
            var $this = $(this);
            
            if ($this.hasClass('manjaPretraga')) {
                $this.removeClass('manjaPretraga');

                $('.nijeDetaljna').show();
                $('#pretragaPodnosilac').css('width', '254px');
                $('#pretragaSadrzaj').css('width', '250px');
                
                $this.attr('title', qKonverzija.VratiLokalizovaniTekst("Detaljna pretraga"));
                
                _scrTabelaOduzimac = 435;
                
                if (tipPretrage == 4 || (tipPretrage == 3 && brisanjePredmeta)) {
                    _scrTabelaOduzimac = 470;
                }

                $('#pretragaPredmetiSlickGrid').css('height', '100vh').css('height', '-=' + _scrTabelaOduzimac + 'px');
            } else {
                $this.addClass('manjaPretraga');
                
                $('.nijeDetaljna').hide();
                $('#pretragaPodnosilac').css('width', '1043px');
                $('#pretragaSadrzaj').css('width', '1039px');

                $this.attr('title', qKonverzija.VratiLokalizovaniTekst("Opšta pretraga"));

                _scrTabelaOduzimac = 325;
                if (tipPretrage == 4 || (tipPretrage == 3 && brisanjePredmeta)) {
                    _scrTabelaOduzimac = 360;
                }

                $('#pretragaPredmetiSlickGrid').css('height', '100vh').css('height', '-=' + _scrTabelaOduzimac + 'px');
            }
        });

        $('#pretragaBtnStampa').click(ClickBtnStampa);
        
        $('#pretragaBtnBrisanje').click(function () {

            var predmetiZaBrisanje = [];

            if (dataView != undefined && grid != undefined && grid.getSelectedRows().length > 0) {
                var selected = grid.getSelectedRows();
                var length = grid.getSelectedRows().length;

                for (var i = 0; i < length; ++i) {
                    var p = dataView.getItem(selected[i]);
                    
                    var pred = {};

                    pred.IdPredmeta = p.IdPredmeta;
                    pred.SifraPredmeta = p.SifraPredmeta;
                    pred.id = p.id;
                    predmetiZaBrisanje.push(pred);
                }
            }

            if (predmetiZaBrisanje.length == 0) {
                PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nijedan predmet nije izabran za brisanje.'), 'greska');
                return;
            }

            PrikaziProzorZaBrisanje(false, predmetiZaBrisanje);
        });
        
        $('#pretragaBtnArhiviranje').click(function () {
            var predmetiZaArhiviranje = [];

            if (dataView != undefined && grid != undefined && grid.getSelectedRows().length > 0) {
                var selected = grid.getSelectedRows();
                var length = grid.getSelectedRows().length;

                var idVrstePrvogPredmeta = undefined;
                
                var prviPredmet = dataView.getItem(selected[0]);
                idVrstePrvogPredmeta = prviPredmet != undefined ? prviPredmet.IdVrstePredmeta : undefined;

                for (var i = 0; i < length; ++i) {
                    var p = dataView.getItem(selected[i]);

                    var pred = {};

                    pred.IdPredmeta = p.IdPredmeta;
                    pred.SifraPredmeta = p.SifraPredmeta;
                    pred.id = p.id;
                    predmetiZaArhiviranje.push(pred);
                }
            }

            if (predmetiZaArhiviranje.length == 0) {
                PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nijedan predmet nije izabran za arhiviranje.'), 'greska');
                return;
            }

            PrikaziProzorZaArhiviranje(predmetiZaArhiviranje, idVrstePrvogPredmeta);
        });
        
        $(window).on('resize.slickgrid', function() {
            if (grid != undefined) {
                grid.resizeCanvas();
            }
        });
    };

}(window.qPretragaPredmeta = window.qPretragaPredmeta || {}, jQuery));

//#endregion

//#region Pretraga obrisanih predmeta

(function (qPretragaObrisanih, $, undefined) {
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
        url_VratiObrisanePredmete,
        url_AktivirajPredmet;
    
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

    function AktivirajFormatter(row, cell, value, columnDef, dataContext) {
        return '<i class="fa fa-unlock-alt aktiviraj" aria-hidden="true" data-id="' + dataContext.IdPredmeta + '"></i>';
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
        $godine.quiComboBox('selectItemByData', danas.getFullYear());
        $predmet.val('');
        $jedinice.quiComboBox('clearSelection');

        $('#pretragaObrisanihNemaRez').hide();

        $('#pretragaObrisanihSlickGrid').empty();
        $('#pretragaObrisanihSlickGridPager').empty();

        columnFilters = {};
        grid = undefined;
    }
    
    function ClickBtnPretrazi() {
        var $btn = $('#pretragaObrisanihBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        grid = undefined;

        $('#pretragaObrisanihSlickGrid').empty();
        $('#pretragaObrisanihSlickGridPager').empty();

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
            url: url_VratiObrisanePredmete,
            data: {
                idOkruga: $okruzi.quiComboBox('getSelectedItemData'),
                idOrgana: $organi.quiComboBox('getSelectedItemData'),
                idKlase: idKlase,
                oznakaKlase: oznakaKlase,
                brojPredmeta: $predmet.val().trimnull(),
                godina: $godine.quiComboBox('getSelectedItemData'),
                idJedinice: idJedinice,
                oznakaJedinice: oznakaJedinice
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data;

                if (predmeti && predmeti.length > 0) {

                    PopuniTabeluRezultataPretrage(predmeti);

                    $('#pretragaObrisanihNemaRez').hide();
                } else {
                    $('#pretragaObrisanihNemaRez').show();
                }
            },
            complete: function() {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }
    
    function PopuniTabeluRezultataPretrage(predmeti) {
        columnFilters = {};

        var dataGrid = [];

        for (var i = 0; i < predmeti.length; ++i) {
            var predmet = predmeti[i];
            var d = $.extend({}, predmet);

            d["id"] = i;

            dataGrid.push(d);
        }

        var columns =[
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
                width: 425,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            },
            {
                field: "IdPredmeta",
                name: '',
                id: 6,
                width: 30,
                sortable: false,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd tac",
                formatter: AktivirajFormatter,
                customPolje: true
            }
        ];

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#pretragaObrisanihSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());
        var pager = new Slick.Controls.Pager(dataView, grid, $("#pretragaObrisanihSlickGridPager"));
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

            if (args.column.id != 0 && args.column.id != 6 && args.column.id != 1) {
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

                var result;

                var val1 = value1.toLowerCase(),
                        val2 = value2.toLowerCase();
                result = (val1 == val2 ? 0 : (val1 > val2 ? 1 : -1)) * sign;

                if (result != 0) {
                    return result;
                }
                return 0;
            };

            dataView.sort(comparer);
        });

        grid.onClick.subscribe(function (e, args) {
            var row = args.row;
            // ako je click na 7. celiju ali ne na slicicu x
            if (e.target.className == "fa fa-unlock-alt aktiviraj") {
                e.stopImmediatePropagation();

                var predmetZaAktiviranje = grid.getDataItem(row);

                PrikaziProzor2(true, true, qKonverzija.VratiLokalizovaniTekst('UPOZORENJE'), qKonverzija.VratiLokalizovaniTekst('Da li ste sigurni da želite da aktivirate obrisani predmet?'), 'upozorenje', [
                    {
                        labela: qKonverzija.VratiLokalizovaniTekst('Aktiviraj predmet'),
                        callback: function () {
                            var $btn = $(this).find('table');
                            if ($btn.hasClass('teloDugmeIskljuceno')) return;

                            $btn.addClass('teloDugmeIskljuceno');
                            $.ajax({
                                type: 'POST',
                                url: url_AktivirajPredmet,
                                data: {
                                    idPredmeta: predmetZaAktiviranje.IdPredmeta
                                },
                                success: function (data) {
                                    if (data.Greska) {
                                        $btn.removeClass('teloDugmeIskljuceno');
                                        PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                                        return;
                                    }

                                    dataView.deleteItem(predmetZaAktiviranje.id, predmetZaAktiviranje.IdPredmeta);
                                    $btn.removeClass('teloDugmeIskljuceno');

                                    PrikaziProzor(false);
                                },
                                complete: function () {
                                }
                            });
                        }
                    },
                    {
                        labela: qKonverzija.VratiLokalizovaniTekst('Odustani'),
                        callback: function() {
                            PrikaziProzor2(false);
                        }
                    }
                ]);

            } else if ($(e.target).hasClass("link")) {
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

    qPretragaObrisanih.Init = function () {
        vm = qUtils.IzvuciVM("#vm", true);
        
        danas = new Date();
        
        columnFilters = {};
        grid = undefined;

        url_VratiKlaseJedinice = $('#url_VratiKlaseJedinice').text();
        url_VratiObrisanePredmete = $('#url_VratiObrisanePredmete').text();
        url_AktivirajPredmet = $('#url_AktivirajPredmet').text();
        
        $okruzi = $('#pretragaObrisanihOkruzi');
        $organi = $('#pretragaObrisanihOrgani');
        $klase = $('#pretragaObrisanihKlase');
        $predmet = $('#pretragaObrisanihPredmet');
        $godine = $('#pretragaObrisanihGodine');
        $jedinice = $('#pretragaObrisanihJedinice');
        
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

        $('#pretragaObrisanihBtnReset').click(ClickBtnReset);
        $('#pretragaObrisanihBtnPretrazi').click(ClickBtnPretrazi);
        
        $(window).on('resize.slickgrid', function () {
            if (grid != undefined) {
                grid.resizeCanvas();
            }
        });
    };

}(window.qPretragaObrisanih = window.qPretragaObrisanih || {}, jQuery));

//#endregion

// #region Rokovnik

(function(qPretragaRokovnik, $, undefined) {
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
        url_VratiPredmeteRokovnika;

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

    // #region Slickgrid metode
    
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

    // #endregion

    function ClickBtnReset() {
        if (vm.Okruzi && vm.Okruzi.length > 1) {
            $okruzi.quiComboBox('clearSelection');
        }

        $organi.quiComboBox('clearSelection');
        $klase.quiComboBox('clearSelection');
        $godine.quiComboBox('selectItemByData', danas.getFullYear());
        $predmet.val('');
        $jedinice.quiComboBox('clearSelection');

        $('#pretragaRokovnikNemaRez').hide();

        $('#pretragaRokovnikSlickGrid').empty();
        $('#pretragaRokovnikSlickGridPager').empty();

        columnFilters = {};
        grid = undefined;
    }

    function ClickBtnPretrazi() {
        var $btn = $('#pretragaRokovnikBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        grid = undefined;

        $('#pretragaRokovnikSlickGrid').empty();
        $('#pretragaRokovnikSlickGridPager').empty();

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
            url: url_VratiPredmeteRokovnika,
            data: {
                idOkruga: $okruzi.quiComboBox('getSelectedItemData'),
                idOrgana: $organi.quiComboBox('getSelectedItemData'),
                idKlase: idKlase,
                oznakaKlase: oznakaKlase,
                brojPredmeta: $predmet.val().trimnull(),
                godina: $godine.quiComboBox('getSelectedItemData'),
                idJedinice: idJedinice,
                oznakaJedinice: oznakaJedinice
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var predmeti = data.Data;

                if (predmeti && predmeti.length > 0) {

                    PopuniTabeluRezultataPretrage(predmeti);

                    $('#pretragaRokovnikNemaRez').hide();
                } else {
                    $('#pretragaRokovnikNemaRez').show();
                }
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }

    function PopuniTabeluRezultataPretrage(predmeti) {
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
                width: 425,
                sortable: true,
                headerCssClass: "qTabelaHeadTd",
                cssClass: "qTabelaTd",
                formatter: NoNullFormatter
            }
        ];

        dataView = new Slick.Data.DataView();
        grid = new Slick.Grid("#pretragaRokovnikSlickGrid", dataView, columns, options);
        grid.setSelectionModel(new Slick.RowSelectionModel());
        var pager = new Slick.Controls.Pager(dataView, grid, $("#pretragaRokovnikSlickGridPager"));
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

                var result;

                var val1 = value1.toLowerCase(),
                        val2 = value2.toLowerCase();
                result = (val1 == val2 ? 0 : (val1 > val2 ? 1 : -1)) * sign;

                if (result != 0) {
                    return result;
                }
                return 0;
            };

            dataView.sort(comparer);
        });

        grid.onClick.subscribe(function (e, args) {
            var row = args.row;
            // ako je click na 1. celiju koja predstavlja link
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

    qPretragaRokovnik.Init = function () {
        vm = qUtils.IzvuciVM("#vm", true);

        danas = new Date();

        columnFilters = {};
        grid = undefined;

        url_VratiKlaseJedinice = $('#url_VratiKlaseJedinice').text();
        url_VratiPredmeteRokovnika = $('#url_VratiPredmeteRokovnika').text();

        $okruzi = $('#pretragaRokovnikOkruzi');
        $organi = $('#pretragaRokovnikOrgani');
        $klase = $('#pretragaRokovnikKlase');
        $predmet = $('#pretragaRokovnikPredmet');
        $godine = $('#pretragaRokovnikGodine');
        $jedinice = $('#pretragaRokovnikJedinice');

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

        $('#pretragaRokovnikBtnReset').click(ClickBtnReset);
        $('#pretragaRokovnikBtnPretrazi').click(ClickBtnPretrazi);

        $(window).on('resize.slickgrid', function () {
            if (grid != undefined) {
                grid.resizeCanvas();
            }
        });
    };

}(window.qPretragaRokovnik = window.qPretragaRokovnik || {}, jQuery));

// #endregion