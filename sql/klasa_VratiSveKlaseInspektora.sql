go
if OBJECT_ID('klasa_VratiSveKlaseInspektora','P') is not null
	drop procedure klasa_VratiSveKlaseInspektora
go
/*
klasa_VratiSveKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klasa_VratiSveKlaseInspektora(
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	select K.Oznaka, MIN(K.Naziv) as Naziv
	from Klase as K
	join KlaseInspektora as KI
	on K.IdOkruga = KI.IdOkruga and
	   K.IdOrgana = KI.IdOrgana and
	   K.IdKlase = KI.IdKlase and
	   KI.IdKorisnika = @IdKorisnika
	where (@IdOkruga is null or K.IdOkruga = @IdOkruga) and
	      K.Aktivan = 1
	group by K.Oznaka
	order by RIGHT('000' + K.Oznaka, 3)

	set nocount off
end