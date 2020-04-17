using System;
using System.IO;
using System.Security.Cryptography;

namespace DmsCore.Data
{
    public static class DmsFileManager
    {
        private static string s_PutanjaNovihFajlova = "C:/DMS/Pisarnica/";

        static DmsFileManager()
        {
            Directory.CreateDirectory(s_PutanjaNovihFajlova);
        }

        public static void PostaviPutanju(string putanja)
        {
            s_PutanjaNovihFajlova = putanja;
            Directory.CreateDirectory(s_PutanjaNovihFajlova);
        }

        public static string SacuvajFajl(string putanja)
        {
            var guid = Guid.NewGuid().ToString();
            var novaPutanja = string.Format("{0}{1}{2}", s_PutanjaNovihFajlova, guid, Path.GetFileName(putanja));
            File.Copy(putanja, novaPutanja);
            File.Delete(putanja);
            return novaPutanja;
        }

        /// <summary>
        /// PutanjaContent da se zavrsava sa /
        /// </summary>
        public static string VratiLink(string putanjaFajla)
        {
            var putanjaContent = string.Format("{0}{1}", PutanjaAplikacije.PutanjaDMSa, Path.GetFileName(putanjaFajla));

            if (File.Exists(putanjaFajla))
            {
                if (!File.Exists(putanjaContent))
                {
                    File.Copy(putanjaFajla, putanjaContent);
                }
                return string.Format(@"{0}{1}", PutanjaAplikacije.PutanjaDMSaWeb, Path.GetFileName(putanjaContent));
            }
            else
            {
                if (File.Exists(putanjaContent))
                {
                    File.Copy(putanjaContent, putanjaFajla);
                    return string.Format(@"{0}{1}", PutanjaAplikacije.PutanjaDMSaWeb, Path.GetFileName(putanjaContent));
                }
            }

            return null;
        }

        public static string GetMD5(string putanja)
        {
            byte[] hashBytes;
            using (var inputFileStream = File.Open(putanja, FileMode.Open))
            {
                var md5 = MD5.Create();
                hashBytes = md5.ComputeHash(inputFileStream);
            }
            return hashBytes.ToString();
        }
    }
}
