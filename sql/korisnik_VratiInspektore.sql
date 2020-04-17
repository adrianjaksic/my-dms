go
if OBJECT_ID('korisnik_VratiInspektore','P') is not null
	drop procedure korisnik_VratiInspektore
go
/*
korisnik_VratiInspektore
ULAZ:
IZLAZ:
*/
create procedure korisnik_VratiInspektore(
	@IdOkruga smallint,
	@IdPredmeta bigint
) as
begin
	set nocount on

	select IdKorisnika, KorisnickoIme, ImeIPrezime			   
	from Korisnici
	where Inspektor = 1 and
		  ((IdOkruga = @IdOkruga and
		  Aktivan = 1) or IdKorisnika in ( select IdInspektora from Predmeti
											where IdPredmeta = @IdPredmeta and IdInspektora is not null))

	set nocount off
end