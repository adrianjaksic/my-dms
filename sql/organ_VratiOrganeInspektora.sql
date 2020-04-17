go
if OBJECT_ID('organ_VratiOrganeInspektora','P') is not null
	drop procedure organ_VratiOrganeInspektora
go
/*
organ_VratiOrganeInspektora
ULAZ:
IZLAZ:
*/
create procedure organ_VratiOrganeInspektora(
	@IdOrgana smallint,
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

		select IdOrgana, Oznaka, Naziv, Napomena, Aktivan
		from Organi
		where (@IdOrgana is null or IdOrgana = @IdOrgana) and
		      (@Aktivan is null or Aktivan = @Aktivan) and
			  (IdOrgana in (select IdOrgana from KlaseInspektora where IdKorisnika = @IdKorisnika))
		order by Oznaka

	set nocount off
end