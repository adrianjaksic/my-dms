using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using DmsCore.Logovanje;

namespace DmsCore.Podesavanja
{
    public static class ExceptionParser
    {
        public static List<int> SqlDeadlock = new List<int>
                                                 {
                                                     1205,
                                                     2755,
                                                     3635,
                                                     3928,
                                                     5231,
                                                     5252,
                                                     17888
                                                 };

        public static List<int> SqlLoginfailed = new List<int>
                                                     {
                                                         4060,
                                                         4064,
                                                         17197,
                                                         18450,
                                                         18451,
                                                         18452,
                                                         18456,
                                                         18457,
                                                         18458,
                                                         18459,
                                                         18460,
                                                         18461,
                                                         18462,
                                                         18463,
                                                         18464,
                                                         18465,
                                                         18466,
                                                         18467,
                                                         18468,
                                                         18470,
                                                         18471,
                                                         18486,
                                                         18487,
                                                         18488
                                                     };

        public static List<int> SqlForeignkey = new List<int>
                                                    {
                                                        1715,
                                                        1753,
                                                        1756,
                                                        1757,
                                                        1761,
                                                        1762,
                                                        1763,
                                                        1765,
                                                        1766,
                                                        1767,
                                                        1768,
                                                        1769,
                                                        1770,
                                                        1771,
                                                        1772,
                                                        1776,
                                                        1778,
                                                        1785,
                                                        1786,
                                                        1787,
                                                        1788,
                                                        1930,
                                                        1971,
                                                        1989,
                                                        1991,
                                                        1992,
                                                        2113,
                                                        3725,
                                                        3726,
                                                        3730,
                                                        4712,
                                                        4968,
                                                        4969,
                                                        4974,
                                                        8138,
                                                        8139,
                                                        14379,
                                                        15252,
                                                        15470,
                                                        15599,
                                                        20637,
                                                        21537,
                                                        21570,
                                                        21572,
                                                        21573,
                                                        21576,
                                                        21724
                                                    };

        public static List<int> SqlPrimarykey = new List<int>
                                                   {
                                                       332,
                                                       962,
                                                       1711,
                                                       1773,
                                                       1774,
                                                       1775,
                                                       1779,
                                                       1996,
                                                       2735,
                                                       2782,
                                                       3734,
                                                       4440,
                                                       4444,
                                                       4445,
                                                       4967,
                                                       6332,
                                                       6831,
                                                       6832,
                                                       8110,
                                                       8111,
                                                       8151,
                                                       8183,
                                                       10605,
                                                       14088,
                                                       15596,
                                                       18756,
                                                       20519,
                                                       20520,
                                                       21250,
                                                       21264,
                                                       21460,
                                                       21663,
                                                       21666,
                                                       21730,
                                                       21782,
                                                       21834,
                                                       21835,
                                                       21839
                                                   };

        public static List<int> SqlUniqueindex = new List<int>
                                                    {
                                                        1505,
                                                        1908,
                                                        1915,
                                                        2601,
                                                        15596,
                                                        21203,
                                                        21265,
                                                        21347,
                                                        21750
                                                    };


        public static List<int> SqlTimeout = new List<int>
                                                 {
                                                     577,
                                                     847,
                                                     1421,
                                                     1476,
                                                     5245,
                                                     9204,
                                                     15163,
                                                     17197,
                                                     17830,
                                                     21417
                                                 };

        public static List<int> SqlServerProcedureFunctionVersion = new List<int>
                                                                        {
                                                                            189,
                                                                            201,
                                                                            203,
                                                                            212,
                                                                            214,
                                                                            215,
                                                                            216,
                                                                            515,
                                                                        };

        public static List<int> SqlInvalidColumnName = new List<int>
                                                           {
                                                               207,
                                                               209
                                                           };

        public const int SqlServernotaccesible = 53;

        public const int SqlCustomexception = 50000;

        public static int SqlAccesdenied = 17;

        public static string Parsiraj(UlogovaniKorisnik korisnik, Exception ex)
        {
            if (korisnik.Jezik != null)
            {
                return Parsiraj(korisnik.Jezik, ex);
            }
            return string.Empty;
        }

        public static string Parsiraj(string jezik, Exception ex)
        {
            if (ex is SqlException)
            {
                var sqlEx = ex as SqlException;

                if (sqlEx.Number == SqlCustomexception)
                {
                    return Konverzija.VratiString(jezik, sqlEx.Message);
                }

                int error = sqlEx.Number;

                if (error == SqlAccesdenied)
                {
                    return Konverzija.VratiString(jezik, "Greška u konekciji. Konekciji na server ne može da se ostvari.");
                }
                if (error == SqlServernotaccesible)
                {
                    return Konverzija.VratiString(jezik, "Greška u konekciji. Problem prilikom logovanja na server.");
                }
                if (SqlLoginfailed.Contains(error))
                {
                    return Konverzija.VratiString(jezik, "Greška u konekciji. Problem prilikom logovanja na server.");
                }
                if (SqlDeadlock.Contains(error))
                {
                    return Konverzija.VratiString(jezik, "Greška u konekciji. Resursi potrebni za izvršavanje zadatog procesa su zauzeti nekim drugim procesom.");
                }
                if (SqlTimeout.Contains(error))
                {
                    return Konverzija.VratiString(jezik, "Greška u konekciji. Server je trenutno zauzet. Pokušajte malo kasnije.");
                }
                if (SqlForeignkey.Contains(error))
                {
                    return Konverzija.VratiString(jezik, "Greška u radu sa bazom. Strani ključ je narušen.");
                }
                if (SqlPrimarykey.Contains(error))
                {
                    return string.Format(Konverzija.VratiString(jezik,"Vrednost polja koje je jedinstveno već postoji. {0}"), sqlEx.Message);
                }
                if (SqlUniqueindex.Contains(error))
                {
                    return string.Format(Konverzija.VratiString(jezik, "Vrednost polja koje je jedinstveno već postoji. {0}"), sqlEx.Message);
                }
                if (SqlServerProcedureFunctionVersion.Contains(error))
                {
                    return string.Format(Konverzija.VratiString(jezik, "Greška u radu sa bazom. Verzija procedure ili funkcije nije odgovarajuća. {0}"), sqlEx.Message);
                }
                if (SqlInvalidColumnName.Contains(error))
                {
                    return string.Format(Konverzija.VratiString(jezik, "Greška u radu sa bazom. Nedostaje kolona. {0}"), sqlEx.Message);
                }
                if (error < SqlCustomexception)
                {
                    return string.Format(Konverzija.VratiString(jezik, "Greška u radu. {0}"), Konverzija.VratiString(jezik, sqlEx.Message));
                }
            }

            if (ex.InnerException is SqlException)
            {
                return Parsiraj(jezik, ex.InnerException);
            }

            return ex.Message;
        }
    }
}
