go

if OBJECT_ID('opstina_VratiOpstine','P') is not null
	drop procedure opstina_VratiOpstine
go
/*
opstina_VratiOpstine
ULAZ:
IZLAZ:
*/
create procedure opstina_VratiOpstine(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOkruga, IdOpstine, PostanskiBroj, Naziv, Aktivan
		from Opstine
		where (@IdOkruga is null or IdOkruga = @IdOkruga) and
		      (@IdOpstine is null or IdOpstine = @IdOpstine) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by Naziv

	set nocount off
end