go

if OBJECT_ID('opstina_SnimiOpstinu','P') is not null
	drop procedure opstina_SnimiOpstinu
go
/*
opstina_SnimiOpstinu
ULAZ:
IZLAZ:
*/
create procedure opstina_SnimiOpstinu(
	@IdOkruga smallint,
	@IdOpstine smallint output,
	@PostanskiBroj char(5),
	@Naziv nvarchar(200),
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
	begin		
		if exists(select top(1) 1 from Opstine where IdOkruga = @IdOkruga and IdOpstine <> isnull(@IdOpstine, 0) and Naziv = @Naziv and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji opština sa nazivom: ' + @Naziv + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Opstine
							where IdOkruga = @IdOkruga and
							   	  IdOpstine = @IdOpstine)
			begin
				set @IdOpstine = isnull((select max(IdOpstine) + 1
									   from Opstine
									   where IdOkruga = @IdOkruga), 1)

				insert into Opstine (
					IdOkruga,
					IdOpstine,
					Naziv,
					Aktivan,
					PostanskiBroj
				) values (
					@IdOkruga,
					@IdOpstine,
					@Naziv,
					@Aktivan,
					@PostanskiBroj
				)			

				set @Poruka = 'Kreirana opština sa nazivom: ' + @Naziv + '.'

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
				update Opstine
				set Naziv = @Naziv,
					Aktivan = @Aktivan,
					PostanskiBroj = @PostanskiBroj
				where IdOkruga = @IdOkruga and
					  IdOpstine = @IdOpstine

				set @Poruka = 'Izmenjena opština sa nazivom: ' + @Naziv + '.'

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