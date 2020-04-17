go
if OBJECT_ID('jedinica_SnimiJedinicu','P') is not null
	drop procedure jedinica_SnimiJedinicu
go

create procedure jedinica_SnimiJedinicu(
	@IdOrgana smallint,
	@IdJedinice smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@Nadleznost nvarchar(4000)
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1)
	begin		
		if exists(select top(1) 1 from Jedinice where IdOrgana = @IdOrgana and IdJedinice <> isnull(@IdJedinice, 0) and Oznaka = @Oznaka and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji jedinica sa oznakom: ' + @Oznaka + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Jedinice
							where IdOrgana = @IdOrgana and
							   	  IdJedinice = @IdJedinice)
			begin
				set @IdJedinice = isnull((select max(IdJedinice) + 1
									   from Jedinice
									   where IdOrgana = @IdOrgana), 1)

				insert into Jedinice (
					IdOrgana,
					IdJedinice,
					Oznaka,
					Naziv,
					Napomena,
					Aktivan,
					Nadleznost
				) values (
					@IdOrgana,
					@IdJedinice,
					@Oznaka,
					@Naziv,
					@Napomena,
					@Aktivan,
					@Nadleznost
				)			

				set @Poruka = 'Kreirana jedinica sa nazivom: ' + @Naziv + '.'

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
				update Jedinice
				set Oznaka = @Oznaka,
					Naziv = @Naziv,
					Napomena = @Napomena,
					Aktivan = @Aktivan,
					Nadleznost = @Nadleznost
				where IdOrgana = @IdOrgana and
					  IdJedinice = @IdJedinice

				set @Poruka = 'Izmenjena jedinica sa nazivom: ' + @Naziv + '.'

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