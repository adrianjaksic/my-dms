using System;
using System.Data.Linq;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;

namespace DmsWeb.Infrastructure
{
    public static class ImageHelper
    {
        public static byte[] ImageToByteArray(this Image imageIn)
        {
            if (imageIn == null) return new byte[0];
            using (var ms = new MemoryStream())
            {
                imageIn.Save(ms, ImageFormat.Jpeg);
                return ms.ToArray();
            }
        }

        public static Image ByteArrayToImage(Binary binary)
        {
            if (binary == null || binary.Length == 0) return null;
            using (var ms = new MemoryStream(binary.ToArray()))
            {
                return Image.FromStream(ms);
            }
        }

        public static Image ResizeImage(Image srcImage, int newWidth, int maxWidth, int newHeight, int maxHeight)
        {
            if (newHeight > maxHeight)
            {
                maxHeight = newHeight;
            }
            if (newWidth > maxWidth)
            {
                maxWidth = newWidth;
            }
            var x = (int)Math.Truncate(((decimal)(maxWidth - newWidth)) / 2);
            Image newImage = new Bitmap(maxWidth, maxHeight);
            using (Graphics gr = Graphics.FromImage(newImage))
            {
                gr.SmoothingMode = SmoothingMode.HighQuality;
                gr.InterpolationMode = InterpolationMode.HighQualityBicubic;
                gr.PixelOffsetMode = PixelOffsetMode.HighQuality;
                gr.Clear(Color.White);
                gr.DrawImage(srcImage, new Rectangle(x, 0, newWidth, newHeight));
            }
            return newImage;
        }

        public static byte[] SrediSliku(string putanja, decimal maxX, decimal maxY, bool zadrziVelicinu)
        {
            Image slikaNova = null;
            byte[] slikaByte;
            using (var m = new FileStream(putanja, FileMode.Open, FileAccess.Read))
            {
                using (Image slika = Image.FromStream(m))
                {
                    if (slika.Width > maxX || slika.Height > maxY)
                    {
                        decimal x = slika.Width / maxX;
                        decimal y = slika.Height / maxY;
                        if (x > y)
                        {
                            y = slika.Height / x;
                            x = maxX;
                        }
                        else
                        {
                            x = slika.Width / y;
                            y = maxY;
                        }
                        slikaNova = zadrziVelicinu ? ResizeImage(slika, (int)Math.Truncate(x), (int)Math.Truncate(maxX), (int)Math.Truncate(y), (int)Math.Truncate(maxY)) : ResizeImage(slika, (int)Math.Truncate(x), 0, (int)Math.Truncate(y), 0);

                        slikaByte = slikaNova.ImageToByteArray();
                    }
                    else
                    {
                        slikaByte = slika.ImageToByteArray();
                    }
                }
            }
            if (slikaNova != null)
            {
                File.Delete(putanja);
                using (var m = new FileStream(putanja, FileMode.Create, FileAccess.Write))
                {
                    ImageCodecInfo codec = ImageCodecInfo.GetImageEncoders().First(c => c.MimeType == @"image/jpeg");

                    var parameters = new EncoderParameters(3);
                    parameters.Param[0] = new EncoderParameter(Encoder.Quality, 90L);
                    parameters.Param[1] = new EncoderParameter(Encoder.ScanMethod, (int)EncoderValue.ScanMethodInterlaced);
                    parameters.Param[2] = new EncoderParameter(Encoder.RenderMethod, (int)EncoderValue.RenderProgressive);

                    slikaNova.Save(m, codec, parameters);
                }
                slikaNova.Dispose();
            }
            return slikaByte;
        }

        public static MemoryStream SrediSliku(Image slika, decimal maxX, decimal maxY, bool zadrziVelicinu)
        {
            if (slika.Width > maxX || slika.Height > maxY)
            {
                decimal x = slika.Width / maxX;
                decimal y = slika.Height / maxY;
                if (x > y)
                {
                    y = slika.Height / x;
                    x = maxX;
                }
                else
                {
                    x = slika.Width / y;
                    y = maxY;
                }
                slika = zadrziVelicinu ? ResizeImage(slika, (int)Math.Truncate(x), (int)Math.Truncate(maxX), (int)Math.Truncate(y), (int)Math.Truncate(maxY)) : ResizeImage(slika, (int)Math.Truncate(x), 0, (int)Math.Truncate(y), 0);
            }
            var m = new MemoryStream();
            ImageCodecInfo codec = ImageCodecInfo.GetImageEncoders().First(c => c.MimeType == @"image/jpeg");

            var parameters = new EncoderParameters(3);
            parameters.Param[0] = new EncoderParameter(Encoder.Quality, 90L);
            parameters.Param[1] = new EncoderParameter(Encoder.ScanMethod, (int)EncoderValue.ScanMethodInterlaced);
            parameters.Param[2] = new EncoderParameter(Encoder.RenderMethod, (int)EncoderValue.RenderProgressive);

            slika.Save(m, codec, parameters);
            return m;
        }

        public static void CreateThumbnail(string putanjaSlike, string putanjaThumbnaila)
        {
            if (putanjaThumbnaila == null) return;
            if (putanjaSlike == null) return;

            string extenzija = Path.GetExtension(putanjaSlike);
            if (extenzija == null) return;
            extenzija = extenzija.TrimStart('.').ToLower();

            if (extenzija != @"jpg" && extenzija != @"jpeg" && extenzija != @"gif" || extenzija != @"png" && extenzija != @"bmp") return;

            byte[] stream = SrediSliku(putanjaSlike, 400, 200, false);

            if (stream != null && stream.Length > 0)
            {
                using (var fs = new FileStream(putanjaThumbnaila, FileMode.CreateNew))
                {
                    fs.Write(stream, 0, stream.Length);
                }
            }
        }
    }
}