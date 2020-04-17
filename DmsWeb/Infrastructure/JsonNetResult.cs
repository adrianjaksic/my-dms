using System;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace DmsWeb.Infrastructure
{
    public class JsonNetResult : JsonResult
    {
        public JsonNetResult()
        {
            this.ContentType = "application/json";
        }

        public JsonNetResult(JsonResult existing)
        {
            this.ContentEncoding = existing.ContentEncoding;
            this.ContentType = !string.IsNullOrWhiteSpace(existing.ContentType) ? existing.ContentType : "application/json";
            this.Data = existing.Data;
            this.JsonRequestBehavior = existing.JsonRequestBehavior;
        }

        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
                throw new ArgumentNullException("context");

            var response = context.HttpContext.Response;

            response.ContentType = !String.IsNullOrEmpty(ContentType) ? ContentType : "application/json";

            if (ContentEncoding != null)
                response.ContentEncoding = ContentEncoding;

            if (Data == null)
                return;

            JsonSerializerSettings setts = new JsonSerializerSettings
            {
                DateFormatHandling = DateFormatHandling.MicrosoftDateFormat,
                Formatting = Formatting.None
            };

            // If you need special handling, you can call another form of SerializeObject below
            var serializedObject = JsonConvert.SerializeObject(Data, setts);
            response.Write(serializedObject);
        }
    }
}