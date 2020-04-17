go

if OBJECT_ID('okrug_SnimiOkrug','P') is not null
	drop procedure okrug_SnimiOkrug
go
/*
okrug_SnimiOkrug
ULAZ:
IZLAZ:
*/
create procedure okrug_SnimiOkrug(
	@IdOkruga smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
	@Mesto nvarchar(200) = null,
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin
		
		if exists(select top(1) 1 from Okruzi where IdOkruga <> isnull(@IdOkruga, 0) and Oznaka = @Oznaka and Aktivan = 1 and @Aktivan = 1)
		begin
		    set @Poruka = 'Postoji okrug sa oznakom: ' + @Oznaka + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Okruzi
							where IdOkruga = @IdOkruga)
			begin
				set @IdOkruga = isnull((select max(IdOkruga) + 1
										from Okruzi), 1)

				insert into Okruzi (
					IdOkruga,
					Oznaka,
					Naziv,
					Mesto,
					Napomena,
					Aktivan
				) values (
					@IdOkruga,
					@Oznaka,
					@Naziv,
					isnull(@Mesto,'-'),
					@Napomena,
					@Aktivan
				)			

				set @Poruka = 'Kreiran okrug sa nazivom: ' + @Naziv + '.'

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
				update Okruzi
				set Oznaka = @Oznaka,
				    Naziv = @Naziv,
					Mesto = isnull(@Mesto, Mesto),
					Napomena = @Napomena,
					Aktivan = @Aktivan
				where IdOkruga = @IdOkruga

				set @Poruka = 'Izmenjen okrug sa nazivom: ' + @Naziv + '.'

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
		
		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga = @IdOkruga)
		begin
			update Okruzi
			set Napomena = @Napomena
			where IdOkruga = @IdOkruga

			set @Poruka = 'Izmenjen okrug sa nazivom: ' + @Naziv + '.'

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

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

			raiserror('Nemate prava pristupa.', 14, 1)

		end

	end

	set nocount off
end