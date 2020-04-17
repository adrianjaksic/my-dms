// #region Sifarnik

(function(qMasterSif, $, undefined) {
    var tipDokumenta,
        vm,
        tekuciNode,
        url_VratiPodatkeElementa,
        url_VratiPodatke,
        url_SnimiPodatkeElementa,
        url_ObrisiElement,
        url_VratiPodatkeKriterijuma2,
        url_VratiPodatkeKriterijuma3,
        url_SnimiSlikuElementa,
        url_VratiPodatkeZavisnogElementa,
        url_VratiZavisnePodatkeElementa,
        listaNazivaGrupaZaTabove = [],
        filterStabla = true;
    
    function ClickTabovi() {
        var $tab = $(this),
            $parent = $tab.parent();
        if ($tab.hasClass('tabSel')) return;
        $parent.find('li.tabSel').removeClass('tabSel');
        $tab.addClass('tabSel');
        $('.tabSekcije').hide();
        var kojiTab = $tab.attr('data-tab');
        $(kojiTab).show();
    }
    
    /*
    * Metoda inicijalno sakriva sve section delove za tabove osim onog koji je inicijalno selektovan tab.
    */
    function InicijalnoSklanjanjeSectionTabova() {

        var $sectionWrap = $('#masterSifSectionWrap');
        $sectionWrap.find('.tabSekcije').hide();

        var sectionId = $("#masterSifTabovi").find('li.tabSel').attr('data-tab');
        $sectionWrap.find(sectionId).show();
    }
    
    // #region METODE ZA REGISTROVANJE CLICK DOGADJAJA NA BTN WRAPA VEZAN ZA KRITERIJUME
    
    function ClickBtnPretrazi() {
        tekuciNode = undefined;

        var $kriterijum1 = $('#kriterijum1');
        var $kriterijum2 = $('#kriterijum2');
        var $kriterijum3 = $('#kriterijum3');

        if ($kriterijum1.length > 0 && $kriterijum1.quiComboBox('getSelectedItemData') == undefined ||
            $kriterijum2.length > 0 && $kriterijum2.quiComboBox('getSelectedItemData') == undefined ||
            $kriterijum3.length > 0 && $kriterijum3.quiComboBox('getSelectedItemData') == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Kriterijum nije selektovan.'), 'greska');
            return;
        }

        $('#masterSifTaboviIBtnWrap').hide();
        $('#masterSifSectionWrap').html('');
        $('#masterSifTree').html('');

        var $btn = $('#masterSifBtnPretrazi').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'GET',
            url: url_VratiPodatke,
            data: {
                tipDokumenta: tipDokumenta,
                kriterijum1: $kriterijum1.quiComboBox('getSelectedItemData'),
                kriterijum2: $kriterijum2.quiComboBox('getSelectedItemData'),
                kriterijum3: $kriterijum3.quiComboBox('getSelectedItemData')
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                InicijalizujStablo(data.Data);
                PodesavanjeVidljivostiBtn(true);
                $('#masterSifStabloWrap').show();
                $('#masterSifTree').show();
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }

    function ClickBtnReset() {
        $('#kriterijum1').quiComboBox('clearSelectionNoTrigger');
        $('#kriterijum2').quiComboBox('clearSelectionNoTrigger');
        $('#kriterijum3').quiComboBox('clearSelectionNoTrigger');
        $('#masterSifTaboviIBtnWrap').hide();
        $('#masterSifTabovi').html('');
        $('#masterSifSectionWrap').html('');
        $('#masterSifStabloWrap').hide();
    }
    
    // #endregion

    /*
    * Metoda u okviru prosledjenog stringa zamenjuje sve razmake sa '_'.
    * @params nazivGrupe - string u kom se svi razmaci zamenjuju sa '_'
    * @returns string kao novi nazivGrupe koji ne sadrzi razmake
    */
    function ReplaceSpaceWithLineInID(nazivGrupe) {
        return nazivGrupe.replace(/ /g, "_");
    }

    // #region METODE ZA REGISTROVANJE CLICK DOGADJAJA NA BTN WRAPA VEZAN ZA STABLO I TAB
    
    /*
    * Metoda nakon klika na dodajNoviNode dugme u TreeWrap-u prikaze tabove i sekcije tabova kliknutog noda
    * @params indikator - boolean koji govori da li je u pitanju izmena postojeceg noda ili unos novog elementa...
    * ...true noviNode, false izmena
    */
    function ClickBtnDodajIliIzmeniNode(indikator) {

        // u zavisnosti od indikatora predstavlja dugme za unos novog noda ili izmenu postojeceg
        var $btn;

        var idElementa = undefined;

        // naslov iznad sekcije u rezimu unos/izmena
        var naslov = '';
        var $btnSacuvaj = $('#masterSifBtnSacuvaj').find('table');
        // ukoliko ima stabla
        if (indikator) {
            

            if (tekuciNode !== undefined) {
                // ukoliko je kliknut element
                $('#masterSifTree').find('.sel').click();
            }

            $btn = $('#masterSifBtnDodajNoviNode').find('table');
            if ($btn.hasClass('teloDugmeIskljuceno')) return;

            //da bi se posle znalo da li se radi unos novog noda ili izmena dodaje se klasa dugmetu za cuvanje
            if (!$btnSacuvaj.hasClass('noviNode')) {
                $btnSacuvaj.addClass('noviNode');
            }

            naslov = 'Unos novog';

        } else {
            //IZMENA
            //ukoliko je izmena u pitanju a nije kliknut postojeci node u stablu
            if (tekuciNode === undefined) {
                PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nije odabrana stavka za izmenu.'), 'greska');
                return;
            } else {
                // karakteristicni parametri za izmenu
                idElementa = tekuciNode.IdElementa;
            }

            $btn = $('#masterSifBtnIzmeniNode').find('table');

            if ($btn.hasClass('teloDugmeIskljuceno')) return;

            if ($btnSacuvaj.hasClass('noviNode')) {
                $btnSacuvaj.removeClass('noviNode');
            }

            naslov = tekuciNode.Naziv;
        }

        if (vm.DodavanjeIdeNaRoot) {
            idNadredjenogElementa = undefined;
        }


        $btn.addClass('teloDugmeIskljuceno');

        // brisanje svih appendovanih childova za tab i section
        $('#masterSifTabovi').html('');
        $('#masterSifSectionWrap').html('');
        // tabovi sakriveni dok se sve ne kreira
        $('#masterSifTaboviIBtnWrap').hide();

        $.ajax({
            type: 'GET',
            url: url_VratiPodatkeElementa,
            data: {
                tipDokumenta: tipDokumenta,
                idElementa: idElementa,
                kriterijum1: $('#kriterijum1').quiComboBox('getSelectedItemData'),
                kriterijum2: $('#kriterijum2').quiComboBox('getSelectedItemData'),
                kriterijum3: $('#kriterijum3').quiComboBox('getSelectedItemData')
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');

                    if (!$('.masterSifTree').length > 0) {
                        $('#masterSifStabloWrap').find('#masterSifStabloNaslov h3').html('');
                    }

                    return;
                }

                var elementiZaUnos = data.Data;

                if (elementiZaUnos && elementiZaUnos.length > 0) {
                    for (var i = 0; i < elementiZaUnos.length; ++i) {
                        var polje = elementiZaUnos[i];
                        if (polje.NazivGrupe != undefined) {
                            // element ide u odgovarajuci tab

                            var izmenjeniNazivGrupe = ReplaceSpaceWithLineInID(polje.NazivGrupe);

                            // ako u listi naziva ne postoji naziv grupe elementa onda se dodaju u listu i kreira tab i sekcija
                            if ($.inArray(izmenjeniNazivGrupe, listaNazivaGrupaZaTabove) == -1) {
                                listaNazivaGrupaZaTabove.push(izmenjeniNazivGrupe);
                                KreirajTabIOdgovarajucuSekciju(polje.NazivGrupe, naslov);
                            }

                                // ako postoji u listi naziva ali div element za smestanje tabova ne sadrzi nazivGrupe ( ako je uradjeno $('#id').html('');
                                // onda kreirati tab
                            else if ($('#masterSifTabovi').has('li[data-tab="#' + izmenjeniNazivGrupe + '"]').length == 0) {
                                KreirajTabIOdgovarajucuSekciju(polje.NazivGrupe, naslov);
                            }

                            //dodati polja u sekciju koja se prikaze za selektovani tab

                            // ukoliko polje sadrzi listu podredjenih elemenata (tip podatka je tabela (TipPodatka = 70))
                            // potrebno je da se pokupi lista podredjenih elemenata kako bi se mogli inicijalizovati u prostoru tabele
                            if (polje.TipPodatka == 70) {
                                var podredjeni = [];
                                for (var j = 0; j < elementiZaUnos.length; ++j) {
                                    var podatak = elementiZaUnos[j];
                                    if (podatak.Id != polje.Id && podatak.IdNadredjenogElementa != undefined && podatak.IdNadredjenogElementa == polje.Id) {
                                        podredjeni.push(podatak);
                                    }
                                }

                                if (podredjeni.length > 0) {
                                    polje['Podredjeni'] = podredjeni;
                                }
                            }

                            DodajPoljeUOdgovarajuciSection(polje, izmenjeniNazivGrupe);
                        }
                    }

                    InicijalnoSklanjanjeSectionTabova();

                    $('#masterSifTaboviIBtnWrap').show();
                    $('#masterSifStabloWrap').show();

                    //brisanje header-a iz svih section-a
                    $('#masterSifSectionWrap').find('section .hederH1').remove();

                    $('#masterSifSectionWrap').find('section').each(function() {
                        var $this = $(this);
                        var $sectionPoljaLevo = $this.find('#masterSifSectionContentPoljaLevo');
                        var $sectionPoljaDesno = $this.find('#masterSifSectionContentPoljaDesno');
                        
                        if ($sectionPoljaLevo.children().length == 0 && $sectionPoljaDesno.children().length == 0) {
                            $sectionPoljaLevo.remove();
                            $sectionPoljaDesno.remove();
                        }
                    });

                    if ($('#masterSifTabovi').find('li').length > 0) {
                        $('#masterSifTaboviWrap').show();
                    } else {
                        $('#masterSifTaboviWrap').hide();
                    }


                    var $sectionWrap = $('#masterSifSectionWrap');

                    if ($sectionWrap.is(':hidden')) {
                        $sectionWrap.show();
                    }

                    if ($('.masterSifTree').length == 0) {
                        //brisanje header-a iz svih section-a
                        $('#masterSifSectionWrap').find('section .hederH1').remove();
                    }
                    
                } else {
                    $('#masterSifTaboviIBtnWrap').hide();
                    $('#masterSifTaboviWrap').hide();
                }


            },
            complete: function () {
                if ($btn != undefined) {
                    $btn.removeClass('teloDugmeIskljuceno');

                    if ($btn.hasClass('noviNode')) {
                        $btn.removeClass('noviNode');
                    }
                }
            }
        });
    }

    function ClickBtnObrisiNode() {
        if (tekuciNode === undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nije odabrana stavka za brisanje.'), 'greska');
            return;
        }

        var $btn = $('#masterSifBtnObrisiNode').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'POST',
            url: url_ObrisiElement,
            data: {
                tipDokumenta: tipDokumenta,
                idElementa: tekuciNode.IdElementa
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }
                // nakon brisanja elementa nijedan element stabla nije selektovan
                tekuciNode = undefined;

                var $tree = $('#masterSifTree');
                if (data.Data) {
                    $tree.quiTree('removeSelectedItem');
                } else {
                    $tree.find('.sel').removeClass('sel');
                }


                var $taboviIBtnWrap = $('#masterSifTaboviIBtnWrap');
                var $sectionWrap = $('#masterSifSectionWrap');

                if ($taboviIBtnWrap.is(':visible')) {
                    $taboviIBtnWrap.hide();
                }

                if ($sectionWrap.is(':visible')) {
                    $sectionWrap.hide();
                }
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }

    function ClickBtnSacuvaj() {
        log(tekuciNode);
        var idElementa = undefined;

        var $btn = $('#masterSifBtnSacuvaj').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;


        if (!$btn.hasClass('noviNode')) {
            if ($('.masterSifTree').length > 0) {
                if (tekuciNode === undefined) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nije odabrana stavka za unos ili izmenu.'), 'greska');
                    return;
                }

                idElementa = tekuciNode.IdElementa;
            } else {
                idElementa = $('#masterSifPretragaInput').val().trimnull();
            }
        }

        var podaci = PreuzimanjePodatakaZaSnimanjeUBazu();

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'POST',
            url: url_SnimiPodatkeElementa,
            data: {
                tipDokumenta: tipDokumenta,
                idElementa: idElementa,
                podaciJ: JSON.stringify(podaci)
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var nodeZaStablo = data.Data;
                
                var $tree = $('#masterSifTree');
                if (nodeZaStablo) {
                    if ($btn.hasClass('noviNode')) {
                        if (vm.DodavanjeIdeNaRoot) {
                            $tree.quiTree('addItem', nodeZaStablo, 1);

                            $('#masterSifBtnDodajNoviNode').click();
                        } else {
                            if (nodeZaStablo.IdNadredjenogElementa != undefined) {
                                $tree.quiTree('addItem', nodeZaStablo, 2);
                            } else {
                                $tree.quiTree('addItem', nodeZaStablo, 1);
                            }

                        }
                    } else {
                        // 
                        $tree.quiTree('updateSelectedItem', nodeZaStablo);

                        var $node = $tree.find('.sel');
                        //signalizacija da je izvrsena izmena selektovanog node-a
                        $node.addClass('new');
                        setTimeout(function () {
                            $node.removeClass('new');
                        }, 1000);
                    }

                    
                }
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }

    /*
    * Funkcija kreira tab i section veza za taj tab.
    * @params nazivGrupe - Originalni naziv grupe [atribut polja]
    * @params naslov - Naslov u okviru svakog section-a kad se kreira
    */
    function KreirajTabIOdgovarajucuSekciju(nazivGrupe, naslov) {

        var izmenjeniNazivGrupe = ReplaceSpaceWithLineInID(nazivGrupe);

        var $tabovi = $('#masterSifTabovi');
        // ako je vece od nule znaci da tabovi postoje i da je prvi selektovan po default-u
        if ($tabovi.find('li').length > 0) {
            $('#masterSifTabovi').append('<li class="tab" data-tab="#' + izmenjeniNazivGrupe + '"><span class="tabText">' + nazivGrupe + '</span></li>');
        } else {
            $('#masterSifTabovi').append('<li class="tab tabSel" data-tab="#' + izmenjeniNazivGrupe + '"><span class="tabText">' + nazivGrupe + '</span></li>');
        }

        // kad se kreira tab, onda se kreira i sekcija za odgovarajuci tab
        // dodaje se stil sekciji da se poklapa sa pozicijom i velicinom tab odeljka!

        var tabHtml = '<section id="' + izmenjeniNazivGrupe + '" class="tabSekcije" style="width: 60%; float: right; min-height:360px;">' +
                        '<div class="hederH1" style="margin-bottom: 0px;"><h2>' + naslov + '</h2></div>' +
                        '<div id="masterSifSectionContentPolja" style="height: 40%; width: 100%;">' +
                            '<div class="unosRed" id="masterSifSectionContentPoljaLevo" style="width: 45%; float: left; margin-top: 5px; height: auto;"></div>' +
                            '<div class="unosRed" id="masterSifSectionContentPoljaDesno" style="width:45%; float: right; margin-top: 5px; height: auto;"></div>' +
                            '<div class="unosRed" id="masterSifSectionContentPoljaDole" style="width:100%; float: right;"></div>' +
                        '</div>' +
                    '<div class="clear"></div>';

        tabHtml += '</section>';

        $('#masterSifSectionWrap').append(tabHtml);
    }

    /*
    * Funkcija koja za prosledjeno polje kreira u okviru svog section-a polje sa odredjenim tipom i nazivom.
    * Section na osnovu tipa [polje.TipPodatka] smesta polje u levu ili desnu kolonu.
    * Ukoliko je tip podatka tabela onda se smesta u div predvidjen za tabelu.
    * @params polje - polje koje se uvezuje za section-polje
    * @params nazivGrupe - predstavlja naziv grupe polja, u okviru koga je razmak zamenjen za _ kako bi se mogao...
    * ...string dodati id elementa koji se krerira u section delu.
    */
    function DodajPoljeUOdgovarajuciSection(polje, nazivGrupe) {
        if (polje.IdNadredjenogElementa != undefined) {
            return;
        }

        var html = '';

        var wLabele = 'min-width:35%; max-width: 35%';
        // labela za checkbox
        var wLabele2 = 'min-width:65%; max-width: 75%; margin-right: 15%';
        var divInputPolja = '62%';
        var wInputPolja = '100%';
        // section u koji se upisuju prosledjena polja
        var $section = $('#masterSifSectionWrap').find('#' + nazivGrupe);
        var $sectionContentPolja = $section.find('#masterSifSectionContentPolja');
        var $sectionContentPoljaLevaKolona = $sectionContentPolja.find('#masterSifSectionContentPoljaLevo');
        var $sectionContentPoljaDesnaKolona = $sectionContentPolja.find('#masterSifSectionContentPoljaDesno');
        var $sectionContentPoljaDole = $sectionContentPolja.find('#masterSifSectionContentPoljaDole');

        var fullIdOfElement = '';

        //Tip =  0, @"L_TIP_PODATKA_TEKST_SAKRIVEN"
        //Tip =  2, @"L_TIP_PODATKA_CEOPOZITIVANBROJ"
        //Tip = 11, @"L_TIP_PODATKA_TEKST"
        //Tip = 111, @"L_TIP_PODATKA_TEKST_DISABLED"
        //Tip = 112, @"L_TIP_PODATKA_TEKSTAREA"
        //Tip = 13, @"L_TIP_PODATKA_CEKIRANJE"

        var index = $sectionContentPolja.find('.masterSifPoljeUSection').length;
        var leftMargin = 'margin-left: 1%;';
        var bottomMargin = 'margin-bottom: 5px;';

        // flag indikator ako je true znaci da se polje ubacuje u levu kolonu, a ako je false ubacuje se u desnu
        var flag = true;

        if (index % 2 == 0) {
            flag = true;
        } else {
            flag = false;
        }

        ++index;

        var vrednostPolja = '';

        if (polje.Vrednost != undefined) {
            vrednostPolja = polje.Vrednost;
        }


        fullIdOfElement = 'masterSifSection' + nazivGrupe + 'Podatak' + index;

        //u zavistnosti od tipa kreira se div za labelu i div za polja. ukoliko je tip input polje ...
        // ... onda se polje odmah i kreira
        // id za komponentu se kreira kao: masterSifSection[idSection]Podatak[index]:
        // idSection predstavlja id atribut section-a u koji se smesta polje
        // index predstavlja koji je po redu child
        switch (polje.TipPodatka) {
            // posto je isto formiranje INPUT polja za tipove 1, 2,3, 11 samo se na poslednjem uradi i primeni se na ostale
            // razlika je samo u rukovanju podacima i samom kontrolom
            case 0:
                // @"L_TIP_PODATKA_TEKST_SAKRIVEN"
                html += '<div style="display:none;" class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele + '; ' + leftMargin + bottomMargin + '">' + polje.Naziv + ':</div>\
                            <div class="unosRedVr" style="' + bottomMargin + '; width:' + divInputPolja + '">\
                                <input type="text" id="' + fullIdOfElement + '" class="myInput" disabled="disabled" value="' + vrednostPolja + '" data-val="' + vrednostPolja + '" style="width:' + wInputPolja + ';" />\
                            </div>\
                        </div>';
                // u zavisnosti na kojoj strani treba da se prikaze appenduje se na odredjeni div
                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                }

                break;
            case 2:
                // @"L_TIP_PODATKA_CEOPOZITIVANBROJ"
            case 11:
                // @"L_TIP_PODATKA_TEKST"
                var poruka = polje.PotrebniPodaci != undefined ? polje.PotrebniPodaci : "";
                html += '<div class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele + '; ' + leftMargin + bottomMargin + '">' + polje.Naziv + ':</div>\
                            <div class="unosRedVr" style="' + bottomMargin + '; width:' + divInputPolja + '">\
                                <input type="text" id="' + fullIdOfElement + '" class="myInput" value="' + vrednostPolja + '" data-val="' + vrednostPolja + '" style="width:' + wInputPolja + ';" />\
                            </div>';
                
                if (poruka.length > 0) {
                    html += '<div class="unosRedLbl_taL" style="width: 100%; font-size: 9px;' + leftMargin + bottomMargin + '">' + poruka + '</div>';
                }

                html += '</div>';
                // u zavisnosti na kojoj strani treba da se prikaze appenduje se na odredjeni div
                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                }

                break;
            case 111:
                // @"L_TIP_PODATKA_TEKST_DISABLED"
                html += '<div class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele + '; ' + leftMargin + bottomMargin + '">' + polje.Naziv + ':</div>\
                            <div class="unosRedVr" style="' + bottomMargin + '; width:' + divInputPolja + '">\
                                <input type="text" id="' + fullIdOfElement + '" class="myInput" disabled="disabled" value="' + vrednostPolja + '" data-val="' + vrednostPolja + '" style="width:' + wInputPolja + ';" />\
                            </div>\
                        </div>';
                // u zavisnosti na kojoj strani treba da se prikaze appenduje se na odredjeni div
                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                }

                break;
            case 112:
                // @"L_TIP_PODATKA_TEKST_AREA"
                html += '<div class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele + '; ' + leftMargin + bottomMargin + '">' + polje.Naziv + ':</div>\
                            <div class="unosRedVr" style="' + bottomMargin + '; width:' + divInputPolja + '">\
                                <textarea class="myInputTAFix" style="width:' + wInputPolja + ';" value="' + vrednostPolja + '" data-val="' + vrednostPolja + '" id="' + fullIdOfElement + '">' + vrednostPolja + '</textarea>\
                            </div>\
                        </div><div class="clear"></div>';
                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                    //$sectionContentPoljaLevaKolona.css('margin-bottom', '80px');
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                    //$sectionContentPoljaDesnaKolona.css('margin-bottom', '80px');
                }
                break;
            case 13:
                // @"L_TIP_PODATKA_CEKIRANJE"
                var checkedInput = polje.Vrednost.toLowerCase() == "true" ? "checked='checked'" : '';

                html += '<div class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele2 + '; ' + leftMargin + bottomMargin + '">' + polje.Naziv + ':</div>\
                            <div class="unosRedVr" style="float: right;">\
                                <input type="checkbox" id="' + fullIdOfElement + '" style="' + bottomMargin + '" ' + checkedInput + '></div>\
                            </div>\
                        </div>';
                // u zavisnosti na kojoj strani treba da se prikaze appenduje se na odredjeni div
                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                }
                break;
            case 20:
                html += '<div class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '" data-idZavisnogElementa="' + nonull(polje.IdZavisnogElementa) + '">\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele + '; ' + leftMargin + bottomMargin + '">' + polje.Naziv + ':</div>\
                            <div class="unosRedVr" style="' + bottomMargin + ' width:' + divInputPolja + ';"><div id="' + fullIdOfElement + '" style="width: 100%;"></div>\
                            </div>\
                        </div>';

                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                }
                break;
            case 21:
                var zavisniPodaci = "";

                if (polje.PotrebniPodaci != undefined) {
                    zavisniPodaci = 'data-potrebniPodaci="' + polje.PotrebniPodaci + '"';
                }
                html += '<div class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '" ' + zavisniPodaci + '>\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele + '; ' + leftMargin + bottomMargin + '">' + polje.Naziv + ':</div>\
                            <div class="unosRedVr" style="' + bottomMargin + ' width:' + divInputPolja + ';"><div id="' + fullIdOfElement + '" style="width: 100%;"></div>\
                            </div>\
                        </div>';

                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                }
                break;
            case 70:
                // TABELA

                if (polje.Podredjeni != undefined && polje.Podredjeni.length > 0) {
                    // za svaki podredjeni se pravi html
                    // za sada se podrazumeva da je svaki podredjeni combobox
                    for (var m = 0; m < polje.Podredjeni.length; ++m) {
                        var pod = polje.Podredjeni[m];

                        var podredjeniFullId = fullIdOfElement + "Podredjeni" + m;
                        var podredjeniHtml = '<div class="masterSifPoljeUSection podredjeni" data-id="' + pod.Id + '" data-fullId="' + podredjeniFullId + '" data-idNadredjenog="' + polje.Id + '">\
                                                <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; width: 100px; ' + leftMargin + bottomMargin + '">' + pod.Naziv + ':</div>\
                                                <div class="unosRedVr" style="' + bottomMargin + ';"><div id="' + podredjeniFullId + '" style="width: 100%;"></div>\
                                                </div>\
                                            </div>';

                        var $podredjeniHtml = $(podredjeniHtml);
                        $podredjeniHtml.data('data-podatak', pod);

                        $sectionContentPoljaDole.append($podredjeniHtml);

                        var $podredjeni = $podredjeniHtml.find('#' + podredjeniFullId);
                        $podredjeni.quiComboBox({ listWidth: 280, width: 180, showX: true });
                        if (pod.IzborniPodaci != undefined && pod.IzborniPodaci.length > 0) {
                            $podredjeni.quiComboBox('setItemsFromBinding', pod.IzborniPodaci, 'Naziv', 'IdPodatka');
                        }

                        if (pod.ImaZavisneElemente) {
                            $podredjeni.on('select', function (e, item) {
                                VratiPodatkeZavisnogElementa($(this));
                            });
                        }
                    }

                    $sectionContentPoljaDole.append('<div class="teloDugmeWrapUFormi btnW3 btnFloatR" data-id="' + polje.Id + '" id="' + fullIdOfElement + 'btnDodajNoviRedTabele">\
                                                        <table class="teloDugme">\
                                                            <tbody><tr>\
                                                                <td>' + qKonverzija.VratiLokalizovaniTekst("Dodaj novi red") + '</td>\
                                                            </tr>\
                                                        </tbody></table>\
                                                    </div><div class="clear"></div>');

                    var $btnUnosNovogReda = $sectionContentPoljaDole.find('#' + fullIdOfElement + 'btnDodajNoviRedTabele');
                    $btnUnosNovogReda.on('click', function () {
                        var $btn = $(this);
                        var $sectionTabeleZaUnosNovogReda = $btn.parent();
                        var $tabelaBody = $sectionTabeleZaUnosNovogReda.find('.masterSifPoljeUSectionTabelaBody[data-id="' + $btn.attr('data-id') + '"]');

                        var podaciZaTabelu = $tabelaBody.data('data-podatak');
                        if (podaciZaTabelu != undefined) {
                            var listaPoredjenih = podaciZaTabelu.Podredjeni;

                            if (listaPoredjenih != undefined && listaPoredjenih.length > 0) {
                                var htmlZaNoviRed = '<tr>';
                                var idPodatkaReda = '';

                                for (var n = 0; n < listaPoredjenih.length; ++n) {
                                    var podredjeni = listaPoredjenih[n];
                                    var $podredjeniTabeleWrap = $sectionTabeleZaUnosNovogReda.find('.masterSifPoljeUSection.podredjeni[data-id="' + podredjeni.Id + '"]');

                                    var $podredjeniTabele = $podredjeniTabeleWrap.find('#' + $podredjeniTabeleWrap.attr('data-fullId'));
                                    var labelaPodredjenog = $podredjeniTabele.quiComboBox('getSelectedItemLabel');
                                    var vrednostPodredjenog = $podredjeniTabele.quiComboBox('getSelectedItemData');
                                    htmlZaNoviRed += '<td class="qTabelaTd">' + nonull(labelaPodredjenog) + '</td>';

                                    if (n == 0) {
                                        idPodatkaReda += nonull(vrednostPodredjenog);
                                    } else {
                                        idPodatkaReda += '-' + nonull(vrednostPodredjenog);
                                    }
                                }

                                htmlZaNoviRed += '<td class="qTabelaTd tac"><i class="fa fa-times"></i></td>\
                                                <\tr>';

                                var $noviRedTabeleHtml = $(htmlZaNoviRed);
                                $noviRedTabeleHtml.attr('data-id', idPodatkaReda);

                                $tabelaBody.append($noviRedTabeleHtml);
                            }
                        }
                    });
                }

                // kod za prikaz tabele
                html += '<table class="qTabela qTabelaMala" style="margin-bottom:3px;">\
                            <thead>\
                                <tr>';
                var hederTabele = polje.Heder;
                for (var indexHederKolone = 0; indexHederKolone < hederTabele.length; ++indexHederKolone) {
                    var kolonaHederaTabele = hederTabele[indexHederKolone];
                    html += '<td class="qTabelaHeadTd" style="width: ' + nonull(kolonaHederaTabele.Sirina) + '">' + kolonaHederaTabele.Naziv + '</td>';
                }

                html += '<td class="qTabelaHeadTd" style="width: 30px"></td>';

                html += '</tr>\
                            </thead>\
                            <tbody id=' + fullIdOfElement + 'TBodyFilter >\
                                <tr>';

                for (var indexFilterKolone = 0; indexFilterKolone < hederTabele.length; ++indexFilterKolone) {
                    html += '<td class="qTabelaTd" data-quitablefilter-type="txt"></td>';
                }

                html += '<td class="qTabelaTd"></td>';

                html += '</tr>\
                            </tbody>\
                            <tbody class="masterSifPoljeUSectionTabelaBody" id="' + fullIdOfElement + '" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            </tbody>\
                        </table>';

                $sectionContentPoljaDole.append(html);
                break;
            case 73:
                // @"L_TIP_PODATKA_TABELASACEKIRANJEM"
                var htmlCb = '<div>\
                            <div class="unosRedLbl_taL" style="overflow: hidden; max-height: 17px; ' + wLabele2 + '; ' + leftMargin + bottomMargin + '">' + qKonverzija.VratiLokalizovaniTekst('Označi sve') + ':</div>\
                            <div class="unosRedVr" style="float: right;">\
                                <input id="cekiranjeTabeleCheckBox" type="checkbox" style="' + bottomMargin + ' margin-right: 24px;"></div>\
                            </div>\
                        </div>';
                $sectionContentPoljaDesnaKolona.append(htmlCb);

                html += '<table class="qTabela qTabelaMala" style="margin-bottom:3px;">\
                            <thead>\
                                <tr>\
                                    <td class="qTabelaHeadTd" style="width:50px;">' + qKonverzija.VratiLokalizovaniTekst('Izabran') + '</td>';
                var hederTabele = polje.Heder;
                for (var indexHederKolone = 0; indexHederKolone < hederTabele.length; ++indexHederKolone) {
                    var kolonaHederaTabele = hederTabele[indexHederKolone];
                    html += ' <td class="qTabelaHeadTd" style="width: ' + nonull(kolonaHederaTabele.Sirina) + '">' + kolonaHederaTabele.Naziv + '</td>';
                }

                html += '</tr>\
                            </thead>\
                            <tbody id=' + fullIdOfElement + 'TBodyFilter >\
                                <tr>\
                                    <td class="qTabelaTd"></td>';

                for (var indexFilterKolone = 0; indexFilterKolone < hederTabele.length; ++indexFilterKolone) {
                    var kolonaFilteraTabele = hederTabele[indexFilterKolone];
                    switch (kolonaFilteraTabele.TipPodatka) {
                        case 3:
                            //money
                            html += ' <td class="qTabelaTd" data-quitablefilter-type="dec"></td>';
                            break;
                        default:
                            html += ' <td class="qTabelaTd" data-quitablefilter-type="txt"></td>';
                            break;
                    }

                }

                html += '</tr>\
                            </tbody>\
                            <tbody class="masterSifPoljeUSectionTabelaBody" id="' + fullIdOfElement + '" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            </tbody>\
                        </table>';

                $sectionContentPoljaDole.append(html);
                break;
            case 1000:
                // @"L_TIP_PODATKA_UPLOADSLIKE"
                /*
                html += '<div class="masterSifPoljeUSection unosRed" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="teloDugmeWrapUFormi btnW3" id="' + fullIdOfElement + 'BtnUploadSlike" style="margin-bottom: 5px; float: left;"></div>\
                            <div style="padding-top: 5px; float: right;">(1200 x 100)</div>\
                            <div class="unosRedVr" style="' + bottomMargin + ' float: right;" id="' + fullIdOfElement + '" data-urlSlike="' + vrednostPolja + '">\
                                <img style="max-width: 100%; max-height: 100%;" src="' + vrednostPolja + '"/>\
                            </div>\
                            <div class="clear"></div>\
                            <img src="' + vrednostPolja + '" id="' + fullIdOfElement + 'imageFullSize" class="qPopup_box" style="display:none; position: absolute !important; width: 59%;"/>\
                        </div>\
                        <div class="clear"></div>';
                if (flag) {
                    $sectionContentPoljaLevaKolona.append(html);
                } else {
                    $sectionContentPoljaDesnaKolona.append(html);
                }
                */
                
                html += '<div class="masterSifPoljeUSection unosRed" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="teloDugmeWrapUFormi btnW3" id="' + fullIdOfElement + 'BtnUploadSlike" style="margin-bottom: 5px; float: left;"></div>\
                            <div style="padding-top: 5px; float: left; margin-left: 80px;">(1200 x 100)</div>\
                            <div class="unosRedVr" style="' + bottomMargin + ' float: right; max-height: 150px;" id="' + fullIdOfElement + '" data-urlSlike="' + vrednostPolja + '">\
                                <img style="max-width: 100%; max-height: 100%;" src="' + vrednostPolja + '"/>\
                            </div>\
                            <div class="clear"></div>\
                        </div>\
                        <div class="clear"></div>';

                $sectionContentPoljaDole.append(html);
                break;
            case 2000:
                // @"L_TIP_PODATKA_TEKSTEDITOR"
                html += '<div class="masterSifPoljeUSection" data-tip="' + polje.TipPodatka + '" data-id="' + polje.Id + '" data-fullId="' + fullIdOfElement + '">\
                            <div class="unosRedVr" style="width: 100%;">\
                                <textarea class="myInputTAFix" style="width:100%; max-height: calc(100vh - 300px); min-height: calc(100vh - 400px);" value="' + vrednostPolja + '" data-val="' + vrednostPolja + '" id="' + fullIdOfElement + '">' + vrednostPolja + '</textarea>\
                            </div>\
                        </div><div class="clear"></div>';

                $sectionContentPoljaDole.append(html);
                break;
        }

        // kreiranje komponente od kreiranog div-a u okviru html-a i registrovanje dogadjaja
        switch (polje.TipPodatka) {
            case 0:
                // @"L_TIP_PODATKA_TEKST_SAKRIVEN"
                break;
            case 2:
                // @"L_TIP_PODATKA_CEOPOZITIVANBROJ"
                var $inputCeoBrojPozitivan = $('#' + fullIdOfElement);
                InicijalizujDogadjajeNaInputCeoBrojPozivan($inputCeoBrojPozitivan);
                break;
            case 11:
                // @"L_TIP_PODATKA_TEKST"
                break;
            case 111:
                // @"L_TIP_PODATKA_TEKST_DISABLED"
                break;
            case 112:
                // @"L_TIP_PODATKA_TEKSTAREA"
                break;
            case 13:
                // @"L_TIP_PODATKA_CEKIRANJE"
                break;
            case 20:
                // @"L_TIP_PODATKA_COMBOBOX"
                var $lookup = $('#' + fullIdOfElement);
                var sirina = $lookup.width();
                $lookup.quiComboBox({ listWidth: 300, width: sirina, showX: true });
                $lookup.quiComboBox('setItemsFromBinding', polje.IzborniPodaci, 'Naziv', 'IdPodatka');
                
                if (vrednostPolja.length > 0) {
                    $lookup.quiComboBox('selectItemByDataNoTrigger', vrednostPolja);
                }
                
                if (polje.IdZavisnogElementa != undefined) {
                    InicijalizujVrednostiZavisnogElementa($lookup);
                }

                break;
            case 21:
                // @"L_TIP_PODATKA_LOOKUPSACEKIRANJEM"
                var $multiSelect = $('#' + fullIdOfElement);
                var sirinaMs = $multiSelect.width();
                $multiSelect.quiMultiselect({ listWidth: 300, width: sirinaMs }).quiMultiselect('setItems', polje.IzborniPodaci, 'Naziv', 'Izabran');
                break;
            case 70:
                // TABELA:
                // todo tabela
                var $tbody = $('#' + fullIdOfElement);

                $tbody.data('data-podatak', polje);

                InicijalizujRedoveTabele($tbody, polje.IzborniPodaci, polje.Heder);
                InicijalizujDodadjajeNaRedoveTabele($tbody);
                break;
            case 73:
                // @"L_TIP_PODATKA_TABELASACEKIRANJEM"
                var $tbody = $('#' + fullIdOfElement);

                InicijalizujRedoveTabeleSaCekiranjem($tbody, polje.IzborniPodaci, polje.Heder);
                InicijalizujDodadjajeNaRedoveTabeleSaCekiranjem($tbody);
                InicijalizujCheckBoxZaTabelu($section, $tbody);
                break;
            case 1000:
                InicijalizujUploaderSlikeElementa(fullIdOfElement, fullIdOfElement + 'BtnUploadSlike', polje.Naziv);
                break;
            case 2000:
                // @"L_TIP_PODATKA_TEKSTEDITOR" - tekst area
                break;
        }
    }

    /*
    * Metoda preuzima vrednosti za svako polje koje se nalazi u tab[section] delu i...
    * ... smesta u niz objekata tipa [PodatakElementaSifarnika] koji ima sledeca polja: ...
    * ... Id, NazivGrupe, Naziv, Vrednost, TipPodatka, List<PodaciZaIzbor>....
    * ... A [PodaciZaIzbor] sadrzi: Id, Naziv, Izabran.
    * @returns podaci - niz objekata tipa [PodatakElementaSifarnika]
    */
    function PreuzimanjePodatakaZaSnimanjeUBazu() {
        var podaci = [];

        // iterira se kroz listu tabova
        $('#masterSifTabovi .tab').each(function () {
            var sectionId = $(this).attr('data-tab');

            // section tekuceg taba
            var $section = $('#masterSifSectionWrap').find(sectionId);

            //svaki section ima content polja
            var $sectionContentPolja = $section.find('#masterSifSectionContentPolja');

            // preuzimanje liste polja iz contentPolja
            var $listaPoljaUContentPolju = $sectionContentPolja.find('.masterSifPoljeUSection:not(.podredjeni)');
            if ($listaPoljaUContentPolju.length > 0) {
                $listaPoljaUContentPolju.each(function () {

                    // podatak u koji smestamo sve vrednosti polja pre nego sto se ubaci u listu
                    var podatak = {};

                    // iteriranje kroz sva polja
                    // svako polje sadrzi labelu i neki input [zavisi od tipa podatka]
                    var $this = $(this);
                    var tipPodatkaPolja = $this.attr('data-tip');

                    // id elementa kom se pristupa kako bi se pokupila vrednost ili lista [PodaciZaIzbor]
                    var fullIdOfElement = $this.attr('data-fullid');

                    podatak.TipPodatka = tipPodatkaPolja;
                    podatak.Id = $this.attr('data-id');
                    var intTipPodatka = parseFloat(tipPodatkaPolja);

                    //u zavisnosti od tipa podatka preuzimamo vrednost
                    // u okviru switch-a nema case 71, 72: iz razloga sto se nikad nece u SectionContentPolja naci tabela...
                    //... ona se nalazi u SectionContentTabela
                    switch (intTipPodatka) {
                        case 0:
                            // @"L_TIP_PODATKA_TEKST_SAKRIVEN"
                            podatak.Vrednost = $('#' + fullIdOfElement).val().trimnull();
                            break;
                        case 2:
                            // @"L_TIP_PODATKA_CEOPOZITIVANBROJ"
                            podatak.Vrednost = $('#' + fullIdOfElement).val().trimnull();
                            break;
                        case 11:
                            // @"L_TIP_PODATKA_TEKST"
                            podatak.Vrednost = $('#' + fullIdOfElement).val().trimnull();
                            break;
                        case 111:
                            // @"L_TIP_PODATKA_TEKST_DISABLED"
                            podatak.Vrednost = $('#' + fullIdOfElement).val().trimnull();
                            break;
                        case 112:
                            // @"L_TIP_PODATKA_TEKST_AREA"
                            podatak.Vrednost = $('#' + fullIdOfElement).val().trimnull();
                            break;
                        case 13:
                            // @"L_TIP_PODATKA_CEKIRANJE"
                            podatak.Vrednost = $('#' + fullIdOfElement).prop('checked');
                            break;
                        case 20:
                            podatak.Vrednost = $('#' + fullIdOfElement).quiComboBox('getSelectedItemData');
                            break;
                        case 21:
                            // @"L_TIP_PODATKA_LOOKUPSACEKIRANJEM"
                            var podaciZaIzbor = $('#' + fullIdOfElement).quiMultiselect('getSelectedItems', 1);
                            podatak.IzborniPodaci = podaciZaIzbor;
                            break;
                        case 2000:
                            podatak.Vrednost = $('#' + fullIdOfElement).val().trimnull();
                    }

                    // kad se za svaki podatak postave atributi ubaci se u listu podataka
                    podaci.push(podatak);
                });
            }
            
            var $tabela = $sectionContentPolja.find('.qTabela');
            if ($tabela.length > 0) {

                var podatakIzTabele = {};
                var podaciZaIzborTabele = [];

                var $tbody = $tabela.find('tbody:eq(0)');

                // ako je prvi tbody filter onda ne sadrzi atribute: data-tip, data-id i data-fullId.
                if ($tbody.attr('data-tip') == undefined) {
                    $tbody = $tabela.find('tbody:eq(1)');
                }

                podatakIzTabele.Id = $tbody.attr('data-id');

                var tipPodatkaTabele = $tbody.attr('data-tip');
                podatakIzTabele.TipPodatka = tipPodatkaTabele;

                var intTip = parseFloat(tipPodatkaTabele);

                switch (intTip) {
                    case 70:
                        $tbody.find('tr').each(function () {
                            var $this = $(this);
                            var podatakZaIzbor = {
                                IdPodatka: $this.attr('data-id')
                            };
                            podaciZaIzborTabele.push(podatakZaIzbor);
                        });
                        break;
                    case 73:
                        // @"L_TIP_PODATKA_TABELASACEKIRANJEM"
                        $tbody.find('tr').each(function () {
                            var podatakZaIzbor = {};

                            var $this = $(this);

                            $this.find('td').each(function (index) {
                                switch (index) {
                                    case 0:
                                        podatakZaIzbor.Izabran = $(this).find('input').prop('checked');
                                        break;
                                    case 1:
                                        podatakZaIzbor.IdPodatka = $(this).attr('data-id');
                                        podatakZaIzbor.Naziv = $(this).text();
                                        break;
                                    case 2:
                                        podatakZaIzbor.Podatak1 = $(this).text();
                                        break;
                                    case 3:
                                        podatakZaIzbor.Podatak1 = $(this).text();
                                        break;
                                    case 4:
                                        podatakZaIzbor.Podatak1 = $(this).text();
                                        break;
                                    case 5:
                                        podatakZaIzbor.Podatak1 = $(this).text();
                                        break;
                                    case 6:
                                        podatakZaIzbor.Podatak1 = $(this).text();
                                        break;
                                }
                            });

                            podaciZaIzborTabele.push(podatakZaIzbor);
                        });
                        break;
                }

                podatakIzTabele.IzborniPodaci = podaciZaIzborTabele;

                podaci.push(podatakIzTabele);
            }
        });

        return podaci;
    }
    
    // #endregion

    // #region METODE ZA INICIJALIZACIJU I VEZIVANJA DOGADJAJA NA KOMPONENTE PRILIKOM NJIHOVOG KREIRANJA
    
    function VratiPodatkeZavisnogElementa($lookup) {
        var idTekucegElementa = undefined;
        if (tekuciNode != undefined) {
            idTekucegElementa = tekuciNode.IdElementa;
        }

        var idElementaPodatka = $lookup.parents('.masterSifPoljeUSection:eq(0)').attr('data-id');

        $.ajax({
            type: 'GET',
            url: url_VratiZavisnePodatkeElementa,
            data: {
                tipDokumenta: tipDokumenta,
                idElementa: idTekucegElementa,
                idElementaPodatka: idElementaPodatka,
                kriterijum1: $lookup.quiComboBox('getSelectedItemData')
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, getLang('W_PROZOR_NASLOV_GRESKA'), data.Poruka, 'greska');
                    return;
                }

                var zavisniPodaci = data.Data;
                if (zavisniPodaci != undefined && zavisniPodaci.length > 0) {
                    for (var i = 0; i < zavisniPodaci.length; ++i) {
                        var zavisni = zavisniPodaci[i];

                        var $zavisniWrap = $('.masterSifPoljeUSection:[data-id="' + zavisni.Id + '"]');
                        if ($zavisniWrap.length > 0) {
                            var $zavisni = $zavisniWrap.find('#' + $zavisniWrap.attr('data-fullId'));

                            if (zavisni.IzborniPodaci != undefined && zavisni.IzborniPodaci.length > 0) {
                                $zavisni.quiComboBox('setItemsFromBinding', zavisni.IzborniPodaci, 'Naziv', 'IdPodatka');
                            } else {
                                $zavisni.quiComboBox('clearItems');
                            }
                        }
                    }
                }

            },
            complete: function() {
            }
        });
    }

    function InicijalizujRedoveTabele($tbody, array, heder) {
        var html = '';

        if (array && array.length > 0) {
            for (var i = 0; i < array.length; ++i) {
                var podatak = array[i];

                html += '<tr data-id="' + podatak.IdPodatka + '">\
                            <td class="qTabelaTd">' + podatak.Naziv + '</td>';

                if (heder != undefined && heder.length > 1) {
                    html += '<td class="qTabelaTd">' + nonull(podatak.Podatak1) + '</td>';
                }

                if (heder != undefined && heder.length > 2) {
                    html += '<td class="qTabelaTd">' + nonull(podatak.Podatak2) + '</td>';
                }

                if (heder != undefined && heder.length > 3) {
                    html += '<td class="qTabelaTd">' + nonull(podatak.Podatak3) + '</td>';
                }

                if (heder != undefined && heder.length > 4) {
                    html += '<td class="qTabelaTd">' + nonull(podatak.Podatak4) + '</td>';
                }

                if (heder != undefined && heder.length > 5) {
                    html += '<td class="qTabelaTd">' + nonull(podatak.Podatak5) + '</td>';
                }

                html += '<td class="qTabelaTd tac"><i class="fa fa-times"></i></td>';

                html += '</tr>';
            }
        }

        $tbody.html(html);

        var tbodyId = $tbody.attr('data-fullId');

        $('#' + tbodyId + 'TBodyFilter').quiTableFilter({ tbodyId: '#' + tbodyId });
    }

    function InicijalizujDodadjajeNaRedoveTabele($tbody) {
        $tbody.on('click', '.fa-times', function () {
            var $tr = $(this).parent().parent();
            $tr.remove();
        });
    }

    function InicijalizujVrednostiZavisnogElementa($lookup) {
        $lookup.on('select', function(event, selectedItem) {
            var idZavisnogElementa = $lookup.parent().parent().attr('data-idZavisnogElementa');
            var $parentZavisnogElementa = $('.masterSifPoljeUSection:[data-id="' + idZavisnogElementa + '"]');
            var $zavisniElement = $('#' + $parentZavisnogElementa.attr('data-fullId'));

            $zavisniElement.quiMultiselect('deselectAll');
            //potrebniPodaci
            var potrebniPodaci = $parentZavisnogElementa.attr('data-potrebniPodaci');

            var listaIdPodataka = potrebniPodaci.split('-');

            var potrebniPodaciZaSlanje = "";
            for (var i = 0; i < listaIdPodataka.length; ++i) {
                var $potrebniElementPolje = $('.masterSifPoljeUSection:[data-id="' + listaIdPodataka[i] + '"]');
                if ($potrebniElementPolje && $potrebniElementPolje.length > 0) {
                    var $potrebniElement = $('#' + $potrebniElementPolje.attr('data-fullId'));
                    potrebniPodaciZaSlanje += $potrebniElement.quiComboBox('getSelectedItemData') + '-';
                }
            }

            var idTekucegElementa = undefined;
            if (tekuciNode != undefined) {
                idTekucegElementa = tekuciNode.IdElementa;
            }

            $.ajax({
                type: 'GET',
                url: url_VratiPodatkeZavisnogElementa,
                data: {
                    tipDokumenta: tipDokumenta,
                    idElementa: idTekucegElementa,
                    kriterijum1: $lookup.quiComboBox('getSelectedItemData'),
                    kriterijum2: potrebniPodaciZaSlanje
                },
                success: function(data) {
                    if (data.Greska) {
                        PrikaziProzor(true, true, getLang('W_PROZOR_NASLOV_GRESKA'), data.Poruka, 'greska');
                        return;
                    }

                    var podaci = data.Data;

                    if (podaci && podaci.length > 0) {
                        $zavisniElement.quiMultiselect('setItems', podaci, 'Naziv', 'Izabran');
                        $zavisniElement.quiMultiselect('deselectAll');
                    } else {
                        $zavisniElement.quiMultiselect('clearItems');
                    }
                },
                complete: function() {

                }
            });
        });
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
    
    function InicijalizujCheckBoxZaTabelu($section, $tbody) {
        $section.find('#cekiranjeTabeleCheckBox').on('change', function () {
            if ($(this).prop('checked')) {
                $tbody.find('tr:visible').each(function () {
                    $(this).find('input').prop('checked', true);
                });
            } else {
                $tbody.find('tr:visible').each(function () {
                    $(this).find('input').prop('checked', false);
                });
            }
        });
    }

    function InicijalizujRedoveTabeleSaCekiranjem($tbody, array, heder) {
        var html = '';

        if (array && array.length > 0) {
            for (var i = 0; i < array.length; ++i) {
                var podatak = array[i];

                var checked = '';

                if (podatak.Izabran) {
                    checked = 'checked="checked"';

                }

                html += '<tr >\
                            <td class="qTabelaTd tac">\
                                <input type="checkbox" ' + checked + '/>\
                            </td>\
                            <td class="qTabelaTd" data-id="' + podatak.IdPodatka + '">' + podatak.Naziv + '</td>';

                // dozvoljena izmena samo za tip decimal
                if (podatak.Podatak1 != undefined) {
                    if (heder[1] != undefined && heder[1].DozvoljenUnos) {
                        html += '<td class="qTabelaTd qTabelaTdPromena" data-tipPodatka="' + heder[1].TipPodatka + '">' + podatak.Podatak1 + '</td>';
                    } else {
                        html += '<td class="qTabelaTd">' + podatak.Podatak1 + '</td>';
                    }
                }

                if (podatak.Podatak2 != undefined) {
                    if (heder[2] != undefined && heder[2].DozvoljenUnos) {
                        html += '<td class="qTabelaTd qTabelaTdPromena" data-tipPodatka="' + heder[2].TipPodatka + '">' + podatak.Podatak2 + '</td>';
                    } else {
                        html += '<td class="qTabelaTd">' + podatak.Podatak2 + '</td>';
                    }
                }

                if (podatak.Podatak3 != undefined) {
                    if (heder[3] != undefined && heder[3].DozvoljenUnos) {
                        html += '<td class="qTabelaTd qTabelaTdPromena" data-tipPodatka="' + heder[3].TipPodatka + '">' + podatak.Podatak3 + '</td>';
                    } else {
                        html += '<td class="qTabelaTd">' + podatak.Podatak3 + '</td>';
                    }
                }

                if (podatak.Podatak4 != undefined) {
                    if (heder[4] != undefined && heder[4].DozvoljenUnos) {
                        html += '<td class="qTabelaTd qTabelaTdPromena" data-tipPodatka="' + heder[4].TipPodatka + '">' + podatak.Podatak4 + '</td>';
                    } else {
                        html += '<td class="qTabelaTd">' + podatak.Podatak4 + '</td>';
                    }
                }

                if (podatak.Podatak5 != undefined) {
                    if (heder[5] != undefined && heder[5].DozvoljenUnos) {
                        html += '<td class="qTabelaTd qTabelaTdPromena" data-tipPodatka="' + heder[5].TipPodatka + '">' + podatak.Podatak5 + '</td>';
                    } else {
                        html += '<td class="qTabelaTd">' + podatak.Podatak5 + '</td>';
                    }
                }

                html += '</tr>';
            }

            $tbody.html(html);

            var tbodyId = $tbody.attr('data-fullId');

            $('#' + tbodyId + 'TBodyFilter').quiTableFilter({ tbodyId: '#' + tbodyId });
        }
    }

    function InicijalizujDodadjajeNaRedoveTabeleSaCekiranjem($tbody) {
        // dodavanje inputa za izmenu
        $tbody.on('click', '.qTabelaTdPromena', function () {
            if ($(this).hasClass('edit')) return;

            var text = $(this).text();
            $(this).html("<div><input type='text' class='myInput' value='" + text + "' style='width: 100%;' /></div>");

            $(this).find('input').focus();
            $(this).addClass('edit');
        });

        // kad se izgubi focus na izmenu
        $tbody.on('blur', '.qTabelaTdPromena input', function () {
            var val = $(this).val().trim();
            var $td = $(this).parent().parent();
            $td.empty().text(val);
            $td.removeClass('edit');
        });

        // kad se klikne enter u okviru input-a da se aktivira blur
        $tbody.on('keydown', '.qTabelaTdPromena input', function (event) {
            if (event.keyCode == 13) {
                $(this).parent().parent().parent().find('input')[0].blur();
            }
        });
    }

    function InicijalizujUploaderSlikeElementa(idElementa, idBtnUploadSlike, nazivBtna) {
        $('#' + idElementa).on('hover', 'img', function () {
            $('#' + idElementa + 'imageFullSize').toggle();
        });

        qMasterSif.InitUploaderSlike(idElementa, idBtnUploadSlike, nazivBtna);
    }
    
    // #endregion

    qMasterSif.InitUploaderSlike = function (idElementa, idBtnUploadSlike, nazivBtna) {
        var defaultParams = {
            tipDokumenta: tipDokumenta
        };

        var uploaderSlike = new qq.FineUploader({
            element: document.getElementById(idBtnUploadSlike),
            multiple: false,
            validation: {
                allowedExtensions: ['jpg', 'jpeg', 'gif', 'bmp', 'png'],
                sizeLimit: 1048576 * 5 // 1mb
            },
            request: {
                endpoint: url_SnimiSlikuElementa,
                inputName: 'postedFileName'
            },
            text: {
                uploadButton: nazivBtna
            },
            template: '<div class="qq-uploader"><div class="qq-upload-drop-area" style="display: none;"><span>{dragZoneText}</span></div><div class="qq-upload-button" style="position: relative; overflow: hidden; direction: ltr;"><div><span class="ubt">{uploadButtonText}</span></div></div><ul class="qq-upload-list" style="display:none"></ul></div>',
            callbacks: {
                onUpload: function (id, fileName) {
                    $('#file span').text(fileName);
                },
                onProgress: function (id, fileName, uloaded, total) {
                    var percent = (uloaded / total) * 100;
                    $('#file b').text(percent + '%');
                },
                onComplete: function (id, fileName, response) {
                    if (response.Greska) {
                        PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), response.poruka, 'greska');
                    } else {
                        HandlePromenaSlikeElementa(response.url, idElementa);
                    }
                },
                onSubmit: function () {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), 'Učitavanje slike' + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');
                    var newParams = {
                        tipDokumenta: tipDokumenta,
                        idElementa: tekuciNode.IdElementa
                    }, finalParams = defaultParams;

                    qq.extend(finalParams, newParams);
                    this.setParams(finalParams);
                }
            },
            showMessage: function (msg) {
                PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), msg, 'greska');
            }
        });
    };

    function HandlePromenaSlikeElementa(urlSlike, idElementa) {
        PrikaziProzor(false);

        var $slikaWrap = $('#' + idElementa);
        $slikaWrap.attr('data-urlSlike', urlSlike);
        $slikaWrap.find('img').attr('src', urlSlike);

        /*
        var $slikaFullSize = $('#' + idElementa + 'imageFullSize');
        $slikaFullSize.attr('src', urlSlike);

        var $contentLevo = $slikaFullSize.parents('section').find('#masterSifSectionContentPoljaLevo');

        var left = $contentLevo.position().left;
        var top = $contentLevo.height() + $contentLevo.position().top;

        $slikaFullSize.css({ 'top': top, 'left': left });
        */
    }

    // #region INICIJALIZOVANJE GUI-ja ZA MASTER SIFARNIK
    
    /* 
    * Metoda inicijalizuje kriterijume pretrage ukoliko ih ima u okviru modela [vm].
    */
    function InicijalizujKriterijumePretrageWrap() {
        var html = '<div class="unosRed">';

        if (vm.NazivKriterijuma1 != undefined) {
            html += '<div class="unosRedLbl_taL" style="width: 90px;">' + vm.NazivKriterijuma1 + ':</div>\
                        <div class="unosRedVr"><div id="kriterijum1"></div></div>';
        }

        if (vm.NazivKriterijuma2 != undefined) {
            html += '<div class="unosRedLbl_taL" style="width: 90px; margin-left: 10px;">' + vm.NazivKriterijuma2 + ':</div>\
                    <div class="unosRedVr"><div id="kriterijum2"></div></div>';
        }
        
        if (vm.NazivKriterijuma3 != undefined) {
            html += '<div class="unosRedLbl_taL" style="width: 90px; margin-left: 10px;">' + vm.NazivKriterijuma3 + ':</div>\
                    <div class="unosRedVr"><div id="kriterijum3"></div></div>';
        }

        html += '</div>';

        if (html !== '<div class="unosRed"></div>') {
            $('#masterSifStabloWrap').hide();
            $('#masterSifKriterijumiWrap').html(html);

            var w1 = 230;
            if (vm.NazivKriterijuma1 != undefined) {
                var $kriterijum1 = $("#kriterijum1");

                $kriterijum1.quiComboBox({ width: w1, listWidth: 350, showX: false, zIndex: '3' });
                $kriterijum1.quiComboBox('setItemsFromBinding', vm.PodaciKriterijuma1, 'Naziv', 'IdPodatka');
                $kriterijum1.on('select', function () {
                    $('#masterSifTree').hide();
                    $('#masterSifStabloWrap').hide();
                    $('#masterSifBtnWrap').hide();
                    $('#masterSifTaboviIBtnWrap').hide();
                    $('#masterSifTabovi').html('');
                    $('#masterSifSectionWrap').html('');
                    
                    if ($('#kriterijum2').length > 0 && vm.ZavisniKriterijum2 == true) {
                        $("#kriterijum2").quiComboBox('clearItems');
                    }

                    if ($('#kriterijum3').length > 0 && vm.ZavisniKriterijum3 == true) {
                        $("#kriterijum3").quiComboBox('clearItems');
                    }
                    
                    if (vm.ZavisniKriterijum2) {
                        $.ajax({
                            type: 'GET',
                            url: url_VratiPodatkeKriterijuma2,
                            data: {
                                tipDokumenta: tipDokumenta,
                                kriterijum1: $("#kriterijum1").quiComboBox('getSelectedItemData')
                            },
                            success: function(data) {
                                if (data.Greska) {
                                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                                    return;
                                }

                                $("#kriterijum2").quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdPodatka');
                            },
                            complete: function() {
                            }
                        });
                    }
                    
                    if ($("#kriterijum2").length == 0) {
                        if ($('#masterSifBtnPretrazi').is(':visible')) {
                            $('#masterSifBtnPretrazi').click();
                        }
                    }
                });
            }

            if (vm.NazivKriterijuma2 != undefined) {
                var $kriterijum2 = $("#kriterijum2");
                
                $kriterijum2.quiComboBox({ width: w1, listWidth: 350, showX: false, zIndex: '3' });
                $kriterijum2.quiComboBox('setItemsFromBinding', vm.PodaciKriterijuma2, 'Naziv', 'IdPodatka');
                $kriterijum2.on('select', function () {
                    $('#masterSifStabloWrap').hide();
                    $('#masterSifTree').hide();
                    $('#masterSifBtnWrap').hide();
                    $('#masterSifTaboviIBtnWrap').hide();
                    $('#masterSifTabovi').html('');
                    $('#masterSifSectionWrap').html('');

                    if ($('#kriterijum3').length > 0 && vm.ZanisniKriterijum3 == true) {
                        $("#kriterijum3").quiComboBox('clearItems');
                    }
                    
                    if (vm.ZavisniKriterijum3) {
                        $.ajax({
                            type: 'GET',
                            url: url_VratiPodatkeKriterijuma3,
                            data: {
                                tipDokumenta: tipDokumenta,
                                kriterijum1: $("#kriterijum1").quiComboBox('getSelectedItemData'),
                                kriterijum2: $("#kriterijum2").quiComboBox('getSelectedItemData')
                            },
                            success: function (data) {
                                if (data.Greska) {
                                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                                    return;
                                }

                                $("#kriterijum3").quiComboBox('setItemsFromBinding', data.Data, 'Naziv', 'IdPodatka');
                            },
                            complete: function () {
                            }
                        });
                    }
                    
                    if ($("#kriterijum3").length == 0) {
                        if ($('#masterSifBtnPretrazi').is(':visible')) {
                            $('#masterSifBtnPretrazi').click();
                        }
                    }
                });
            }
            
            if (vm.NazivKriterijuma3 != undefined) {
                var $kriterijum3 = $("#kriterijum3");
                $kriterijum3.quiComboBox({ width: w1, listWidth: 350, showX: false, zIndex: '3' });
                $kriterijum3.quiComboBox('setItemsFromBinding', vm.PodaciKriterijuma3, 'Naziv', 'IdPodatka');
                $kriterijum3.on('select', function () {
                    $('#masterSifStabloWrap').hide();
                    $('#masterSifTree').hide();
                    $('#masterSifBtnWrap').hide();
                    $('#masterSifTaboviIBtnWrap').hide();
                    $('#masterSifTabovi').html('');
                    $('#masterSifSectionWrap').html('');

                    if ($('#masterSifBtnPretrazi').is(':visible')) {
                        $('#masterSifBtnPretrazi').click();
                    }
                });
            }

            if (vm.PrikaziStablo) {
                $('#masterSifBtnPretragaWrap').show();
            } else {
                $('#masterSifBtnPretragaWrap').hide();
            }
        } else {
            $('#masterSifKriterijumiIPretragaWrap').hide();
        }
    }
    
    /*
    * Metoda inicijalizuje stablo za prosledjeni niz elemeneta.
    * @params arrayElementi - niz na osnovu kog se inicijalizuje stablo
    */
    function InicijalizujStablo(arrayElementi) {
        $('#masterSifTree').off('dblclick', 'span');
        $('#masterSifTree').off('click', 'span');
        $('#masterSifTree').off('click', 'i.node');
        $('#masterSifTree').quiTree({ array: arrayElementi, idProp: 'IdElementa', idParentProp: 'IdNadredjenogElementa', labelProp: 'Naziv', rootValue: null, dblClickOpensNode: true });
        $('#masterSifTree').find('li').css({ 'font-size': '14px', 'margin-bottom': '1px', 'margin-top': '1px' });
    }

    /*
    * Metoda podesava da li su dugmici za brisanje, izmenu i dodelu noda u okviru stabla vidljivi korisniku.
    */
    function PodesavanjeVidljivostiBtn(flag) {
        if (flag) {
            var $btnObrisi = $('#masterSifBtnObrisiNode').find('table');
            var $btnDodajNovi = $('#masterSifBtnDodajNoviNode').find('table');
            var $btnIzmeni = $('#masterSifBtnIzmeniNode').find('table');

            if (vm.DozvoljenoBrisanje) {
                if ($btnObrisi.hasClass('teloDugmeIskljuceno')) {
                    $btnObrisi.removeClass('teloDugmeIskljuceno');
                }
                $('#masterSifBtnObrisiNode').show();
            } else {
                $('#masterSifBtnObrisiNode').hide();
            }

            if (vm.DozvoljenoDodavanje) {
                if ($btnDodajNovi.hasClass('teloDugmeIskljuceno')) {
                    $btnDodajNovi.removeClass('teloDugmeIskljuceno');
                }
                $('#masterSifBtnDodajNoviNode').show();
            } else {
                $('#masterSifBtnDodajNoviNode').hide();
            }

            if (vm.DozvoljenaIzmena) {
                if ($btnIzmeni.hasClass('teloDugmeIskljuceno')) {
                    $btnIzmeni.removeClass('teloDugmeIskljuceno');
                }
                $('#masterSifBtnIzmeniNode').show();
            } else {
                $('#masterSifBtnIzmeniNode').hide();
            }

            $('#masterSifBtnWrap').show();
        } else {
            $('#masterSifBtnWrap').hide();
        }
    }
    
    /*
    * Metoda inicijalizuje input polje za pretragu clanove stabla. Ukoliko u okviru stabla postoji node/node-ovi
    * koji sadrzi/e naziv iz filtera treba da se prikaze/u. Ukoliko klikne na njega treba da se prikaze celo stablo sa selektovanim elementom. 
    */
    function InicijalizujFilterStabla() {
        var $filterInput = $('#masterSifFilterStabla');

        $filterInput.on('keydown', function (e) {
            if (e.keyCode == 13) {
                filterStabla = true;
                var textFilter = $filterInput.val().trim().toLowerCase();
                
                textFilter = qKonverzija.KonvertujULatinicu(textFilter);

                if (textFilter == undefined || textFilter.length == 0) {
                    $('#masterSifTree ul').find('li').show();
                } else {
                    textFilter = IzmeniSpecijalnaSlova(textFilter);
                    $('#masterSifTree ul').find('li').each(function () {
                        var $this = $(this);
                        var nodeText = $this.find('span').text().toLowerCase();

                        nodeText = qKonverzija.KonvertujULatinicu(nodeText);
                        
                        nodeText = IzmeniSpecijalnaSlova(nodeText);

                        if (nodeText.contains(textFilter)) {
                            $this.show();
                        } else {
                            $this.hide();
                        }
                    });
                }
            }
        });
    }

    function IzmeniSpecijalnaSlova(text) {
        text = text.replace(/ć/g, 'c');
        text = text.replace(/č/g, 'c');
        text = text.replace(/ž/g, 'z');
        text = text.replace(/ž/g, 'z');
        text = text.replace(/š/g, 's');
        text = text.replace(/đ/g, 'dj');

        return text;
    }

    /*
    * Metoda ucitava stablo iz modela ukoliko postoji u okviru modela [vm].
    * Ukoliko ne, onda se skriva od korisnika citavo polje za stablo.
    */
    function InicijalizujStabloWrap() {
        if (vm.PrikaziStablo) {
            InicijalizujStablo(vm.Elementi);
            var flag = vm.NazivKriterijuma1 != undefined || vm.NazivKriterijuma2 != undefined || vm.NazivKriterijuma3 != undefined ? false : true;
            PodesavanjeVidljivostiBtn(flag);
            if (vm.PrikaziFilter) {
                InicijalizujFilterStabla();
                $('#masterSifFilterStablaWrap').show();
            } else {
                $('#masterSifFilterStablaWrap').hide();
            }
            $('#masterSifTree').show();
        } else {
            //ukoliko transkacija nema stabla u vm onda se ceo wrap obrise kako bi se smestali dinamicki podaci
            $('#masterSifStabloWrap').html('');
        }
    }

    // #endregion
    
    qMasterSif.Init = function () {
        tipDokumenta = $('#tipDokumenta').text();

        vm = qUtils.IzvuciVM();

        url_VratiPodatkeElementa = $('#url_VratiPodatkeElementa').text();
        url_VratiPodatke = $('#url_VratiPodatke').text();
        url_SnimiPodatkeElementa = $('#url_SnimiPodatkeElementa').text();
        url_ObrisiElement = $('#url_ObrisiElement').text();
        url_VratiPodatkeKriterijuma2 = $('#url_VratiPodatkeKriterijuma2').text();
        url_VratiPodatkeKriterijuma3 = $('#url_VratiPodatkeKriterijuma3').text();
        url_SnimiSlikuElementa = $('#url_SnimiSlikuElementa').text();
        url_VratiPodatkeZavisnogElementa = $('#url_VratiPodatkeZavisnogElementa').text();
        url_VratiZavisnePodatkeElementa = $('#url_VratiZavisnePodatkeElementa').text();
        
        log(vm);

        $('#masterSifNaslov').text(vm.Naziv);

        InicijalizujKriterijumePretrageWrap();

        InicijalizujStabloWrap();
        
        // parametar koji se prosledjuje metodi govori da li unos novog ili izmena postojeceg
        // true - unos novog noda
        $('#masterSifBtnDodajNoviNode').on('click', function () {
            ClickBtnDodajIliIzmeniNode(true);
        });

        // false - izmena postojeceg noda
        $('#masterSifBtnIzmeniNode').on('click', function () {
            ClickBtnDodajIliIzmeniNode(false);
        });

        $('#masterSifTree').on('select', function (event, selectedItem) {
            $('#masterSifTaboviIBtnWrap').hide();
            $('#masterSifTabovi').html('');
            $('#masterSifSectionWrap').html('');

            // prkazi sve ukoliko je pre  select-a bilo filterisanje
            if (filterStabla) {
                $('#masterSifTree ul').find('li').show();
                $('#masterSifFilterStabla').val('');

                if ($('#masterSifTree').find('.sel').length > 0) {
                    var $selected = $('#masterSifTree').find('.sel');
                    if ($selected.offset().top > 500) {
                        var widthScroll = $selected.parent().prevAll().length * ($selected.height() + 1);
                        $('#masterSifTree').scrollTop(widthScroll);
                    }
                }

                // ponisti indikator posle filterisanja
                filterStabla = false;
            }

            // kliknut je ponovo selektovan pa ga treba deselektovati
            if (tekuciNode != undefined) {
                if (tekuciNode.IdElementa == selectedItem.IdElementa) {
                    $('#masterSifTree').find('.sel').removeClass('sel');
                    tekuciNode = undefined;
                    return;
                }
            }

            tekuciNode = selectedItem;

            // ukoliko je dozvoljeno dodavanje/izmena/brisanje enable ili disable btn
            var $btnDodavanje = $('#masterSifBtnDodajNoviNode').find('table');
            var $btnIzmena = $('#masterSifBtnIzmeniNode').find('table');
            var $btnBrisanje = $('#masterSifBtnObrisiNode').find('table');

            if (vm.DodavanjeIdeNaRoot) {
                if ($btnDodavanje.hasClass('teloDugmeIskljuceno')) {
                    $btnDodavanje.removeClass('teloDugmeIskljuceno');
                }
            } else if (tekuciNode.DozvoljenoDodavanje) {
                if ($btnDodavanje.hasClass('teloDugmeIskljuceno')) {
                    $btnDodavanje.removeClass('teloDugmeIskljuceno');
                }
            } else {
                if (!$btnDodavanje.hasClass('teloDugmeIskljuceno')) {
                    $btnDodavanje.addClass('teloDugmeIskljuceno');
                }
            }

            if (tekuciNode.DozvoljenaIzmena) {
                if ($btnIzmena.hasClass('teloDugmeIskljuceno')) {
                    $btnIzmena.removeClass('teloDugmeIskljuceno');
                }
            } else {
                if (!$btnIzmena.hasClass('teloDugmeIskljuceno')) {
                    $btnIzmena.addClass('teloDugmeIskljuceno');
                }
            }

            if (tekuciNode.DozvoljenoBrisanje) {
                if ($btnBrisanje.hasClass('teloDugmeIskljuceno')) {
                    $btnBrisanje.removeClass('teloDugmeIskljuceno');
                }
            } else {
                if (!$btnBrisanje.hasClass('teloDugmeIskljuceno')) {
                    $btnBrisanje.addClass('teloDugmeIskljuceno');
                }
            }
        });

        $('#masterSifBtnSacuvaj').click(ClickBtnSacuvaj);
        $('#masterSifBtnObrisiNode').click(ClickBtnObrisiNode);

        $('#masterSifBtnReset').click(ClickBtnReset);
        $('#masterSifBtnPretrazi').click(ClickBtnPretrazi);
        $('#masterSifTabovi').on('click', 'li', ClickTabovi);
        
        // ukoliko je u okviru kriterijuma samo jedan element selektovati i disablevati ga
        if (vm.PodaciKriterijuma1 != undefined && vm.PodaciKriterijuma1.length == 1) {
            $('#kriterijum1').quiComboBox('selectItemByIndex', 0);
            $('#kriterijum1').quiComboBox('enable', false);
        }
    };

}(window.qMasterSif = window.qMasterSif || {}, jQuery));

//#endregion