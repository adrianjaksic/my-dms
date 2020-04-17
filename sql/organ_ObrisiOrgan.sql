go
if OBJECT_ID('organ_ObrisiOrgan','P') is not null
	drop procedure organ_ObrisiOrgan
go
/*
organ_ObrisiOrgan
ULAZ:
IZLAZ:
*/
create procedure organ_ObrisiOrgan(
	@IdOrgana smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Klase where IdOrgana = @IdOrgana)
	begin
		raiserror('Izabrani organ poseduje klase. Nije moguæe brisanje.', 14, 1)
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
			from Organi
			where IdOrgana = @IdOrgana

			delete
			from Organi
			where IdOrgana = @IdOrgana

			set @Poruka = 'Obrisan organ sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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