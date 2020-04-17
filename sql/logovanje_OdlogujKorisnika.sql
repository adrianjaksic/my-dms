go
if OBJECT_ID('logovanje_OdlogujKorisnika','P') is not null
	drop procedure logovanje_OdlogujKorisnika
go
/*
logovanje_OdlogujKorisnika
ULAZ:
IZLAZ:
*/
create procedure logovanje_OdlogujKorisnika(
	@KorisnickoIme nvarchar(50)
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)
	declare @IdLoga bigint			
	declare @IdKorisnika int

	select @Sada = getdate()

	select @IdKorisnika = IdKorisnika 
	from Korisnici
	where KorisnickoIme = @KorisnickoIme

	update Korisnici
	set Guid = null
	where KorisnickoIme = @KorisnickoIme

	set @Poruka = 'Odlogovan korisnik.'

	set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

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

	set nocount off
end