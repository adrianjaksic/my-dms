/// <reference path="jquery-1.7.2-vsdoc.js" />
/// <reference path="quinta.putanje.js" />

(function (qKeys, $, undefined) {
    // mapa kodova na nazive
    var kod_naziv = {
        8:   "Backspace",
        9:   "Tab",
        13:  "Enter",
        16:  "Shift",
        17:  "Ctrl",
        18:  "Alt",
        19:  "Pause",
        20:  "Capslock",
        27:  "Esc",
        33:  "Pageup",
        34:  "Pagedown",
        35:  "End",
        36:  "Home",
        37:  "Strelica levo",
        38:  "Strelica gore",
        39:  "Strelica desno",
        40:  "Strelica dole",
        45:  "Insert",
        46:  "Delete",
        48:  "0",
        49:  "1",
        50:  "2",
        51:  "3",
        52:  "4",
        53:  "5",
        54:  "6",
        55:  "7",
        56:  "8",
        57:  "9",
        65:  "A",
        66:  "B",
        67:  "C",
        68:  "D",
        69:  "E",
        70:  "F",
        71:  "G",
        72:  "H",
        73:  "I",
        74:  "J",
        75:  "K",
        76:  "L",
        77:  "M",
        78:  "N",
        79:  "O",
        80:  "P",
        81:  "Q",
        82:  "R",
        83:  "S",
        84:  "T",
        85:  "U",
        86:  "V",
        87:  "W",
        88:  "X",
        89:  "Y",
        90:  "Z",
        96:  "0 numerička",
        97:  "1 numerička",
        98:  "2 numerička",
        99:  "3 numerička",
        100: "4 numerička",
        101: "5 numerička",
        102: "6 numerička",
        103: "7 numerička",
        104: "8 numerička",
        105: "9 numerička",
        106: "Zvezdica",
        107: "Plus",
        109: "Crtica",
        110: "Dot",
        111: "Slash1",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        187: "equal",
        188: "Coma",
        191: "Slash",
        220: "Backslash"
    };
    // mapa naziva na kodove
    var naziv_kod = {
        0: "48",
        '0 numerička': "96",
        1: "49",
        '1 numerička': "97",
        2: "50",
        '2 numerička': "98",
        3: "51",
        '3 numerička': "99",
        4: "52",
        '4 numerička': "100",
        5: "53",
        '5 numerička': "101",
        6: "54",
        '6 numerička': "102",
        7: "55",
        '7 numerička': "103",
        8: "56",
        '8 numerička': "104",
        9: "57",
        '9 numerička': "105",
        A: "65",
        Alt: "18",
        B: "66",
        Backslash: "220",
        Backspace: "8",
        C: "67",
        Capslock: "20",
        Coma: "188",
        Crtica: "109",
        Ctrl: "17",
        D: "68",
        Delete: "46",
        Dot: "110",
        E: "69",
        End: "35",
        Enter: "13",
        Esc: "27",
        F: "70",
        F1: "112",
        F2: "113",
        F3: "114",
        F4: "115",
        F5: "116",
        F6: "117",
        F7: "118",
        F8: "119",
        F9: "120",
        F10: "121",
        F11: "122",
        F12: "123",
        G: "71",
        H: "72",
        Home: "36",
        I: "73",
        Insert: "45",
        J: "74",
        K: "75",
        L: "76",
        M: "77",
        N: "78",
        O: "79",
        P: "80",
        Pagedown: "34",
        Pageup: "33",
        Pause: "19",
        Plus: "107",
        Q: "81",
        R: "82",
        S: "83",
        Shift: "16",
        Slash: "191",
        Slash1: "111",
        'Strelica desno': "39",
        'Strelica dole': "40",
        'Strelica gore': "38",
        'Strelica levo': "37",
        T: "84",
        Tab: "9",
        U: "85",
        V: "86",
        W: "87",
        X: "88",
        Y: "89",
        Z: "90",
        Zvezdica: "106",
        equal: "187"
    };
    var $bla = $(window);
    // sve registrovane precice
    var precice;
    // sva focusable polja za kretanje
    var polja, $aktivanElement, idxAktivnogElementa;
    // flag za otvoren prozor
    qKeys.otvorenProzor = false;
    
    var jqWindow = function (data) {
        $('#helpWindowContent').html(data);
        var $helpWindow = $('#helpWindow');
        $helpWindow.jqxWindow({ position: 'center' });
        $helpWindow.jqxWindow('open');
        $helpWindow.focus();
    };

    qKeys.GlobalKeydown = function (e) {
        /// <summary>Kači globalno funkcije na keydown event</summary>
        /// <param name="e" type="">event</param>
        
        // ako je otvoren quinta prozor, odustani
        if (qKeys.otvorenProzor) return;

        // ako je samo alt, odustani
        if (e.altKey && e.keyCode == 18) return; 

        // ako je alt utisnut, a dodat je jos jedan taster
        if (e.altKey) { 
            e.preventDefault();
            if (precice.hasOwnProperty(e.keyCode))
                precice[e.keyCode]['func'](e.keyCode);
        }
        
        // tab
        if (!e.shiftKey && e.keyCode == 9) {
            e.preventDefault();
            $(document).trigger('quinta-changeFocus-fw');
        }
        if (e.shiftKey && e.keyCode == 9) {
            e.preventDefault();
            $(document).trigger('quinta-changeFocus-bk');
        }
        
        // strelice
        if (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40) {
            if ($aktivanElement) {
                qKeys.HendlerStrelica(e);
            }
        }
        
        // enter
        if (e.keyCode == 13) {
            if ($aktivanElement) {
                qKeys.HendlerEntera(e);
            }
        }
        
        // delete
        if (e.keyCode == 46) {
            if ($aktivanElement) {
                qKeys.HendlerDelete(e);
            }
        }
    };

    qKeys.RegistujPrecice = function (preciceObj, oblakId) {
        /// <summary>Registruje prečice, tj. kombinacije ALT+taster koji su prečica do dugmadi.</summary>
        /// <param name="preciceObj" type="">objekat prečica { 'Precica': { func: _, opis: _ } }</param>
        /// <param name="oblakId" type="">Id DOM elementa kome se prependuje ikonica tastature (obično ima klasu .oblakTelo)</param>
        
        $(document).on('keydown', qKeys.GlobalKeydown);
        precice = {};
        if (preciceObj) {
            for (var v in preciceObj) {
                var p = preciceObj[v];
                p['naziv'] = v;
                if (naziv_kod.hasOwnProperty(v)) {
                    var kod = naziv_kod[v];
                    precice[kod] = p;
                } else {
                    alert('Precica nije dobro registrovana: ' + v);
                }
            }
        }
        if (oblakId)
            qKeys.NapraviShortCut(oblakId);
    };
    
    qKeys.NapraviShortCut = function (oblakId) {
        /// <summary>Prependuje ikonicu tastature na DOM element</summary>
        /// <param name="oblakId" type="">Id DOM elementa kome se prependuje ikonica tastature (obično ima klasu .oblakTelo)</param>
        
        var $oblak = $('#' + oblakId);
        var iconUrl = _pathImgB + 'keys24.png';
        $oblak.prepend('<div id="keysIconWrap" style="height:0;position:relative"><img src=' + iconUrl + ' id="keysIcon" /></div>');
        $('#keysIcon').click(function () {
            var s = '<h2>' + document.title + '</h2>';
            for (var key in precice) {
                var precica = precice[key];
                s += '<p><b style="display:inline-block;min-width:140px">ALT + ' + precica.naziv + ':</b>' + precica.opis + '</p>';
            }
            jqWindow(s);
        });
    };

    qKeys.RegistrujFocusablePolja = function($arr, aktivirajPoRedu, dodavanjePolja) {
        /// <summary>Registruje sve elemente koju mogu dobiti fokus (polja sa klasom .focusable)</summary>
        /// <param name="$arr" type="">jQuery array polja</param>
        /// <param name="aktivirajPoRedu" type="">int/false - koji focusable element po redu se treba aktivirati</param>
        /// <param name="dodavanjePolja" type="">flag - da li se polja inicijalno registruju ili se dodaju</param>

        var i = 0;
        if (!dodavanjePolja) {
            polja = {};
        } else {
            for (var v in polja) {
                i++;
            }
            if (polja.hasOwnProperty(i)) {
                alert('Polje ne moze da se doda!');
                return;
            }
        }
        $arr.each(function() {
            var $this = $(this);
            $this.attr('data-focusable-idx', i);
            polja[i] = $this;
            $this.click(function () {
                DeaktivirajElement($aktivanElement);
                $aktivanElement = $(this);
                idxAktivnogElementa = parseInt($(this).attr('data-focusable-idx'));
                AktivirajElement(false);
            });
            i++;
        });
        if (!dodavanjePolja) {
            $(document).on('quinta-changeFocus-fw', qKeys.GlobalChangeFocusFw);
            $(document).on('quinta-changeFocus-bk', qKeys.GlobalChangeFocusBk);
        }
        if (aktivirajPoRedu) {
            aktivirajPoRedu--;
            $aktivanElement = $arr.eq(aktivirajPoRedu);
            if (!$aktivanElement.length) {
                $aktivanElement = $arr.eq(0);
                idxAktivnogElementa = 0;
            } else {
                idxAktivnogElementa = aktivirajPoRedu;
            }
            AktivirajElement(true);
        }
    };
    
    function AktivirajElement(pocetnaAktivnost) {
        /// <summary>Vizuelno oznacava aktivan element</summary>
        /// <param name="pocetnaAktivnost" type="">flag - ako se prosledi, aktivira se vidget, table... u okviru focusable elementa, po tipu tog elementa</param>
        
        $('.focus').removeClass('focus');
        $aktivanElement.addClass('focus');
        var tip = $aktivanElement.attr('data-focusable-tip'); // tip
        //    charTip = tip[0]; // prvo slovo tipa
        //if (charTip == 'r') { // 'r' - ako je unosRed
        //    if (pocetnaAktivnost) {
        //        aktivator[tip]($aktivanElement);
        //    }
        //}
        if (pocetnaAktivnost) {
            aktivator[tip]($aktivanElement);
        }
    }

    var aktivator = {
        r1: function ($el) {
            $el.find('.myInput').focus().select();
        },
        r11:function ($el) {
            $el.find('.myInput').focus().select();
        },
        r2: function($el) {
            $el.find('.qui').click();
        },
        r3: function($el) {
            $el.find('input').click();
        },
        r4: function() {
            return false;
        },
        r5: function($el) {
            $el.find('input').focus().select();
        },
        t1: function($el) {
            $el.find('tbody.tbodyFocus tr:visible').eq(0).addClass('qTrKliknut');
        },
        t2: function ($el) {
            $el.find('tbody.tbodyFocus tr:visible:first td.qTabelaTdPromena:visible:first').click();
        }
    };
    
    function DeaktivirajElement($el) {
        /// <summary>Sklanja focus oznake unutar elementa, po tipu elementa (npr aktivni red tabele...)</summary>
        /// <param name="$el" type="">element</param>
        
        if ($el) {
            var tip = $el.attr('data-focusable-tip'); // tip
            if (deaktivator.hasOwnProperty(tip)) {
                deaktivator[tip]($el);
            }
        }
    }

    var deaktivator = {
        t1: function ($el) {
            $el.find('.qTrKliknut').removeClass('qTrKliknut');
        }
    };

    qKeys.GlobalChangeFocusFw = function () {
        /// <summary>Hendluje promenu fokusa unapred</summary>
        
        document.activeElement.blur();
        $bla.click();
        
        var noviIdx = idxAktivnogElementa + 1;
        if (!polja.hasOwnProperty(noviIdx)) {
            noviIdx = 0;
        }
        if (noviIdx == idxAktivnogElementa) return; // ako je samo jedan focusable element
        DeaktivirajElement($aktivanElement);
        idxAktivnogElementa = noviIdx;
        $aktivanElement = polja[idxAktivnogElementa];
        AktivirajElement(true);
    };
    
    qKeys.GlobalChangeFocusBk = function () {
        /// <summary>Hendluje promenu fokusa unazad</summary>

        document.activeElement.blur();
        $bla.click();
        
        var noviIdx = idxAktivnogElementa - 1;
        if (polja.hasOwnProperty(noviIdx)) {
            DeaktivirajElement($aktivanElement);
            idxAktivnogElementa = noviIdx;
            $aktivanElement = polja[idxAktivnogElementa];
            AktivirajElement(true);
        }
    };

    qKeys.HendlerStrelica = function(e) {
        /// <summary>Hendluje stiskanje srelica i resporedjuje callback u odosu na tip aktivnog elementa</summary>
        /// <param name="keyCode" type="">event.ketCode</param>
        
        var tip = $aktivanElement.attr('data-focusable-tip');
        if (tip == 't1') {
            e.preventDefault();
            var $tr = $aktivanElement.find('.qTrKliknut'),
                $prev, $next;
            if ($tr.length) {
                if (e.keyCode == 38) {
                    $prev = $tr.prevAll(':visible').eq(0);
                    if ($prev.length) {
                        $tr.removeClass('qTrKliknut');
                        $prev.addClass('qTrKliknut').moveBodyTo();
                    }
                }
                if (e.keyCode == 40) {
                    $next = $tr.nextAll(':visible').eq(0);
                    if ($next.length) {
                        $tr.removeClass('qTrKliknut');
                        $next.addClass('qTrKliknut').moveBodyTo();
                    }
                }
            } else {
                aktivator[tip]($aktivanElement);
            }
        }
    };

    qKeys.HendlerEntera = function(e) {
        var tip = $aktivanElement.attr('data-focusable-tip');
        if (tip == 'r11') {
            $(document).trigger('quinta-changeFocus-fw');
        }
        if (tip == 'r4') {
            $aktivanElement.find('.qui').quiCheckBox('toggle');
        }
        if (tip == 't1') {
            e.preventDefault();
            $aktivanElement.find('.qTrKliknut').click();
        }
    };

    qKeys.HendlerDelete = function(e) {
        var tip = $aktivanElement.attr('data-focusable-tip');
        if (tip == 't1') {
            e.preventDefault();
            $aktivanElement.find('.qTrKliknut .x').click();
        }
    };
    

    qKeys.SkloniSveEventove = function() {
        /// <summary>Nesto tipa destruktora, skida sve zakacene eventove, brise ikonu...</summary>
        
        $(document).off('keydown', qKeys.GlobalKeydown);
        $(document).off('quinta-changeFocus-fw', qKeys.GlobalChangeFocusFw);
        $(document).off('quinta-changeFocus-bk', qKeys.GlobalChangeFocusBk);
        $('#keysIconWrap').remove();
    };
    
    qKeys.LogPrecice = function () { log(precice); };
    qKeys.LogPolja = function () { log(polja); };
    qKeys.LogAktivnoPolje = function () { var x = { obj: $aktivanElement, idx: idxAktivnogElementa }; log(x); };

}(window.qKeys = window.qKeys || {}, jQuery));
                            