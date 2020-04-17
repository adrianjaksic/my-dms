/// <reference path="pisarnica.konverzija.js" />
/// <reference path="jquery-1.7.2-vsdoc.js" />
/// <reference path="quinta.putanje.js" />
/// <reference path="jquery.ba-hashchange.min.js" />
/// <reference path="signals.js" />
/// <reference path="quinta.pretrage.js" />

// event sistem - pretrage
var sigPretrage = {
    izabranArtikal: new signals.Signal(),
    izabranKomitent: new signals.Signal(),
    izabranaStavka: new signals.Signal(),
    izabranDokumentPrethodni: new signals.Signal(),
    izabranDokumentKnjizenjePoSablonu: new signals.Signal(),
    izabranDokumentKopiranje: new signals.Signal(),
    izabranNalog: new signals.Signal(),
    izabranoOsnovnoSredstvo: new signals.Signal(),
    izabranNormativ: new signals.Signal(),
    izabranZaposleni: new signals.Signal(),
    izabranaObrada: new signals.Signal(),
    izabranInventar: new signals.Signal(),
    izabranaOprema: new signals.Signal(),
    izabranUgovor: new signals.Signal()
};

// event sistem - pager
var sigPager = {
    kliknutBroj: new signals.Signal()
};

// event sistem - pitanja
var sigPitanja = {
    potOtkPitanje: new signals.Signal(),
    triPitanje: new signals.Signal()
};
var sigPitanjaObjekat = {
    odgovor: false,
    objekat: new Object()
    // ...
};

// event sistem - raspodela po kljucu
var sigRPK = {
    raspodeljeno: new signals.Signal()
};

// event sistem - DMS
var sigDMS = {
    zatvoren: new signals.Signal()
};

// event sistem - Popup prozori
var sigPopup = {
    kliknutOverlej: new signals.Signal()
};

// event sistem - dijalog za knjige sa opsteg i knjizenja po sablonu
var sigDijalogKnjiga = {
    // TODO
    //otvorenDijalog: new signals.Signal(),
    zatvorenDijalog: new signals.Signal()
};

// event sistem - skrol tabele
var sigScrollTable = {
    resize: new signals.Signal()
};

// tipovi prozora
var tipoviProzora = {
    difolt: { boja: '#EEE', dugmad: 'prozDugmad1' },
    pitanje: { boja: '#FCF8E3', dugmad: 'prozDugmad2' },
    pitanje3: { boja: '#FCF8E3', dugmad: 'prozDugmad3' },
    upozorenje: { boja: '#FCF8E3', dugmad: 'prozDugmad1' },
    greska: { boja: '#F2DEDE', dugmad: 'prozDugmad1' },
    ucitavanje: { boja: '#EEE', dugmad: 'prozDugmadBez' },
    fiskal: { boja: '#EEE', dugmad: 'prozDugmad4' }
};

// id helpa
var idHelpa = undefined;
var idHelpaOznaka = undefined;

// podesavanja za bank acc widget
var _qui_bacc_dbsettings;

// glavni loader
var $viewLoader;


// ------------------------------------
// LOKALIZACIJA
// ------------------------------------

var getLang = function (key, values) {
    var ret;
    if (window._lang && window._lang.hasOwnProperty(key)) {
        ret = window._lang[key];
    } else {
        return key;
    }

    if (values) {
        return stringInject(ret, values);
    } else {
        return ret;
    }
};

function stringInject(sSource, aValues) {
    var i = 0;

    if (aValues && aValues.length) {
        return sSource.replace(/\{\d+\}/g, function (substr) {
            var sValue = aValues[i];

            if (sValue) {
                i += 1;
                return sValue;
            } else {
                return substr;
            }
        });
    }

    return sSource;
};


$(document).ready(function () {
    //TODO - VRATITI OVO KAD SE NADJE GRESKA U WIDGETIMA!!
    //if ($.browser.msie) { _toggleAllAnimations(); }

    if (window.screen.width < 1260) {
        $('body').css('overflow-x', 'scroll');
        $('#preHeder').css('width', '1260px');
        $('#phExpander').parent().css('width', '1260px');
    }
    
    $viewLoader = $('#loader');
    
    $.ajaxSetup({
        cache: false,
        data: {
            _idf: $('#_idf').text()
        }
    });

    $(document).ajaxError(function (e, xhr, set, err) {
        // istekla sesija
        if (xhr.status == 901) {
            PrikaziProzor(false);
            window.location = _pathApp + "Account/Index?SessionExpired";
        }
        // ulogovana druga firma
        if (xhr.status == 902) {
            PrikaziProzor(false);
            window.location = _pathApp + "#promenjenaFirma";
        }
        // korisnicka prava
        if (xhr.status == 903) {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Nemate prava da pristupite ovoj transakciji!'), 'greska');
        }
        // nehendlovan ex na serveru
        if (xhr.status == 500) {
            var restxt = '';
            if (xhr.responseText) {
                try {
                    restxt = $.parseJSON(xhr.responseText);
                    restxt = restxt.ErrorMessage;
                } catch (e) {
                    restxt = 'Greška na serveru.';
                }
            }
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), qKonverzija.VratiLokalizovaniTekst('Pokušajte ponovo. ') + '<span>' + qKonverzija.VratiLokalizovaniTekst(restxt) + '</span>', 'greska');
        }
    });

    $.fn.getCursorPosition = function () {
        var input = this.get(0);
        if (!input) {
            return;
        } // No (input) element found
        if ('selectionStart' in input) {
            // Standard-compliant browsers
            return input.selectionStart;
        } else if (document.selection) {
            // IE
            input.focus();
            var sel = document.selection.createRange();
            var selLen = document.selection.createRange().text.length;
            sel.moveStart('character', -input.value.length);
            return sel.text.length - selLen;
        }
    };
    $.ctrlklik = function (selector, keyCode, callback, args) {
        $(selector).keydown(function (e) {
            if (!args) args = []; // IE barks when args is null 
            if (e.keyCode == keyCode && e.ctrlKey) {
                callback.apply(this, args);
                return false;
            }
        });
    };

    // stopira da backspace radi BrowserBack
    // binduje F1, F2 i F3
    $(document).on('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD')) || d.tagName.toUpperCase() === 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        if (event.keyCode === 112){
            doPrevent = true;
            $('#divVelikaPomoc').click();
        }

        if (event.keyCode === 113){
            doPrevent = true;
            $('#divQuickHelp').click();
        }
        
        if (event.keyCode === 114){
            doPrevent = true;
            qHightLight.Toggle();
        }

        if (doPrevent) {
            event.preventDefault();
        }
    });
    
    // omogucava direktno linkovanje
    if (location.hash != "" && location.hash != "#promenjenaFirma") {
        qUI.HandleHashChange(location.hash);
    }

    $(window).hashchange(function () {
        qUI.HandleHashChange();
    });

    // klik na dugme u hederu
    // dodaje i oduzima klase, popunjava nav poljima
    //$('.hederMeniDugme').live('click', function () {
    //$('#hederMeni').on('click', '.drugiNivoMenuBarLink', function (e) {
    //    if ($('#hederMeniDugmePodesavanja').hasClass('hederMeniDugmePodesavanjaHover')) {
    //        $('#hederMeniDugmePodesavanja').removeClass('hederMeniDugmePodesavanjaHover');
    //    }
        
    //    if ($('#hederMeniDugmeHelp').hasClass('hederMeniDugmeHelpHover')) {
    //        $('#hederMeniDugmeHelp').removeClass('hederMeniDugmeHelpHover');
    //    }

        
    //    e.preventDefault();
    //    var $this = $(this);
    //    if ($this.hasClass('meniDugmeKliknuto')) return;
        
    //    $('.drugiNivoMenuBarLink').removeClass('meniDugmeKliknuto');
    //    $('.drugiNivoMenuBarLink').removeClass('drugiNivoMenuBarLinkKliknut');
        
    //    var url = $this.attr('data-url');
        
    //    $this.addClass('meniDugmeKliknuto');
    //    $this.addClass('drugiNivoMenuBarLinkKliknut');
    //    qUI.direktanPristup = false;
        
    //    window.location.hash = url;
        
        
    //});

    $('#hederMeni').on('click', '.hederMeniDugme', function () {

        var $this = $(this);
        if ($this.hasClass('meniDugmeKliknuto')) return;
        
        $('.hederMeniDugme').removeClass('meniDugmeKliknuto');
        $('#hederMeniDugmePodesavanja').removeClass('hederMeniDugmePodesavanjaHover');
        $this.addClass('meniDugmeKliknuto');
        
        var url = $this.attr('data-url');
        
        qUI.direktanPristup = false;
        
        window.location.hash = url;
    });
    
    //#unosNovogPredmeta, #pretragaPredmeta, #izvestaji
    $('#unosNovogPredmeta, #pretragaPredmeta, #izvestaji, #sifarnici').click(function () {
        $('.hederMeniDugme').removeClass('meniDugmeKliknuto');
        var $this = $(this);

        var id = $this.attr('data-meni');

        $('#hederMeni').find('.meniWrap').hide();

        $(id).show();
        $(id).find('.hederMeniDugme:eq(0)').click();
    });

    $('.hederLogo').click(function () {
        
        //idi na sajt
        window.open('/Account/LogOn', '_blank');
    });

    $(document).on('change', '#welCBPrikazi', function () {
        var ch = $('#welCBPrikazi').prop('checked');
        $.ajax({
            url: 'Home/UpdatePrikazivanjaPrvihKoraka',
            data: { prikazi: ch }
        });
    });
    
    qUI.IzbaciMeniNaDirektanPristup();


    // ------------------------------------------------
    // prozori
    
    /* todo WINDOW HELP
    // jqwWindow za help

    $('#helpWindow').jqxWindow({
        showCollapseButton: true,
        maxHeight: 450, maxWidth: 820,
        minHeight: 200, minWidth: 200,
        height: 430, width: 820,
        animationType: 'fade',
        resizable: false,
        closeAnimationDuration: 1,
        theme: theme
    });
    $('#helpWindow').on('close', function() {
        $('#helpWindowContent').empty();
    }).on('click', '.jqx-window-close-button', function () { $('#helpWindow').hide(); });
    */

    // skriveni hendleri

    // tip 1 (difolt zatvori)
    $('#prozT1Zatvorii').keypress(function (event) {
        if (event.keyCode == 13) {
            $('#prozT1Zatvori').click();
            return false;
        }
    });



    // klik hendleri

    // tip 1 (difolt zatvori)
    $('#prozT1Zatvori').click(function () {
        if ($(this).find('table').hasClass('teloDugmeIskljuceno')) return;
        PrikaziProzor(false);
    });

    // tip 2 (pitanje potvrdi/otkazi)
    $('#prozT2Potvrdi').click(function () {
        if ($(this).find('table').hasClass('teloDugmeIskljuceno')) return;
        sigPitanja.potOtkPitanje.dispatch(true);
    });
    $('#prozT2Otkazi').click(function () {
        if ($(this).find('table').hasClass('teloDugmeIskljuceno')) return;
        sigPitanja.potOtkPitanje.dispatch(false);
    });
    
    // tip 3 (pitanje 1/2/3)
    $('#prozT31').click(function () {
        if ($(this).find('table').hasClass('teloDugmeIskljuceno')) return;
        sigPitanja.triPitanje.dispatch(1);
    });
    $('#prozT32').click(function () {
        if ($(this).find('table').hasClass('teloDugmeIskljuceno')) return;
        sigPitanja.triPitanje.dispatch(2);
    });
    $('#prozT33').click(function () {
        if ($(this).find('table').hasClass('teloDugmeIskljuceno')) return;
        sigPitanja.triPitanje.dispatch(3);
    });
    
    $('#mainPOFNotif').click(function () {
        location.hash = "./Poruke";
    });

    qLang.Init();

    /*
    Premešteno u callback od qUI.VratiFirmu() zbog... sira.

    qUI.ProveriPoruke();
    qUI.IntervalnoProveravajPoruke();*/

    $('#mainScroll').click(function () {
        _scrollTo('body');
    });
    $('#mainFullScr').click(function() {
        $('#main').addClass('ceoEkran');
        $(this).hide();
        $('#mainFullScrBack').show();
        $(window).resize(); //  stavljeno zbog StickyTableHeders plugina!
        sigScrollTable.resize.dispatch(); // stavljeno zbog scroll tabela
    });
    $('#mainFullScrBack').click(function () {
        $('#main').removeClass('ceoEkran');
        $(this).hide();
        $('#mainFullScr').show();
        $(window).resize(); //  stavljeno zbog StickyTableHeders plugina!
        sigScrollTable.resize.dispatch(); // stavljeno zbog scroll tabela
    });

    $('#mainWide').click(function() {
        $('body').addClass('wide');
        $(this).hide();
        $('#mainNoWide').show();
        $(window).resize(); //  stavljeno zbog StickyTableHeders plugina!
        sigScrollTable.resize.dispatch(); // stavljeno zbog scroll tabela
        qOmiljeneTrx.PozicionirajMeni();
    });
    $('#mainNoWide').click(function () {
        $('body').removeClass('wide');
        $(this).hide();
        $('#mainWide').show();
        $(window).resize(); //  stavljeno zbog StickyTableHeders plugina!
        sigScrollTable.resize.dispatch(); // stavljeno zbog scroll tabela
        qOmiljeneTrx.PozicionirajMeni();
    });

    //$(document).on('focus', 'input.jqx-combobox-input', function (e) {
    //    if ($(this).val().trim() == '-') $(this).val('');
    //});


    // ---------------------------------------
    // window resize

    // kodblok koji hendluje resize prozora
    var winResizeTimeOut = null;
    var onWinResize = function () {
        if (typeof (window.innerWidth) == 'number') {
            OnWinowResize();
        }
    };
    window.onresize = function () {
        if (winResizeTimeOut != null) clearTimeout(winResizeTimeOut);
        winResizeTimeOut = setTimeout(onWinResize, 300);
    };
    function OnWinowResize() {
        var contentSirina = $('#content').width();
        if (contentSirina < 1200 && qUI.navUmanjena == false) {
            $('#navUmanjivac').click();
        }
        if (contentSirina >= 1200 && qUI.navUmanjena == true) {
            $('#navUmanjivac').click();
        }
        // provera da li je prozor dovoljno velik za kompletan meni, ili skraceni meni
        var $nav = $('#navLevo');
        var wh = window.innerHeight;
        var isNekiCvorKliknut = $nav.find('.navMeniDugmeCvorKliknut').length ? true : false;
        if (wh < 610) {
            qUI.maliMeni = true;
            if (isNekiCvorKliknut && !qUI.navUmanjena)
                $('#navLevo').find('.navMeniDugmeCvor:not(.navMeniDugmeCvorKliknut)').hide();
        } else {
            qUI.maliMeni = false;
            if (isNekiCvorKliknut && !qUI.navUmanjena)
                $('#navLevo').find('.navMeniDugmeCvor:not(.navMeniDugmeCvorKliknut)').show();
        }
        
    }

    OnWinowResize();
    // ---------------------------------------

    $(document).on('mouseenter', '.qTdPopupPredmeti,.qTdPopupKomitenti,.qTdPopupDokumenti,.qTdPopupArtikli', function (e) {
        qUI.PopupMouseEnterTd($(this));
    });
    $(document).on('mouseleave', '.qTdPopupPredmeti,.qTdPopupKomitenti,.qTdPopupDokumenti,.qTdPopupArtikli', function (e) {
        qUI.PopupMouseLeaveTd($(this));
    });
    $(document).on('click', '.qTdPopupPredmeti,.qTdPopupKomitenti,.qTdPopupDokumenti,.qTdPopupArtikli', function (e) {
        qUI.PopupMouseClickTd($(this));
    });

    $(document).on('mouseenter', '#qHoverPopup', function (e) {
        qUI.PopupMouseEnterPopup();
    });
    $(document).on('mouseleave', '#qHoverPopup', function (e) {
        qUI.PopupMouseLeavePopup();
    });

    // ---------------------------------------

    // ---------Prikazivanje Skrivenog opisa

    $(document).on('mouseenter', '.qTdPopupOpis', function (e) {
        qUI.PopupMouseEnterOpis($(this));
    });
    $(document).on('mouseleave', '.qTdPopupOpis', function (e) {
        qUI.PopupMouseLeaveOpis($(this));
    });
    $(document).on('click', '.qTdPopupOpis', function (e) {
        qUI.PopupMouseClickOpis($(this));
    });

    $('#mainFeedback').click(function () {
        var methods = Feedback({
            h2cPath: 'Content/feedback/html2canvas.js',
            url: 'Poruke/PrihvatiFeedback',
            appendTo: null,

            header: 'Prijava greške',
            nextLabel: 'Sledeći korak',
            reviewLabel: 'Sledeći korak',
            sendLabel: 'Pošalji',
            closeLabel: 'Zatvori',

            messageSuccess: 'Prijava greške je uspela!',
            messageError: 'Nije uspela prijava greške. Molim pokušajte ponovo.'
        });
        methods.open();
    });


    $('#qHoverPopup,#qHoverPopupNapomena').on('click', '.qPopup_box img', function () {
        var $parent = $(this).parent();
        $parent.css({
            'position': 'fixed'
        }).hide();
        $(window).off('click');
    });
    
    $('#qHoverPopup,#qHoverPopupNapomena').on('click', 'a', function (e) {
        var tip = $(this).attr('data-tip');
        
        // 1 likovanje dokumenta na pregled dokumenta
        // 2 likovanje komitenata na analitika komitenta
        // 3 linkovanje naloga na pregled naloga
        if (tip == '1' || tip == '2' || tip == '3') {
            qUI.substringZaIzbacivanje = $(this).attr('data-mask');
        }
        // 4 DMS dokumenta
        if (tip == '4') {
            e.preventDefault();
            var iDdms = $(this).attr('data-iddms');
            $.ajax({
                type: 'GET',
                url: 'Knjizenje/VratiDMSDokument',
                data: {
                    idDms: iDdms
                },
                success: function (data) {
                    if (data.Greska) {
                        PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                        return;
                    }
                    qDms.PrikaziDmsDijalog(data.Data, true);
                }
            });
        }

        $('#qHoverPopup,#qHoverPopupNapomena').hide();
    });

    $('#qHoverPopupNapomena textarea').blur(function () {
        var idKom = $(this).attr('data-idKom');
        if (idKom) {
            var napomena = $(this).val().trim();
            if (napomena == '') {
                $('#dokZagIDKomitentaNapomena').attr('src', _pathImgB + 'comment.png');
            } else {
                $('#dokZagIDKomitentaNapomena').attr('src', _pathImgB + 'commentOrange.png');
            }
            $.ajax({
                url: 'Komitenti/SnimiNapomenuKomitenta',
                data: {
                    idKom: idKom,
                    napomena: napomena
                },
                type: 'POST'
            });
        }
    });

    $('#helpWindow').jqxWindow({
        showCollapseButton: true,
        maxHeight: 450, maxWidth: 820,
        minHeight: 200, minWidth: 200,
        height: 430, width: 820,
        animationType: 'fade',
        resizable: false,
        closeAnimationDuration: 1,
        theme: theme
    });
    $('#helpWindow').on('close', function () {
        $('#helpWindowContent').empty();
    }).on('click', '.jqx-window-close-button', function () { $('#helpWindow').hide(); });
    
    // ---------------------------------------
    // Master trx pretraga

    var meni, cvor, trx;
    var items = [];
    
    $('.hederMeniDugme').each(function () {
        var $trx = $(this);
        var url = $trx.attr('data-url');
        if (url && !url.contains('TransakcijaUIzradi')) {
            trx = $trx.attr('data-naziv').trim();
            items.push({
                label: trx,
                data: {
                    url: url,
                    idHelpa: $trx.attr('data-idHelpa'),
                    idHelpaOznaka: $trx.attr('data-oznaka')
                }
            });
        }
    });

    $('#trxSearch').quiComboBox({
        width: 450,
        showX: false,
        listHeight: 250,
        zIndex: 601,
        searchType: 'filter2',
        items: items,
        listWidth: 450
    });

    $('#trxSearch').on('select', function (e, item) {
        if (!item) return;
        log(item);
        location.hash = item.data.url;
        idHelpa = item.data.idHelpa;
        idHelpaOznaka = item.data.idHelpaOznaka;
        $('#prozOverlej').click();
        $('#trxSearch').quiComboBox('clearSelectionNoTrigger');
    });

    $.ctrlklik('body', 81, function () {
        qKeys.otvorenProzor = true;
        
        $('#prozOverlej,#trxSearch').show();
        $('#trxSearch').click().find('input').focus();

        $('body').on('keydown.trxKeyDown', function (e) {
            if (e.keyCode == 27) {
                $('#prozOverlej').click();
            }
        });

        $('#prozOverlej').on('click', function () {
            qKeys.otvorenProzor = false;
            $('#prozOverlej,#trxSearch').hide();
            $(this).off('click');
            $('body').off('keydown.trxKeyDown');
        });
    });

    // init highlighta
    qHightLight.Init();

    // provera verzije u localStorage
    qUI.ProveriLocalStorage();
    
    // init bank acc podesavanja
    _qui_bacc_dbsettings = $.parseJSON($('#qui_bacc_dbsettings').remove().text());
    
   
    //link za podrsku
    $('#mainTehnickaPodrskaLink').click(function(e) {
        e.preventDefault();
        var $tehPod = $('#mainTehnickaPodrskaClone').clone().removeAttr('id').show();
        $('#helpWindowContent').html($tehPod);
        var $helpWindow = $('#helpWindow');
        $helpWindow.jqxWindow({ position: 'center' });
        $helpWindow.jqxWindow('open');
        $helpWindow.focus();
    });
    
    qStampa.Init();

    $('.mainEBIcons').click(function() {
        if ($(this).attr('id') == 'mainEBPlay') {
            $('#mainEBPlay').hide();
            $('#mainEBPause').show();
            $('#eb').easyBackground({
                overlay: null,
                baseColor: 'transparent',
                colors: ["#444444", "#fe5815", "#ffffff"],
                baseSize: 20,
                numParticles: 50
            });
        } else {
            $('#mainEBPause').hide();
            $('#mainEBPlay').show();
            $('#eb').empty();
        }
    });
    
    // detalji
    $('#phExpander').click(function () {
        var $preHeder = $('#preHeder');
        if ($preHeder.is(':visible')) {
            $('#preHeder').slideUp();
            $('.preHederLine').animate({ top: '0px' }, 400);
        } else {
            $('#preHeder').slideDown();
            $('.preHederLine').animate({ top: '142px' }, 400);
        }
    });

    // prijava greske
    $('#main-feedback').click(function () {
        if ($(this).attr('data-jira') == "False") {
            PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('Greška'), qKonverzija.VratiLokalizovaniTekst('Prijava greške nije podešena, kontaktirajte proizvođača softvera.'), 'greska');
            return;
        }

        html2canvas($('body')[0]).then(function (canvas) {//$('#content')[0]
            var screenshot = canvas.toDataURL("image/png");

            var html = '<div>' + qKonverzija.VratiLokalizovaniTekst('Molimo Vas da ukratko opišete problem na koji ste naišli') + ':</div>\
                            <div id="mainFeedbackImageUrl" style="display: none;" data-url="' + screenshot + '"></div>\
                        <textarea rows="8" style="width: 400px; resize: none; height: 100px;" class="myInput" id="dmsPrijavaGreskeTextArea"></textarea>';

            PrikaziProzor2(true, true, qKonverzija.VratiLokalizovaniTekst('Prijava greške'), html, 'difolt', [
                {
                    labela: qKonverzija.VratiLokalizovaniTekst('Zatvori'),
                    callback: function () {
                        PrikaziProzor2(false);
                    }
                },
                {
                    labela: qKonverzija.VratiLokalizovaniTekst('Prijavi grešku'),
                    callback: function () {
                        var greska = $('#dmsPrijavaGreskeTextArea').val().trimnull();
                        if (greska == undefined) {
                            qUtils.BlinkiBGColorElementa($('#dmsPrijavaGreskeTextArea'), 'red', 1000, 'white');
                            return;
                        }

                        var url = window.location.href;
                        var screenshot = $('#mainFeedbackImageUrl').attr('data-url');

                        $viewLoader.show();

                        $.ajax({
                            type: 'POST',
                            url: $('#url_PrijaviGresku').text(),
                            data: {
                                url: url,
                                greska: greska,
                                slika: screenshot
                            },
                            success: function (data) {
                                if (data.Greska) {
                                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                                    return;
                                }

                                PrikaziProzor(false);
                            },
                            complete: function () {
                                $viewLoader.hide();
                            }
                        });
                    }
                }
            ], 450);

            $('#dmsPrijavaGreskeTextArea').select();
        });
    });
});

// doc.ready
// ---------------------------------------------------------------------------------------------------------------------
// funkcije

(function (qScriptLoader, $, undefined) {
    var _folderModula = 'JS/';

    qScriptLoader.aktivanModul = null;

    qScriptLoader.Load = function (url, noInit) {
        /// <summary>Ucitava JS modul ako nije vec ucitan i aktivira Init() funkciju</summary>
        /// <param name="url" type="">putanja do modula</param>
        /// <param name="noInit" type="">[OPCIONO] proslediti true za ucitavanje modula bez pokretanja Init() funkcije</param>
        
        var modul;
        try {
            modul = url.split('/').pop().split('.')[0];
        } catch (e) {
            console.error('Neispravna putanja: ' + url);
            qScriptLoader.aktivanModul = null;
            return;
        }
        var wModul = window[modul];
        if (wModul) {
            qScriptLoader.aktivanModul = modul;
            if (wModul.hasOwnProperty('Init') && !noInit) wModul.Init();
        } else {
            $.ajax({
                url: _folderModula + url,
                dataType: "script",
                success: function () {
                    wModul = window[modul];
                    if (wModul) {
                        qScriptLoader.aktivanModul = modul;
                        if (wModul.hasOwnProperty('Init') && !noInit) wModul.Init();
                    }
                },
                error: function () {
                    console.error('Neispravna putanja: ' + url);
                    qScriptLoader.aktivanModul = null;
                }
            });
        }
    };

}(window.qScriptLoader = window.qScriptLoader || {}, jQuery));



(function (qUI, $, undefined) {
    var viewsCache = {};
    
    // verzija vezana za tabele u dokumentima i izvestajima, kad se nesto menja povecava se broj da bi se cisto LocalStorage
    var verzijaTabela = 3;
    // timeout varijabla za popup prozorcice na hover misha
    var tdHoverTimeout;
    // timeout varijabla za popup prozorcice na hover misha
    var popupHoverTimeout;
    // double check za mouseleave event, pomocni flag za timeout
    var tdHoverFlag = false;

    function SkloniJqwOstatke() {
        /// <summary>ui - jqWidgeti apenduju podatke na body, tako da ova Fja čisti to djubre.</summary>
    
        var $nextAll = $('#jqwZaSklanjanje').nextAll();
        if ($nextAll.length > 0) {
            $nextAll.each(function () {
                var id = $(this).attr('id');
                if (id != undefined) {
                    if (! ((id.contains('pret')) || (id.contains('help'))) ) {
                        $(this).remove();
                    }
                } else {
                    $(this).remove();
                }
            });
        }
    }
    

    // prikazivati mali ili veliki meni
    qUI.maliMeni = false;
    // da li je nav umanjena il ne
    qUI.navUmanjena = false;
    // samo za prvo ucitavanje
    qUI.direktanPristup = true;
    // 
    qUI.izbaciMeni = true;
    // koristi se za pluploader plugin
    qUI.qFileUploader = {};
    // string koji se izbacuje iz hash-a pri direktom ucitavanju dokumenata sa ID
    qUI.substringZaIzbacivanje = undefined;

    qUI.PopupMouseEnterTd = function ($this) {
        /// <summary>ui - Hendluje mouseEnter dogadjaj na celiju tabele i prikazuje popup</summary>
        /// <param name="$this" type="">jQ objekat koji je ispod miša</param>

        //todo videti posle idKom, idArtikla i idDokArt obrisati ako se ne bude posle koristilo
        var idKom = $this.attr('data-id'),
            idKnjiz = $this.attr('data-idKnjiz'),
            idArtikla = $this.attr('data-idArtikla'),
            idDokumentaZaArtikal = $this.attr('data-idDokArt');

        var idPredmeta = $this.attr('data-idPredmeta');
        var idDok = $this.attr('data-idDok');
        var idPredmetaDokumenta = $this.attr('data-idPredDok');

        if (idPredmeta != undefined && idPredmeta != '0') {
            tdHoverFlag = true;
            tdHoverTimeout = setTimeout(function () {
                $.ajax({
                    url: 'Predmeti/VratiInfoOPredmetu',
                    data: {
                        idPredmeta: idPredmeta
                    },
                    success: function (data) {
                        PopuniPopupNaMouseenter($this, data);
                    }
                });
            }, 700);
        } else if (idDok && idDok != '0' && idPredmetaDokumenta && idPredmetaDokumenta != '0') {
            tdHoverFlag = true;
            tdHoverTimeout = setTimeout(function () {
                $.ajax({
                    url: 'Dms/VratiInfoODokumentu',
                    data: {
                        idPredmeta: idPredmetaDokumenta,
                        idDokumenta: idDok
                    },
                    success: function (data) {
                        PopuniPopupNaMouseenter($this, data);
                    }
                });
            }, 700);
        } else if (idKom != undefined && idKom != '0') {
            tdHoverFlag = true;
            tdHoverTimeout = setTimeout(function () {
                $.ajax({
                    url: 'Komitenti/VratiInfoOKomitentu',
                    data: {
                        idKom: idKom
                    },
                    success: function (data) {
                        PopuniPopupNaMouseenter($this, data);
                    }
                });
            }, 700);
        }  else if (idKnjiz && idKnjiz != '0') {
            tdHoverFlag = true;
            tdHoverTimeout = setTimeout(function () {
                $.ajax({
                    url: 'Knjizenje/VratiInfoOKnjizenju',
                    data: {
                        idKnjiz: idKnjiz
                    },
                    success: function (data) {
                        PopuniPopupNaMouseenter($this, data);
                    }
                });
            }, 700);
        } else if (idArtikla != undefined && idArtikla != '0') {
            tdHoverFlag = true;
            tdHoverTimeout = setTimeout(function () {
                $.ajax({
                    url: 'Dokumenti/VratiInfoOArtiklu',
                    data: {
                        idArtikla: idArtikla,
                        idDokumenta: idDokumentaZaArtikal != '0' ? idDokumentaZaArtikal : undefined
                    },
                    success: function (data) {
                        PopuniPopupNaMouseenter($this, data);
                    }
                });
            }, 700);
        }
    };
    
    function PopuniPopupNaMouseenter($this, data) {
        if (tdHoverFlag) {
            $('.qTdPopupHover').removeClass('qTdPopupHover');
            $this.addClass('qTdPopupHover');
            var el = $this.get(0);
            var position = el.getBoundingClientRect();
            var $hoverPopup = $('#qHoverPopup');
            $hoverPopup
                .css({
                    left: position.left + position.width
                    //'top': position.top + 'px'
                })
                .html(data)
                // premesteno ovde da bi se izracunala sredina
                .css({ top: position.top - $hoverPopup.height() / 2 + $this.height() / 2 })
                .slideDown(300);
            tdHoverFlag = false;
        }
    }

    qUI.PopupMouseLeaveTd = function ($this) {
        /// <summary>ui - Hendluje mouseLeave dogadjaj na celiju tabele, sklanja popup i resetuje timeout</summary>
        /// <param name="$this" type="">jQ objekat koji je ispod miša</param>

        tdHoverFlag = false;
        $this.removeClass('qTdPopupHover');
        clearTimeout(tdHoverTimeout);
        popupHoverTimeout = setTimeout(function() {
            $('#qHoverPopup').hide();
        }, 300);
    };
    
    qUI.PopupMouseClickTd = function ($this) {
        /// <summary>ui - Slusa click dogadjaj na celiju tabele i prekida sve, kao mouseOut...</summary>
        /// <param name="$this" type="">jQ objekat koji je ispod miša</param>

        qUI.PopupMouseLeaveTd($this);
    };


    qUI.PopupMouseEnterPopup = function() {
        clearTimeout(popupHoverTimeout);
    };
    qUI.PopupMouseLeavePopup = function () {
        $('#qHoverPopup').hide();
    };



    ////////////BOSJA - Prikazivanje opisa //////////////////////////////////////////////////////////////
    
    qUI.PopupMouseEnterOpis = function ($this) {
        /// <summary>ui - Hendluje mouseEnter dogadjaj na celiju tabele i prikazuje popup</summary>
        /// <param name="$this" type="">jQ objekat koji je ispod miša</param>

        var opis = $this.attr('data-opis');
      
            tdHoverTimeout = setTimeout(function () {
                $('.qTdPopupHover').removeClass('qTdPopupHover');
                $this.addClass('qTdPopupHover');
                var el = $this.get(0);
                var position = el.getBoundingClientRect();
                $('#qHoverPopup').css({
                    'left':position.left+position.width+'px',
                    'top':position.top+'px'
                });
                $('#qHoverPopup')
                    .html("<div style='margin: 20px;'>" + opis + "</div>")
                    .slideDown(300);
            }, 700);
        
    };

    qUI.PopupMouseLeaveOpis = function ($this) {
        /// <summary>ui - Hendluje mouseLeave dogadjaj na celiju tabele, sklanja popup i resetuje timeout</summary>
        /// <param name="$this" type="">jQ objekat koji je ispod miša</param>

        $this.removeClass('qTdPopupHover');
        clearTimeout(tdHoverTimeout);
        $('#qHoverPopup').hide();
    };
    
    qUI.PopupMouseClickOpis = function ($this) {
        /// <summary>ui - Slusa click dogadjaj na celiju tabele i prekida sve, kao mouseOut...</summary>
        /// <param name="$this" type="">jQ objekat koji je ispod miša</param>

        qUI.PopupMouseLeaveTd($this);
    };



    ////////////BOSJA - Prikazivanje opisa //////////////////////////////////////////////////////////////
    


    qUI.getOffset = function (el) {
        /// <summary>ui - Vraca koordinate elementa u odnosu na prozor</summary>
        /// <param name="el" type="">HTML element, NE JQUERY. Proselditi kao $(element).get(0).</param>
        /// <returns type="">{ top: ?, left: ? }</returns>
    
        var x = 0;
        var y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            x += el.offsetLeft - el.scrollLeft;
            y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: y, left: x };
    };
    
    qUI.UcitajView = function (url,novi) {
        /// <summary>ui - Učitava View za dat url</summary>
        /// <param name="url" type="string">url za view</param>
        /// <param name="novi" type="bool"></param>
        
        // ako bude bilo kakvih problema sa učitavanjem transakcija, zakomentarisati ovo:
        //if (viewsCache.hasOwnProperty(url) && !novi) {
        //    $('#main').html(viewsCache[url]);
        //    return;
        //}
        // 

        $viewLoader.show();
        $.ajax({
            url: url,
            data: {
                novi: novi
            },
            success: function (data) {
                $('#main').html(data);
                //viewsCache[url] = data;
            },
            error: function () {
                $('#main').empty();
            },
            complete: function () {
                //SkloniJqwOstatke();
                $viewLoader.hide();
            }
        });
    };

    qUI.UcitajViewNoviDokument = function(){
        /// <summary>ui - Specijalna verzija UcitajView funkcije koja se koristi kod Dokumenata. Učitava novi dokument i čisti hash.</summary>
        
        var oldHash = location.hash.substring(1);
        var newHash = location.hash.substring(1).split('&');
        newHash = newHash[0] + "&" + newHash[1];
        if (oldHash == newHash) {
            qUI.UcitajView(newHash);
        } else {
            location.hash = newHash;
        }
    };
    
    qUI.IzbaciMeniNaDirektanPristup = function() {
        /// <summary>ui - Izbacuje i selektuje dugme u meniju. Koristi se kod back i forward klikova, na direktan pristup i na refresh.</summary>
        var hash = location.hash.substring(1);
        if (hash == '') {
            $('.hederMeniDugme').removeClass('meniDugmeKliknuto');
            $('#hederMeniDugmePodesavanja').removeClass('hederMeniDugmePodesavanjaHover');
            return;
        }

        if (qUI.substringZaIzbacivanje) {
            hash = hash.replace(qUI.substringZaIzbacivanje, '');
            qUI.substringZaIzbacivanje = undefined;
        }

        if (hash.length > 0) {
            $('#hederMeni').find('.meniWrap').hide();
            $('.hederMeniDugme').removeClass('meniDugmeKliknuto');

            var urlSplit = hash.split('/');
            var url = urlSplit[1];
            if (urlSplit.length == 3) {
                // kada nije tipa Controller?tip nego Controller/Action
                url = urlSplit[1] + "/" + urlSplit[2];
            }
            var $dugme = $('#hederMeni').find('.hederMeniDugme[data-url="./' + url + '"]');

            if ($dugme.length > 0) {
                $dugme.parent().show();
            }

            $dugme.addClass('meniDugmeKliknuto');
        }
        
        qUI.SetujNaslovNaTabuBrowsera();
    };
    
    qUI.HandleHashChange = function (hash) {
        /// <summary>ui - Hendler promene heša. Poziva UcitajView i IzbaciMeniNaDirektanPristup po potrebi.</summary>
        /// <param name="hash" type="string">Opciono se može proselditi heš koji da učita.</param>

        // SKLONI SVE PRECICE IZ KEYS NAMESPACE
        qKeys.SkloniSveEventove();

        $(document).off('keydown.dms');
        
        $(window).off('resize.slickgrid');

        if ($('.slick-columnpicker').length > 0) {
            $('.slick-columnpicker').remove();
        }

        $(window).off('click.columnpicker');

        $('#helpWindow').hide();
        $('#helpWindowContent').empty();
        
        if (hash != undefined) {
            qUI.UcitajView(hash.substring(1));
        } else {
            if (location.hash.trim() == "" || location.hash == undefined) {
                $('#main').html($('#logotip').clone());
                SkloniJqwOstatke();
                //$('#hederMeni .hederMeniDugme').removeClass('meniDugmeKliknuto');
                //$('#navLevo .navMeniDugme').hide();
            }
            else {
                qUI.UcitajView(location.hash.substring(1));
            }
        }

        if (qUI.izbaciMeni){
            qUI.IzbaciMeniNaDirektanPristup();
        } else{
            qUI.izbaciMeni = true;
            if (location.hash.trim() == '') {
                $('.hederMeniDugme').removeClass('meniDugmeKliknuto');
                $('#hederMeniDugmePodesavanja').removeClass('hederMeniDugmePodesavanjaHover');
                return;
            }
        }
    };

    qUI.SetujNaslovNaTabuBrowsera = function (naslov) {

        if (!naslov) {
            var text = $('.drugiNivoMenuBarLink.drugiNivoMenuBarLinkKliknut:first').text();
            if (!text) {
                text = 'Sistem za evidenciju predmeta';
            }
            document.title = text;
        } else{
            document.title = naslov;
        }
    };

    qUI.ProveriLocalStorage = function() {
        var ver = $.totalStorage('_v1'); // verzija tabela
        if (!ver || ver != verzijaTabela) {
            window.localStorage.clear();
            $.totalStorage('_v1', verzijaTabela);
        }
    };
    
}(window.qUI = window.qUI || {}, jQuery));



(function (qScrollTabela, $, undefined) {
    var _to = 150;

    qScrollTabela.InitSort = function(idTabele, idTBody) {
        //keshiraj tabelu, skloni eventove, skloni jQuery.Data iz hedera tabele, skloni klase i strelice
        var $table = $(idTabele);
        $table.off('click', '.qTabelaHeadTd');
        $table.off('aftertablesort');
        $table.find('.qTabelaHeadTd').removeData().removeClass('sorting-asc sorting-desc sort-active').find(".sort-arrow").remove();
        //inicijalizuj sorter
        $table.stupidtable({
            //sortira nas format datuma, npr: 24.2.2012.
            date: function (a, b) {
                if (a == "") {
                    if (b == "") {
                        return 0;
                    } else {
                        return -1;
                    }
                }else if (b == "") {
                    return 1;
                }
                var aDate = qUtils.VratiDateIzFormatiranogDatuma(a).getTime();
                var bDate = qUtils.VratiDateIzFormatiranogDatuma(b).getTime();
                return aDate - bDate;
            }
        }, { tbody: idTBody });
        //inicijalizuj event 'nakon sortiranja'
        $table.on("aftertablesort", function(event, data) {
            //uzmi sve hedere, skloni klase i strelice
            var th = $(this).find(".qTabelaHeadTd");
            th.removeClass('sort-active').find(".sort-arrow").remove();
            //uzmi direction i odredi koji je, dodaj SPAN sa strelicom na kraj texta u hederu kliknute kolone
            var dir = $.fn.stupidtable.dir;
            var arrow = data.direction === dir.ASC ? "&and;" : "&or;";
            th.eq(data.column).addClass('sort-active').append('<span class="sort-arrow"> ' + arrow + '</span>');
            //uzmi tbody (ne mora, moze i preko $(this).find('tbody')...)
            //nadji po klasi stare sortirane TD i skloni aktivnu klasu
            //nadji po rednom broju kolone nove sortirane TD i dodaj klasu da su aktivni
            var $tbody = $(idTBody);
            $tbody.find('.sort-active-column').removeClass('sort-active-column');
            $tbody.find('td:nth-child(' + (data.column + 1) + ')').addClass('sort-active-column');
        });
    };

    qScrollTabela.KlonirajHead = function (idOrigTabele, idKlonTabele, initSort, idOrigTabeleTBody, listenResizeSignal) {
        /// <summary></summary>
        /// <param name="idOrigTabele" type="">[string] #Id originalne tabele</param>
        /// <param name="idKlonTabele" type="">[string] #Id tabele gde ce se smestiti klon</param>
        /// <param name="initSort" type="">[bool] da li se inicijalizuje sortiranje</param>
        /// <param name="idOrigTabeleTBody" type="">[string] #Id tbody originalne tabele</param>
        /// <param name="listenResizeSignal" type="">[bool] da li da se slusa resize signal</param>

        setTimeout(function () {
            // kesiranje klonova i originala
            var $tabelaOrig = $(idOrigTabele);
            var $headOrig = $tabelaOrig.find('thead');
            var $headKlon = $headOrig.clone();
            // podesavanje sirina celija hedera
            var $headKlonTds = $headKlon.find('td');
            $headOrig.find('td').each(function (i) {
                $headKlonTds.eq(i).width($(this).width());
            });
            // ubacivanje
            $(idKlonTabele).find('thead').remove().end().prepend($headKlon); // ako je slucajno thead vec tu
            // inicijalizacija sortiranja
            if (initSort) {
                qScrollTabela.InitSort(idKlonTabele, idOrigTabeleTBody);
            }
            // inicijalizacija slusanje fullsceen signala signala
            if (listenResizeSignal) {
                sigScrollTable.resize.removeAll();
                sigScrollTable.resize.add(function () {
                    qScrollTabela.PodesiSirineHead(idOrigTabele, idKlonTabele);
                });
            }
        }, _to);

    };

    qScrollTabela.PodesiSirineHead = function (idOrigTabele, idKlonTabele) {
        /// <summary></summary>
        /// <param name="idOrigTabele" type="">[string] #Id originalne tabele</param>
        /// <param name="idKlonTabele" type="">[string] #Id klonirane tabele</param>

        var $headKlonTds = $(idKlonTabele).find('thead td');
        $(idOrigTabele).find('thead td').each(function (i) {
            $headKlonTds.eq(i).width($(this).width());
        });
    };

    qScrollTabela.KlonirajTotal = function (idOrigTotalTBody, idKlonTabele, listenResizeSignal) {
        /// <summary></summary>
        /// <param name="idOrigTotalTBody" type="">[string] #Id tbody originalne tabele</param>
        /// <param name="idKlonTabele" type="">[string] #Id tabele gde ce se smestiti klon</param>
        /// <param name="listenResizeSignal" type="">[bool] da li da se slusa resize signal</param>

        setTimeout(function() {
            // kesiranje klonova i originala
            var $totalOrig = $(idOrigTotalTBody);
            var $totalKlon = $totalOrig.clone().removeAttr('id');
            // podesavanje sirina celija totala
            var $totalKlonTds = $totalKlon.find('td');
            $totalOrig.find('td').each(function(i) {
                $totalKlonTds.eq(i).width($(this).width()).removeAttr('id');
            });
            // ubacivanje
            $(idKlonTabele).html($totalKlon);
            // inicijalizacija slusanje fullsceen signala signala
            if (listenResizeSignal) {
                sigScrollTable.resize.add(function() {
                    qScrollTabela.PodesiSirineTotal(idOrigTotalTBody, idKlonTabele);
                });
            }
        }, _to);
    };

    qScrollTabela.PodesiSirineTotal = function (idOrigTotalTBody, idKlonTabele) {
        /// <summary></summary>
        /// <param name="idOrigTotalTBody" type="">[string] #Id tbody originalne tabele</param>
        /// <param name="idKlonTabele" type="">[string] #Id klonirane tabele</param>

        var $totalKlonTds = $(idKlonTabele).find('td');
        $(idOrigTotalTBody).find('td').each(function (i) {
            $totalKlonTds.eq(i).width($(this).width());
        });
    };

    qScrollTabela.KlonirajFilter = function (idOrigFilterTBody, idKlonTabele, idOrigTabeleTBody, onFilteredCallback) {
        /// <summary></summary>
        /// <param name="idOrigFilterTBody" type="">[string] #Id filter tbody originalne tabele</param>
        /// <param name="idKlonTabele" type="">[string] #Id tabele gde ce se smestiti klon</param>
        /// <param name="idOrigTabeleTBody" type="">[string] #Id tbody originalne tabele</param>
        /// <param name="onFilteredCallback" type="">[function] callback na 'filtered' dogadjaj</param>
        setTimeout(function() {
            // kesiranje klona
            var $filterKlon = $(idOrigFilterTBody).clone().removeAttr('id');
            // ubacivanje (podesavanje sirina nije potrebno jer se sirine prenose iz thead)
            $(idKlonTabele).find('tbody').remove().end().append($filterKlon); // ako je slucajno tbody vec tu
            // quifilter
            $filterKlon.quiTableFilter({ tbodyId: idOrigTabeleTBody });
            // callback na 'filtered' dogadjaj
            if (onFilteredCallback && typeof onFilteredCallback === 'function') {
                $filterKlon.on('filtered', onFilteredCallback);
            }
        }, _to + 10);
    };

    qScrollTabela.PodesiVisinuTabele = function(idScrollWrap, oduzimac) {
        /// <summary></summary>
        /// <param name="idScrollWrap" type="">[string] #Id skroll wrapa kojem se podesava visina</param>
        /// <param name="oduzimac" type="">[number] broj koji se oduzima, tj visina forme na strani...</param>
        
        $(idScrollWrap).css('max-height', window.innerHeight - oduzimac);
    };

}(window.qScrollTabela = window.qScrollTabela || {}, jQuery));



(function (qStampa, $, undefined) {
    qStampa.sirinaProzora = 550;

    //qStampa.VratiLiknoveZaStampu = function (data, bezExcela) {
    //    /// <summary>stampa - Pravi string linkova za stampu</summary>
    //    /// <param name="data" type="">data niz koji je dosao sa servera</param>
    //    /// <param name="bezExcela" type="">true / false - da li da se prikazu i liknovi ka Excel fajlovima</param>

    //    var linkPDF = '', linkXLS = '', link3 = '', linkImg = '', linkovi = '', bold;
    //    $.each(data, function (i, obj) {
    //        if (obj.Podrazumevana) {
    //            bold = 'style="font-weight:bold"';
    //        } else {
    //            bold = '';
    //        }
    //        linkImg = '<img class="prozStampaImg" src="' + _pathImg + 'printemail.png" alt="" title="Pošalji PDF na Email." /> - ';
    //        linkPDF = '<a ' + bold + ' href="Content/Pdf/' + obj.Link + '" target="_blank" >' + obj.Naziv + '.PDF</a>';
    //        if (!bezExcela) linkXLS = ' - <a download ' + bold + ' href="Content/Pdf/' + obj.Link.replace('.pdf', '.xls') + '" target="_blank" >XLS</a>';
    //        else linkXLS = '';
    //        if (obj.DownloadLink && obj.DownloadLinkName) link3 = ' - <a download ' + bold + ' href="Content/Pdf/' + obj.DownloadLink + '" target="_blank" >' + obj.DownloadLinkName + '</a>';
    //        linkovi += linkImg + linkPDF + linkXLS + link3 + '<br>';
    //    });
    //    return linkovi;
    //};
    
    qStampa.VratiLiknoveZaStampu = function (data, bezExcela) {
        /// <summary>stampa - Pravi string linkova za stampu</summary>
        /// <param name="data" type="">data niz koji je dosao sa servera</param>
        /// <param name="bezExcela" type="">true / false - da li da se prikazu i liknovi ka Excel fajlovima</param>

        var linkPDF = '', linkXLS = '', link3 = '', linkImg = '', linkovi, bold;
        linkovi = '<table class="prozStampaTable"><tbody>';
        $.each(data, function (i, obj) {
            linkovi += '<tr>';
            if (obj.Podrazumevana) {
                bold = 'style="font-weight:bold"';
            } else {
                bold = '';
            }
            linkImg = '<td><img class="prozStampaImg" src="' + _pathImg + 'printemail.png" alt="" title="' + qKonverzija.VratiLokalizovaniTekst('Pošalji PDF na Email') + '." data-nazivStampe="' + obj.Naziv + '" data-link="' + obj.Link + '"/></td>';
            linkPDF = '<td><a ' + bold + ' href="' + obj.Link + '" target="_blank" >' + obj.Naziv + '</a></td>';
            if (!bezExcela) linkXLS = '<td><a download ' + bold + ' href="' + obj.Link.replace('.pdf', '.xls') + '" target="_blank" >XLS</a></td>';
            else linkXLS = '<td></td>';
            //linkXLS = '<td></td>';
            //if (obj.DownloadLink && obj.DownloadLinkName) link3 = '<td><a download ' + bold + ' href="Content/Pdf/' + obj.DownloadLink + '" target="_blank" >' + obj.DownloadLinkName + '</a></td>';
            //else link3 = '<td></td>';
            //linkovi += linkImg + linkPDF + linkXLS + link3 + '</tr>';
            link3 = '<td></td>';
            linkovi += linkImg + linkPDF + linkXLS + link3 + '</tr>';
        });
        linkovi += '</tbody></table>';
        return linkovi;
    };

    qStampa.PrikaziDijalogStampe = function (url, dataObj, bezExcela, bezUcitavanje, getPost) {
        /// <summary>stampa - Ajaxuje ka serveru i prikazuje dijalog stampe.</summary>
        /// <param name="url" type="">url do metode stampe za transakciju</param>
        /// <param name="dataObj" type="">data objekat koji se salje serveru</param>
        /// <param name="bezExcela" type="">true / false - da li da se prikazu i liknovi ka Excel fajlovima</param>
        /// <param name="bezUcitavanje" type="">true / false - da li da se prikaze prozor za ucitavanje (false ako je vec prikazan, npr na dokumentima)</param>
        /// <param name="getPost" type="">'GET' ili 'POST' ('GET' je default)</param>
     
        if (!bezUcitavanje) PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Učitavanje štampi') + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');
        $.ajax({
            type: getPost || 'GET',
            url: url,
            data: dataObj,
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                } else {
                    if (data.Data && data.Data.length > 0) {
                        var linkovi = qStampa.VratiLiknoveZaStampu(data.Data, bezExcela);
                        PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Štampanje dokumenta:') + '<br><br>' + linkovi, 'difolt', null, qStampa.sirinaProzora);
                        $('#prozTelo .prozStampaTable').on('click', 'a', function () {
                            PrikaziProzor(false);
                        });
                    } else {
                        PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Ne postoje štampe za izabrani predmet.'), 'difolt');
                    }
                    
                }
            }
        });
    };
    
    //qStampa.VratiLiknoveZaStampuDokumenta = function(data, bezExcela) {
    //    /// <summary>stampa - Pravi string linkova za stampu dokumenta</summary>
    //    /// <param name="data" type="">data niz koji je dosao sa servera</param>
    //    /// <param name="bezExcela" type="">true / false - da li da se prikazu i liknovi ka Excel fajlovima</param>
        
    //    var linkPDF = '', linkXLS = '', link3 = '', linkovi = '', bold;
    //    $.each(data, function (i, obj) {
    //        if (obj.Podrazumevana) {
    //            bold = 'style="font-weight:bold"';
    //        } else {
    //            bold = '';
    //        }
    //        linkPDF = '<a ' + bold + ' href="Pdf/Dokument?idDok=' + obj.IdDokumenta + '&link=' + obj.Link + '" target="_blank" >' + obj.OpisStampe + '.PDF</a>';
    //        if (!bezExcela) linkXLS = ' - <a download ' + bold + ' href="Pdf/Dokument?idDok=' + obj.IdDokumenta + '&link=' + obj.Link.replace('.pdf', '.xls') + '" target="_blank" >XLS</a>';
    //        else linkXLS = '';
    //        if (obj.DownloadLink && obj.DownloadLinkName) link3 = ' - <a download ' + bold + ' href="Pdf/Dokument?idDok=' + obj.IdDokumenta + '&link=' + obj.DownloadLink + '" target="_blank" >' + obj.DownloadLinkName + '</a>';
    //        linkovi += linkPDF + linkXLS + link3 + '<br>';
    //    });
    //    return linkovi;
    //};
    
    qStampa.VratiLiknoveZaStampuDokumenta = function (data, bezExcela) {
        /// <summary>stampa - Pravi string linkova za stampu dokumenta</summary>
        /// <param name="data" type="">data niz koji je dosao sa servera</param>
        /// <param name="bezExcela" type="">true / false - da li da se prikazu i liknovi ka Excel fajlovima</param>

        var linkPDF = '', linkXLS = '', link3 = '', linkImg = '', linkovi, bold;
        linkovi = '<table class="prozStampaTable"><tbody>';
        $.each(data, function (i, obj) {
            linkovi += '<tr>';
            if (obj.Podrazumevana) {
                bold = 'style="font-weight:bold"';
            } else {
                bold = '';
            }
            linkImg = '<td><img class="prozStampaImg" src="' + _pathImg + 'printemail.png" alt="" title="Pošalji PDF na Email." data-nazivStampe="' + obj.OpisStampe + '" data-link="' + obj.Link + '"/></td>';
            linkPDF = '<td><a ' + bold + ' href="Pdf/Dokument?idDok=' + obj.IdDokumenta + '&link=' + obj.Link + '" target="_blank" >' + obj.OpisStampe + '.PDF</a></td>';
            if (!bezExcela) linkXLS = '<td><a download ' + bold + ' href="Pdf/Dokument?idDok=' + obj.IdDokumenta + '&link=' + obj.Link.replace('.pdf', '.xls') + '" target="_blank" >XLS</a></td>';
            else linkXLS = '<td></td>';
            if (obj.DownloadLink && obj.DownloadLinkName) link3 = '<td><a download ' + bold + ' href="Pdf/Dokument?idDok=' + obj.IdDokumenta + '&link=' + obj.DownloadLink + '" target="_blank" >' + obj.DownloadLinkName + '</a></td>';
            else link3 = '<td></td>';
            linkovi += linkImg + linkPDF + linkXLS + link3 + '</tr>';
        });
        linkovi += '</tbody></table>';
        return linkovi;
    };
    
    qStampa.PrikaziDijalogStampeDokumenta = function (url, dataObj, bezExcela, bezUcitavanje, getPost) {
        /// <summary>stampa - Ajaxuje ka serveru i prikazuje dijalog stampe.</summary>
        /// <param name="url" type="">url do metode stampe za transakciju</param>
        /// <param name="dataObj" type="">data objekat koji se salje serveru</param>
        /// <param name="bezExcela" type="">true / false - da li da se prikazu i liknovi ka Excel fajlovima</param>
        /// <param name="bezUcitavanje" type="">true / false - da li da se prikaze prozor za ucitavanje (false ako je vec prikazan, npr na dokumentima)</param>
        /// <param name="getPost" type="">'GET' ili 'POST' ('GET' je default)</param>

        if (!bezUcitavanje) PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), getLang('W_PROZOR_UCITAVANJE_STAMPI') + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');
        $.ajax({
            type: getPost || 'GET',
            url: url,
            data: dataObj,
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                } else {
                    var linkovi = qStampa.VratiLiknoveZaStampuDokumenta(data.Data, bezExcela);
                    PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), getLang('W_PROZOR_STAMPANJE_DOKUMENTA_BREAK') + linkovi, 'difolt', null, qStampa.sirinaProzora);
                }
            }
        });
    };


    function ZakaciSlanjeMaila() {
        var $img = $(this),
            $tr = $img.closest('tr'),
            $tbody = $tr.parent(),
            $table = $tbody.parent();
        $tbody.find('tr').hide();
        $tr.show();
        var $forma = $('<div class="prozStampaForm">\
                            <div class="unosRed">\
                                <div class="unosRedLbl_taL" style="width: 120px">' + qKonverzija.VratiLokalizovaniTekst('Kontakt email') + ':</div>\
                                <div class="unosRedVr"><input type="text" class="myInput prozStampaFormEmail" style="width: 300px"></div>\
                            </div>\
                            <div class="unosRed">\
                                <div class="unosRedLbl_taL" style="width: 120px">' + qKonverzija.VratiLokalizovaniTekst('Naslov email-a') + ':</div>\
                                <div class="unosRedVr"><input type="text" class="myInput prozStampaFormSubject" style="width: 300px"></div>\
                            </div>\
                            <div class="unosRed">\
                                <div class="unosRedLbl_taL" style="width: 120px">' + qKonverzija.VratiLokalizovaniTekst('Tekst email-a') + ':</div>\
                                <div class="unosRedVr"><textarea type="text" class="myInput myInputTAFix prozStampaFormText" style="width: 300px"></textarea></div>\
                            </div>\
                            <div class="unosRed">\
                                <div class="unosRedLbl_taL" style="width: 120px">' + qKonverzija.VratiLokalizovaniTekst('Odgovori na email') + ':</div>\
                                <div class="unosRedVr"><input type="text" class="myInput prozStampaFormReplyTo" style="width: 300px"></div>\
                            </div>\
                            <div class="unosRed clear">\
                                <div class="unosRedLbl_taR" style="width: 100%"><img src="'+_pathImg+'kockice_loaderB.gif" class="prozStampaFormLoader" alt="" /><a href="#" class="prozStampaFormSend">Pošalji</a> <a href="#" class="prozStampaFormCancel">Odustani</a></div>\
                            </div>\
                        </div>');
        var skloniFormu = function() {
            $forma.remove();
            $tbody.find('tr').show();
        };
        var $loader = $forma.find('.prozStampaFormLoader');
        $forma.find('.prozStampaFormCancel').click(function(e) {
            e.preventDefault();
            skloniFormu();
        });
        $forma.find('.prozStampaFormSend').click(function (e) {
            e.preventDefault();
            if ($loader.is(':visible')) return;
            var $email = $forma.find('.prozStampaFormEmail'),
                $subject = $forma.find('.prozStampaFormSubject'),
                $text = $forma.find('.prozStampaFormText'),
                $replyTo = $forma.find('.prozStampaFormReplyTo'),
                email = $email.val().trim(),
                subject = $subject.val().trim(),
                text = $text.val().trim(),
                replyTo = $replyTo.val().trim();
            if (!email) {
                qUtils.BlinkiBGColorElementa($email, 'red', null, 'white');
                $email.focus();
                return;
            }
            if (!subject) {
                qUtils.BlinkiBGColorElementa($subject, 'red', null, 'white');
                $subject.focus();
                return;
            }
            if (!replyTo) {
                qUtils.BlinkiBGColorElementa($replyTo, 'red', null, 'white');
                $replyTo.focus();
                return;
            }
            $loader.show();
            $.ajax({
                type: 'POST',
                url: $('#url_PosaljiStampuNaMail').text(),
                data: {
                    email: email,
                    subject: subject,
                    text: text,
                    file: $img.attr('data-link'),
                    replyTo: replyTo
                },
                success: function(data) {
                    if (data.Greska) {
                        alert(data.Poruka);
                        return;
                    }
                    skloniFormu();
                },
                complete: function() {
                    $loader.hide();
                }
            });
        });
        
        $table.nextAll().remove();
        $table.after($forma);
        $forma.find('.prozStampaFormText').val($img.attr('data-nazivStampe'));
        $forma.find('.prozStampaFormEmail').focus();
        $forma.find('.prozStampaFormReplyTo').val(nonull($('#mailKorisnikaZaSlanjeStampe').text()));
    };

    qStampa.Init = function() {
        $('#prozTelo').on('click', '.prozStampaImg', ZakaciSlanjeMaila);
    };

}(window.qStampa = window.qStampa || {}, jQuery));



(function (qLang, $, undefined) {

    var cookieKey = '_lang',
        cookieOpts = { expires: 365, path: '/' },
        lang;

    qLang.getLang = function() { return lang; };

    qLang.setLang = function(jezik, reload) {
        lang = jezik;
        
        $.cookie(cookieKey, lang, cookieOpts);
        if (reload)
            window.location.reload();
    };

    qLang.Init = function () {
    };

}(window.qLang = window.qLang || {}, jQuery));


// ------------------------------------------------
// prozori

function PrikaziProzor(prikaz, novi, naslov, poruka, tip, labeleDugmadi, sirina) {
    /// <summary>ui - Prikazuje NAŠ prozor modalni prozor, koristi se za obaveštenja, poruke, greške...</summary>
    /// <param name="prikaz" type="Boolean">Da li se prozor prikazuje ili sklanja. FALSE ne zahteva nijedan parametar posle.</param>
    /// <param name="novi" type="Boolean">Da li je novi (onda se animira) ili se koristi već postojeći, tj. menja se sadržaj.</param>
    /// <param name="naslov" type="String">Naslov prozora</param>
    /// <param name="poruka" type="String">HTML poruke prozora</param>
    /// <param name="tip" type="">Prosleđuej se tip prozora iz globalne var tipoviProzora. Ovaj parametar postavlja boju i dugmad.</param>
    /// <param name="labeleDugmadi" type="String">Opciono se mogu podesiti labele dugmadi. Ako je null/undefined, ide default vrednost određena tipom prozora. FORMAT JE "labela|labela|labela|...".</param>
    /// <param name="sirina" type="Number">Opciono se može podesiti širina prozora.</param>
    
    if (!prikaz){
        $('#prozOverlej').hide();
        $('#proz').animate({ 'top': '20%', 'opacity': '0' }, 300, 'swing', function () {
            $('#proz').hide();
            qKeys.otvorenProzor = false;
        });
        return;
    }
    qKeys.otvorenProzor = true;
    $('#prozNaslov').text(naslov);
    $('#prozTelo').html(poruka);
    $('#proz').css({
        'background-color': tipoviProzora[tip].boja
    });
    if(IsInt(sirina)){
        $('#proz').css({
            'width': sirina+'px',
            'margin-left': '-'+(sirina/2)+'px'
        });
    }else{
        $('#proz').css({
            'width': '',
            'margin-left': ''
        });
    }
    $('.prozDugmad > div').hide();
    var $dugmad = $('#' + tipoviProzora[tip].dugmad);
    
    if(labeleDugmadi){
        var labele = labeleDugmadi.toString().split('|');
        $dugmad.find('td').each(function(i){
            $(this).text(labele[i]);
        });
    } else{
        $dugmad.find('td').each(function(){
            var defLbl = $(this).attr('data-defaultLbl');
            if(defLbl != undefined){
                $(this).text(defLbl);
            }
        });
    }

    $dugmad.show();
    $('#prozOverlej').show();
    if (novi){
        $('#proz')
            .css({ 'opacity': '0', 'top': '20%', 'display': 'block' })
            .animate({ 'top': '40%', 'opacity': '1' }, 500, 'swing');
    }
    // fokus difoltnog dugmeta
    $('#' + tipoviProzora[tip].dugmad + ' > input').focus();
}

function PrikaziProzor2(prikaz, novi, naslov, poruka, tip, arrDugmadi, sirina) {
    /// <summary>ui - Prikazuje NAŠ prozor modalni prozor, koristi se za obaveštenja, poruke, greške...</summary>
    /// <param name="prikaz" type="Boolean">Da li se prozor prikazuje ili sklanja. FALSE ne zahteva nijedan parametar posle.</param>
    /// <param name="novi" type="Boolean">Da li je novi (onda se animira) ili se koristi već postojeći, tj. menja se sadržaj.</param>
    /// <param name="naslov" type="String">Naslov prozora</param>
    /// <param name="poruka" type="String">HTML poruke prozora</param>
    /// <param name="tip" type="String">Prosleđuej se tip prozora iz globalne var tipoviProzora. Ovaj parametar postavlja boju prozora.</param>
    /// <param name="arrDugmadi" type="Object">Objekat za postavljanje dugmadi, format [{ labela: 'ime_dugmeta', callback: function }, ...]. Biće postavljeno dugmadi koliko ima elemenata niza u sa imenom 'label' propertija i hendlerom klika iz 'callback' propertija.</param>
    /// <param name="sirina" type="Number">Opciono se može podesiti širina prozora.</param>
    var $proz = $('#proz');

    if (!prikaz) {
        $('#prozOverlej').hide();
        $proz.animate({ 'top': '20%', 'opacity': '0' }, 300, 'swing', function () {
            $proz.hide();
            qKeys.otvorenProzor = false;
        });
        return;
    }
    qKeys.otvorenProzor = true;
    $('#prozNaslov').text(naslov);
    $('#prozTelo').html(poruka);
    $proz.css({
        'background-color': tipoviProzora[tip].boja
    });
    if (IsInt(sirina)) {
        $proz.css({
            'width': sirina + 'px',
            'margin-left': '-' + (sirina / 2) + 'px'
        });
    } else {
        $proz.css({
            'width': '',
            'margin-left': ''
        });
    }
    $('.prozDugmad > div').hide();
    var $dugmad = $('#prozDugmadCustom').empty();

    for (var i = 0; i < arrDugmadi.length; i++) {
        var dugme = arrDugmadi[i];
        var $dugme = $('<div class="teloDugmeWrapUProzoru btnWauto">\
                            <table class="teloDugme">\
                                <tr>\
                                    <td>' + dugme.labela + '</td>\
                                </tr>\
                            </table>\
                        </div>');
        if (typeof dugme.callback === 'function') {
            $dugme.click(dugme.callback);
        } else {
            $dugme.click(function() {
                PrikaziProzor2(false);
            });
        }

        $dugmad.append($dugme);
    }

    $dugmad.show();
    $('#prozOverlej').show();
    if (novi) {
        $proz
            .css({ 'opacity': '0', 'top': '20%', 'display': 'block' })
            .animate({ 'top': '40%', 'opacity': '1' }, 500, 'swing');
    }

}





// ------------------------------------------------
// utils

(function (qUtils, $, undefined) {
    
    qUtils.IzvuciSkriveniDatumIzHTML = function (id){
        /// <summary>ui - Vraća JS Date koji je spakovan u skriveni div tag. Koristi se za setovanje datuma jqxDateTimeInputu.[Date / false]</summary>
        /// <param name="id" type="">Id html taga u obliku "#id"</param>
        /// <returns type="">Date / false</returns>
        
        var $tag = $(id);
        if($tag.length){
            var g = $tag.attr('data-g');
            var m = $tag.attr('data-m');
            var d = $tag.attr('data-d');
            if(g && m && d){
                return new Date(g, m, d);
            } else{
                return false;
            }
        } else{
            return false;
        }
    };
    
    qUtils.IzvuciSkriveniDatumSaVremenomIzHTML = function (id) {
        /// <summary>ui - Vraća JS Date sa vremenom koji je spakovan u skriveni div tag. Koristi se za setovanje datuma jqxDateTimeInputu.[Date / false]</summary>
        /// <param name="id" type="">Id html taga u obliku "#id"</param>
        /// <returns type="">Date / false</returns>

        var $tag = $(id);
        if ($tag.length) {
            var g = $tag.attr('data-g');
            var m = $tag.attr('data-m');
            var d = $tag.attr('data-d');
            var h = $tag.attr('data-h');
            var mm = $tag.attr('data-mm');
            var s = $tag.attr('data-s');
            if (g && m && d) {
                return new Date(g, m, d, h, mm, s);
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    qUtils.IzvuciDatumIzDataSaServera = function(datum, dodajIVreme){
        /// <summary>ui - Izvlači PARSIRAN datum (datum za prikaz) iz stringa koji je sa servera došao serijalizovan u Json. [formatiran Date]</summary>
        /// <param name="datum" type="">Json datum</param>
        /// <param name="dodajIVreme" type="">[opciono] da li treba u ispis dodati i vreme</param>
        /// <returns type="">formatiran Date</returns>

        if (!datum) return '';
        datum = datum.substring(6);
        datum = datum.substr(0, datum.length - 2);
        var parsiran = new Date(parseInt(datum)),
            d = parsiran.getDate(),
            m = parsiran.getMonth() + 1,
            g = parsiran.getFullYear();
        d = d < 10 ? '0' + d : d;
        m = m < 10 ? '0' + m : m;
        var ret = d + '.' + m + '.' + g + '.';

        if (dodajIVreme) {
            var sat = parsiran.getHours();
            if(sat < 10) sat = "0" + sat;
            var min = parsiran.getMinutes();
            if(min < 10) min = "0" + min;
            ret += ' - ' + sat + ':' + min;
        }

        return ret;
    };
    
    qUtils.IzvuciDatumIzDateObj = function (datum, dodajIVreme) {
        /// <summary>ui - Izvlači PARSIRAN datum (datum za prikaz) iz Date() objekta. [formatiran Date]</summary>
        /// <param name="datum" type="">Json datum</param>
        /// <param name="dodajIVreme" type="">[opciono] da li treba u ispis dodati i vreme</param>
        /// <returns type="">formatiran Date</returns>

        if (!datum) return '';
        var d = datum.getDate(),
            m = datum.getMonth() + 1,
            g = datum.getFullYear();
        d = d < 10 ? '0' + d : d;
        m = m < 10 ? '0' + m : m;
        var ret = d + '.' + m + '.' + g + '.';
        
        if (dodajIVreme) {
            var sat = datum.getHours();
            if (sat < 10) sat = "0" + sat;
            var min = datum.getMinutes();
            if (min < 10) min = "0" + min;
            ret += ' u ' + sat + ':' + min;
        }
        
        return ret;
    };
    
    qUtils.IzvuciDateObjIzDataSaServera = function (datum) {
        /// <summary>ui - Izvlači objekat Date() iz stringa koji je sa servera došao serijalizovan u Json. [obj Date()]</summary>
        /// <param name="datum" type="">Json datum</param>

        datum = datum.substring(6);
        datum = datum.substr(0, datum.length - 2);
        return new Date(parseInt(datum));
    };
    
    qUtils.IzvuciDateObjIzIntDatuma = function (datum) {
        /// <summary>ui - Izvlači objekat Date() iz stringa koji je sa servera došao u obliku YYYYMMDD. [obj Date()]</summary>
        /// <param name="datum" type="">int datum</param>

        var y = datum.substr(0, 4),
            m = datum.substr(4, 2).toInt() - 1,
            d = datum.substr(6);
        return new Date(y, m, d);
    };

    qUtils.SkloniMinuteISateIzDatuma = function(datum){
        /// <summary>ui - Anulira vrednost sati i minuta kod datuma. Potrebno uglavnom kada se koristi new Date(). [Date]</summary>
        /// <param name="datum" type="">Datum</param>
        /// <returns type="">Date</returns>
        
        var d = datum.getDate();
        var m = datum.getMonth();
        var g = datum.getFullYear();
        return new Date(g, m, d);
    };

    qUtils.VratiDateIzFormatiranogDatuma = function(datum){
        /// <summary>ui - Vraća Date() objekat iz stringa formatiranog datuma oblika dd.mm.gggg. [Date]</summary>
        /// <param name="datum" type="">String formatiranog datuma</param>
        /// <returns type="">Date</returns>
        
        var parts = datum.trim().match(/(\d+)/g);
        var d = parts[0];
        var m = parts[1] - 1;
        var y = parts[2];
        return new Date(y, m, d);
    };

    qUtils.VratiJSONDateNoTZIzDate = function (datum) {
        /// <summary>ui - Vraća datum bez vremena i vremenske zone</summary>
        /// <param name="datum" type="">Date()</param>

        if (!datum) return undefined;
        return (new Date(Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate(), 0, 0))).toJSON();
    };
    
    qUtils.VratiJSONDateNoTZIzDateStringify = function (datum) {
        /// <summary>ui - Vraća STRINGIFY datum bez vremena i vremenske zone</summary>
        /// <param name="datum" type="">Date()</param>

        if (!datum) return undefined;
        return JSON.stringify((new Date(Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate(), 0, 0))).toJSON());
    };

    qUtils.GetChartInterval = function (series, data) {
        /// <summary>ui - Vraća interval za grafikone. [Number]</summary>
        /// <param name="series" type="">Series objekat koji se pravi za jqxChart.</param>
        /// <param name="data" type="">Niz vrednosti koji se dobio sa servera i koji se čuva u jQuery.data na grafikonu.</param>
        /// <returns type="">Number</returns>
        
        var values = [];
        $.each(series, function (j, obj) {
            var dataField = obj.dataField;
            $.each(data, function (ii, oobj) {
                values.push(Math.abs(oobj[dataField]));
            });
        });
        var max = values[0];
        $.each(values, function (j, obj) {
            if (max < obj) max = obj;
        });
        var intv = (max / 10).toFixed(0);
        var interval = intv[0];
        for (var i = 0; i < intv.length - 1; i++) {
            interval += "0";
        }
        return parseInt(interval);
    };

    qUtils.BlinkiBGColorElementa = function($el, boja, msec, bojaFg) {
        /// <summary>ui - BGColor prosledjenog elementa promeni boju i fejduje na prethodnu, tj. blinkne.</summary>
        /// <param name="$el" type="">jQ element</param>
        /// <param name="boja" type="">string bg boja</param>
        /// <param name="msec" type="">duzina animacije u milisekundama</param>
        /// <param name="bojaFg" type="">string boja fonta</param>

        var _boja = "#FC9999";
        var _msec = 700;
        var _fg = "#444";

        if (boja) _boja = boja;
        if (msec) _msec = msec;
        if (bojaFg) _fg = bojaFg;

        var bg = $el.css("background-color");
        var fg = $el.css("color");
        
        $el.css({ "background-color": _boja, "color": _fg });
        $el.animate({ "background-color": bg, "color": fg }, _msec, function() {
            $el.css({ "background-color": "", "color": "" });
        });
    };

    qUtils.VratiExtFajla = function(fileName) {
        /// <summary>ui - Vraca extenziju fajla iz imena fajla [string]</summary>
        /// <param name="fileName" type="">ime fajla</param>

        return (-1 !== fileName.indexOf('.'))
            ? fileName.replace(/.*[.]/, '').toLowerCase()
            : '';
    };

    qUtils.ParsirajYTurl = function (url) {
        /// <summary>ui - Parsira YouTube link i vadi ID videa</summary>
        /// <param name="url" type="">url</param>
        
        if (url == '') return url;
        var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        return (url.match(p)) ? RegExp.$1 : false;
    };

    qUtils.SliceFileName = function (name, length) {
        /// <summary>ui - Sece string i umeće '...'</summary>
        /// <param name="name" type="">string</param>
        /// <param name="length" type="">dužina</param>

        if (!length) length = 33;
        if (name.length + 4 > length) {
            name = name.slice(0, length - 14) + '...' + name.slice(-13);
        }
        return name;
    };

    qUtils.SliceFileName2 = function (name, length) {
        /// <summary>ui - Sece string i stavlja na kraj '...'</summary>
        /// <param name="name" type="">string</param>
        /// <param name="length" type="">dužina</param>

        if (name.length > length) {
            name = name.substring(0, length) + '...';
        }
        return name;
    };

    qUtils.GetQueryParams = function () {
        /// <summary>ui - Vraća JS objekat od search/query stringa (koji se kod nas nalazi u location.hash ... ). Raspoznaje boolean, undefined i brojeve, sve ostalo interpretira kao string</summary>

        var ret = null;
        var sQuery = location.href.split('?')[1];
        if (sQuery) {
            var aPairs = sQuery.split('&');
            if (aPairs) {
                ret = {};
                for (var i = 0; i < aPairs.length; i++) {
                    var aPair = aPairs[i].split('=');
                    var param = aPair[0];
                    var value = aPair[1];
                    if (value != undefined) {
                        var up = value.toUpperCase();
                        if (up == 'UNDEFINED' || up == 'NULL') value = undefined;
                        else if (up == 'TRUE') value = true;
                        else if (up == 'FALSE') value = false;
                        else if (value.match(/^[.0-9]+$/)) {
                            var f = parseFloat(value);
                            if (!isNaN(f)) value = f;
                        }
                    }
                    ret[param] = value;
                }
            }
        }
        return ret;
    };

    qUtils.ZakaciProveruReference = function ($inp, funcVratiIdKom, funcVratiIdDok) {
        $inp.on('blur', function () {
            var $this = $(this);
            var val = $(this).val().trim();
            var idKom = funcVratiIdKom();
            var idDok = null;
            if (funcVratiIdDok) idDok = funcVratiIdDok();
            if (val != '' && IsInt(idKom)) {
                $.ajax({
                    type: 'GET',
                    url: 'Dokumenti/ProveriReferencu',
                    data: {
                        idKom: idKom,
                        idDok: idDok,
                        referenca: val
                    },
                    success: function(data) {
                        var d = data.Data;
                        var $next = $this.next();
                        var newWidth;
                        if (d.length) {
                            if ($next.length) {
                                $next.remove();
                            } else {
                                newWidth = $this.width() - 29;
                                $this.width(newWidth);
                            }
                            var $info = $('<div class="info" title="' + getLang('W_REFERENCA_TITLE1') + '"><span></span></div>');
                            $info.find('span').text(d.length);
                            $info.data('infoData', d);
                            $info.click(function() {
                                var infoData = $(this).data('infoData'),
                                    s = '<span>' + getLang('W_REFERENCA_TITLE2') + ':</span><br><br>';
                                for (var i = 0; i < infoData.length; i++) {
                                    var item = infoData[i];
                                    s += '<small>Dokument: </small><a href="#" data-tip="1" data-id="' + item.IdDokumenta + '">' + item.BrojDokumenta + '</a> (' + item.NazivTipaRacuna + ') - <small>Nalog: </small><a href="#" data-tip="2" data-ozn="' + item.OznakaNaloga + '">' + item.OznakaNaloga + '</a> - <small>Datum unosa:</small> ' + qUtils.IzvuciDatumIzDataSaServera(item.DatumUnosa) + '<br>';
                                }
                                var $s = $(s);
                                $s.filter('a').on('click', function(e) {
                                    e.preventDefault();
                                    var tip = $(this).attr('data-tip'),
                                        hash = '#', mask = '', idDok, oznNal;
                                    if (tip == '1') { // link na pregled dokumenata
                                        idDok = $(this).attr('data-id');
                                        hash = './PregledDokumenta?Z';
                                        mask = '&idDok=' + idDok;
                                    }
                                    if (tip == '2') { // link na pregled naloga
                                        oznNal = $(this).attr('data-ozn');
                                        hash = './Knjizenje/PregledNaloga?R';
                                        mask = '&oznaka=' + oznNal;
                                    }
                                    qUI.substringZaIzbacivanje = mask;
                                    location.hash = hash + mask;
                                    PrikaziProzor(false);
                                });
                                PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), $s, 'difolt', null, 700);
                            });
                            $this.after($info);
                        } else {
                            if ($next.length) {
                                $next.remove();
                                newWidth = $this.width() + 29;
                                $this.width(newWidth);
                            }
                        }
                    }
                });
            } else {
                var $next = $this.next();
                if ($next.length) {
                    $next.remove();
                    var newWidth = $this.width() + 29;
                    $this.width(newWidth);
                }
            }
        }).on('reset', function () {
            var $this = $(this);
            var $next = $this.next();
            if ($next.length) {
                $next.remove();
                var newWidth = $this.width() + 29;
                $this.width(newWidth);
            }
        });
    };

    qUtils.ZakaciProveruJMBG = function($inp) {
        $inp
            .blur(function () {
                var $this = $(this);
                var val = $this.val().trim();
                $.ajax({
                    type: 'GET',
                    url: 'Zarade/ProveriJMBG',
                    data: { jmbg: val },
                    success: function(data) {
                        if (data.Greska || !data.Data) {
                            $this.css('background-color', '#FCC');
                            return;
                        }
                        $this.css('background-color', '');
                        //qUtils.BlinkiBGColorElementa($this, 'green', null, 'white');
                    },
                    error: function() {
                        $this.css('background-color', '');
                    }
                });
            });
    };

    qUtils.NapraviInfoOKomZaUnosRed = function (kom) {
        /// <summary>ui - Pravi string sa informacijama o komitentu koji je prilagodjen da se upiše u .unosRed, dakle negde inline u nekoj formi. Prima objekat C# klase KomitentiZaIzbor.</summary>
        /// <param name="kom" type="Object">KomitentiZaIzbor</param>

        var nijeUPdv = '';
        if (!kom.PdvObveznik) nijeUPdv = ' (<small class="komNijeUPdv">' + getLang('W_KOMNIJEUPDV') + '</small>)';
        return '(' + nonull(kom.PibJmbg, '-') + ') ' + kom.NazivKomitenta + nijeUPdv + '<br>' + nonull(kom.Adresa) + ', ' + nonull(kom.NazivMesta) + ', ' + nonull(kom.Drzava);
    };

    qUtils.IzvuciVM = function(vmId, consoleLog) {
        /// <summary>ui - Vraca VM objekat koji je zapisan uglavnom u #vm DOM objektu kao JSON string.</summary>
        /// <param name="vmId" type="String">[OPCIONO] jQuery ID</param>
        /// <param name="consoleLog" type="Boolean">[OPCIONO] da li da se pozove log()</param>
        /// <returns type="">JS objekat</returns>
        
        if (!vmId) vmId = '#vm';
        var obj = $.parseJSON($(vmId).text());
        if (consoleLog) log(obj);
        return obj;
    };

    // --- PAMĆENJE KOLONA ZA TEBELE SA IZBORNIKOM KOLONA ---
    qUtils.IzvuciKoloneIzLSZaTabelu = function (idInputParent, kljucLS) {
        /// <summary>Iz LocalStorage nalazi zapisane vidljive kolone za tabelu transakcije i popunjava čekboksove u izborniku kolona.</summary>
        /// <param name="idInputParent" type="">[string] #Id parenta čekboksova</param>
        /// <param name="kljucLS" type="">[string] kluč za LocalStorage</param>
        
        var koloneLS = $.totalStorage(kljucLS);
        if (koloneLS) {
            var $inputs = $(idInputParent).find('input');
            if ($inputs.length == koloneLS.length) {
                $inputs.each(function(i) {
                    var koli = koloneLS[i];
                    if (koli && koli.c)
                        $(this).prop('checked', true);
                    else
                        $(this).prop('checked', false);
                });
            } else {
                console.error('>> Kolone se ne podudaraju: ' + kljucLS);
            }
        }
    };
    qUtils.ZapisiKoloneULSZaTabelu = function (idInputParent, kljucLS) {
        /// <summary>Čuva u LocalStorage niz sa zapisanim vidljivim kolonama za tabelu transakcije.</summary>
        /// <param name="idInputParent" type="">[string] #Id parenta čekboksova</param>
        /// <param name="kljucLS" type="">[string] kluč za LocalStorage</param>
        
        var arr = [];
        $(idInputParent).find('input').each(function () {
            var tf = $(this).prop('checked') ? 1 : 0;
            arr.push({ c: tf });
        });
        $.totalStorage(kljucLS, arr);
    };
    // --- END --- 

    qUtils.VratiDms = function (options) {
        var opts = $.extend({
            url: $('#urlG_VratiDms').text(),
            idDms: undefined,
            $btn: $(),
            successCallback: function () { },
            errorCallback: function () { },
            completeCallback: function () { },
            prikaziDmsDijalog: true,
            readonlyDmsDijalog: false
        }, options);
        
        var idDmsTemp = parseInt(opts.idDms);
        if (isNaN(idDmsTemp) || idDmsTemp < 1)
            opts.idDms = undefined;

        var $btnTable = opts.$btn.find('table');
        if ($btnTable.hasClass('teloDugmeIskljuceno')) return;
        $btnTable.addClass('teloDugmeIskljuceno');
        $.ajax({
            type: 'POST',
            url: opts.url,
            data: {
                idDms: opts.idDms
            },
            success: function(data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }
                var dmsVm = data.Data;
                if (opts.prikaziDmsDijalog)
                    qDms.PrikaziDmsDijalog(dmsVm, opts.readonlyDmsDijalog);
                opts.successCallback(dmsVm);
            },
            error: function() {
                opts.errorCallback();
            },
            complete: function() {
                $btnTable.removeClass('teloDugmeIskljuceno');
                opts.completeCallback();
            }
        });
    };

    qUtils.ExportToXls = function (tableId, nazivFajla) {
        /// <summary>Radi export u XLS fajl. Gleda samo vidljive kolone i redove.</summary>
        /// <param name="tableId" type="">ID tabele</param>
        /// <param name="nazivFajla" type="">Naziv fajla koji ce se izvesti</param>
        
        if (!nazivFajla) nazivFajla = 'Excelizvoz';
        //kesiraj promenljive
        var $table = $('#' + tableId),
            $trs = $table.find('tr:not(.qui-tf-tr):not(.trTotal):visible'),
            tdN = $table.find('tr').eq(0).find('td:visible').length,
            $trTotal = $table.find('tr.trTotal'),
            html = '';

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

        //kolone
        for (var j = 0; j < tdN; j++) {
            html += '<Column ss:AutoFitWidth="1" ss:Width="65"/>';
        }

        //za svaki red tabele...
        $trs.each(function () {
            var $tr = $(this);
            html += '<Row>';
            //...nadji celije tabele
            $tr.find('td:visible').each(function () {
                var $td = $(this);
                if ($td.hasClass('qTabelaHeadTd')) { // ako je celija u THEAD
                    html += '<Cell ss:StyleID="heder"><Data ss:Type="String">' + $td.text() + '</Data></Cell>';
                } else {
                    // ucitaj tip za formatiranje polja
                    var type = $td.attr('data-xls-type'),
                        txt = $td.text();
                    switch (type) {
                        case 'skip':
                            break;
                        case 'decimal':
                            txt = txt.fromMoney();
                            if (txt !== false) {
                                html += '<Cell ss:StyleID="bodyDecimal"><Data ss:Type="Number">' + txt + '</Data></Cell>';
                            } else {
                                html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String"></Data></Cell>';
                            }
                            break;
                        default:
                            html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String">' + txt + '</Data></Cell>';

                    }
                }
            });
            html += '</Row>';
        });

        //za total tabele
        html += '<Row>';
        $trTotal.find('td:visible').each(function () {
            var $td = $(this);
            var type = $td.attr('data-xls-type'),
                txt = $td.text();
            switch (type) {
                case 'skip':
                    break;
                case 'decimal':
                    txt = txt.fromMoney();
                    if (txt !== false) {
                        html += '<Cell ss:StyleID="totalDecimal"><Data ss:Type="Number">' + txt + '</Data></Cell>';
                    } else {
                        html += '<Cell ss:StyleID="totalTxt"><Data ss:Type="String"></Data></Cell>';
                    }
                    break;
                default:
                    html += '<Cell ss:StyleID="totalTxt"><Data ss:Type="String">' + txt + '</Data></Cell>';
            }
        });
        html += '</Row>';
        html += '</Table></Worksheet></Workbook>';

        var a = document.createElement('a');
        a.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
        a.download = nazivFajla + '.xls';
        //a.click();
        var clickEvent = new MouseEvent("click", {
            "view": window,
            "bubbles": true,
            "cancelable": false
        });
        a.dispatchEvent(clickEvent);
    };

    qUtils.ExportToXlsNovaTabela = function(columns, items, totals, nazivFajla) {
        if (!nazivFajla) nazivFajla = 'Pisarnica_izvoz';
        //kesiraj promenljive
        //var $table = $('#' + tableId),
        //    $trs = $table.find('tr:not(.qui-tf-tr):not(.trTotal):visible'),
        //    tdN = $table.find('tr').eq(0).find('td:visible').length,
        //    $trTotal = $table.find('tr.trTotal'),
        //    html = '';

        var html = '';
        Slick.GlobalEditorLock.commitCurrentEdit();
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

        //za svaki red tabele...
        for (var k = 0; k < items.length; k++) {
            html += '<Row>';

            var item = items[k];

            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];

                var type = column.tipPodatka,
                    vrednost = item[column.field];

                switch (type) {
                case 'skip':
                    break;
                case 'decimal':
                    if (vrednost !== undefined && vrednost != null) {
                        // sada su brojevi: hiljade se odvajaju "." a decimalni zarez ","
                        // za excel treba kontra
                        var novaVrednost = "";
                        if (typeof vrednost == "number") {
                            novaVrednost = vrednost.toLocaleString("en-US").replace(/\,/g, '');
                        } else {
                            novaVrednost = vrednost.replace(/\,/g, '');
                        }

                        html += '<Cell ss:StyleID="bodyDecimal"><Data ss:Type="Number">' + novaVrednost + '</Data></Cell>';
                    } else {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String"></Data></Cell>';
                    }
                    break;
                case 'date':
                    if (vrednost !== undefined && vrednost != null) {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String">' + qUtils.IzvuciDatumIzDataSaServera(vrednost) + '</Data></Cell>';
                    } else {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String"></Data></Cell>';
                    }
                    break;
                case 'dateTime':
                    if (vrednost !== undefined && vrednost != null) {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String">' + qUtils.IzvuciDatumIzDataSaServera(vrednost, true) + '</Data></Cell>';
                    } else {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String"></Data></Cell>';
                    }
                    break;
                case 'dateMilisec':
                    if (vrednost !== undefined && vrednost != null) {
                        var parsiran = qUtils.IzvuciDateObjIzDataSaServera(vrednost);
                        var d = parsiran.getDate(),
                            m = parsiran.getMonth() + 1,
                            g = parsiran.getFullYear();
                        d = d < 10 ? '0' + d : d;
                        m = m < 10 ? '0' + m : m;
                        var ret = d + '.' + m + '.' + g + '.';

                        var sat = parsiran.getHours();
                        if (sat < 10) sat = "0" + sat;
                        var min = parsiran.getMinutes();
                        if (min < 10) min = "0" + min;
                        ret += ' - ' + sat + ':' + min;

                        var sec = parsiran.getSeconds();
                        if (sec < 10) sec = "0" + sec;

                        ret += ':' + sec;

                        ret += ':' + parsiran.getMilliseconds();
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String">' + ret + '</Data></Cell>';
                    } else {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String"></Data></Cell>';
                    }
                    break;
                case 'dateObj':
                    if (vrednost !== undefined && vrednost != null) {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String">' + qUtils.IzvuciDatumIzDateObj(vrednost) + '</Data></Cell>';
                    } else {
                        html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String"></Data></Cell>';
                    }
                    break;
                default:
                    html += '<Cell ss:StyleID="bodyTxt"><Data ss:Type="String">' + nonull(vrednost) + '</Data></Cell>';
                }
            }

            html += '</Row>';
        }

        //totali
        if (totals != undefined && totals.length > 0) {
            html += '<Row>';
            for (var t = 0; t < totals.length; ++t) {
                var total = totals[t];
                if (total != undefined) {
                    html += '<Cell ss:StyleID="totalDecimal"><Data ss:Type="Number">' + total + '</Data></Cell>';
                } else {
                    html += '<Cell ss:StyleID="totalTxt"><Data ss:Type="String"></Data></Cell>';
                }
            }
            html += '</Row>';
        }

        html += '</Table></Worksheet></Workbook>';
        var a = document.createElement('a');
        //a.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
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
    };

} (window.qUtils = window.qUtils || {}, jQuery));



(function (qHightLight, $, undefined) {

    var oldVal = '',
        $main,
        $srcWrap,
        $srcInp,
        $highlighted,
        $next,
        next = 0,
        ok = false;

    var mtop = 120,
        blinkspd = 1000;

    function KeyupMainHighlightInput(e){
        if(e.keyCode == 13){
            var val = $(this).val().trim();
            if(!val){
                $main.removeHighlight();
                return;
            }
            if(oldVal == val){
                ActivateNext();
            }else{
                ok = true;
                oldVal = val;
                $main.removeHighlight().highlight(val);
                $highlighted = $('.highlight');
                if($highlighted.length){
                    $next = $highlighted.eq(0);
                    next = 0;
                    _scrollTo($next.addClass('active'), mtop);
                }else{
                    ok = false;
                    qUtils.BlinkiBGColorElementa($(this), 'red', blinkspd, 'white');
                }
            }
        }
        if(e.keyCode == 27){
            e.preventDefault();
            qHightLight.Hide();
        }
    }

    function ActivateNext(){
        if(ok){
            $next.removeClass('active');
            next++;
            $next = $highlighted.eq(next);
            if($next.length){
                _scrollTo($next.addClass('active'), mtop);
            }else{
                $next = $highlighted.eq(0);
                next = 0;
                _scrollTo($next.addClass('active'), mtop);
            }
        }else{
            qUtils.BlinkiBGColorElementa($(this), 'red', blinkspd, 'white');
        }
    }

    function ActivatePrev(){
        if(ok){
            $next.removeClass('active');
            next--;
            $next = $highlighted.eq(next);
            if($next.length){
                _scrollTo($next.addClass('active'), mtop);
            }else{
                var n = $highlighted.length - 1;
                $next = $highlighted.eq(n);
                next = n;
                _scrollTo($next.addClass('active'), mtop);
            }
        }else{
            qUtils.BlinkiBGColorElementa($(this), 'red', blinkspd, 'white');
        }
    }

    qHightLight.Show = function(){
        $srcWrap.addClass('active').slideDown(function(){
            $srcInp.focus();
        });
    };
    
    qHightLight.Hide = function(){
        $srcWrap.removeClass('active').slideUp(function(){
            $srcInp.blur();
        });
        $main.removeHighlight();
        oldVal = '';
        $srcInp.val('');
    };

    qHightLight.Toggle = function(){
        if ($srcWrap.hasClass('active')) qHightLight.Hide();
        else qHightLight.Show();
    };

    qHightLight.Init = function(){
        $main = $('#main');
        $srcWrap = $('#mainSearchWrap');
        $srcInp = $('#mainSearchInp');
        $('#mainSearchInp').keyup(KeyupMainHighlightInput);
        $('#mainSearchNext').click(ActivateNext);
        $('#mainSearchPrev').click(ActivatePrev);
        $('#mainSearchX').click(qHightLight.Hide);
    };
    

} (window.qHightLight = window.qHightLight || {}, jQuery));

// ------------------------------------------------
// jqWidgets utils

(function (qJqx, $, undefined) {
    
    // ------------------------------------------------
    // dateTimeInput

    // html koji će biti dodat na kalendar
    var meseci = '<select class="calMeseci"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option></select>';
    var godine = '<select class="calGodine"><option>2013</option><option>2012</option><option>2011</option><option>2010</option><option>2009</option><option>2008</option></select>';

    var JqxDateTimeInput_open = function(id){
        /// <summary>ui - Hendler opet eventa koji menja izgled kalendara. Mora ovako da ne bih menjao source samog vidžeta.</summary>
        /// <param name="id" type="">id elementa oblika 'id'</param>
        
        qJqx.jqxDTIid = id;    

        var $ctitle = $('#calendarTitleView1innerCalendar' + id);
        if ($ctitle.prev().length != 1){
            var $ctitle2 = $ctitle.clone();
            $ctitle2.attr('id', 'calendarCBoxes' + id);
            $ctitle2.find('td').empty().removeAttr('id');
            $ctitle2.find('td:nth-child(2)').html(godine + meseci);
            $ctitle.parent().parent().parent().height(50);
            $ctitle.parent().prepend($ctitle2);
            $ctitle.find('td:first-child,td:last-child').html('<div style="width:15px"></div>');
        }
        $('#calendar'+id).height(250);
        $('#innerCalendar'+id).height(225);
        $('#View1innerCalendar'+id).height(225);
        $('#cellsTableView1innerCalendar'+id).height(155);
        
        var idd = '#'+id;
        PodesiJqxDTICboxeve($(idd).jqxDateTimeInput('getDate'), id);
    };
    
    var PodesiJqxDTICboxeve = function(datum, id){
        /// <summary>ui - Podešava komboe za mesece i godine na kalendaru u odnosu na aktivan datum</summary>
        /// <param name="datum" type="">datum sa vidžeta</param>
        /// <param name="id" type="">id elementa oblika 'id'</param>
        
        var g = datum.getFullYear();
        var m = datum.getMonth() + 1;

        $('#calendar' + id + ' .calGodine').val(g);
        $('#calendar' + id + ' .calMeseci').val(m);
    };

    // javno dostupni smeštaj za ID jqxDTI objekta
    qJqx.jqxDTIid = '';

    qJqx.jqxDateTimeInput = function (id, width, disabled, date){
        /// <summary>ui - Wrapper oko jqxDateTimeInput kontruktora, koji radi isto što i original, samo dodaje eventove i menja izgled kalendara.</summary>
        /// <param name="id" type="">id elementa oblika 'id'</param>
        /// <param name="width" type="">širina vidžeta</param>
        /// <param name="disabled" type="">[opciono] da li je vidžet disejblovan</param>
        /// <param name="date" type="">[opciono] datum koji se setuje vidžetu</param>
        
        var idd = '#' + id;
        
        $(idd).jqxDateTimeInput({
            formatString: 'dd.MM.yyyy.',
            height: '22px',
            firstDayOfWeek: 1,
            theme: theme,
            
            disabled: disabled,
            width: width
        });
        
        if(date != undefined){
            $(idd).jqxDateTimeInput('setDate', date);
        }else{
            $(idd).jqxDateTimeInput('setDate', qUtils.SkloniMinuteISateIzDatuma(new Date()));
        }
        
        $(idd).bind('open', function () {
            JqxDateTimeInput_open($(this).attr('id'));
        }); 
    };

    // ------------------------------------------------
    // 

}(window.qJqx = window.qJqx || {}, jQuery));


// ------------------------------------------------
// globalne & prototipovi

function _scrollTo(id, plusTop) {
    /// <summary>ui - Animirano skroluje stranu:</summary>
    /// <param name="id" type="String">#Id elementa/$element do kog se skroluje.</param>
    /// <param name="plusTop" type="Number">[opciono] broj pixela odmaknutosti od vrha viewporta.</param>
    
    if (plusTop == undefined)
        plusTop = 0;
    if(typeof id === "string")
        $('html, body').animate({ scrollTop: ($(id).offset().top - plusTop) }, 400, 'swing');
    else
        $('html, body').animate({ scrollTop: (id.offset().top - plusTop) }, 400, 'swing');
}

function IsInt(input) {
    /// <summary>ui - Proverava dal je proseldjena vrednost int. Uradjeno ovako da bi podsećalo na onu isNaN funkciju. [true / false]</summary>
    /// <param name="input" type="">Vrednost za proveriti</param>
    /// <returns type="">true / false</returns>

    return !isNaN(input) && parseInt(input) == input && input < 2147483648; // signed int32
}

var moneyDefaults = {
    toMoney_decSep: '.',
    toMoney_thSep: ',',
    fromMoney_regEx: /,| /g
    //toMoney_decSep: ',',
    //toMoney_thSep: '.',
    //fromMoney_regEx: /\.| /g
};
Number.prototype.toMoney = function (decimals, decimalSep, thousandsSep) {
    /// <summary>ui - Formatira BROJ iz decimalnog u čitljiv zapis. BROJ! [Vraća formatiran string]</summary>
    /// <param name="decimals" type="Number">Broj decimala - def 2</param>
    /// <param name="decimalSep" type="String">Separator decimala - def "."</param>
    /// <param name="thousandsSep" type="String">Separator hiljade - def ","</param>
    /// <returns type="Number">Vraća formatiran string</returns>
    var n = this,
        c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
        d = decimalSep || moneyDefaults.toMoney_decSep, //if no decimal separetor is passed we use the comma as default decimal separator (we MUST use a decimal separator)
        t = (typeof thousandsSep === 'undefined') ? moneyDefaults.toMoney_thSep : thousandsSep, //if you don't want ot use a thousands separator you can pass empty string as thousands_sep value
        sign = (n < 0) ? '-' : '',
        //extracting the absolute value of the integer part of the number and converting to string
        i = parseInt(n = Math.abs(n).toFixed(c)) + '',
        j = ((j = i.length) > 3) ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
};

Number.prototype.trimDecimal = function (decimals) {
    /// <summary>ui - Decimalnom broju odseca i zaokružuje decimale. [Vraća zaokružen decimalni broj]</summary>
    /// <param name="decimals" type="Number">Broj decimala</param>
    /// <returns type="">Vraća zaokružen decimalni broj</returns>

    if (IsInt(decimals) && decimals >= 0) {
        var pow = Math.pow(10, decimals);
        return Math.round(this * pow) / pow;
    }
    else return Math.round(this * 100) / 100;
};

Number.prototype.trimInteger = function (zeros) {
    /// <summary>ui - Broj zaokruzuje na odredjen broj nula. [Vraća zaokružen ceo broj]</summary>
    /// <param name="decimals" type="Number">Broj nula</param>
    /// <returns type="">Vraća zaokružen ceo broj</returns>

    if (IsInt(zeros) && zeros != 0) {
        var pow = Math.pow(10, zeros);
        if (pow < this)
            return Math.round(this / pow) * pow;
    }
    return Math.round(this);
};

String.prototype.fromMoney = function (value) {
    /// <summary>ui - Vraća decimalni broj iz stringa koji je prethodno formatiran sa .toMoney(). [Vraća broj ili false ako nije uspelo parsiranje]</summary>
    /// <param name="value" type="Number">[OPCIONO] Broj koji će se vratiti ako parsiranje ne uspe</param>
    /// <returns type="">Vraća broj ili false ako nije uspelo parsiranje.</returns>
    
    // ako bude problema, vratiti .replace(/,/g, "") - izmenjeno da guta i spejs za separator hiljada zbog bodova na zaposlenima
    //var d = parseFloat(this.replace(moneyDefaults.fromMoney_regEx, '').replace(/,/g, '.'));
    var d = parseFloat(this.replace(moneyDefaults.fromMoney_regEx, ''));
    if (isNaN(d)) {
        if (value != undefined) {
            return value;
        }
        return false;
    }
    else return d;
};

String.prototype.toDecimal = function (value) {
    /// <summary>ui - Vraća decimalni broj iz stringa sa dodatkom da guta i zarez i tačku kao decimalni separator. [Vraća broj ili false ako nije uspelo parsiranje]</summary>
    /// <param name="value" type="Number">[OPCIONO] Broj koji će se vratiti ako parsiranje ne uspe</param>
    /// <returns type="">Vraća broj ili false ako nije uspelo parsiranje.</returns>
    
    var d = parseFloat(this.replace(/,/g, "."));
    if (isNaN(d)) {
        if (value != undefined) {
            return value;
        }
        return false;
    } 
    else return d;
};

String.prototype.toInt = function (value) {
    /// <summary>ui - Vraća int broj iz stringa. [Vraća broj ili false ako nije uspelo parsiranje]</summary>
    /// <param name="value" type="Number">[OPCIONO] Broj koji će se vratiti ako parsiranje ne uspe</param>
    /// <returns type="">Vraća broj ili false ako nije uspelo parsiranje.</returns>

    var d = parseInt(this);
    if (isNaN(d)) {
        if (value != undefined) {
            return value;
        }
        return false;
    }
    else return d;
};

String.prototype.contains = function (it){
    /// <summary>ui - Proverava da li string sadrži u sebi prosleđeni string. [true / false]</summary>
    /// <param name="it" type="">String koji treba da se nađe</param>
    /// <returns type="">true / false</returns>
    
    return this.indexOf(it) != -1;
};

String.prototype.trimnull = function () {
    /// <summary>ui - Trimuje string, i ako je '' vraca undefined</summary>
    /// <returns type="">trimmed string / undefined</returns>

    var ret = this.trim();
    return ret ? ret : undefined;
};

Array.prototype.remIdx = function (idx) {
    /// <summary>ui - Izbacuje element niza po indexu [izbacen element]</summary>
    /// <param name="idx" type="">index niza</param>
    /// <returns type="">izbacen element</returns>

    return this.splice(idx, 1);
};

Array.prototype.remProp = function (property, value) {
    /// <summary>ui - Izbacuje PRVI nadjeni element niza po imenu i vrednosti propertija [izbacen element]</summary>
    /// <param name="property" type="">ime propertija</param>
    /// <param name="value" type="">vrednost propertija</param>
    /// <returns type="">izbacen element</returns>

    var n = this.length;
    var i = 0;
    var x = undefined;
    for (i; i < n; i++) {
        x = this[i];
        if (x.hasOwnProperty(property)) {
            if (x[property] == value) break;
        }
    }
    return this.splice(i, 1);
};

Array.prototype.contains = function (property, value) {
    /// <summary>ui - Proverava da li postoji element u nizu po imenu i vrednosti propertija [false/obj]</summary>
    /// <param name="property" type="">ime propertija</param>
    /// <param name="value" type="">vrednost propertija</param>
    /// <returns type=""></returns>

    var n = this.length;
    var i = 0;
    var x = undefined;
    if (!property) {
        for (i; i < n; i++) {
            if (this[i] == value) break;
        }
    } else {
        for (i; i < n; i++) {
            x = this[i];
            if (x.hasOwnProperty(property)) {
                if (x[property] == value) break;
            }
        }
    }
    if (i == n) {
        return false;
    }
    return { idx: i, obj: this[i] };
};

function nonull(obj, value) {
    /// <summary>ui - Sklanja null iz promenljive - korisno za ispivanje vrednosti dobijenih u JSON sa servera.</summary>
    /// <param name="obj" type="">Objekat koji se obradjuje</param>
    /// <param name="value" type="">[OPCIONO] Vrednost koje se vrati ako je objekat null/undefined</param>

    if (!obj && obj !== 0) {
        if (value != undefined) return value;
        else return '';
    } else return obj;
}

function log(msg) {
    if (_debug) window.console.log(msg);
}