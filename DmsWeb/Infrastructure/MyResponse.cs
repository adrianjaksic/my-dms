namespace DmsWeb.Infrastructure
{
    public class MyResponse
    {
        public bool Greska { get; set; }
        public string Poruka { get; set; }
        public object Data { get; set; }

        public MyResponse()
        {
            Greska = false;
            Poruka = "Došlo je do greške. Molim pokušajte ponovo.";
            Data = new object();
        }
    }
}