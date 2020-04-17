go
if OBJECT_ID('klase_insp_SnimiKlasuInspektora','P') is not null
	drop procedure klase_insp_SnimiKlasuInspektora
go
/*
klase_insp_SnimiKlasuInspektora
ULAZ:
IZLAZ:
*/
create procedure klase_insp_SnimiKlasuInspektora(
	@IdKorisnika int,
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint
) as
begin
	set nocount on

	insert into KlaseInspektora	(
		IdKorisnika,
		IdOkruga,
		IdOrgana,
		IdKlase
	) values (
		@IdKorisnika,
		@IdOkruga,
		@IdOrgana,
		@IdKlase
	)

	set nocount off
end