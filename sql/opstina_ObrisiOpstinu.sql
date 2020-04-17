go

if OBJECT_ID('opstina_ObrisiOpstinu','P') is not null
	drop procedure opstina_ObrisiOpstinu
go
/*
opstina_ObrisiOpstinu
ULAZ:
IZLAZ:
*/
create procedure opstina_ObrisiOpstinu(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Predmeti where IdOkruga = IdOkruga and IdOpstine = @IdOpstine)
	begin
		raiserror('Izabrana opština poseduje predmete. Nije moguce brisanje.', 14, 1)
	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
		begin		

			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

			declare @Naziv nvarchar (200)

			select @Naziv = Naziv
			from Opstine
			where IdOkruga = @IdOkruga and
			      IdOpstine = @IdOpstine
			
			delete Mesta
			where IdOkruga = @IdOkruga and
				  IdOpstine = @IdOpstine

			delete
			from Opstine
			where IdOkruga = @IdOkruga and
			      IdOpstine = @IdOpstine

			set @Poruka = 'Obrisana opština sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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

go