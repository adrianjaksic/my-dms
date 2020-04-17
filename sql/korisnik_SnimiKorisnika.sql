go
if OBJECT_ID('korisnik_SnimiKorisnika','P') is not null
	drop procedure korisnik_SnimiKorisnika
go
/*
korisnik_SnimiKorisnika
ULAZ:
IZLAZ:
*/
create procedure korisnik_SnimiKorisnika(
	@IdKorisnikaZaUnos int output,
	@KorisnickoIme nvarchar(50),
	@Inspektor bit,
	@IdOkruga smallint,
	@UnosNovogPredmeta bit,
	@DozvolaRezervisanja bit,
	@IzmenaPredmeta bit,
	@BrisanjePredmeta bit,
	@Administracija bit,
	@PregledIzvestaja bit,
	@Email nvarchar(200),
	@Telefon nvarchar(200),
	@Jmbg nchar(13),
	@ImeIPrezime nvarchar(200),
	@Napomena nvarchar(200),
	@Aktivan bit,
	@IdKorisnika int,
	@Lozinka varbinary(8000),
	@NovaLozinka varbinary(8000) = null,
	@SamoSvojePredmete bit = null,
	@IdOrgana smallint = null,
	@MaksimalniBrojPredmeta smallint = null,
	@MaxBrojRezervisanihPredmeta smallint = null,
	@MaksimalniBrojPredmetaGodine smallint = null,
	@StrogoPoverljivi bit = 0
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	declare @IdOkrugaKorisnika smallint

	select @IdOkrugaKorisnika = IdOkruga
	from Korisnici
	where IdKorisnika = @IdKorisnika

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1)
	begin
		
		if exists(select top(1) 1 from Korisnici where IdKorisnika <> isnull(@IdKorisnikaZaUnos, 0) and KorisnickoIme = @KorisnickoIme and Aktivan = 1 and @Aktivan = 1)
		begin
		    set @Poruka = 'Postoji korisnik sa korisnièkim imenom: ' + @KorisnickoIme + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Korisnici
							where IdKorisnika = @IdKorisnikaZaUnos)
			begin
				set @IdKorisnikaZaUnos = isnull((select max(IdKorisnika) + 1
										from Korisnici), 1)

				insert into Korisnici(
					IdKorisnika,
					KorisnickoIme,
					Lozinka,
					Inspektor,
					IdOkruga,
					UnosNovogPredmeta,
					DozvolaRezervisanja,
					IzmenaPredmeta,
					BrisanjePredmeta,
					Administracija,
					PregledIzvestaja,
					SamoSvojePredmete,
					Email,
					Telefon,
					Jmbg,
					ImeIPrezime,
					Napomena,
					Aktivan,
					Guid,
					IdOrgana,
					MaksimalniBrojPredmeta,
					MaxBrojRezervisanihPredmeta,
					MaksimalniBrojPredmetaGodine,
					StrogoPoverljivi
				) values (
					@IdKorisnikaZaUnos,
					@KorisnickoIme,
					@Lozinka,
					@Inspektor,
					isnull(@IdOkrugaKorisnika, @IdOkruga),
					@UnosNovogPredmeta,
					@DozvolaRezervisanja,
					@IzmenaPredmeta,
					@BrisanjePredmeta,
					@Administracija,
					@PregledIzvestaja,
					@SamoSvojePredmete,
					@Email,
					@Telefon,
					@Jmbg,
					@ImeIPrezime,
					@Napomena,
					@Aktivan,
					null,
					@IdOrgana,
					@MaksimalniBrojPredmeta,
					@MaxBrojRezervisanihPredmeta,
					@MaksimalniBrojPredmetaGodine,
					@StrogoPoverljivi
				)			

				set @Poruka = 'Kreiran korisnik sa korisnièkim imenom: ' + @KorisnickoIme + '.'

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

				-- insert precica
				insert into PreciceKorisnika (
					IdKorisnika,
					IdPrecice,
					Tekst
				)
				values
				(
					@IdKorisnikaZaUnos,
					1,
					'Precica 1'
				),
				(
					@IdKorisnikaZaUnos,
					2,
					'Precica 2'
				),
				(
					@IdKorisnikaZaUnos,
					3,
					'Precica 3'
				),
				(
					@IdKorisnikaZaUnos,
					4,
					'Precica 4'
				),
				(
					@IdKorisnikaZaUnos,
					5,
					'Precica 5'
				),
				(
					@IdKorisnikaZaUnos,
					6,
					'Precica 6'
				),
				(
					@IdKorisnikaZaUnos,
					7,
					'Precica 7'
				),
				(
					@IdKorisnikaZaUnos,
					8,
					'Precica 8'
				),
				(
					@IdKorisnikaZaUnos,
					9,
					'Precica 9'
				)
			end
			else
			begin
				update Korisnici
				set Inspektor = @Inspektor,
					UnosNovogPredmeta = @UnosNovogPredmeta,
					DozvolaRezervisanja = @DozvolaRezervisanja,
					IzmenaPredmeta = @IzmenaPredmeta,
					BrisanjePredmeta = @BrisanjePredmeta,
					Administracija = @Administracija,
					PregledIzvestaja = @PregledIzvestaja,
					SamoSvojePredmete = @SamoSvojePredmete,
					Email = @Email,
					Telefon = @Telefon,
					Jmbg = @Jmbg,
					ImeIPrezime = @ImeIPrezime,
					Napomena = @Napomena,
					Aktivan = @Aktivan,
					IdOkruga = isnull(@IdOkrugaKorisnika, @IdOkruga),
					IdOrgana = @IdOrgana,
					Lozinka = case
					           when len(@NovaLozinka) > 0 then @NovaLozinka
							   else Lozinka
							  end,
					MaksimalniBrojPredmeta = @MaksimalniBrojPredmeta,
					MaxBrojRezervisanihPredmeta = @MaxBrojRezervisanihPredmeta,
					MaksimalniBrojPredmetaGodine = @MaksimalniBrojPredmetaGodine,
					StrogoPoverljivi = @StrogoPoverljivi
				where IdKorisnika = @IdKorisnikaZaUnos and
				      (@IdOkrugaKorisnika is null or IdOkruga = @IdOkrugaKorisnika)

				set @Poruka = 'Izmenjen korisnik sa korisnièkim imenom: ' + @KorisnickoIme + '.'

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
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end