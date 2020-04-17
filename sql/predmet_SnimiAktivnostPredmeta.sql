go

if OBJECT_ID('predmet_SnimiAktivnostPredmeta','P') is not null
	drop procedure predmet_SnimiAktivnostPredmeta
go
/*
predmet_SnimiAktivnostPredmeta
ULAZ:
IZLAZ:
*/
create procedure predmet_SnimiAktivnostPredmeta(
	@IdPredmeta bigint,
	@IdKorisnika int,
	@Opis nvarchar(2000)
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @IdKretanja smallint

	select @Sada = getdate()

	set @IdKretanja = isnull((select max(IdKretanja) + 1
							  from IstorijaPredmeta
							  where IdPredmeta = @IdPredmeta), 1)

	insert into IstorijaPredmeta (
		IdPredmeta,
		IdKretanja,
		IdKretanjaPredmeta,
		Vreme,
		IdKorisnika,
		Opis,
		Napomena,
		Broj,
		DatumBrisanja,
		Obrisao,
		SamoAdministrator
	) values (
		@IdPredmeta,
		@IdKretanja,
		null,
		@Sada,
		@IdKorisnika,
		@Opis,
		null,
		null,
		null,
		null,
		1
	)

	set nocount off
end

go