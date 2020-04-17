using DmsCore.Data;
using System.Net.Mail;

namespace DmsCore.Helperi
{
    public static class MailHelper
    {
        public static void PosaljiEMailSaFajlom(string kome, string subject, string tekst, string putanja, string replyTo)
        {
            var smtp = new SmtpClient(DmsData.EmailHost, DmsData.EmailPort)
            {
                EnableSsl = false,
                Credentials = new System.Net.NetworkCredential(DmsData.EmailUsername, DmsData.EmailPassword)
            };

            var email = new MailMessage(DmsData.EmailUsername, kome, subject, tekst);
            if (!string.IsNullOrEmpty(replyTo))
            {
                email.ReplyToList.Add(replyTo);
            }
            if (putanja != null)
            {
                var atch = new Attachment(putanja);
                email.Attachments.Add(atch);
            }
            smtp.Send(email);
        }
    }
}
