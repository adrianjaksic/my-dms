namespace DmsCore.Helperi
{
    public static class StringHelper
    {
        public static string SrediZaPretragu(this string str)
        {
            if (str != null)
            {
                str = str.Trim();
                str = str.Replace('*', '%');
                str = str != string.Empty ? str : null;
            }
            return str;
        }

        public static string SrediZaSnimanje(this string str)
        {
            if (str != null)
            {
                str = str.Trim();
                str = str != string.Empty ? str : null;
            }
            return str;
        }

        public static string SrediZaSnimanje(this string str, int maxDuzina)
        {
            str = SrediZaSnimanje(str);
            if (str != null)
            {
                if (str.Length > maxDuzina)
                {
                    str = str.Substring(0, maxDuzina);
                }
                str = str != string.Empty ? str : null;
            }
            return str;
        }

        public static string SrediZaPretragu(this string str, int maxDuzina)
        {
            if (str != null)
            {
                str = str.Trim();
                str = str.Replace('*', '%');
                if (str.Length > maxDuzina)
                {
                    str = str.Substring(0, maxDuzina);
                }
                str = str != string.Empty ? str : null;
                return str;
            }
            return null;
        }
    }
}
