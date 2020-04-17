go
if OBJECT_ID('korisnik_VratiArhivatore','P') is not null
	drop procedure korisnik_VratiArhivatore
go

create procedure korisnik_VratiArhivatore(
	@IdOkruga smallint
) as
begin
	set nocount on

	select IdKorisnika, KorisnickoIme, ImeIPrezime
	from Korisnici
	where IdOkruga = @IdOkruga and
	      Administracija = 0 and
		  Inspektor = 0 and
		  Aktivan = 1

	set nocount off
end