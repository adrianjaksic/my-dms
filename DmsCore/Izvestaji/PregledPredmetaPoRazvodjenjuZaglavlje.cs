using System;
using System.Collections.Generic;

namespace DmsCore.Izvestaji
{
    public class PregledPredmetaPoRazvodjenjuZaglavlje
    {
        public DateTime DoDatuma { get; set; }

        public DateTime OdDatuma { get; set; }

        public List<PredmetPoRazvodjenju> Stavke { get; set; }
    }
}
