using System.Collections.Generic;

namespace DmsCore.Dms
{
    public class DMSPredmeta
    {
        public long IdPredmeta { get; set; }

        public List<PodaciDokumenta> Dokumenti { get; set; }

        public List<string> DozvoljeneEkstenzije { get; set; }

        public bool DozvoljenoVracanjeObrisanog { get; set; }

        public int MaksimalnaVelicina { get; set; }
    }
}
