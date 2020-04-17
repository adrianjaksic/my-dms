go
if OBJECT_ID('klasa_SnimiKlasu','P') is not null
	drop procedure klasa_SnimiKlasu
go
/*
klasa_SnimiKlasu
ULAZ:
IZLAZ:
*/
create procedure klasa_SnimiKlasu(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@Nadleznost nvarchar(4000) = null,
	@IdInspekcije smallint = null,
	@IzuzmiIzProvere bit = null
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1) -- and isnull(IdOkruga, @IdOkruga) = @IdOkruga) pre je bio master admin koji nije imao dozvole za menjanje podataka
	begin		
		if exists(select top(1) 1 from Klase where IdOkruga = @IdOkruga and IdOrgana = @IdOrgana and IdKlase <> isnull(@IdKlase, 0) and Oznaka = @Oznaka and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji klasa sa oznakom: ' + @Oznaka + '. Nije moguće snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Klase
							where IdOkruga = @IdOkruga and
								  IdOrgana = @IdOrgana and
							   	  IdKlase = @IdKlase)
			begin
				set @IdKlase = isnull((select max(IdKlase) + 1
									   from Klase
									   where IdOkruga = @IdOkruga and
										     IdOrgana = @IdOrgana), 1)

				insert into Klase (
					IdOkruga,
					IdOrgana,
					IdKlase,
					Oznaka,
					Naziv,
					Napomena,
					Aktivan,
					Nadleznost,
					IdInspekcije,
					IzuzmiIzProvere
				) values (
					@IdOkruga,
					@IdOrgana,
					@IdKlase,
					@Oznaka,
					@Naziv,
					@Napomena,
					@Aktivan,
					@Nadleznost,
					@IdInspekcije,
					@IzuzmiIzProvere
				)			

				set @Poruka = 'Kreirana klasa sa nazivom: ' + @Naziv + '.'

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
				update Klase
				set Oznaka = @Oznaka,
					Naziv = @Naziv,
					IdInspekcije = @IdInspekcije,
					Napomena = @Napomena,
					Aktivan = @Aktivan,
					Nadleznost = @Nadleznost,
					IzuzmiIzProvere = @IzuzmiIzProvere
				where IdOkruga = @IdOkruga and
					  IdOrgana = @IdOrgana and
					  IdKlase = @IdKlase

				set @Poruka = 'Izmenjena klasa sa nazivom: ' + @Naziv + '.'

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