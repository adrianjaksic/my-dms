go
if OBJECT_ID('organ_SnimiOrgan','P') is not null
	drop procedure organ_SnimiOrgan
go
/*
organ_SnimiOrgan
ULAZ:
IZLAZ:
*/
create procedure organ_SnimiOrgan(
	@IdOrgana smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
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
		if exists(select top(1) 1 from Organi where IdOrgana <> isnull(@IdOrgana, 0) and Oznaka = @Oznaka and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji organ sa oznakom: ' + @Oznaka + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Organi
							where IdOrgana = @IdOrgana)
			begin
				set @IdOrgana = isnull((select max(IdOrgana) + 1
										from Organi), 1)

				insert into Organi (
					IdOrgana,
					Oznaka,
					Naziv,
					Napomena,
					Aktivan
				) values (
					@IdOrgana,
					@Oznaka,
					@Naziv,
					@Napomena,
					@Aktivan
				)			

				set @Poruka = 'Kreiran organ sa nazivom: ' + @Naziv + '.'

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
				update Organi
				set Oznaka = @Oznaka,
					Naziv = @Naziv,
					Napomena = @Napomena,
					Aktivan = @Aktivan
				where IdOrgana = @IdOrgana

				set @Poruka = 'Izmenjen organ sa nazivom: ' + @Naziv + '.'

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