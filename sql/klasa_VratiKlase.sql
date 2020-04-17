go
if OBJECT_ID('klasa_VratiKlase','P') is not null
	drop procedure klasa_VratiKlase
go
/*
klasa_VratiKlase
ULAZ:
IZLAZ:
*/
create procedure klasa_VratiKlase(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOkruga, IdOrgana, IdKlase, Oznaka, Naziv, Napomena, Aktivan, Nadleznost, IdInspekcije, IzuzmiIzProvere
		from Klase
		where (@IdOkruga is null or IdOkruga = @IdOkruga) and
		      (@IdOrgana is null or IdOrgana = @IdOrgana) and
			  (@IdKlase is null or IdKlase = @IdKlase) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by Oznaka

	set nocount off
end