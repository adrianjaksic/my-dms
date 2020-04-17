go
if OBJECT_ID('inspekcije_VratiInspekcije','P') is not null
	drop procedure inspekcije_VratiInspekcije
go

create procedure inspekcije_VratiInspekcije(
	@IdInspekcije smallint
) as
begin
	set nocount on

	select IdInspekcije, Naziv
	from Inspekcije
	where @IdInspekcije is null or IdInspekcije = @IdInspekcije

	set nocount off
end