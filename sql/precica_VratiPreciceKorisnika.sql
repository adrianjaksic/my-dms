go
if OBJECT_ID('precica_VratiPreciceKorisnika','P') is not null
	drop procedure precica_VratiPreciceKorisnika
go
/*
precica_VratiPreciceKorisnika
ULAZ:
IZLAZ:
*/
create procedure precica_VratiPreciceKorisnika(
	@IdKorisnika int
) as
begin
	set nocount on
	
	select IdPrecice, Tekst
	from PreciceKorisnika
	where IdKorisnika = @IdKorisnika
	
	set nocount off
end