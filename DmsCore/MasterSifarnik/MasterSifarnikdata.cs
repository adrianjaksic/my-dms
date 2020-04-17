using System.Collections.Generic;
using DmsCore.Logovanje;
using DmsCore.MasterSifarnik.Realizacije;

namespace DmsCore.MasterSifarnik
{
    public static class MasterSifarnikData
    {
        #region Master Sifarnik

        private static IMasterSifarnikModel VratiModelSifarnika(short tipDokumenta)
        {
            switch (tipDokumenta)
            {
                case 1:
                    return new OkruziModel();
                case 2:
                    return new OrganiModel();
                case 3:
                    return new KlaseModel();
                case 4:
                    return new JediniceModel();
                case 5:
                    return new VrstePredmetaModel();
                case 6:
                    return new TakseModel();
                case 7:
                    return new VrsteKretanjaPredmetaModel();
                case 8:
                    return new KorisniciModel();
                case 9:
                    return new PreciceModel();
                case 10:
                    return new OpstineModel();
                case 11:
                    return new MestaOpstineModel();
                case 12:
                    return new InspekcijeModel();
            }

            return null;
        }

        public static MasterSifarnikViewModel VratiSifarnikViewModel(short tipDokumenta, UlogovaniKorisnik korisnik)
        {
            var vm = VratiModelSifarnika(tipDokumenta).VratiViewModel(korisnik);
            if (vm.Elementi == null)
            {
                vm.Elementi = new List<ElementSifarnika>();
            }
            return vm;
        }

        public static List<ElementSifarnika> VratiPodatke(short tipDokumenta, string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).VratiPodatke(kriterijum1, kriterijum2, kriterijum3, korisnik);
        }

        public static List<PodatakElementaSifarnika> VratiPodatkeElementa(short tipDokumenta, string idElementa, string idNadredjenogElementa, string kriterijum1, string kriterijum2, string kriterijum3, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).VratiPodatkeElementa(idElementa, idNadredjenogElementa, kriterijum1, kriterijum2, kriterijum3, korisnik);
        }

        public static ElementSifarnika SnimiPodatkeElementa(short tipDokumenta, string idElementa, List<PodatakElementaSifarnika> podaci, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).SnimiPodatkeElementa(idElementa, podaci, korisnik);
        }

        public static bool ObrisiElement(short tipDokumenta, string idElementa, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).ObrisiElement(idElementa, korisnik);
        }

        public static List<PodaciZaIzbor> VratiPodatkeKriterijuma2(short tipDokumenta, string kriterijum1, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).VratiPodatkeKriterijuma2(kriterijum1, korisnik);
        }

        public static List<PodaciZaIzbor> VratiPodatkeKriterijuma3(short tipDokumenta, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).VratiPodatkeKriterijuma3(kriterijum1, kriterijum2, korisnik);
        }

        public static List<PodaciZaIzbor> VratiPodatkeZavisnogElementa(short tipDokumenta, string idElementa, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).VratiPodatkeZavisnogElementa(idElementa, kriterijum1, kriterijum2, korisnik);
        }

        public static List<PodatakElementaSifarnika> VratiZavisnePodatkeElementa(short tipDokumenta, string idElementa, string idElementaPodatka, string kriterijum1, string kriterijum2, UlogovaniKorisnik korisnik)
        {
            return VratiModelSifarnika(tipDokumenta).VratiZavisnePodatkeElementa(idElementa, idElementaPodatka, kriterijum1, kriterijum2, korisnik);
        }

        #endregion
    }
}
