using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using DmsCore.Data;
using DmsCore.Logovanje;

namespace DmsWeb
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Index", // Route name
                "Account/Index", // URL with parameters
                new { controller = "Account", action = "Index" } // Parameter defaults
            );
            
            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );

        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            // Use LocalDB for Entity Framework by default
            Database.DefaultConnectionFactory = new SqlConnectionFactory(@"Data Source=(localdb)\v11.0; Integrated Security=True; MultipleActiveResultSets=True");

            var dir = Directory.CreateDirectory(Server.MapPath("~"));
            PutanjaAplikacije.Inicijalizacija(dir.FullName);
            DmsData.Inicijalizacija();

            LogovanjeData.UcitajUlogovaneKorisnike();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
        }
    }
}