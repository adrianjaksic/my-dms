go
if OBJECT_ID('kret_pred_SnimiKretanjePredmeta','P') is not null
	drop procedure kret_pred_SnimiKretanjePredmeta
go
/*
kret_pred_SnimiKretanjePredmeta
ULAZ:
IZLAZ:
*/
create procedure kret_pred_SnimiKretanjePredmeta(
	@IdKretanjaPredmeta smallint output,
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@Status char(1) = null,
	@Zapisnik bit = 0,
	@Primedba nvarchar(100) = null,
	@UnosRoka bit = null,
	@Oznaka char(3) = '',
	@NazivZaIstoriju nvarchar(200) = ''
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
		
		if not exists(select top(1) 1 from KretanjaPredmeta
						where IdKretanjaPredmeta = @IdKretanjaPredmeta)
		begin
			set @IdKretanjaPredmeta = isnull((select max(IdKretanjaPredmeta) + 1
									from KretanjaPredmeta), 1)

			insert into KretanjaPredmeta (
				IdKretanjaPredmeta,
				Oznaka,
				Naziv,
				NazivZaIstoriju,
				Napomena,
				Aktivan,
				Status,
				Zapisnik,
				Primedba,
				UnosRoka
			) values (
				@IdKretanjaPredmeta,
				@Oznaka,
				@Naziv,
				@NazivZaIstoriju,
				@Napomena,
				@Aktivan,
				@Status,
				@Zapisnik,
				@Primedba,
				@UnosRoka
			)			

			set @Poruka = 'Kreirano kretanje predmeta sa nazivom: ' + @Naziv + '.'

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
			
			update KretanjaPredmeta
			set Naziv = @Naziv,
			    NazivZaIstoriju = @NazivZaIstoriju,
				Napomena = @Napomena,
				Aktivan = @Aktivan,
				Status = @Status,
				Zapisnik = @Zapisnik,
				Primedba = @Primedba,
				UnosRoka = @UnosRoka,
				Oznaka = @Oznaka
			where IdKretanjaPredmeta = @IdKretanjaPredmeta

			set @Poruka = 'Izmenjeno kretanje predmeta sa nazivom: ' + @Naziv + '.'

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
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end