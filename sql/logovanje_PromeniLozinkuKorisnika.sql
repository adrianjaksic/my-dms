go
if OBJECT_ID('logovanje_PromeniLozinkuKorisnika','P') is not null
	drop procedure logovanje_PromeniLozinkuKorisnika
go
/*
logovanje_PromeniLozinkuKorisnika
ULAZ:
IZLAZ:
*/
create procedure logovanje_PromeniLozinkuKorisnika(
	@IdKorisnika int,
	@StaraLozinka varbinary(8000),
	@NovaLozinka varbinary(8000)
) as
begin
	set nocount on
	
	if exists (select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Lozinka = @StaraLozinka)
	begin

		declare @Sada smalldatetime
		declare @IdLoga bigint
		declare @Poruka nvarchar(200)

		set @Sada = getdate()

		
		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

		update Korisnici
		set Korisnici.Lozinka = @NovaLozinka
		where IdKorisnika = @IdKorisnika and
		      Lozinka = @StaraLozinka
		
		set @Poruka = 'Promenjena lozinka korisnika.'

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
	    raiserror('Podaci nisu ispravni', 14, 1)
	end
	
	set nocount off
end