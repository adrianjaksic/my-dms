using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;

namespace DmsCore.Podesavanja
{
    public static class Konverzija
    {
        private static readonly Dictionary<char, char> ParoviZaKonverzijuUCirilicu = new Dictionary<char, char>
            {
                {'A', 'A'},
                {'B', 'Б'},
                {'C', 'Ц'},
                {'D', 'Д'},
                {'E', 'Е'},
                {'F', 'Ф'},
                {'G', 'Г'},
                {'H', 'Х'},
                {'I', 'И'},
                {'J', 'Ј'},
                {'K', 'К'},
                {'L', 'Л'},
                {'M', 'М'},
                {'N', 'Н'},
                {'O', 'О'},
                {'P', 'П'},
                {'R', 'Р'},
                {'S', 'С'},
                {'T', 'Т'},
                {'U', 'У'},
                {'V', 'В'},
                {'Z', 'З'},
                {'a', 'а'},
                {'b', 'б'},
                {'c', 'ц'},
                {'d', 'д'},
                {'e', 'е'},
                {'f', 'ф'},
                {'g', 'г'},
                {'h', 'х'},
                {'i', 'и'},
                {'j', 'ј'},
                {'k', 'к'},
                {'l', 'л'},
                {'m', 'м'},
                {'n', 'н'},
                {'o', 'о'},
                {'p', 'п'},
                {'r', 'р'},
                {'s', 'с'},
                {'t', 'т'},
                {'u', 'у'},
                {'v', 'в'},
                {'z', 'з'},
                {'Ć', 'Ћ'},
                {'ć', 'ћ'},
                {'Č', 'Ч'},
                {'č', 'ч'},
                {'Đ', 'Ђ'},
                {'đ', 'ђ'},
                {'Š', 'Ш'},
                {'š', 'ш'},
                {'Ž', 'Ж'},
                {'ž', 'ж'}
            };

        private static readonly Dictionary<char, string> ParoviZaKonverzijuULatinicu = new Dictionary<char, string>
            {
                {'A', @"A"},
                {'Б', @"B"},
                {'Ц', @"C"},
                {'Д', @"D"},
                {'Е', @"E"},
                {'Ф', @"F"},
                {'Г', @"G"},
                {'Х', @"H"},
                {'И', @"I"},
                {'Ј', @"J"},
                {'К', @"K"},
                {'Л', @"L"},
                {'М', @"M"},
                {'Н', @"N"},
                {'О', @"O"},
                {'П', @"P"},
                {'Р', @"R"},
                {'С', @"S"},
                {'Т', @"T"},
                {'У', @"U"},
                {'В', @"V"},
                {'З', @"Z"},
                {'а', @"a"},
                {'б', @"b"},
                {'ц', @"c"},
                {'д', @"d"},
                {'е', @"e"},
                {'ф', @"f"},
                {'г', @"g"},
                {'х', @"h"},
                {'и', @"i"},
                {'ј', @"j"},
                {'к', @"k"},
                {'л', @"l"},
                {'м', @"m"},
                {'н', @"n"},
                {'о', @"o"},
                {'п', @"p"},
                {'р', @"r"},
                {'с', @"s"},
                {'т', @"t"},
                {'у', @"u"},
                {'в', @"v"},
                {'з', @"z"},
                {'Ћ', @"Ć"},
                {'ћ', @"ć"},
                {'Ч', @"Č"},
                {'ч', @"č"},
                {'Ђ', @"Đ"},
                {'ђ', @"đ"},
                {'Ш', @"Š"},
                {'ш', @"š"},
                {'Ж', @"Ž"},
                {'ж', @"ž"},
                {'љ',@"lj"},
                {'Љ',@"Lj"},
                {'њ',@"nj"},
                {'Њ',@"Nj"},
                {'џ',@"dž"},
                {'Џ',@"Dž"},
            };

        public static string KonvertujUCirilicu(string tekst)
        {
            if (tekst != null)
            {
                var sb = new StringBuilder();
                for (int i = 0; i < tekst.Length; i++)
                {
                    char ch = tekst[i];
                    bool prost = true;
                    if (i + 1 < tekst.Length)
                    {
                        char sledeci = tekst[i + 1];
                        if (ch == 'l' || ch == 'L')
                        {
                            if (sledeci == 'j' || sledeci == 'J')
                            {
                                i++;
                                sb.Append(ch == 'L' ? @"Љ" : @"љ");
                                prost = false;
                            }
                        }

                        if (ch == 'n' || ch == 'N')
                        {
                            if (sledeci == 'j' || sledeci == 'J')
                            {
                                i++;
                                sb.Append(ch == 'N' ? @"Њ" : @"њ");
                                prost = false;
                            }
                        }

                        if (ch == 'd' || ch == 'D')
                        {
                            if (sledeci == 'j' || sledeci == 'J')
                            {
                                i++;
                                sb.Append(ch == 'D' ? @"Ђ" : @"ђ");
                                prost = false;
                            }
                            if (sledeci == 'ž' || sledeci == 'Ž')
                            {
                                i++;
                                sb.Append(ch == 'D' ? @"Џ" : @"џ");
                                prost = false;
                            }
                        }
                    }
                    if (prost)
                    {
                        sb.Append(ParoviZaKonverzijuUCirilicu.ContainsKey(ch) ? ParoviZaKonverzijuUCirilicu[ch] : ch);
                    }
                }
                return sb.ToString();
            }
            return null;
        }

        public static string KonvertujULatinicu(string tekst)
        {
            if (tekst != null)
            {
                var sb = new StringBuilder();
                foreach (var ch in tekst)
                {
                    if (ParoviZaKonverzijuULatinicu.ContainsKey(ch))
                    {
                        sb.Append(ParoviZaKonverzijuULatinicu[ch]);
                    }
                    else
                    {
                        sb.Append(ch);
                    }
                }
                return sb.ToString();
            }
            return null;
        }

        public static string VratiString(string jezik, string tekst)
        {
            return jezik == "1" ? KonvertujUCirilicu(tekst) : tekst;
        }

        public static string VratiException(string jezik, Exception exc)
        {
            if (exc is SqlException)
            {
                var sqlEx = exc as SqlException;
                if (sqlEx.ErrorCode > 2000)
                {
                    return VratiString(jezik, exc.Message);
                }
            }
            return exc.Message;
        }
    }
}
