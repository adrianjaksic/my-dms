go
if OBJECT_ID('korisnik_PrijaviGresku','P') is not null
	drop procedure korisnik_PrijaviGresku
go

create procedure korisnik_PrijaviGresku(
	@IdKorisnika int,
	@PrijavljenaGreska nvarchar(max),
	@Url nvarchar(255)
) as
begin
	set nocount on

	declare @IdPrijave int
	set @IdPrijave = isnull((select max(IdPrijave) + 1 from PrijavljeneGreske), 1)

	insert into PrijavljeneGreske (
		IdPrijave,
		IdKorisnika,
		Vreme,
		PrijavljenaGreska,
		Url
	) values (
		@IdPrijave,
		@IdKorisnika,
		getdate(),
		@PrijavljenaGreska,
		@Url
	)

	set nocount off
end