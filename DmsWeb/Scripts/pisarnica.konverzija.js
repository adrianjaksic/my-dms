/// <reference path="quinta.ui.js" />
(function (qKonverzija, $, undefined) {

    var mapaZaKonverzijuUCirilicu = {
        A: "А",
        B: "Б",
        C: "Ц",
        D: "Д",
        E: "Е",
        F: "Ф",
        G: "Г",
        H: "Х",
        I: "И",
        J: "Ј",
        K: "К",
        L: "Л",
        M: "М",
        N: "Н",
        O: "О",
        P: "П",
        R: "Р",
        S: "С",
        T: "Т",
        U: "У",
        V: "В",
        Z: "З",
        a: "а",
        b: "б",
        c: "ц",
        d: "д",
        e: "е",
        f: "ф",
        g: "г",
        h: "х",
        i: "и",
        j: "ј",
        k: "к",
        l: "л",
        m: "м",
        n: "н",
        o: "о",
        p: "п",
        r: "р",
        s: "с",
        t: "т",
        u: "у",
        v: "в",
        z: "з",
        Ć: "Ћ",
        ć: "ћ",
        Č: "Ч",
        č: "ч",
        Đ: "Ђ",
        đ: "ђ",
        Š: "Ш",
        š: "ш",
        Ž: "Ж",
        ž: "ж"
    };

    var mapaZaKonverzijuULatinicu = {
        А: "A",
        Б: "B",
        Ц: "C",
        Д: "D",
        Е: "E",
        Ф: "F",
        Г: "G",
        Х: "H",
        И: "I",
        Ј: "J",
        К: "K",
        Л: "L",
        М: "M",
        Н: "N",
        О: "O",
        П: "P",
        Р: "R",
        С: "S",
        Т: "T",
        У: "U",
        В: "V",
        З: "Z",
        а: "a",
        б: "b",
        ц: "c",
        д: "d",
        е: "e",
        ф: "f",
        г: "g",
        х: "h",
        и: "i",
        ј: "j",
        к: "k",
        л: "l",
        м: "m",
        н: "n",
        о: "o",
        п: "p",
        р: "r",
        с: "s",
        т: "t",
        у: "u",
        в: "v",
        з: "z",
        Ћ: "Ć",
        ћ: "ć",
        Ч: "Č",
        ч: "č",
        Ђ: "Đ",
        ђ: "đ",
        Ш: "Š",
        ш: "š",
        Ж: "Ž",
        ж: "ž",
        љ: "lj",
        Љ: "Lj",
        њ: "nj",
        Њ: "Nj",
        џ: "dž",
        Џ: "Dž"
    };

    qKonverzija.KonvertujUCirilicu = function (tekst) {
        if (tekst && tekst.length > 0) {
            var konvertovanTekst = "";
            for (var i = 0; i < tekst.length; ++i) {

                var ch = tekst[i];
                var prost = true;

                if (i + 1 < tekst.length) {
                    var sledeci = tekst[i + 1];

                    if (ch == 'l' || ch == 'L')
                    {
                        if (sledeci == 'j' || sledeci == 'J')
                        {
                            i++;
                            konvertovanTekst += ch == 'L' ? "Љ" : "љ";
                            prost = false;
                        }
                    }

                    if (ch == 'n' || ch == 'N')
                    {
                        if (sledeci == 'j' || sledeci == 'J')
                        {
                            i++;
                            konvertovanTekst += ch == 'N' ? "Њ" : "њ";
                            prost = false;
                        }
                    }

                    if (ch == 'd' || ch == 'D')
                    {
                        if (sledeci == 'j' || sledeci == 'J')
                        {
                            i++;
                            konvertovanTekst += ch == 'D' ? "Ђ" : "ђ";
                            prost = false;
                        }
                        if (sledeci == 'ž' || sledeci == 'Ž')
                        {
                            i++;
                            konvertovanTekst += ch == 'D' ? "Џ" : "џ";
                            prost = false;
                        }
                    }                    
                }
                if (prost) {
                    konvertovanTekst += mapaZaKonverzijuUCirilicu.hasOwnProperty(ch) ? mapaZaKonverzijuUCirilicu[ch] : ch;
                }
            }
            return konvertovanTekst;
        }
        return undefined;
    };

    qKonverzija.KonvertujULatinicu = function (tekst) {
        if (tekst && tekst.length > 0)
        {
            var konvertovanTekst = "";

            for(var i = 0; i < tekst.length; ++i)
            {
                var ch = tekst[i];
                if (mapaZaKonverzijuULatinicu.hasOwnProperty(ch))
                {
                    konvertovanTekst += mapaZaKonverzijuULatinicu[ch];
                }
                else
                {
                    konvertovanTekst += ch;
                }
            }
            return konvertovanTekst;
        }
        return undefined;
    };

    qKonverzija.VratiLokalizovaniTekst = function (tekst) {
        var jezik = $.cookie("_lang");

        if (tekst && tekst.length > 0) {
            return jezik == "1" ? qKonverzija.KonvertujUCirilicu(tekst) : tekst;
        }

        return tekst;

    };

    qKonverzija.Init = function () {

    };

}(window.qKonverzija = window.qKonverzija || {}, jQuery));