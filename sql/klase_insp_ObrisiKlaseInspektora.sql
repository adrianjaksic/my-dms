go
if OBJECT_ID('klase_insp_ObrisiKlaseInspektora','P') is not null
	drop procedure klase_insp_ObrisiKlaseInspektora
go
/*
klase_insp_ObrisiKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klase_insp_ObrisiKlaseInspektora(
	@IdKorisnika int
) as
begin
	set nocount on

	delete 
	from KlaseInspektora
	where IdKorisnika = @IdKorisnika

	set nocount off
end