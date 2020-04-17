go
if OBJECT_ID('kret_pred_ObrisiKretanjePredmeta','P') is not null
	drop procedure kret_pred_ObrisiKretanjePredmeta
go
/*
kret_pred_ObrisiKretanjePredmeta
ULAZ:
IZLAZ:
*/
create procedure kret_pred_ObrisiKretanjePredmeta(
	@IdKretanjaPredmeta smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		

		declare @IdLoga bigint

		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

		declare @Naziv nvarchar (200)

		select @Naziv = Naziv
		from KretanjaPredmeta
		where IdKretanjaPredmeta = @IdKretanjaPredmeta

		delete
		from KretanjaPredmeta
		where IdKretanjaPredmeta = @IdKretanjaPredmeta

		set @Poruka = 'Obrisano kretanje predmeta sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

		insert into LogoviKorisnika (
			IdKorisnika,
			IdLoga,
			Vreme,
			Opis
		) values (
			@IdKorisnika,
			@IdLoga,
			@Sada,
			@Poruka
		)
	end
	else
	begin
		raiserror('Nemate prava pristupa', 14, 1)
	end
	
	set nocount off
end