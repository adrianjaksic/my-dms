go
if OBJECT_ID('logovanje_UlogujKorisnika','P') is not null
	drop procedure dbo.logovanje_UlogujKorisnika
go
/*
logovanje_UlogujKorisnika
ULAZ:
IZLAZ:
*/
create procedure logovanje_UlogujKorisnika (
	@KorisnickoIme nvarchar(30),
	@Lozinka varbinary(8000),
	@Jezik nvarchar(10) = null
)
as
begin
	set nocount on

	declare @IdKorisnika int

	set @IdKorisnika = (SELECT TOP(1) IdKorisnika 
	                    from Korisnici 
						where KorisnickoIme = @KorisnickoIme and
						      Lozinka = @Lozinka and
							  Aktivan = 1)

	IF (@IdKorisnika is null)
	BEGIN
	
		raiserror('Podaci za logovanje nisu ispravni.' , 14, 1)

	END
	ELSE
	BEGIN
		declare @IdLoga bigint
		set @IdLoga = isnull((select MAX(IdLoga) + 1 from LogoviKorisnika where IdKorisnika = @IdKorisnika), 1)
		
		declare @Guid char(36)
		set @Guid = CAST(NEWID() AS CHAR(36))

		update Korisnici
		set Guid = @Guid,
		    Jezik = @Jezik
		where IdKorisnika = @IdKorisnika

		INSERT INTO [dbo].[LogoviKorisnika]
			   ([IdKorisnika]
			   ,[IdLoga]
			   ,[Vreme]
			   ,[Opis])
		 VALUES
			   (@IdKorisnika
			   ,@IdLoga
			   ,getdate()
			   ,'Ulogovan korisnik')

		SELECT [IdKorisnika]
		  ,case
			when K.Administracija = 1 then cast(0 as bit)
			else K.Inspektor
		   end as Inspektor
		  ,K.[IdOkruga]
		  ,K.[UnosNovogPredmeta]
		  ,K.[DozvolaRezervisanja]
		  ,K.[IzmenaPredmeta]
		  ,K.[BrisanjePredmeta]
		  ,K.[Administracija]
		  ,K.[PregledIzvestaja]
		  ,K.[SamoSvojePredmete]
		  ,K.[Email]
		  ,K.[Telefon]
		  ,K.[Jmbg]
		  ,K.[ImeIPrezime]
		  ,K.[Napomena]
		  ,K.[Guid]
		  ,K.IdOrgana
		  ,O.Napomena as NapomenaOkruga
		  ,K.StrogoPoverljivi
		FROM Korisnici as K
		left outer join Okruzi as O
		on O.IdOkruga = K.IdOkruga
		where K.IdKorisnika = @IdKorisnika

	END

	set nocount off
end