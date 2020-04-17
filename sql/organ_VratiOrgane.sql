go
if OBJECT_ID('organ_VratiOrgane','P') is not null
	drop procedure organ_VratiOrgane
go
/*
organ_VratiOrgane
ULAZ:
IZLAZ:
*/
create procedure organ_VratiOrgane(
	@IdOrgana smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOrgana, Oznaka, Naziv, Napomena, Aktivan
		from Organi
		where (@IdOrgana is null or IdOrgana = @IdOrgana) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by Oznaka

	set nocount off
end