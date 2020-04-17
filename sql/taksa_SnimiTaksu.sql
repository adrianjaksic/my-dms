go
if OBJECT_ID('taksa_SnimiTaksu','P') is not null
	drop procedure taksa_SnimiTaksu
go
/*
taksa_SnimiTaksu
ULAZ:
IZLAZ:
*/
create procedure taksa_SnimiTaksu(
	@IdTakse smallint output,
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@OznakaZaStampu nvarchar(30) = null
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
		
		if not exists(select top(1) 1 from Takse
						where IdTakse = @IdTakse)
		begin
			set @IdTakse = isnull((select max(IdTakse) + 1
									from Takse), 1)

			insert into Takse (
				IdTakse,
				Naziv,
				Napomena,
				Aktivan,
				OznakaZaStampu
			) values (
				@IdTakse,
				@Naziv,
				@Napomena,
				@Aktivan,
				@OznakaZaStampu
			)			

			set @Poruka = 'Kreirana taksa sa nazivom: ' + @Naziv + '.'

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
			update Takse
			set Naziv = @Naziv,
				Napomena = @Napomena,
				Aktivan = @Aktivan,
				OznakaZaStampu = @OznakaZaStampu
			where IdTakse = @IdTakse

			set @Poruka = 'Izmenjena taksa sa nazivom: ' + @Naziv + '.'

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