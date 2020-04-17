go

if OBJECT_ID('klasa_ObrisiKlasu','P') is not null
	drop procedure klasa_ObrisiKlasu
go
/*
klasa_ObrisiKlasu
ULAZ:
IZLAZ:
*/
create procedure klasa_ObrisiKlasu(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Predmeti where IdOrgana = @IdOrgana and IdKlase = @IdKlase)
	begin
		raiserror('Izabrana klasa poseduje predmete. Nije moguæe brisanje.', 14, 1)
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
			from Klase
			where IdOkruga = @IdOkruga and
			      IdOrgana = @IdOrgana and
				  IdKlase = @IdKlase

			delete
			from Klase
			where IdOkruga = @IdOkruga and
			      IdOrgana = @IdOrgana and
				  IdKlase = @IdKlase

			set @Poruka = 'Obrisana klasa sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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