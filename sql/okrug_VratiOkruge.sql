go
if OBJECT_ID('okrug_VratiOkruge','P') is not null
	drop procedure okrug_VratiOkruge
go
/*
okrug_VratiOkruge
ULAZ:
IZLAZ:
*/
create procedure okrug_VratiOkruge(
	@IdOkruga smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOkruga, Oznaka, Naziv, Napomena, Aktivan, Mesto
		from Okruzi
		where (@IdOkruga is null or IdOkruga = @IdOkruga) and
		      (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end