using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using DmsCore.NbsAccounts;

namespace DmsCore.NBS
{
    public static class NbsData
    {
        public static IList<PravnoLice> PretraziNbsKlijente(long? maticniBroj, string pib, long? banka, long? brojRacuna, int? kontrolniBroj, string naziv, string mesto)
        {
            using (var svc = new CompanyAccountXmlServiceSoapClient())
            {
                var authHeader = new AuthenticationHeader
                {
                    LicenceID = new Guid("57eadda1-7075-46c3-9b15-56c5430fd218"),
                    UserName = @"ipsylon",
                    Password = @"ipsy1302",
                };
                var result = svc.GetCompanyAccount(authHeader, maticniBroj, pib, banka, brojRacuna, kontrolniBroj, naziv, mesto, null,
                                      null);
                var xml = XDocument.Parse(result);
                var pravnaLica = xml.Descendants("CompanyAccount").Select(x => new PravnoLice
                {
                    TekuciRacun = x.Element("Account").Value,
                    Banka = x.Element("BankCode").Value,
                    BrojRacuna = x.Element("AccountNumber").Value,
                    KontrolniBroj = x.Element("ControlNumber").Value,
                    Naziv = x.Element("CompanyName").Value,
                    MaticniBroj = x.Element("NationalIdentificationNumber").Value,
                    PIB = x.Element("TaxIdentificationNumber").Value,
                    Adresa = x.Element("Address").Value,
                    Mesto = x.Element("City").Value
                }).ToList();
                return pravnaLica;
            }
        }
    }
}