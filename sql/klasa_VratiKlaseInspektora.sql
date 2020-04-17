go
if OBJECT_ID('klasa_VratiKlaseInspektora','P') is not null
	drop procedure klasa_VratiKlaseInspektora
go
/*
klasa_VratiKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klasa_VratiKlaseInspektora(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	select K.IdOkruga, K.IdOrgana, K.IdKlase, K.Oznaka, K.Naziv, K.Napomena, K.Aktivan, K.Nadleznost
	from Klase as K
	join KlaseInspektora as KI
	on K.IdOkruga = KI.IdOkruga and
	   K.IdOrgana = KI.IdOrgana and
	   K.IdKlase = KI.IdKlase and
	   KI.IdKorisnika = @IdKorisnika
	where (@IdOkruga is null or K.IdOkruga = @IdOkruga) and
		    (@IdOrgana is null or K.IdOrgana = @IdOrgana) and
			(@IdKlase is null or K.IdKlase = @IdKlase) and
		    (@Aktivan is null or Aktivan = @Aktivan)
	order by RIGHT('000' + K.Oznaka, 3)

	set nocount off
end