using System.Data.SqlClient;
using System.IO;

namespace DmsCore.Data
{
    public static class DmsData
    {
        private static string s_ConnectionString = null;

        public static string Naziv = "DMS TEST";

        public static string EmailHost { get; private set; }
        public static int EmailPort { get; private set; }
        public static string EmailUsername { get; private set; }
        public static string EmailPassword { get; private set; }
        public static string JiraUrl { get; private set; }

        public static object JiraUsername { get; private set; }
        public static object JiraPassword { get; private set; }

        public static bool PromenaDatumaDozvoljena;

        public static void Inicijalizacija()
        {
            UcitajPodesavanjeIzTxt();
            using (var context = DmsData.GetContext())
            {
                context.server_Start(PromenaDatumaDozvoljena);
            }
        }

        private static void UcitajPodesavanjeIzTxt()
        {
            var txtFile = string.Format(@"{0}Config.txt", PutanjaAplikacije.Putanja);

            if (File.Exists(txtFile))
            {
                using (var sr = new StreamReader(txtFile))
                {
                    string line = string.Empty;
                    while (line != null)
                    {
                        line = sr.ReadLine();
                        if (line != null)
                        {
                            var split = line.Split('|');
                            string split1 = null;
                            string split2 = null;
                            if (split.Length >= 1)
                            {
                                split1 = split[0];
                                if (split1 != null)
                                {
                                    split1 = split1.ToUpper();
                                }
                            }
                            if (split.Length >= 2)
                            {
                                split2 = split[1];
                            }

                            if (split1 == @"SERVER")
                            {
                                s_ConnectionString = split2;
                            }

                            if (split1 == @"NAZIV")
                            {
                                Naziv = split2;
                            }

                            if (split1 == @"PUTANJA")
                            {
                                DmsFileManager.PostaviPutanju(split2);
                            }

                            if (split1 == @"PROMENADATUMA")
                            {
                                PromenaDatumaDozvoljena = true;
                            }

                            if (split1 == @"JIRA")
                            {
                                if (!string.IsNullOrEmpty(split2))
                                {
                                    var jiraSplit = split1.Split(',');
                                    if (jiraSplit.Length >= 3)
                                    {
                                        JiraUrl = jiraSplit[0];
                                        JiraUsername = jiraSplit[1];
                                        JiraPassword = jiraSplit[2];
                                    }
                                }
                            }

                            if (split1 == @"EMAIL")
                            {
                                if (!string.IsNullOrEmpty(split2))
                                {
                                    var emailSplit = split1.Split(',');
                                    if (emailSplit.Length >= 4)
                                    {
                                        int.TryParse(split[1], out int port);
                                        EmailHost = emailSplit[0];
                                        EmailPort = port;
                                        EmailUsername = emailSplit[2];
                                        EmailPassword = emailSplit[3];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        public static DmsDataDataContext GetContext()
        {
            var ctx = new DmsDataDataContext(s_ConnectionString)
            {
                CommandTimeout = 300
            };
            return ctx;
        }

        internal static DmsDataDataContext GetContext(SqlConnection con)
        {
            return new DmsDataDataContext(con);
        }

        internal static DmsDataDataContext GetContextWithTransaction()
        {
            var connection = new SqlConnection(s_ConnectionString);
            connection.Open();
            var transaction = connection.BeginTransaction();
            var context = GetContext(connection);
            context.Transaction = transaction;
            context.CommandTimeout = 300;
            return context;
        }
    }
}
