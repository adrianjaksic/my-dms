/// <reference path="pisarnica.konverzija.js" />
(function (qDms, $, undefined) {

    var imgext = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

    qDms.icoPath = undefined;

    qDms.uploader = undefined;
    qDms.vm = undefined;

    qDms.url_VratiLinkDokumentaPredmeta = undefined;
    qDms.url_VratiObrisaniDokument = undefined;
    qDms.url_SnimiAktivnostPredmeta = undefined;

    var nfiles = 0,
        ro = false;

    function NapraviFajlHtml(file) {
        var slika = imgext.contains(null, file.Ekstenzija);
        //var datum = Date.parse(file.VremeUnosa);
        //if (isNaN(datum)) {
        //    datum = qUtils.IzvuciDatumIzDataSaServera(file.VremeUnosa, true);
        //} else {
        //    datum = qUtils.IzvuciDatumIzDateObj(new Date(datum), true);
        //}
        
        var f = '';
        var slikaZaData = '';

        var obrisan = '';
        if (file.Obrisan) {
            obrisan = 'obrisan';
        }

        if (slika !== false) slikaZaData = 'data-slika="true"';
        f += '<div class="dmsFile ' + obrisan + '" style="background-image: url(' + qDms.icoPath + file.Ekstenzija + '.gif)" data-id="' + file.IdDokumenta + '" ' + slikaZaData + ' data-link="" data-linkSlike="" data-ext="' + file.Ekstenzija + '">';
        f += '<div class="red"><span class="qTdPopupDokumenti" data-idDok="' + file.IdDokumenta + '" data-idPredDok="' + qDms.vm.IdPredmeta + '">' + qKonverzija.VratiLokalizovaniTekst(qUtils.SliceFileName(file.Naziv, 33)) + '</i></div>';
        f += '<div class="red">';
        //if (slika === false) {
        //    f += '<a href="https://docs.google.com/viewer?url=" class="pregledaj" target="_blank">' + qKonverzija.VratiLokalizovaniTekst('Pregledaj') + '</a>';
        //}
        //f += '<a href="" class="link" target="_blank">' + qKonverzija.VratiLokalizovaniTekst('Preuzmi') + '</a>';
        if (!file.Obrisan) {
            f += '<a class="del" href="#">' + qKonverzija.VratiLokalizovaniTekst('Obriši') + '</a>';
        } else if (qDms.vm.DozvoljenoVracanjeObrisanog) {
            f += '<a class="undoDel" href="#">' + qKonverzija.VratiLokalizovaniTekst('Vrati obrisani') + '</a>';
        }
        f += '</div>';
        //if (!file.Obrisan) {
        //    f += '<div class="red dane">' + qKonverzija.VratiLokalizovaniTekst('Da li ste sigurni?') + '<a class="da" href="#">' + qKonverzija.VratiLokalizovaniTekst('Da') + '</a><a class="ne" href="#">' + qKonverzija.VratiLokalizovaniTekst('Ne') + '</a></div>';
        //}
        f += '</div>';
        return f;
    }

    function PopuniPostojeceFajlove() {
        var links = '';
        var n = qDms.vm.Dokumenti.length;
        if (n == 0) {
            $('#dmsFilesWrap').empty();
        } else {
            for (var i = 0; i < n; i++) {
                var l = qDms.vm.Dokumenti[i];
                links += NapraviFajlHtml(l);
            }
            $('#dmsFilesWrap').html(links);
        }
    }

    function DodajFajlUPostojece(file) {
        var link = NapraviFajlHtml(file);
        //$('#leviDeo').removeClass('upload');
        //$('#dmsPrikazListeFajlova').hide();

        //$('#dmsBrowse').find('.qq-upload-list').children().fadeOut(3000).promise().then(function () {
        //    $('#dmsBrowse').find('.qq-upload-list').empty();
        //});

        $('#dmsFilesWrap').append($(link).hide().fadeIn());

        var widthToScroll = $('#dmsFilesWrap').height() + $('#dmsFilesWrap').find('.dmsFile').length * 32;
        $('#dmsFilesWrap').scrollTop(widthToScroll);
    }

    function HendlujFileDel($el, razlogBrisanja) {
        if (ro) return false;
        //var $el = $(this);
        var id = $el.attr('data-id');
        $.ajax({
            type: 'POST',
            url: 'Dms/ObrisiDokument',
            data: {
                idPredmeta: qDms.vm.IdPredmeta,
                idDokumenta: id,
                razlogBrisanja: razlogBrisanja
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }
                //$el.slideUp(function () { $el.remove(); });
                $el.addClass('obrisan');
                $el.find('.del').remove();

                if (qDms.vm.DozvoljenoVracanjeObrisanog) {
                    var html = '<a class="undoDel" href="#">' + qKonverzija.VratiLokalizovaniTekst('Vrati obrisani') + '</a>';
                    $el.find('.red:eq(1)').html(html);
                }

                //$el.find('.red.dane').remove();
                //$el.css('height', '32');

                if ($('#dmsPrikaziObrisane').prop('checked')) {
                    $el.show();
                    $('#dmsDesno').show();
                } else {
                    $el.hide();
                    $el.removeClass('kliknut');
                    $('#dmsDesno').hide();
                    
                    var $dmsDesno = $('#dmsWrap').find('#dmsDesno');
                    $dmsDesno.find('iframe').remove();
                    $dmsDesno.find('#dmsTxtWrap').remove();
                    $dmsDesno.find('#dmsPdfWrap').remove();
                    $dmsDesno.find('#dmsImg').remove();
                    $dmsDesno.find('#dmsPorukaZaZoom').hide();
                }
            }
        });
        return false;
    };

    qDms.InitUI = function (readOnly) {
        if (readOnly) {
            ro = true;
            $('#dmsWrap').addClass('ro');
        } else {
            ro = false;
            $('#dmsWrap').removeClass('ro');
        }
    };

    qDms.InitUploader = function () {
        qDms.uploader = new qq.FineUploader({
            element: document.getElementById('dmsBrowse'),
            request: {
                endpoint: 'Dms/UploadDokumenta',
                params: {
                    idPredmeta: qDms.vm.IdPredmeta
                }
            },
            autoUpload: false,
            text: {
                uploadButton: qKonverzija.VratiLokalizovaniTekst('Odaberi fajlove'),
                cancelButton: qKonverzija.VratiLokalizovaniTekst('Ukloni'),
                waitingForResponse: qKonverzija.VratiLokalizovaniTekst('Učitavanje')
            },
            template: '<div class="qq-uploader"><div class="qq-upload-drop-area" style="display: none;"><span>{dragZoneText}</span></div><div class="qq-upload-button" style="position: relative; overflow: hidden; direction: ltr;"><div><span class="ubt">{uploadButtonText}</span></div></div><ul class="qq-upload-list"></ul></div>',
            validation: {
                allowedExtensions: qDms.vm.DozvoljeneEkstenzije,
                sizeLimit: (qDms.vm.MaksimalnaVelicina * 1024), // kb * 1024 = bytes
                stopOnFirstInvalidFile: false
            },
            failedUploadTextDisplay: {
                mode: 'custom',
                maxChars: 40,
                responseProperty: 'error',
                enableTooltip: true
            },
            callbacks: {
                onComplete: function (id, fileName, response) {
                    nfiles--;
                    if (!response.error) {
                        DodajFajlUPostojece(response.file);                        
                    }
                    //UploaderZavrsio();
                    
                },
                onSubmit: function (id, fileName) {
                    log(fileName);
                    //$('#leviDeo').addClass('upload');
                    nfiles++;
                }
            }
        });
        PopuniPostojeceFajlove();
    };
    
    qDms.HendlujClickVratiObrisani = function ($el) {

        if (ro) return false;

        var $dmsFajl = $el.parent().parent();

        $.ajax({
            type: 'POST',
            url: qDms.url_VratiObrisaniDokument,
            data: {
                idPredmeta: qDms.vm.IdPredmeta,
                idDokumenta: $dmsFajl.attr('data-id')
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                $dmsFajl.removeClass('obrisan');
                var html = '<a class="del" href="#">' + qKonverzija.VratiLokalizovaniTekst('Obriši') + '</a>';
                $dmsFajl.find('.red:eq(1)').html(html);
                $el.remove();
            },
            complete: function() {
            }
        });
    };
        
    qDms.UploadStoredFiles = function () {
        if (!ro) {
            qDms.uploader.uploadStoredFiles();            
        }
    };

    qDms.HendlujClickObrisi = function ($el) {
        //if (!ro)
        //    $(this).parent().parent().animate({ height: 52 });
        //return false;

        if (ro) return false;
        
        var $dmsFajl = $el.parent().parent();

        var html = '<div>\
                        <div>' + qKonverzija.VratiLokalizovaniTekst('Unesite razlog brisanja dokumenta') + ':</div>\
                        <div class="unosRed">\
                            <div class="unosRedVr" style="width: 90%; margin-left: 5%; margin-right: 5%;"><input class="myInput" style="width: 100%;" id="dmsRazlogBrisanja"/></div>\
                        </div>\
                    </div>';
        
        PrikaziProzor2(true, true, qKonverzija.VratiLokalizovaniTekst('BRISANJE DOKUMENTA'), html, 'difolt', [
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Obriši'),
                callback: function () {
                    var $razlogBrisanja = $('#dmsRazlogBrisanja');
                    var razlogBrisanja = $razlogBrisanja.val().trimnull();
                    if (razlogBrisanja == undefined) {
                        qUtils.BlinkiBGColorElementa($razlogBrisanja, 'red', null, 'white');
                        $razlogBrisanja.focus();
                        return;
                    }
                    
                    HendlujFileDel($dmsFajl, razlogBrisanja);
                    PrikaziProzor2(false);
                }
            },
            {
                labela: qKonverzija.VratiLokalizovaniTekst('Zatvori'),
                callback: function () {
                    PrikaziProzor2(false);
                }
            }
        ]);
        

    };

    qDms.PrikaziDmsDijalog = function (dmsVm, readOnly) {
        /// <summary>dms - Prikazuje DMS dijalog</summary>
        /// <param name="dmsVm" type="">DMSViewModel</param>
        /// <param name="readOnly" type="">ukljuci read only mod - sklanja se levi upload panel, ostaje samo desni za pregled</param>
        $('#dmsPorukaZaZoom').hide();
        $('#dmsWrap').show();
        $('#dmsLinkoviWrap').hide();
        
        $('#dmsWrap').find('iframe').remove();
        $('#dmsWrap').find('#dmsImg').remove();
        $('#dmsWrap').find('#dmsTxtWrap').remove();
        $('#dmsWrap').find('#dmsPdfWrap').remove();

        nfiles = 0;
        qDms.vm = dmsVm;
        qDms.InitUploader();
        qDms.InitUI(readOnly);
    };

    qDms.HendlujPostaviKliknutFajl = function () {
        var $this = $(this);
        if ($this.hasClass('kliknut')) return;

        $.ajax({
            type: 'POST',
            url: qDms.url_SnimiAktivnostPredmeta,
            data: {
                idPredmeta: qDms.vm.IdPredmeta,
                naziv: $this.find('.red:eq(0) span').text().trimnull()
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }
            },
            complete: function() {
            }
        });
        
        var slika = $this.attr('data-slika');
        var ekstenzija = $this.attr('data-ext');

        //var urlDmsa = $this.find('.red:eq(1)').find('a:eq(1)').attr('href');
        // putanja: [host]/Content/...
        var link = $this.attr('data-link').trimnull();  // urlDmsa

        // putanja: /Content/...
        var linkZaPrikazSlike = $this.attr('data-linkSlike').trimnull(); 

        var $dmsDesno = $('#dmsWrap').find('#dmsDesno');

        //izbrisi postojeci i dodaj novi iframe (uvek inicijalizacija)
        $dmsDesno.find('iframe').remove();
        $dmsDesno.find('#dmsTxtWrap').remove();
        $dmsDesno.find('#dmsPdfWrap').remove();
        $dmsDesno.find('#dmsImg').remove();
        
        var $porukaZoomWrap = $dmsDesno.find('#dmsPorukaZaZoom');

        $porukaZoomWrap.hide();
        $('#dmsLinkoviWrap').hide();

        $('.dmsFile').removeClass('kliknut');
        $this.addClass('kliknut');

        if (link == undefined) {
            $.ajax({
                type: 'GET',
                url: qDms.url_VratiLinkDokumentaPredmeta,
                data: {
                    idPredmeta: qDms.vm.IdPredmeta,
                    idDokumenta: $this.attr('data-id')
                },
                success: function (data) {
                    if (data.Greska) {
                        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                        return;
                    }
                    
                    linkZaPrikazSlike = data.Data;

                    if (linkZaPrikazSlike == undefined) {
                        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Fajl je obrisan.'), 'greska');
                        return;
                    }

                    if (linkZaPrikazSlike.startsWith('/')) {
                        link = window.location.origin + linkZaPrikazSlike;
                    } else {
                        link = window.location.origin + '/' + linkZaPrikazSlike;
                    }

                    $this.attr('data-link', link);
                    $this.attr('data-linkSlike', linkZaPrikazSlike);                   

                    var htmlForGoogleView = "";

                    $('#dmsLinkoviWrap').find('a.link').attr('href', link);

                    if (slika === "true") {
                        //ovaj deo je dobar
                        $('#dmsLinkoviWrap').find('a.pregledaj').hide();
                        var dmsImgHtml1 = '<img id="dmsImg" src="' + linkZaPrikazSlike + '"/>';
                        $('#dmsDesnoDonjiRed').before(dmsImgHtml1);
                        wheelzoom(document.querySelector('img#dmsImg'));
                        $porukaZoomWrap.show();
                    } else {
                        $porukaZoomWrap.hide();
                        if (ekstenzija == "txt") {
                            // div
                            var dmsTxtWrap1 = '<div id="dmsTxtWrap" style="height: 100%"><object type="text/plain" data="' + link + '" border="0" style="width: 100%; height: 100%;"></object></div>';
                            $('#dmsDesnoDonjiRed').before(dmsTxtWrap1);
                        } else if (ekstenzija == "pdf") {
                            // dmsPdfWrap
                            var dmsPdfWrap1 = '<div id="dmsPdfWrap" style="height: 100%"></div>';
                            $('#dmsDesnoDonjiRed').before(dmsPdfWrap1);

                            var pdfParams1 = {
                                url: link,
                                pdfOpenParams: { view: "FitV" }
                            };

                            var pdfObject1 = new PDFObject(pdfParams1);

                            pdfObject1.embed("dmsPdfWrap");

                        } else {
                            //iframe
                            htmlForGoogleView = "https://docs.google.com/gview?url=" + link + "&embedded=true";

                            var frameHtml1 = '<iframe frameborder="0" src=' + htmlForGoogleView + '></iframe>';
                            $('#dmsDesnoDonjiRed').before(frameHtml1);
                        }

                        $('#dmsLinkoviWrap').find('a.pregledaj').attr('href', 'https://docs.google.com/viewer?url=' + link);
                        $('#dmsLinkoviWrap').find('a.pregledaj').show();
                    }

                    $('#dmsLinkoviWrap').show();
                    $dmsDesno.show();
                },
                complete: function() {
                }
            });
        } else {
            $('#dmsLinkoviWrap').find('a.link').attr('href', link);

            var htmlForGoogleView = "";

            if (slika === "true") {
                $('#dmsLinkoviWrap').find('a.pregledaj').hide();
                var dmsImgHtml = '<img id="dmsImg" src="' + linkZaPrikazSlike + '"/>';
                $('#dmsDesnoDonjiRed').before(dmsImgHtml);
                wheelzoom(document.querySelector('img#dmsImg'));
                $porukaZoomWrap.show();
            } else {
                $porukaZoomWrap.hide();

                //htmlForGoogleView = "https://docs.google.com/gview?url=" + urlDmsa + "&embedded=true";
                if (ekstenzija == "txt") {
                    // div
                    var dmsTxtWrap = '<div id="dmsTxtWrap" style="height: 100%"><object type="text/plain" data="' + link + '" border="0" style="width: 100%; height: 100%;"></object></div>';
                    $('#dmsDesnoDonjiRed').before(dmsTxtWrap);
                } else if (ekstenzija == "pdf") {
                    // dmsPdfWrap
                    var dmsPdfWrap = '<div id="dmsPdfWrap" style="height: 100%"></div>';
                    $('#dmsDesnoDonjiRed').before(dmsPdfWrap);

                    var pdfParams = {
                        url: link,
                        pdfOpenParams: { view: "FitV" }
                    };

                    var pdfObject = new PDFObject(pdfParams);

                    pdfObject.embed("dmsPdfWrap");

                } else {
                    //iframe
                    htmlForGoogleView = "https://docs.google.com/gview?url=" + link + "&embedded=true";

                    var frameHtml = '<iframe frameborder="0" src=' + htmlForGoogleView + '></iframe>';
                    $('#dmsDesnoDonjiRed').before(frameHtml);
                }
                
                $('#dmsLinkoviWrap').find('a.pregledaj').attr('href', 'https://docs.google.com/viewer?url=' + link);
                $('#dmsLinkoviWrap').find('a.pregledaj').show();
            }
            
            $('#dmsLinkoviWrap').show();
            $dmsDesno.show();
        }
    };

    qDms.HendlujPrikazFajlaPrekoCursora = function (goreLevo) {
        var $tekuciFajl = $('#dmsWrap').find('#dmsFilesWrap').find('.kliknut');
        
        var ukupanBroj = $('#dmsWrap').find('#dmsFilesWrap').find('.dmsFile').length;

        if (ukupanBroj > 0) {
            if ($tekuciFajl && $tekuciFajl.length > 0) {
                var indexFajla = $tekuciFajl.index();
                // ako je cursor levo ili gore onda treba ucitati prethodni fajl u suprotnom sledeci
                if (goreLevo) {
                    if (indexFajla > 0) {
                        var indexGore = indexFajla - 1;
                        $('#dmsWrap').find('#dmsFilesWrap').find('.dmsFile:eq(' + indexGore + ')').click();
                    } else {
                        return;
                    }
                } else {
                    if (indexFajla != ukupanBroj - 1) {
                        var indexDole = indexFajla + 1;
                        $('#dmsWrap').find('#dmsFilesWrap').find('.dmsFile:eq(' + indexDole + ')').click();
                    } else {
                        return;
                    }
                }
            } else {
                $('#dmsWrap').find('#dmsFilesWrap').find('.dmsFile:eq(0)').click();
            }
        }
        
    };

}(window.qDms = window.qDms || {}, jQuery));
