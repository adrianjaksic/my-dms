using System;
using System.Collections.Generic;

namespace DmsCore.Izvestaji
{
    public class PregledPretmetaPoOpstinamaZaglavlje
    {
        public DateTime DoDatuma { get; set; }

        public DateTime OdDatuma { get; set; }

        public List<PredmetPoOpstinama> Stavke { get; set; }
    }
}
