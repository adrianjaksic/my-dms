go
if OBJECT_ID('okrug_ObrisiOkrug','P') is not null
	drop procedure okrug_ObrisiOkrug
go
/*
okrug_ObrisiOkrug
ULAZ:
IZLAZ:
*/
create procedure okrug_ObrisiOkrug(
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Okruzi where IdOkruga = @IdOkruga)
	begin
		raiserror('Izabrani okrug poseduje organe. Nije moguæe brisanje.', 14, 1)
	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
		begin		

			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

			declare @Naziv nvarchar (200)

			select @Naziv = Naziv
			from Okruzi
			where IdOkruga = @IdOkruga

			delete
			from Okruzi
			where IdOkruga = @IdOkruga

			set @Poruka = 'Obrisan okrug sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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