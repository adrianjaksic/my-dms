go
if OBJECT_ID('taksa_ObrisiTaksu','P') is not null
	drop procedure taksa_ObrisiTaksu
go
/*
taksa_ObrisiTaksu
ULAZ:
IZLAZ:
*/
create procedure taksa_ObrisiTaksu(
	@IdTakse smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		

		declare @IdLoga bigint

		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

		declare @Naziv nvarchar (200)

		select @Naziv = Naziv
		from Takse
		where IdTakse = @IdTakse

		delete
		from Takse
		where IdTakse = @IdTakse

		set @Poruka = 'Obrisana taksa sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
	
	set nocount off
end