go
if OBJECT_ID('precica_VratiPrecicu','P') is not null
	drop procedure precica_VratiPrecicu
go
/*
precica_VratiPrecicu
ULAZ:
IZLAZ:
*/
create procedure precica_VratiPrecicu(
	@IdKorisnika int,
	@IdPrecice tinyint
) as
begin
	set nocount on
	
	select Tekst
	from PreciceKorisnika
	where IdKorisnika = @IdKorisnika and
	      IdPrecice = @IdPrecice
	
	set nocount off
end