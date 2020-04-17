go
if OBJECT_ID('korisnik_VratiKorisnike','P') is not null
	drop procedure korisnik_VratiKorisnike
go
/*
korisnik_VratiKorisnike
ULAZ:
IZLAZ:
*/
create procedure korisnik_VratiKorisnike(
	@IdKorisnika int,
	@Aktivan bit,
	@IdOkruga smallint
) as
begin
	set nocount on

		select IdKorisnika,
			   KorisnickoIme,
			   Inspektor,
			   IdOkruga,
			   UnosNovogPredmeta,
			   DozvolaRezervisanja,
			   IzmenaPredmeta,
			   BrisanjePredmeta,
			   Administracija,
			   PregledIzvestaja,
			   Email,
			   Telefon,
			   Jmbg,
			   ImeIPrezime,
			   Napomena,
			   Aktivan,
			   SamoSvojePredmete,
			   IdOrgana,
			   MaksimalniBrojPredmeta,
			   MaxBrojRezervisanihPredmeta,
			   MaksimalniBrojPredmetaGodine,
			   StrogoPoverljivi
		from Korisnici
		where (@IdKorisnika is null or IdKorisnika = @IdKorisnika) and
		      (@Aktivan is null or Aktivan = @Aktivan) and
			  (@IdOkruga is null or IdOkruga = @IdOkruga)

	set nocount off
end