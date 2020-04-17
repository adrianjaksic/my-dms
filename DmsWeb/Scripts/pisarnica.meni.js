/// <reference path="jquery-1.7.2-vsdoc.js" />
/// <reference path="quinta.ui.js" />
/// <reference path="quinta.putanje.js" />
/// <reference path="pisarnica.konverzija.js" />

$(document).ready(function () {
    var url_OdlogujKorisnika = $('#url_OdlogujKorisnika').text();
    var url_PodesiJezik = $('#url_PodesiJezik').text();

    $("#divPocetnaStranica").click(function () {
        window.location.href = _pathHome;
    });
    
    $('#divLogOutPodesavanja').click(function () {
        $.ajax({
            url: url_OdlogujKorisnika,
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }
                
                window.location = _pathApp + "Account/Index";
            },
            error: function () {
            },
            type: "GET"
        });

    });

    $('#homeStranica').click(function() {
        window.location.href = _pathHome;
    });

    $('#divJezikPodesavanja').click(function () {
        var jezik = $(this).attr('data-jezik');

        $.ajax({
            type: 'GET',
            url: url_PodesiJezik,
            data: {
                jezik: jezik
            },
            success: function (data) {
                if (data.Greska) {
                    PrikaziProzor(true, true, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                    return;
                }

                qLang.setLang(jezik, true);
            },
            complete: function () {
            }
        });
        
    });

    $('#divPromenaLozinke').click(function () {
        var url_PromeniLozinku = $('#url_PromeniLozinku').text();
        sigPitanja.potOtkPitanje.removeAll();
        sigPitanja.potOtkPitanje.add(function (odg) {
            if (odg) {
                var staraSifr = $('#prozorClone').find('#txtStaraSifraP').val().trim();
                var novaSifr = $('#prozorClone').find('#txtNovaSifraP').val().trim();
                var novaPonSifr = $('#prozorClone').find('#txtNovaSifraPonovoP').val().trim();

                if (staraSifr == "" || novaSifr == "" || novaPonSifr == "") {
                    $('#divPorukaZaPromenuSifre span').text(qKonverzija.VratiLokalizovaniTekst('Morate popuniti sva polja!'));
                    $('#prozorClone').find('#divPorukaZaPromenuSifre').show();
                    return false;
                }

                if (novaSifr != novaPonSifr) {
                    $('#divPorukaZaPromenuSifre span').text(qKonverzija.VratiLokalizovaniTekst('Nova i ponovljena lozinka moraju biti iste!'));
                    $('#prozorClone').find('#divPorukaZaPromenuSifre').show();
                    return false;
                }

                if (novaSifr.length < 6) {
                    $('#divPorukaZaPromenuSifre span').text(qKonverzija.VratiLokalizovaniTekst('Nova lozinka mora imati najmanje 6 karaktera!'));
                    $('#prozorClone').find('#divPorukaZaPromenuSifre').show();
                    return false;
                }

                var letterNumber = /[A-Za-z].*[0-9]|[0-9].*[A-Za-z]|[а-шА-Ш].*[0-9]|[0-9].*[а-шА-Ш]/;
                if (!novaSifr.match(letterNumber)) {
                    $('#divPorukaZaPromenuSifre span').text(qKonverzija.VratiLokalizovaniTekst('Lozinka se mora sastojati iz slova i brojeva!'));
                    $('#prozorClone').find('#divPorukaZaPromenuSifre').show();
                    return false;
                }
                PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Molim sačekajte..') + '<br><br><img src="' + _pathImg + 'loadProgress2.gif" alt="" />', 'ucitavanje');

                $.ajax({
                    type: 'POST',
                    url: url_PromeniLozinku,
                    data: {
                        staraSifra: staraSifr,
                        novaSifra: novaSifr
                    },
                    success: function (data) {
                        if (data.Greska) {

                            PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('GREŠKA'), data.Poruka, 'greska');
                            return;
                        }

                        PrikaziProzor(true, false, qKonverzija.VratiLokalizovaniTekst('OBAVEŠTENJE'), qKonverzija.VratiLokalizovaniTekst('Uspešno ste promenili lozinku'), 'difolt');
                    },
                    complete: function() {
                        
                    }
                });
            } else {
                PrikaziProzor(false);
            }

        });
        var $temp = $('#wrapProzorZaPromenuSifre').clone().attr('id', 'prozorClone');
        $temp.find('#divPorukaZaPromenuSifre').hide();
        PrikaziProzor(1, 1, qKonverzija.VratiLokalizovaniTekst('Promena lozinke'), $temp.show(), 'pitanje', qKonverzija.VratiLokalizovaniTekst('Promeni') + '|' + qKonverzija.VratiLokalizovaniTekst('Odustani'));
        
    });
});