using System;
using System.Collections.Generic;
using System.Linq;
using DmsCore.Data;
using DmsCore.Helperi;
using DmsCore.Logovanje;
using DmsCore.Podesavanja;

namespace DmsCore.MasterSifarnik.Realizacije
{
    public class PreciceModel : IMasterSifarnikModel
    {
        public MasterSifarnikViewModel VratiViewModel(UlogovaniKorisnik korisnik)
        {
            return new MasterSifarnikViewModel
            {
                Naziv = Konverzija.VratiString(korisnik.Jezik, "Prečice"),
                DodavanjeIdeNaRoot = true,
                DozvoljenoDodavanje = false,
                DozvoljenaIzmena = true,
                DozvoljenoBrisanje = false,
                PrikaziStablo = true,
                Elementi = VratiPodatke(null, null, null, korisnik),
            };
        }

        public List<ElementSifarnika> VratiPodatke(string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                return context.precica_VratiPreciceKorisnika(korisnik.IdKorisnika).Select(element => new ElementSifarnika
                {
                    IdElementa = string.Format(@"{0}", element.IdPrecice),
                    Naziv = Konverzija.VratiString(korisnik.Jezik, element.Tekst.SrediZaSnimanje(50)),
                    Aktivan = true,
                    DozvoljenoDodavanje = false,
                    DozvoljenaIzmena = true,
                    DozvoljenoBrisanje = false,
                    IdNadredjenogElementa = null,
                }).ToList();
            }
        }

        public List<PodatakElementaSifarnika> VratiPodatkeElementa(string idElementa, string idNadredjenogElementa, string kriterijum1, string kriterijum2,
                                         string kriterijum3, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContext())
            {
                if (!string.IsNullOrEmpty(idElementa))
                {
                    var precica = context.precica_VratiPrecicu(korisnik.IdKorisnika, Byte.Parse(idElementa)).SingleOrDefault();

                    if (precica == null)
                    {
                        throw new ApplicationException("Prečica ne postoji.");
                    }

                    return new List<PodatakElementaSifarnika>
                    {
                        new PodatakElementaSifarnika
                        {
                            Id = 0,
                            Naziv = Konverzija.VratiString(korisnik.Jezik, "Tekst"),
                            NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                            TipPodatka = PodatakElementaSifarnika.TipoviE.TekstEditor,
                            Vrednost = Konverzija.VratiString(korisnik.Jezik, precica.Tekst)
                        },
                    };
                }

                return new List<PodatakElementaSifarnika>
                {
                    new PodatakElementaSifarnika
                    {
                        Id = 0,
                        Naziv = Konverzija.VratiString(korisnik.Jezik, "Tekst"),
                        NazivGrupe = Konverzija.VratiString(korisnik.Jezik, "Podaci"),
                        TipPodatka = PodatakElementaSifarnika.TipoviE.TekstEditor,
                        Vrednost = ""
                    },
                };
            }
        }

        public ElementSifarnika SnimiPodatkeElementa(string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            using (var context = DmsData.GetContextWithTransaction())
            {
                var noviElement = new ElementSifarnika();

                byte? idPrecice = null;
                if (!string.IsNullOrEmpty(idElementa))
                {
                    idPrecice = Byte.Parse(idElementa);
                }

                try
                {
                    string tekst = null;

                    foreach (PodatakElementaSifarnika element in podaci)
                    {
                        switch (element.Id)
                        {
                            case 0:
                                tekst = element.Vrednost;
                                break;
                        }
                    }

                    if (string.IsNullOrEmpty(tekst))
                    {
                        throw new ApplicationException("Tekst prečice nije unet.");
                    }

                    if (tekst != null && tekst.Length > 2000)
                    {
                        throw new ApplicationException("Tekst prečice ima više od 2000 karaktera.");
                    }

                    context.precica_SnimiPrecicu(korisnik.IdKorisnika, idPrecice, tekst.SrediZaSnimanje(2000));

                    noviElement.IdElementa = string.Format(@"{0}", idPrecice);
                    noviElement.Naziv = Konverzija.VratiString(korisnik.Jezik, tekst.SrediZaSnimanje(50));
                    noviElement.Aktivan = true;
                    noviElement.DozvoljenoBrisanje = false;
                    noviElement.DozvoljenoDodavanje = false;
                    noviElement.DozvoljenaIzmena = true;
                    noviElement.IdNadredjenogElementa = null;

                    context.Transaction.Commit();
                }
                catch (Exception)
                {
                    context.Transaction.Rollback();
                    throw;
                }
                finally
                {
                    context.Connection.Close();
                }

                return noviElement;

            }
        }

        public bool ObrisiElement(string idElementa, UlogovaniKorisnik korisnik)
        {
            throw new System.NotImplementedException();
        }

        public List<PodaciZaIzbor> VratiPodatkeKriterijuma2(string kriterijum1, UlogovaniKorisnik korisnik)
        {
            return null;
        }

        public List<PodaciZaIzbor> VratiPodatkeKriterijuma3(string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return null;
        }

        public List<PodaciZaIzbor> VratiPodatkeZavisnogElementa(string idElementa, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return null;
        }

        public List<PodatakElementaSifarnika> VratiZavisnePodatkeElementa(string idElementa, string idElementaPodatka, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return null;
        }
    }
}
