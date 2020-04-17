go
if OBJECT_ID('mesta_VratiMesta','P') is not null
	drop procedure mesta_VratiMesta
go
/*
mesta_VratiMesta
ULAZ:
IZLAZ:
*/
create procedure mesta_VratiMesta(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@IdMesta int,
	@Aktivan bit
) as
begin
	set nocount on

	select IdMesta, Naziv, Aktivan
	from Mesta
	where IdOkruga = @IdOkruga and
	      IdOpstine = @IdOpstine and
		  (@IdMesta is null or IdMesta = @IdMesta) and
		  (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end