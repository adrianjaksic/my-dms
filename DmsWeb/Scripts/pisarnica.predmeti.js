//#region Predmeti
(function (qPredmeti, $, undefined) {
    var vm,
        tipDokumenta,
        width = 517,
        width2 = 920,
        width3 = 300,
        url_VratiKlaseOrgana,
        url_VratiJediniceOrgana,
        url_SnimiPredmet,
        url_SnimiKretanjePredmeta,
        url_VratiLinkDokumentaPredmeta,
        url_PretraziNbsKlijente,
        url_VratiIstorijuPredmeta,
        url_VratiStampePredmeta,
        url_VratiObrisaniDokument,
        url_ObrisiKretanjePredmeta,
        url_VratiSledeciSlobodanBrojPredmeta,
        url_SnimiAktivnostPredmeta,
        url_VratiIdPredmetaPrekoBroja,
        url_VratiMestaOpstine,
        url_VratiDokumentePredmeta,
        preciceTekstovi = [],
        pretragaPredmetaUToku;

    var _scrTabelaOduzimac = 400;

    function ClickTabovi() {
        var $tab = $(this),
            $parent = $tab.parent();
        if ($tab.hasClass('tabSel')) return;

        var $prev = $parent.find('li.tabSel');

        // ako je prethodno kliknut tab dms a treba da ide na neki drugi da snimi fajlove (ako nije kliknuto sacuvaj)
        if ($prev.length > 0 && $prev.attr('data-tab') == '#predmetDmsPredmeta') {
            qDms.UploadStoredFiles();
        }

        $prev.removeClass('tabSel');
        $tab.addClass('tabSel');
        $('.tabSekcije').hide();
        var kojiTab = $tab.attr('data-tab');

        if (kojiTab == '#predmetIstorijaPredmeta') {
            $('#predmetBtnIzmeni').hide();
            $('#predmetBtnUnosKretanja').hide();
        } else if (kojiTab == '#predmetKretanjePredmeta') {
            $('#predmetBtnIzmeni').hide();
            $('#predmetBtnUnosKretanja').show();
        } else if (kojiTab == '#predmetDmsPredmeta') {
            $('#predmetBtnIzmeni').hide();
            $('#predmetBtnUnosKretanja').hide();

            // svaki put kad se klikne na tab treba da se pozove metoda kontrolera da vrati dms objekat
            $.ajax({
                type: 'GET',
                url: url_VratiDokumentePredmeta,
                data: {
                    idPredmeta: vm.Predmet.IdPredmeta
                },
                success: function (data) {
                    if (data.Greska) {
                        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                        return;
                    }

                    vm.Predmet.DMS.Dokumenti = data.Data;

                    if (tipDokumenta == 3) {
                        var dmsIzmena = $('#dmsIzmena').text().trimnull();
                        if (dmsIzmena == "True") {
                            qDms.PrikaziDmsDijalog(vm.Predmet.DMS, false);
                        } else {
                            qDms.PrikaziDmsDijalog(vm.Predmet.DMS, true);
                        }
                    }

                    if (tipDokumenta == 4) {
                        qDms.PrikaziDmsDijalog(vm.Predmet.DMS, false);
                    }

                    // kad god se ode na tab ucita se view model pa treba da ne bude cekirano prikazivanje obrisanih
                    $('#dmsPrikaziObrisane').prop('checked', false);
                },
                complete: function () {
                },
                aysnc: false // svaki put kad se klikne na tab dms treba prvo da se pokupi dms objekat pa tek da se onda prikaze
            });

        } else {
            $('#predmetBtnIzmeni').show();
            $('#predmetBtnUnosKretanja').hide();
        }

        $(kojiTab).show();
    }

    function KlikniInicijalnioSelektovaniTab() {
        $('#predmetiTaboviWrap').find('li.tabSel').click();
    }

    function ClickBtnReset() {
        $('#predmetOrgani').quiComboBox('clearSelectionNoTrigger');
        $('#predmetKlase').quiComboBox('clearSelectionNoTrigger');
        $('#predmetJedinice').quiComboBox('clearSelectionNoTrigger');
        $('#predmetInspektori').quiComboBox('clearSelectionNoTrigger');
        $('#predmetVrste').quiComboBox('clearSelectionNoTrigger');
        $('#predmetTakse').quiComboBox('clearSelectionNoTrigger');

        $('#predmetPrilog').val('');
        $('#predmetRok').text('');
        $('#predmetStraniBroj').val('');
        $('#predmetSadrzaj').val('');
        $('#predmetKolicina').val('');

        if ($('#predmetStrogoPoverljiv').length > 0) {
            $('#predmetStrogoPoverljiv').prop('checked', false);
        }

        //$('#predmetKontrolnoLice').val('');
        //$('#predmetPodnosilac').val('');

        //$('#predmetKontrolnoLice').attr('data-jedinstveniBroj', '');
        //$('#predmetPodnosilac').attr('data-jedinstveniBroj', '');

        $('#radioWrapInspektor').find('input[value="0"]').prop('checked', true);

        $('#predmetObrisiVrednostPodnosioca').click();
        $('#predmetObrisiVrednostLicaKontrole').click();

        $('#predmetSledeciSlobodanBroj').text('');
        $('#predmetSledeciSlobodanBrojWrap').hide();
    }

    function ClickBtnResetZaUnosNovog() {
        $('#predmetJedinice').quiComboBox('clearSelectionNoTrigger');
        $('#predmetInspektori').quiComboBox('clearSelectionNoTrigger');
        $('#predmetVrste').quiComboBox('clearSelectionNoTrigger');
        $('#predmetTakse').quiComboBox('clearSelectionNoTrigger');

        $('#predmetPrilog').val('');
        $('#predmetRok').text('');
        $('#predmetStraniBroj').val('');
        $('#predmetSadrzaj').val('');
        $('#predmetKolicina').val('');

        if ($('#predmetStrogoPoverljiv').length > 0) {
            $('#predmetStrogoPoverljiv').prop('checked', false);
        }

        $('#radioWrapInspektor').find('input[value="0"]').prop('checked', true);

        $('#predmetObrisiVrednostPodnosioca').click();
        $('#predmetObrisiVrednostLicaKontrole').click();

        $('#predmetSledeciSlobodanBroj').text('');
        $('#predmetSledeciSlobodanBrojWrap').hide();
    }

    function ClickBtnSacuvaj(izmenaFlag) {
        if (pretragaPredmetaUToku > 0) {
            PrikaziProzor(true, true, getLang('Greška'), getLang('Pretraga predmeta za prezavodjenje je u toku.'), 'greska');
            return;
        }
        var $btn;
        if (izmenaFlag == true) {
            $btn = $('#predmetBtnIzmeni').find('table');
        } else {
            $btn = $('#predmetBtnSacuvaj').find('table');
        }

        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var predmetJ = PrikupiPodatkeZaSnimanjePredmeta();

        var kolicina = undefined;
        if (tipDokumenta == 2) {
            kolicina = $('#predmetKolicina').val().trimnull();
        }

        if (predmetJ.IdOrgana == undefined || predmetJ.IdKlase == undefined || predmetJ.IdJedinice == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nisu uneti obavezni podaci za snimanje novog predmeta.'), 'greska');
            return;
        }

        if (parseInt(kolicina) > 100) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Maksimalni broj predmeta za rezervaciju je 100.'), 'greska');
            return;
        }
        if (tipDokumenta == 2 && parseInt(kolicina) == 0) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Količina rezervisanih predmeta mora minimalno biti 1.'), 'greska');
            return;
        }

        $btn.addClass('teloDugmeIskljuceno');
        var naslovUcitavanja = "Unos predmeta u toku...";
        if (izmenaFlag == true) {
            naslovUcitavanja = "Izmena predmeta u toku...";
        }
        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst(naslovUcitavanja) + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');
        $.ajax({
            type: 'POST',
            url: url_SnimiPredmet,
            data: {
                tipDokumenta: tipDokumenta,
                kolicina: kolicina,
                predmetJ: JSON.stringify(predmetJ)
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                if ((tipDokumenta == 3 || tipDokumenta == 4) && data.Data != undefined && data.Data.Predmet != undefined) {
                    $('#nazivStatusaPredmeta').text(data.Data.Predmet.NazivStatusa);
                }

                var zaglavlje = data.Data;
                var predmeti = zaglavlje.RezervisaniBrojevi,
                    html = '';

                if (predmeti && predmeti.length > 0) {
                    if (tipDokumenta == 1) {
                        var snimljeniPredmet = predmeti[0];

                        html = '<div>' + qKonverzija.VratiLokalizovaniTekst('Uspešno je snimljen predmet sa brojem ') + '<br><strong>' + snimljeniPredmet.Naziv + '</strong>.</div> <br>';

                        PrikaziProzor2(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), html, 'difolt', [
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Unos novog'),
                                callback: function () {
                                    ClickBtnResetZaUnosNovog();
                                    PrikaziProzor2(false);
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Izmena'),
                                callback: function () {
                                    PrikaziProzor2(false);
                                    var mask = '&idPredmeta=' + snimljeniPredmet.IdElementa + '';
                                    qUI.substringZaIzbacivanje = mask;

                                    location.hash = '#./Predmeti?tipDokumenta=4' + mask;
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('DMS'),
                                callback: function () {
                                    PrikaziProzor2(false);
                                    var mask = '&idPredmeta=' + snimljeniPredmet.IdElementa + '&dms=true';
                                    qUI.substringZaIzbacivanje = mask;

                                    location.hash = '#./Predmeti?tipDokumenta=4' + mask;
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Štampa'),
                                callback: function () {
                                    PrikaziProzor2(false);
                                    var mask = '&idPredmeta=' + snimljeniPredmet.IdElementa + '&stampa=true';
                                    qUI.substringZaIzbacivanje = mask;

                                    location.hash = '#./Predmeti?tipDokumenta=4' + mask;
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Idi na početnu'),
                                callback: function () {
                                    PrikaziProzor2(false);
                                    window.location = _pathHome;
                                }
                            }
                        ]);
                    }

                    if (tipDokumenta == 2) {
                        if (predmeti.length == 1) {
                            html = '<div><div id="osnovnaPorukaSnimanjaRezervisanihPredmeta">' + qKonverzija.VratiLokalizovaniTekst('Uspešno je snimljen predmet sa brojem ') + '<br><strong>' + predmeti[0].Naziv + '</strong><br></div>';
                        } else {
                            html = '<div><div id="osnovnaPorukaSnimanjaRezervisanihPredmeta">' + qKonverzija.VratiLokalizovaniTekst('Uspešno su snimljeni predmeti sa brojevima ') + '<br>' + qKonverzija.VratiLokalizovaniTekst('od ') + '<br><strong>' + predmeti[0].Naziv + '</strong><br>' + qKonverzija.VratiLokalizovaniTekst('do ') + '<br><strong>' + predmeti[predmeti.length - 1].Naziv + '</strong>.<br></div>';
                        }
                        html += '<a href="#" id="detaljiRezervisanihPredmetaLink">' + qKonverzija.VratiLokalizovaniTekst('Detalji') + '</a><div class="qDispNone" id="detaljiRezervisanihPredmeta">';

                        var brojacRezervisanih = 1;

                        for (var i = 0; i < predmeti.length; i++) {
                            var pr = predmeti[i];

                            html += '<div>' + brojacRezervisanih + '. ' + pr.Naziv + '</div> <br>';
                            brojacRezervisanih++;
                        }

                        html += '</div>';

                        PrikaziProzor2(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), html, 'difolt', [
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Rezervisanje novih'),
                                callback: function () {
                                    ClickBtnResetZaUnosNovog();
                                    PrikaziProzor2(false);
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Idi na početnu'),
                                callback: function () {
                                    PrikaziProzor2(false);
                                    window.location = _pathHome;
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Štampa'),
                                callback: function () {
                                    //PrikaziProzor2(false);
                                    var stampa = zaglavlje.Stampa;
                                    window.open(stampa.Link, stampa.Naziv);
                                }
                            }
                        ]);

                        $('#detaljiRezervisanihPredmetaLink').click(function (e) {
                            e.preventDefault();

                            var $this = $(this);
                            $('#detaljiRezervisanihPredmeta').toggle();
                            $('#osnovnaPorukaSnimanjaRezervisanihPredmeta').toggle();

                            if ($('#osnovnaPorukaSnimanjaRezervisanihPredmeta').is(':visible')) {
                                $this.text(qKonverzija.VratiLokalizovaniTekst('Detalji'));
                            } else {
                                $this.text(qKonverzija.VratiLokalizovaniTekst('Sakrij detalje'));
                            }
                        });
                    }

                    if (tipDokumenta == 4) {
                        var izmenjenPredmet = predmeti[0];

                        html = '<div>' + qKonverzija.VratiLokalizovaniTekst('Uspešno je izmenjen predmet sa brojem: ') + izmenjenPredmet.Naziv + '.</div> <br>';

                        PrikaziProzor2(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), html, 'difolt', [
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Ostani na izmeni'),
                                callback: function () {
                                    // nakon uspesne izmene predmeta ako korisnik ostane na izmeni treba osveziti istoriju predmeta
                                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Učitavanje istorije i kretanja predmeta') + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');
                                    $.when(
                                       $.ajax({
                                           type: 'GET',
                                           url: url_VratiIstorijuPredmeta,
                                           data: {
                                               idPredmeta: vm.Predmet.IdPredmeta,
                                               kretanje: true
                                           },
                                       }),
                                       $.ajax({
                                           type: 'GET',
                                           url: url_VratiIstorijuPredmeta,
                                           data: {
                                               idPredmeta: vm.Predmet.IdPredmeta
                                           },
                                       })
                                   ).then(function (responseKretanje, responseIstorija) {

                                       var dataKretanje = responseKretanje[0];
                                       if (dataKretanje.Greska) {
                                           PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), dataKretanje.Poruka, 'greska');
                                       } else {
                                           PopuniTabeluKretanjaPredmeta(dataKretanje.Data);
                                       }

                                       var dataIstorije = responseIstorija[0];

                                       if (dataIstorije.Greska) {
                                           PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), dataIstorije.Poruka, 'greska');
                                       } else {
                                           PopuniTabeluIstorijePredmeta(dataIstorije.Data);
                                       }

                                       PrikaziProzor(false);
                                   });
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Vrati se na pretragu'),
                                callback: function () {
                                    PrikaziProzor2(false);

                                    location.hash = '#./Pretrage?tipPretrage=1';
                                }
                            },
                            {
                                labela: qKonverzija.VratiLokalizovaniTekst('Idi na početnu'),
                                callback: function () {
                                    PrikaziProzor2(false);
                                    window.location = _pathHome;
                                }
                            }
                        ]);
                    }
                }
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }

    function PrikupiPodatkeZaSnimanjePredmeta() {
        var predmetZaSnimanje = {
            IdOrgana: $('#predmetOrgani').quiComboBox('getSelectedItemData'),
            IdOpstine: $('#predmetOpstine').quiComboBox('getSelectedItemData'),
            IdKlase: $('#predmetKlase').quiComboBox('getSelectedItemData'),
            IdJedinice: $('#predmetJedinice').quiComboBox('getSelectedItemData'),
            PodnosilacJeInspektor: $('#radioWrapInspektor').find('input[name="inspektor"]:checked').val() == 2,
            Podnosilac: $('#predmetPodnosilac').val().trimnull(),
            PodnosilacJedinstveniBroj: $('#predmetPodnosilac').attr('data-jedinstveniBroj'),
            LiceKontrole: $('#predmetKontrolnoLice').val().trimnull(),
            LiceKontroleJedinstveniBroj: $('#predmetKontrolnoLice').attr('data-jedinstveniBroj') != undefined ? $('#predmetKontrolnoLice').attr('data-jedinstveniBroj').trimnull() : undefined,
            IdVrstePredmeta: $('#predmetVrste').quiComboBox('getSelectedItemDataProperty', 'IdElementa'),
            IdInspektora: $('#predmetInspektori').quiComboBox('getSelectedItemData'),
            //Prilog: $('#predmetPrilog').val().trimnull(),
            Sadrzaj: $('#predmetSadrzaj').val().trimnull(),
            IdTakse: $('#predmetTakse').quiComboBox('getSelectedItemData'),
            StraniBroj: $('#predmetStraniBroj').val().trimnull(),
            IdPredmeta: vm.Predmet != undefined ? vm.Predmet.IdPredmeta : undefined,
            IdNadredjenogPredmeta: $('#predmetBrojNadredjenogPredmetaInfo').attr('data-idPredmeta'),
            IdMesta: $('#predmetMesta').quiComboBox('getSelectedItemData'),
            VremeKreiranja: $('#predmetDatum').quiDate('getDate'),
            StrogoPoverljiv: $('#predmetStrogoPoverljiv').prop('checked')
        };

        if (tipDokumenta == 4) {
            predmetZaSnimanje.IdPredmeta = vm.Predmet.IdPredmeta;
        }

        return predmetZaSnimanje;
    }

    function ClickBtnSacuvajUnosKretanja() {
        var $btn = $('#predmetBtnUnosKretanja').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        var vrstaKretanja = $("#predmetIstorijaVrsteKretanja").quiComboBox('getSelectedItemDataProperty', 'IdElementa');
        var napomena = $('#predmetIstorijaNapomena').val().trimnull();

        var unosRoka = $("#predmetIstorijaVrsteKretanja").quiComboBox('getSelectedItemDataProperty', 'UnosRoka');

        var datumRokaJ = undefined;
        if (unosRoka) {
            datumRokaJ = $('#predmetIstorijaKretanjaDatumRoka').quiDate('getJSONDateNoTZStringify');
        }

        if (vrstaKretanja == undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nije uneta vrsta kretanja.'), 'greska');
            return;
        }

        var opis = $("#predmetIstorijaVrsteKretanja").quiComboBox('getSelectedItemLabel');

        $btn.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'POST',
            url: url_SnimiKretanjePredmeta,
            data: {
                idPredmeta: vm.Predmet.IdPredmeta,
                napomena: napomena,
                vrstaKretanja: vrstaKretanja,
                datumRokaJ: datumRokaJ
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                var istorija = data.Data;

                $('#nazivStatusaPredmeta').text(istorija.Status);
                //parametar koji signalizira da li je moguca izmena predmeta
                var izmena = $('#dmsIzmena').text().trimnull();

                var html = '<tr data-idKretanja="' + istorija.IdKretanja + '">\
                                <td>' + qUtils.IzvuciDatumIzDataSaServera(istorija.Vreme, true) + '</td>\
                                <td>' + istorija.Korisnik + '</td>\
                                <td>' + qKonverzija.VratiLokalizovaniTekst(opis) + '</td>\
                                <td>' + nonull(istorija.Napomena) + '</td>\
                                <td>' + qUtils.IzvuciDatumIzDataSaServera(istorija.DatumRoka) + '</td>';

                if (izmena == "True") {
                    html += '<td><img src="' + _pathImgB + 'x.png" class="x" title=' + qKonverzija.VratiLokalizovaniTekst('Brisanje kretanja predmeta') + '></td>';
                } else {
                    html += '<td></td>';
                }
                html += '</tr>';

                $('#predmetTabelaKretanjaTBody').append(html);

                $("#predmetIstorijaVrsteKretanja").quiComboBox('clearSelection');
                $('#predmetIstorijaNapomena').val('');

                $('#predmetBtnUnosKretanja').removeClass('signalZaBtnUnosKretanja');

                UcitajIstorijuPredmeta();
            },
            complete: function () {
                $btn.removeClass('teloDugmeIskljuceno');
            }
        });
    }

    function ClickBtnStampa(snimi) {
        if (pretragaPredmetaUToku > 0) {
            PrikaziProzor(true, true, getLang('Greška'), getLang('Pretraga predmeta za prezavodjenje je u toku.'), 'greska');
            return;
        }
        var $btn = $('#predmetBtnStampa').find('table');
        if ($btn.hasClass('teloDugmeIskljuceno')) return;

        $btn.addClass('teloDugmeIskljuceno');

        var greska = false;

        if (tipDokumenta == 4 && snimi) {
            // kad je izmena treba da se snimi predmet pre nego sto se prikazu stampe
            var predmetJ = PrikupiPodatkeZaSnimanjePredmeta();

            // asinhron poziv, treba prvo da se snimi pa tek onda da se prikazu stampe

            $.ajax({
                type: 'POST',
                url: url_SnimiPredmet,
                data: {
                    tipDokumenta: tipDokumenta,
                    predmetJ: JSON.stringify(predmetJ),
                    bezStampe: true
                },
                success: function (data) {
                    if (data.Greska) {
                        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                        greska = true;
                        return;
                    }
                },
                complete: function () {
                },
                async: false
            });
        }

        // ako nije bilo greske prilikom snimanja (ako je izmena predmeta) onda prikazati stampe
        if (!greska) {
            if (vm.Predmet && vm.Predmet.IdPredmeta) {
                var dataObj = {
                    idPredmeta: vm.Predmet.IdPredmeta
                };

                qStampa.PrikaziDijalogStampe(url_VratiStampePredmeta, dataObj);
            }
        }

        $btn.removeClass('teloDugmeIskljuceno');
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

    function OnObrisiKreatanjePredmeta(odgovor) {
        if (odgovor) {
            var $tr = sigPitanjaObjekat.objekat.tr;
            var idKretanja = sigPitanjaObjekat.objekat.idKretanja;

            $.ajax({
                type: 'POST',
                url: url_ObrisiKretanjePredmeta,
                data: {
                    idPredmeta: vm.Predmet.IdPredmeta,
                    idKretanja: idKretanja
                },
                success: function (data) {
                    if (data.Greska) {
                        PrikaziProzor(true, false, getLang('W_PROZOR_NASLOV_GRESKA'), data.Poruka, 'greska');
                        return;
                    }

                    UcitajIstorijuPredmeta();

                    $tr.remove();

                    PrikaziProzor(false);
                },
                complete: function () {
                }
            });
        } else {
            PrikaziProzor(false);
        }
    }

    function PopuniTabeluKretanjaPredmeta(stavkeKretanja) {
        var html = '';

        //parametar koji signalizira da li je moguca izmena predmeta
        var izmena = $('#dmsIzmena').text().trimnull();

        for (var i = 0; i < stavkeKretanja.length; ++i) {
            var kretanje = stavkeKretanja[i];

            html += '<tr data-idKretanja="' + kretanje.IdKretanja + '">\
                        <td>' + qUtils.IzvuciDatumIzDataSaServera(kretanje.Vreme, true) + '</td>\
                        <td>' + qKonverzija.VratiLokalizovaniTekst(kretanje.Korisnik) + '</td>\
                        <td>' + qKonverzija.VratiLokalizovaniTekst(kretanje.Opis) + '</td>\
                        <td>' + qKonverzija.VratiLokalizovaniTekst(nonull(kretanje.Napomena)) + '</td>\
                        <td>' + qUtils.IzvuciDatumIzDataSaServera(kretanje.DatumRoka) + '</td>';

            if (izmena == "True") {
                html += '<td><img src="' + _pathImgB + 'x.png" class="x" title=' + qKonverzija.VratiLokalizovaniTekst('Brisanje kretanja predmeta') + '></td>';
            } else {
                html += '<td></td>';
            }
            html += '</tr>';
        }

        $('#predmetTabelaKretanjaTBody').html(html);

        $('#predmetTabelaKretanjaTBody').on('click', '.x', function (e) {
            e.stopPropagation();
            var $tr = $(this).parent().parent();

            var idKretanja = $tr.attr('data-idKretanja');

            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('Pitanje'), qKonverzija.VratiLokalizovaniTekst('Da li želite da obrišete kretanje predmeta?'), 'pitanje');
            sigPitanjaObjekat.objekat = {
                tr: $tr,
                idKretanja: idKretanja
            };
            sigPitanja.potOtkPitanje.removeAll();
            sigPitanja.potOtkPitanje.add(OnObrisiKreatanjePredmeta);
        });

        $('#predmetTabelaKretanjaTBodyFilter').quiTableFilter({ tbodyId: '#predmetTabelaKretanjaTBody' });

        qScrollTabela.KlonirajHead('#predmetTabelaKretanja', '#predmetTabelaKretanjaCloneHead', null, null, true);
        qScrollTabela.KlonirajFilter('#predmetTabelaKretanjaTBodyFilter', '#predmetTabelaKretanjaCloneHead', '#predmetTabelaKretanjaTBody');
        qScrollTabela.PodesiVisinuTabele('#predmetTabelaKretanjaScroll', _scrTabelaOduzimac);
    }

    function PopuniTabeluIstorijePredmeta(stavkeIstorije) {
        var html = '';

        for (var i = 0; i < stavkeIstorije.length; ++i) {
            var istorija = stavkeIstorije[i];

            var title = "",
                klasaObrisan = "";

            if (istorija.DatumBrisanja != undefined) {
                title = qKonverzija.VratiLokalizovaniTekst("Obrisao") + ": " + qKonverzija.VratiLokalizovaniTekst(istorija.Obrisao) +
                        "\n" + qKonverzija.VratiLokalizovaniTekst("Datum brisanja") + ": " + qUtils.IzvuciDatumIzDataSaServera(istorija.DatumBrisanja, true);
                klasaObrisan = "obrisanoKretanje";
            }

            html += '<tr class="' + klasaObrisan + '" title="' + (title) + '" >\
                        <td>' + qUtils.IzvuciDatumIzDataSaServera(istorija.Vreme, true) + '</td>\
                        <td>' + qKonverzija.VratiLokalizovaniTekst(istorija.Korisnik) + '</td>\
                        <td>' + qKonverzija.VratiLokalizovaniTekst(istorija.Opis) + '</td>\
                        <td>' + qKonverzija.VratiLokalizovaniTekst(nonull(istorija.Napomena)) + '</td>\
                    </tr>';
        }

        $('#predmetTabelaIstorijeTBody').html(html);

        $('#predmetTabelaIstorijeTBodyFilter').quiTableFilter({ tbodyId: '#predmetTabelaIstorijeTBody' });

        qScrollTabela.KlonirajHead('#predmetTabelaIstorije', '#predmetTabelaIstorijeCloneHead', null, null, true);
        qScrollTabela.KlonirajFilter('#predmetTabelaIstorijeTBodyFilter', '#predmetTabelaIstorijeCloneHead', '#predmetTabelaIstorijeTBody');
        qScrollTabela.PodesiVisinuTabele('#predmetTabelaIstorijaScroll', _scrTabelaOduzimac);
    }

    function UcitajKretanjePredmeta() {
        $.ajax({
            type: 'GET',
            url: url_VratiIstorijuPredmeta,
            data: {
                idPredmeta: vm.Predmet.IdPredmeta,
                kretanje: true
            },
            success: function (kretanjeData) {
                if (kretanjeData.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), kretanjeData.Poruka, 'greska');
                    return;
                }

                PopuniTabeluKretanjaPredmeta(kretanjeData.Data);
            },
            complete: function () {
            }
        });
    }

    function UcitajIstorijuPredmeta() {
        $.ajax({
            type: 'GET',
            url: url_VratiIstorijuPredmeta,
            data: {
                idPredmeta: vm.Predmet.IdPredmeta,
            },
            success: function (istorijaData) {
                if (istorijaData.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), istorijaData.Poruka, 'greska');
                    return;
                }

                PopuniTabeluIstorijePredmeta(istorijaData.Data);
            },
            complete: function () {
            }
        });
    }

    function VratiSledeciSlobodanBrojPredmeta(klasa) {
        $('#predmetSledeciSlobodanBroj').text('');
        $('#predmetSledeciSlobodanBrojWrap').hide();

        $.ajax({
            type: 'GET',
            url: url_VratiSledeciSlobodanBrojPredmeta,
            data: {
                idOrgana: $('#predmetOrgani').quiComboBox('getSelectedItemData'),
                idKlase: klasa
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, getLang('W_PROZOR_NASLOV_GRESKA'), data.Poruka, 'greska');
                    return;
                }

                $('#predmetSledeciSlobodanBroj').text(data.Data);
                $('#predmetSledeciSlobodanBrojWrap').show();
            },
            complete: function () {
            }
        });
    }

    qPredmeti.Init = function () {
        var greska = $('#greskaNaTransakciji').text();
        if (greska != undefined && greska.trimnull() != undefined) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), greska, 'greska');
            $('#main').empty();
            return;
        }

        tipDokumenta = $('#tipDokumenta').text();
        url_VratiKlaseOrgana = $('#url_VratiKlaseOrgana').text();
        url_VratiJediniceOrgana = $('#url_VratiJediniceOrgana').text();
        url_SnimiPredmet = $('#url_SnimiPredmet').text();
        url_SnimiKretanjePredmeta = $('#url_SnimiKretanjePredmeta').text();
        url_VratiLinkDokumentaPredmeta = $('#url_VratiLinkDokumentaPredmeta').text();
        url_PretraziNbsKlijente = $('#url_PretraziNbsKlijente').text();
        url_VratiIstorijuPredmeta = $('#url_VratiIstorijuPredmeta').text();
        url_VratiStampePredmeta = $('#url_VratiStampePredmeta').text();
        url_VratiObrisaniDokument = $('#url_VratiObrisaniDokument').text();
        url_ObrisiKretanjePredmeta = $('#url_ObrisiKretanjePredmeta').text();
        url_VratiSledeciSlobodanBrojPredmeta = $('#url_VratiSledeciSlobodanBrojPredmeta').text();
        url_SnimiAktivnostPredmeta = $('#url_SnimiAktivnostPredmeta').text();
        url_VratiIdPredmetaPrekoBroja = $('#url_VratiIdPredmetaPrekoBroja').text();
        url_VratiMestaOpstine = $('#url_VratiMestaOpstine').text();
        url_VratiDokumentePredmeta = $('#url_VratiDokumentePredmeta').text();

        vm = qUtils.IzvuciVM('#vm', true);

        $('#predmetDatum').quiDate({});
        if (tipDokumenta == 3 && vm.Predmet != undefined) {
            if (vm.Predmet.Status == 'R') {
                $('#predmetDatum').quiDate('setDate', qUtils.IzvuciDateObjIzDataSaServera(vm.Predmet.VremeRezervacije));
            }
            else {
                $('#predmetDatum').quiDate('setDate', qUtils.IzvuciDateObjIzDataSaServera(vm.Predmet.VremeKreiranja));
            }
        }
        else {
            $('#predmetDatum').quiDate('setDate', qUtils.IzvuciDateObjIzDataSaServera(vm.Datum));
        }

        pretragaPredmetaUToku = 0;
        //$('#predmetDatum').text(qUtils.IzvuciDatumIzDataSaServera(vm.Datum));

        var $opstineCmb = $('#predmetOpstine');
        $opstineCmb.quiComboBox({ width: width, listWidth: width, showX: true });
        $opstineCmb.quiComboBox('setItemsFromBinding', vm.Opstine, 'Naziv', 'IdElementa');

        var $mestaCmb = $('#predmetMesta');
        $mestaCmb.quiComboBox({ width: width, listWidth: width, showX: true });

        if (vm.Opstine && vm.Opstine.length > 0) {
            $opstineCmb.parent().parent().show();
            $mestaCmb.parent().parent().show();
        } else {
            $opstineCmb.parent().parent().hide();
            $mestaCmb.parent().parent().show();
        }

        var $organiCmb = $('#predmetOrgani');
        $organiCmb.quiComboBox({ width: width, listWidth: width, showX: false });
        $organiCmb.quiComboBox('setItemsFromBinding', vm.Organi, 'Naziv', 'IdElementa');

        var $klaseCmb = $('#predmetKlase');
        $klaseCmb.quiComboBox({ width: width, listWidth: width, showX: false });

        var $jediniceCmb = $('#predmetJedinice');
        $jediniceCmb.quiComboBox({ width: width, listWidth: width, showX: false });

        var $inspekoriCmb = $('#predmetInspektori');
        $inspekoriCmb.quiComboBox({ width: width2, listWidth: width2, showX: true });
        $inspekoriCmb.quiComboBox('setItemsFromBinding', vm.Inspektori, 'Naziv', 'IdElementa');

        var $vrstePredmeta = $('#predmetVrste');
        $vrstePredmeta.quiComboBox({ width: width2, listWidth: width2, showX: true });
        $vrstePredmeta.quiComboBox('setItemsFromBinding2', vm.VrstePredmeta, 'Naziv');

        var $takse = $('#predmetTakse');
        $takse.quiComboBox({ width: width3, listWidth: width3, showX: true });
        $takse.quiComboBox('setItemsFromBinding', vm.Takse, 'Naziv', 'IdElementa');

        // ----------------------------- Dogadjaji na elemente ----------------------------------

        $organiCmb.on('select', function () {
            $klaseCmb.quiComboBox('clearItems');
            $jediniceCmb.quiComboBox('clearItems');

            $('#predmetSledeciSlobodanBroj').text('');
            $('#predmetSledeciSlobodanBrojWrap').hide();

            var idOrgana = $organiCmb.quiComboBox('getSelectedItemData');

            if (idOrgana != undefined) {
                $.when(
                    $.ajax({
                        type: 'GET',
                        url: url_VratiKlaseOrgana,
                        data: {
                            idOrgana: idOrgana
                        },
                    }),
                    $.ajax({
                        type: 'GET',
                        url: url_VratiJediniceOrgana,
                        data: {
                            idOrgana: idOrgana
                        },
                    })
                ).then(function (responseKlase, responseJedinice) {

                    var dataKlase = responseKlase[0];
                    if (dataKlase.Greska) {
                        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), dataKlase.Poruka, 'greska');
                    } else {
                        var klase = dataKlase.Data;
                        $klaseCmb.quiComboBox('setItemsFromBinding', klase, 'Naziv', 'IdElementa');
                    }

                    var dataJedinice = responseJedinice[0];

                    if (dataJedinice.Greska) {
                        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), dataJedinice.Poruka, 'greska');
                    }

                    var jedinice = dataJedinice.Data;
                    $jediniceCmb.quiComboBox('setItemsFromBinding', jedinice, 'Naziv', 'IdElementa');
                });
            }
        });

        $vrstePredmeta.on('select', function () {
            var idVrstePredmeta = $vrstePredmeta.quiComboBox('getSelectedItemDataProperty', 'IdElementa');

            if (idVrstePredmeta != undefined) {
                var rok = $vrstePredmeta.quiComboBox('getSelectedItemDataProperty', 'Rok');
                if (rok != undefined) {

                    var datum = qUtils.IzvuciDateObjIzDataSaServera(vm.Datum);
                    datum.setDate(datum.getDate() + parseInt(rok));

                    $('#predmetRok').text(qUtils.IzvuciDatumIzDateObj(datum, false));
                }
            } else {
                $('#predmetRok').text('');
            }


        });

        $opstineCmb.on('select', function () {
            var idOpstine = $opstineCmb.quiComboBox('getSelectedItemData');

            $mestaCmb.quiComboBox('clearItems');

            if (idOpstine != undefined) {
                $.ajax({
                    type: 'GET',
                    url: url_VratiMestaOpstine,
                    data: {
                        idOpstine: idOpstine
                    },
                    success: function (data) {
                        if (data.Greska) {
                            PrikaziProzor(true, true, getLang('W_PROZOR_NASLOV_GRESKA'), data.Poruka, 'greska');
                            return;
                        }

                        var mesta = data.Data;
                        $mestaCmb.quiComboBox('setItemsFromBinding', mesta, 'Naziv', 'IdElementa');

                    },
                    complete: function () {
                    }
                });
            }
        });

        $('#radioWrapInspektor').find('input[name="inspektor"]').on('change', function () {
            var value = $(this).val();

            if (value == 0) {
                //fizicko lice
                $('#predmetPodnosilac').prop('disabled', false);
                $('#predmetPodnosilac').attr('data-jedinstveniBroj', '');
                $('#predmetPodnosilacNBS').hide();
            }
            else if (value == 1) {
                //pravno lice
                if ($('#predmetPodnosilac').attr('data-jedinstveniBroj') != undefined && $('#predmetPodnosilac').attr('data-jedinstveniBroj').length > 0) {
                    $('#predmetPodnosilac').prop('disabled', true);
                } else {
                    $('#predmetPodnosilac').prop('disabled', false);
                }

                $('#predmetPodnosilacNBS').show();
            } else if (value == 2) {
                // inspektor
                $('#predmetPodnosilac').prop('disabled', true);
                $('#predmetPodnosilacNBS').hide();
                $('#predmetPodnosilac').attr('data-jedinstveniBroj', '');
                var inspektor = $inspekoriCmb.quiComboBox('getSelectedItemLabel');

                if (inspektor != undefined) {
                    $('#predmetPodnosilac').val(inspektor);
                }
            }
        });

        $('#predmetObrisiVrednostPodnosioca').click(function () {
            var $podnosilac = $('#predmetPodnosilac');
            $podnosilac.val('');
            $podnosilac.prop('disabled', false);
            $podnosilac.attr('data-jedinstveniBroj', '');
            $(this).hide();
        });

        $('#predmetObrisiVrednostLicaKontrole').click(function () {
            var $liceKotrole = $('#predmetKontrolnoLice');
            $liceKotrole.val('');
            $liceKotrole.prop('disabled', false);
            $liceKotrole.attr('data-jedinstveniBroj', '');
            $(this).hide();
        });

        $inspekoriCmb.on('select', function () {
            var nazivInspektora = $inspekoriCmb.quiComboBox('getSelectedItemLabel');
            var inspektorRadio = $('#radioWrapInspektor').find('input[name="inspektor"]:checked').val();
            if (inspektorRadio == "2") {
                if (nazivInspektora != undefined) {
                    $('#predmetPodnosilac').val(nazivInspektora);
                } else {
                    $('#predmetPodnosilac').val('');
                }
            }
        });

        $('#predmetBrojNadredjenogPredmeta').on('blur', function () {
            var vrednost = $('#predmetBrojNadredjenogPredmeta').val().trimnull();

            if (vrednost == undefined) {
                $('#predmetBrojNadredjenogPredmeta').val('');
                $('#predmetBrojNadredjenogPredmetaInfo').hide();
                $('#predmetBrojNadredjenogPredmetaDelete').hide();
                $('#predmetBrojNadredjenogPredmetaInfo').attr('data-idPredmeta', '');
                return;
            }

            pretragaPredmetaUToku += 1;
            $('#predmetBrojNadredjenogPredmeta').prop('disabled', true);
            var loader = $('#predmetBrojNadredjenogPredmetaLoader');

            loader.show();
            $.ajax({
                type: 'GET',
                url: url_VratiIdPredmetaPrekoBroja,
                data: {
                    brojPredmeta: vrednost
                },
                success: function (data) {
                    if (data.Greska) {
                        PrikaziProzor(true, true, getLang('Greška'), data.Poruka, 'greska');
                        return;
                    }

                    var idPredmeta = data.Data;

                    if (idPredmeta != undefined) {
                        PrikaziProzor(false);
                        $('#predmetBrojNadredjenogPredmetaInfo').show();
                        $('#predmetBrojNadredjenogPredmetaInfo').attr('data-idPredmeta', idPredmeta);
                        $('#predmetBrojNadredjenogPredmetaDelete').show();
                    } else {
                        PrikaziProzor(true, true, getLang('Upozorenja'), getLang('Predmet nije pronadjen'), 'upozorenje');
                        //$('#predmetBrojNadredjenogPredmeta').val('');
                        $('#predmetBrojNadredjenogPredmetaInfo').hide();
                        $('#predmetBrojNadredjenogPredmetaInfo').attr('data-idPredmeta', '');
                        $('#predmetBrojNadredjenogPredmetaDelete').hide();
                    }
                    pretragaPredmetaUToku -= 1;
                },
                complete: function () {
                    loader.hide();
                    $('#predmetBrojNadredjenogPredmeta').prop('disabled', false);
                }
            });
        });

        $('#predmetBrojNadredjenogPredmeta').on('keyup', function (e) {
            if (e.keyCode == 13) {
                $(this).blur();
            }
        });

        $('#predmetTabelaPovezanihPredmetaTBody').on('click', 'i.fa', function () {
            var idPredmeta = $(this).attr('data-id');

            var mask = '&idPredmeta=' + idPredmeta + '&close=true';

            var hash = '#./Predmeti?tipDokumenta=3' + mask;
            window.open(location.origin + hash, '_blank');
        });

        $('#predmetBrojNadredjenogPredmetaDelete').on('click', function (e) {
            $('#predmetBrojNadredjenogPredmeta').val('');
            $('#predmetBrojNadredjenogPredmetaInfo').hide();
            $('#predmetBrojNadredjenogPredmetaInfo').attr('data-idPredmeta', '');
            $('#predmetBrojNadredjenogPredmetaDelete').hide();
        });

        if (tipDokumenta == 1 || tipDokumenta == 2) {
            $('#predmetBtnSacuvaj').click(ClickBtnSacuvaj);
            $('#predmetBtnReset').click(ClickBtnReset);

            $klaseCmb.on('select', function () {
                var klasa = $klaseCmb.quiComboBox('getSelectedItemData');
                if (klasa != undefined) {
                    VratiSledeciSlobodanBrojPredmeta(klasa);
                }
            });
        }

        if (tipDokumenta == 2) {
            InicijalizujDogadjajeNaInputCeoBrojPozivan($('#predmetKolicina'));
        }

        // ako je u pitanju modifikacija ili pregled predmeta - treba postaviti sve vrednosti predmeta
        if ((tipDokumenta == 4 || tipDokumenta == 3) && vm.Predmet != undefined) {
            $organiCmb.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdOrgana);
            $opstineCmb.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdOpstine);
            $inspekoriCmb.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdInspektora);
            //$vrstePredmeta.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdVrstePredmeta);
            $vrstePredmeta.quiComboBox('selectItemByDataPropertyNoTrigger', 'IdElementa', vm.Predmet.IdVrstePredmeta);
            $takse.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdTakse);

            $klaseCmb.quiComboBox('setItemsFromBinding', vm.Klase, 'Naziv', 'IdElementa');
            $jediniceCmb.quiComboBox('setItemsFromBinding', vm.Jedinice, 'Naziv', 'IdElementa');
            $mestaCmb.quiComboBox('setItemsFromBinding', vm.Mesta, 'Naziv', 'IdElementa');

            $klaseCmb.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdKlase);
            $jediniceCmb.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdJedinice);
            $mestaCmb.quiComboBox('selectItemByDataNoTrigger', vm.Predmet.IdMesta);

            if ($('#predmetStrogoPoverljiv').length > 0) {
                $('#predmetStrogoPoverljiv').prop('checked', vm.Predmet.StrogoPoverljiv);
            }

            if (vm.Predmet && vm.Predmet.PodnosilacJeInspektor) {
                $('#radioWrapInspektor').find('input[value="2"]').prop('checked', true);
                $('#predmetPodnosilac').prop('disabled', true);
            } else {
                if (vm.Predmet.PodnosilacJedinstveniBroj && vm.Predmet.PodnosilacJedinstveniBroj.length > 0) {
                    $('#radioWrapInspektor').find('input[value="1"]').prop('checked', true);
                    $('#predmetPodnosilacNBS').show();

                    //posto je ucitan iz nbs-a podnosilac treba da je disabled
                    $('#predmetPodnosilac').prop('disabled', true);
                    $('#predmetObrisiVrednostPodnosioca').show();

                } else {
                    $('#radioWrapInspektor').find('input[value="0"]').prop('checked', true);
                    $('#predmetPodnosilac').prop('disabled', false);
                }
            }

            if (vm.Predmet.IdNadredjenogPredmeta != undefined && vm.Predmet.BrojNadredjenogPredmeta != undefined) {
                $('#predmetBrojNadredjenogPredmeta').val(vm.Predmet.BrojNadredjenogPredmeta);
                $('#predmetBrojNadredjenogPredmetaInfo').show();
                $('#predmetBrojNadredjenogPredmetaInfo').attr('data-idPredmeta', vm.Predmet.IdNadredjenogPredmeta);
                $('#predmetBrojNadredjenogPredmetaDelete').show();
            } else {
                $('#predmetBrojNadredjenogPredmeta').val('');
                $('#predmetBrojNadredjenogPredmetaInfo').hide();
                $('#predmetBrojNadredjenogPredmetaInfo').attr('data-idPredmeta', '');
                $('#predmetBrojNadredjenogPredmetaDelete').hide();
            }

            if (vm.Predmet.PovezaniPredmeti && vm.Predmet.PovezaniPredmeti.length > 0) {
                var povezani = vm.Predmet.PovezaniPredmeti;

                var htmlPovezanih = '';

                for (var m = 0; m < povezani.length; ++m) {
                    var po = povezani[m];

                    htmlPovezanih = '<tr>\
                                        <td class="tac"><i class="fa fa-reply" data-id="' + po.IdPredmeta + '"></i></td>\
                                        <td class="tac qTdPopupPredmeti"  data-idPredmeta="' + po.IdPredmeta + '">' + po.BrojPredmeta + '</td>\
                                    </tr>';
                }

                $('#predmetTabelaPovezanihPredmetaTBody').html(htmlPovezanih);
                $('#predmetTabelaPovezanihPredmeta').show();
            } else {
                $('#predmetTabelaPovezanihPredmeta').hide();
                $('#predmetTabelaPovezanihPredmetaTBody').empty();
            }

            $('#predmetPodnosilac').val(qKonverzija.VratiLokalizovaniTekst(vm.Predmet.Podnosilac));
            $('#predmetKontrolnoLice').val(qKonverzija.VratiLokalizovaniTekst(vm.Predmet.LiceKontrole));
            $('#predmetPodnosilac').attr('data-jedinstveniBroj', vm.Predmet.PodnosilacJedinstveniBroj);

            //posto je ucitan iz nbs-a lice kontrole treba da je disabled
            if (vm.Predmet.LiceKontroleJedinstveniBroj && vm.Predmet.LiceKontroleJedinstveniBroj.length > 0) {
                $('#predmetKontrolnoLice').attr('data-jedinstveniBroj', vm.Predmet.LiceKontroleJedinstveniBroj);
                $('#predmetKontrolnoLice').prop('disabled', true);
                $('#predmetObrisiVrednostLicaKontrole').show();
            }

            var rokVrstePredmeta = $vrstePredmeta.quiComboBox('getSelectedItemDataProperty', 'Rok');
            if (rokVrstePredmeta != undefined) {

                var datumVrstePredmeta = qUtils.IzvuciDateObjIzDataSaServera(vm.Datum);
                datumVrstePredmeta.setDate(datumVrstePredmeta.getDate() + parseInt(rokVrstePredmeta));

                $('#predmetRok').text(qUtils.IzvuciDatumIzDateObj(datumVrstePredmeta, false));
            }

            $organiCmb.quiComboBox('enable', false);
            $klaseCmb.quiComboBox('enable', false);

            $('#predmetPrilog').val(qKonverzija.VratiLokalizovaniTekst(vm.Predmet.Prilog));
            $('#predmetSadrzaj').val(qKonverzija.VratiLokalizovaniTekst(vm.Predmet.Sadrzaj));
            $('#predmetStraniBroj').val(qKonverzija.VratiLokalizovaniTekst(vm.Predmet.StraniBroj));

            if (tipDokumenta == 4 || tipDokumenta == 3) {
                // TAB ISTORIJA PREDMETA
                var $istorijaPredmetaVrsteKretanja = $("#predmetIstorijaVrsteKretanja");
                $istorijaPredmetaVrsteKretanja.quiComboBox({ width: width, listWidth: width, showX: true });
                $istorijaPredmetaVrsteKretanja.quiComboBox('setItemsFromBinding2', vm.VrsteKretanjaPredmeta, 'Naziv');
                $istorijaPredmetaVrsteKretanja.on('select', function () {
                    var unosRoka = $(this).quiComboBox('getSelectedItemDataProperty', 'UnosRoka');
                    if (unosRoka) {
                        $('#predmetIstorijaKretanjaDatumRokaWrap').show();
                    } else {
                        $('#predmetIstorijaKretanjaDatumRokaWrap').hide();
                    }

                    $('#predmetIstorijaKretanjaDatumRokaWrap').quiDate('setDate', new Date());

                    var $btn = $('#predmetBtnUnosKretanja');
                    if ($(this).quiComboBox('getSelectedItemData') != undefined) {
                        if ($btn.hasClass('signalZaBtnUnosKretanja')) return;
                    } else if ($('#predmetIstorijaNapomena').val().trimnull() != undefined) {
                        if ($btn.hasClass('signalZaBtnUnosKretanja')) return;
                    } else {
                        if ($btn.hasClass('signalZaBtnUnosKretanja')) {
                            $btn.removeClass('signalZaBtnUnosKretanja');
                            return;
                        }
                    }

                    $btn.addClass('signalZaBtnUnosKretanja');
                });

                var $istorijaKretanjaDatumRoka = $("#predmetIstorijaKretanjaDatumRoka");
                $istorijaKretanjaDatumRoka.quiDate({ width: 200, listWidth: 200, showX: true });

                $('#predmetIstorijaNapomena').on('keyup', function () {
                    var text = $('#predmetIstorijaNapomena').val().trimnull();
                    var $btn = $('#predmetBtnUnosKretanja');
                    if (text != undefined) {
                        if ($btn.hasClass('signalZaBtnUnosKretanja')) return;
                    } else if ($("#predmetIstorijaVrsteKretanja").quiComboBox('getSelectedItemData') != undefined) {
                        if ($btn.hasClass('signalZaBtnUnosKretanja')) return;
                    } else {
                        if ($btn.hasClass('signalZaBtnUnosKretanja')) {
                            $btn.removeClass('signalZaBtnUnosKretanja');
                            return;
                        };
                    }

                    $btn.addClass('signalZaBtnUnosKretanja');
                });

                // TAB PODACI PREDMETA
                $('#predmetBtnIzmeni').on('click', function () {
                    ClickBtnSacuvaj(true);
                });

                // TAB KRETANJE PREDMETA
                $('#predmetBtnUnosKretanja').on('click', function () {
                    ClickBtnSacuvajUnosKretanja();
                });
            }

            // TAB KRETANJE PREDMETA
            PopuniTabeluKretanjaPredmeta(vm.Predmet.Kretanje);

            // TAB ISTORIJE PREDMETA
            PopuniTabeluIstorijePredmeta(vm.Predmet.Istorija);
        }
        if (tipDokumenta == 3 && vm.Predmet != undefined) {
            $jediniceCmb.quiComboBox('enable', false);
            $inspekoriCmb.quiComboBox('enable', false);
            $vrstePredmeta.quiComboBox('enable', false);
            $opstineCmb.quiComboBox('enable', false);
            $takse.quiComboBox('enable', false);
            $mestaCmb.quiComboBox('enable', false);

            if ($('#predmetStrogoPoverljiv').length > 0) {
                $('#predmetStrogoPoverljiv').prop('disabled', true);
            }

            $('#radioWrapInspektor').find('input[name="inspektor"]').prop('disabled', true);

            $('#predmetDatum').prop('disabled', true);
            $('#predmetPrilog').prop('disabled', true);
            $('#predmetSadrzaj').prop('disabled', true);
            $('#predmetStraniBroj').prop('disabled', true);
            $('#predmetPodnosilac').prop('disabled', true);
            $('#predmetKontrolnoLice').prop('disabled', true);

            $('#predmetBrojNadredjenogPredmeta').prop('disabled', true);
            $('#predmetBrojNadredjenogPredmetaDelete').hide();

            // linkovi
            $('#predmetKontrolnoLiceNBS').hide();
            $('#predmetPodnosilacNBS').hide();

            $('#predmetBtnIdiNaIzmenu').click(function () {
                var dms = $('#predmetiTabovi').find('.tab[data-tab="#predmetDmsPredmeta"]').hasClass('tabSel');

                var mask = '&idPredmeta=' + vm.Predmet.IdPredmeta + '';

                if (dms == true) {
                    mask += '&dms=true';
                }

                qUI.substringZaIzbacivanje = mask;

                location.hash = '#./Predmeti?tipDokumenta=4' + mask;
            });

            if ($('#predmetBtnIdiNaIzmenu').length == 0) {
                $('#predmetBtnZatvoriProzor').css('margin-left', '400px');
            } else {
                $('#predmetBtnZatvoriProzor').css('margin-left', '10px');
            }
        }
        //if (!vm.DozvoljenoMenjanjeDatuma)
        //{
        //    $('#predmetDatum').prop('disabled', true);
        //}

        if (tipDokumenta == 3 || tipDokumenta == 4) {
            $('#predmetiTabovi').on('click', 'li', ClickTabovi);

            $('#predmetBtnStampa').click(function () {
                ClickBtnStampa(true);
            });

            $('#predmetBtnZatvoriProzor').click(function () {
                window.close();
            });
        }

        if (tipDokumenta == 3 || !vm.DozvoljenoMenjanjeDatuma) {
            $('#predmetDatum').quiDate('enable', false);
        } else {
            $('#predmetDatum').quiDate('enable', true);
        }
        // ----------------------------- INICIJALIZACIJA DOGADJAJA DMS-a ----------------------------

        qDms.icoPath = $('#_dmsIco').text();
        qDms.url_VratiLinkDokumentaPredmeta = url_VratiLinkDokumentaPredmeta;
        qDms.url_VratiObrisaniDokument = url_VratiObrisaniDokument;
        qDms.url_SnimiAktivnostPredmeta = url_SnimiAktivnostPredmeta;

        $('#dmsUpload').click(qDms.UploadStoredFiles);

        //$('#dmsX').click(qDms.SkloniDmsDijalog);



        //$('#dmsFilesWrap').on('click', 'a.ne', function () {
        //    $(this).parent().parent().animate({ height: 32 });
        //    return false;
        //});

        //$('#dmsFilesWrap').on('click', 'a.da', qDms.HendlujFileDel);

        //$('#dmsFilesWrap').on('click', 'a.thumb', qDms.HendlujPostaviThumb);

        $('#dmsFilesWrap').on('click', '.dmsFile', qDms.HendlujPostaviKliknutFajl);

        $('#dmsFilesWrap').on('click', 'a.del', function (e) {
            e.preventDefault();
            qDms.HendlujClickObrisi($(this));

            UcitajKretanjePredmeta();
            UcitajIstorijuPredmeta();
        });

        $('#dmsFilesWrap').on('click', 'a.undoDel', function (e) {
            e.preventDefault();
            qDms.HendlujClickVratiObrisani($(this));

            UcitajKretanjePredmeta();
            UcitajIstorijuPredmeta();
        });

        $('#dmsPrikaziObrisane').on('change', function () {
            var $this = $(this);

            var prikazi = $this.prop('checked');
            if (prikazi) {
                $('#dmsWrap').find('.dmsFile').each(function () {
                    $(this).show();
                });
            } else {
                $('#dmsWrap').find('.dmsFile').each(function () {
                    var $fajl = $(this);

                    if ($fajl.hasClass('obrisan')) {
                        $fajl.hide();
                    } else {
                        $fajl.show();
                    }
                });
            }

            var $selektovan = $('#dmsWrap').find('.kliknut.obrisan');

            if ($selektovan && $selektovan.length > 0) {
                if (!prikazi) {
                    $selektovan.removeClass('kliknut');

                    var $dmsDesno = $('#dmsWrap').find('#dmsDesno');
                    var $iframe = $dmsDesno.find('iframe');
                    var $dmsImg = $dmsDesno.find('#dmsImg');

                    $iframe.attr('src', '');
                    $iframe.hide();
                    $dmsImg.attr('src', '');
                    $dmsImg.hide();
                    $dmsDesno.hide();
                }
            }
        });

        $('#dmsPrikazListeFajlova').click(function (e) {
            e.preventDefault();

            $('#leviDeo').removeClass('upload');
            $('#dmsBrowse').find('.qq-upload-list').empty();
            $(this).hide();
        });

        //$('#dmsFilesWrap').on('click', 'a.link, a.pregledaj', qDms.HendlujLinkFajla);

        $(document).on('keydown.dms', function (e) {
            if ($('.tabSel').attr('data-tab') === '#predmetDmsPredmeta') {
                // cursor: levo ili gore
                if (e.keyCode == 37 || e.keyCode == 38) {
                    qDms.HendlujPrikazFajlaPrekoCursora(true);
                }
                    // cursor: desno ili dole
                else if (e.keyCode == 39 || e.keyCode == 40) {
                    qDms.HendlujPrikazFajlaPrekoCursora(false);
                }
            }
        });

        // ------------------------------ INICIJALIZACIJA DOGADJAJA NBS ----------------------------------

        // NBS provera komitenata
        $('#predmetPodnosilacNBS, #predmetKontrolnoLiceNBS').click(function (e) {
            e.preventDefault();
            var winH = window.innerHeight;
            if (winH) {
                var prozH = winH - 60;
                $('#nbsWrap').height(prozH).css('margin-top', -(prozH / 2));
                $('#nbsTabelaWrap').height(prozH - 130);
            }
            $('#_nbs').show().attr('data-provera', $(this).attr('data-provera'));
            $('#nbsNaziv').focus().select();
        });

        $('#nbsX').click(function () {
            $('#_nbs').hide();
        });

        $('#nbsTeloWrap').on('keyup', 'input', function (e) {
            if (e.keyCode == 13) $('#nbsBtnPretrazi').click();
            if (e.keyCode == 27) $('#_nbs').hide();
        });

        $('#nbsTabelaTBody').on('click', 'tr', function () {
            var provera = $('#_nbs').hide().attr('data-provera');
            var $tr = $(this),
                $tds = $tr.find('td');
            $('#kkJedOzn').val($tds.eq(1).text());
            $('#kkJedOzn2').val($tds.eq(2).text());
            if (provera == '2') {
                // kontrolno lice
                var $kontrolnoLice = $('#predmetKontrolnoLice');
                $kontrolnoLice.val(qKonverzija.VratiLokalizovaniTekst($tds.eq(0).text()) + ', ' + qKonverzija.VratiLokalizovaniTekst($tr.attr('data-mesto')));
                $kontrolnoLice.attr('data-jedinstveniBroj', $tds.eq(1).text().trim() + '/' + $tds.eq(2).text().trim());
                $kontrolnoLice.val($tds.eq(0).text().trim() + ', ' + $tds.eq(3).text().trim() + ', ' + $tds.eq(1).text().trim() + ', ' + $tds.eq(2).text().trim());
                $kontrolnoLice.prop('disabled', true);
                $('#predmetObrisiVrednostLicaKontrole').show();
            } else {
                // pravno lice
                var $podnosilac = $('#predmetPodnosilac');
                $podnosilac.val(qKonverzija.VratiLokalizovaniTekst($tds.eq(0).text()) + ', ' + qKonverzija.VratiLokalizovaniTekst($tr.attr('data-mesto')));
                $podnosilac.attr('data-jedinstveniBroj', $tds.eq(1).text().trim() + '/' + $tds.eq(2).text().trim());
                $podnosilac.val($tds.eq(1).text().trim() + '/' + $tds.eq(2).text().trim() + ' - ' + $tds.eq(0).text().trim());
                $podnosilac.prop('disabled', true);
                $('#predmetObrisiVrednostPodnosioca').show();
            }
        });

        $('#nbsBtnPretrazi').click(function () {
            var $btn = $(this).find('table');
            if ($btn.hasClass('teloDugmeIskljuceno')) return;
            var d = {
                pib: $('#nbsPib').val(),
                maticniBroj: $('#nbsMaticni').val(),
                naziv: $('#nbsNaziv').val(),
                mesto: $('#nbsMesto').val(),
                banka: $('#nbsRacun1').val(),
                brojRacuna: $('#nbsRacun2').val(),
                kontrolniBroj: $('#nbsRacun3').val()
            };
            if (!d.pib && !d.maticniBroj && !d.naziv && !d.mesto && !d.banka && !d.brojRacuna && !d.kontrolniBroj) {
                $('#nbsNaziv').focus();
                return;
            }
            $btn.addClass('teloDugmeIskljuceno');
            $.ajax({
                type: 'GET',
                url: url_PretraziNbsKlijente,
                data: d,
                success: function (data) {
                    if (data.Greska) {
                        $('#nbsTabelaWrap').hide();
                        $('#nbsGreskaWrap').show().html(qKonverzija.VratiLokalizovaniTekst('Uneli ste preopširne kriterijume pretrage. Ponovite pretragu sa detaljnijim kriterijumima.'));
                        return;
                    }
                    var ar = data.Data,
                        n = ar.length;
                    if (!n) {
                        $('#nbsTabelaWrap').hide();
                        $('#nbsGreskaWrap').show().html(qKonverzija.VratiLokalizovaniTekst('Nema rezultata pretrage.'));
                        return;
                    }
                    var s = '';
                    for (var i = 0; i < n; i++) {
                        var f = ar[i];
                        s += '<tr data-mesto="' + f.Mesto + '" data-adresa="' + f.Adresa + '"><td>' + qKonverzija.VratiLokalizovaniTekst(f.Naziv) + '</td>';
                        s += '<td>' + qKonverzija.VratiLokalizovaniTekst(f.PIB) + '</td>';
                        s += '<td>' + qKonverzija.VratiLokalizovaniTekst(f.MaticniBroj) + '</td>';
                        s += '<td>' + qKonverzija.VratiLokalizovaniTekst(f.Adresa) + ', ' + qKonverzija.VratiLokalizovaniTekst(f.Mesto) + '</td>';
                        s += '<td>' + qKonverzija.VratiLokalizovaniTekst(f.TekuciRacun) + '</td></tr>';
                    }
                    $('#nbsTabelaTBody').html(s);
                    $('#nbsGreskaWrap').hide();
                    $('#nbsTabelaWrap').show();
                },
                complete: function () {
                    $btn.removeClass('teloDugmeIskljuceno');
                }
            });
        });

        // ------------------------- SELEKTUJ DMS TAB ---------------------

        var dmsTab = $('#dmsTabSelektuj').text().trimnull();
        if (dmsTab && dmsTab == "True") {
            $('#predmetiTabovi').find('li:eq(1)').click();
        }

        // ---------------------- POKRENI UCITAVANJE STAMPE ----------------

        if ($('#predmetiUcitavanjeStampe').length > 0) {
            // potrebno kad se ucitava transakcija ako prozor nije zatvoren
            var prikazanProzor = $('#proz').is(':visible');

            if (prikazanProzor) {
                setTimeout(function () {
                    ClickBtnStampa(false);
                }, 1000);
            }
        }

        // --------------------- KEYS PRECICE ------------------------------
        if (tipDokumenta != 3) {
            var precice = vm.Precice;

            if (precice && precice.length > 0) {

                var preciceObj = {};

                for (var i = 0; i < precice.length; ++i) {
                    var prec = precice[i];

                    preciceTekstovi[i] = qKonverzija.VratiLokalizovaniTekst(prec.Naziv);

                    var key = i + 1;
                    preciceObj[key] = {
                        func: function (keyCode) {
                            $('#predmetSadrzaj').val(preciceTekstovi[keyCode - 49]);
                        },
                        opis: qKonverzija.VratiLokalizovaniTekst(prec.IdElementa)
                    };
                }

                log(preciceObj);

                qKeys.RegistujPrecice(preciceObj, 'oblakTeloWrap');
            }
        }
    };

}(window.qPredmeti = window.qPredmeti || {}, jQuery));
//#endregion

// ==================================================================================================================================================