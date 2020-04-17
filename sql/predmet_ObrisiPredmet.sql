go
if OBJECT_ID('predmet_ObrisiPredmet','P') is not null
	drop procedure predmet_ObrisiPredmet
go
/*
predmet_ObrisiPredmet
ULAZ:
IZLAZ:
*/
create procedure predmet_ObrisiPredmet(
	@IdPredmeta bigint,
	@IdKorisnika int,
	@RazlogBrisanja nvarchar(2000)
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	declare @IdOkruga smallint
	set @IdOkruga = (select IdOkruga from Predmeti where IdPredmeta = @IdPredmeta)
	
	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and BrisanjePredmeta = 1 and IdOkruga = @IdOkruga)
	begin
		if exists(select top(1) 1 from Predmeti where IdPredmeta = @IdPredmeta)
		begin
		    declare @IdLoga bigint
		    declare @IdKretanja smallint

			set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

			set @IdKretanja = isnull((select max(IdKretanja) + 1
									from IstorijaPredmeta
									where IdPredmeta = @IdPredmeta), 1)

			INSERT INTO [dbo].[IstorijaPredmeta]
			   ([IdPredmeta]
			   ,[IdKretanja]
			   ,[Vreme]
			   ,[IdKorisnika]
			   ,[Opis]
			   ,[Napomena])
			 SELECT
				    P.IdPredmeta
				   ,@IdKretanja
				   ,@Sada
				   ,@IdKorisnika
				   ,'Obrisan predmet. Promenjen status predmeta sa ' + isnull(P.Status, 'O') + ' na B.'
				   ,@RazlogBrisanja
			FROM Predmeti as P
			where P.IdPredmeta = @IdPredmeta

			update Predmeti
			set Status = 'B'
			where IdPredmeta = @IdPredmeta
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	
	set nocount off
end