
(function ($) {
    var cultures = $.global.cultures,
        en = cultures.en,
        standard = en.calendars.standard,
        culture = cultures["sr"] = $.extend(true, {}, en, {
            name: "sr",
            englishName: "Serbian",
            nativeName: "srpski",
            language: "sr",
            numberFormat: {
                pattern: ["- n"],
                ',': ".",
                '.': ",",
                percent: {
                    pattern: ["-n%", "n%"],
                    ',': ".",
                    '.': ","
                },
                currency: {
                    pattern: ["-n $", "n $"],
                    ',': ".",
                    '.': ",",
                    symbol: "din"
                }
            },
            calendars: {
                standard: $.extend(true, {}, standard, {
                    '/': ".",
                    firstDay: 1,
                    days: {
                        names: ["nedelja", "ponedjeljak", "utorak", "sreda", "četvrtak", "petak", "subota"],
                        namesAbbr: ["ned", "pon", "uto", "sre", "čet", "pet", "sub"],
                        namesShort: ["ne", "po", "ut", "sr", "če", "pe", "su"]
                    },
                    months: {
                        names: ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar", ""],
                        namesAbbr: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec", ""]
                    },
                    monthsGenitive: {
                        names: ["januara", "februara", "marta", "aprila", "maja", "juna", "jula", "avgusta", "septembara", "oktobara", "novembara", "decembara", ""],
                        namesAbbr: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec", ""]
                    },
                    AM: null,
                    PM: null,
                    patterns: {
                        d: "dd.MM.yyyy.",
                        D: "d. MMMM yyyy.",
                        t: "H:mm",
                        T: "H:mm:ss",
                        f: "d. MMMM yyyy. H:mm",
                        F: "d. MMMM yyyy. H:mm:ss",
                        M: "d. MMMM"
                    }
                })
            }
        }, cultures["sr"]);
    culture.calendar = culture.calendars.standard;
})(jQuery);