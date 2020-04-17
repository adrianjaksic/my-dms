go
if OBJECT_ID('predmet_AktivirajPredmet','P') is not null
	drop procedure predmet_AktivirajPredmet
go
/*
predmet_AktivirajPredmet
ULAZ:
IZLAZ:
*/
create procedure predmet_AktivirajPredmet(
	@IdPredmeta bigint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	declare @IdOkruga smallint
	set @IdOkruga = (select IdOkruga from Predmeti where IdPredmeta = @IdPredmeta)
	
	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga = @IdOkruga)
	begin
		if exists(select top(1) 1 from Predmeti where IdPredmeta = @IdPredmeta and Status = 'B')
		begin
		    declare @IdKretanja smallint

			set @IdKretanja = isnull((select max(IdKretanja) + 1
									from IstorijaPredmeta
									where IdPredmeta = @IdPredmeta), 1)

			insert into IstorijaPredmeta (
			   IdPredmeta,
			   IdKretanja,
			   Vreme,
			   IdKorisnika,
			   Opis,
			   Napomena
			)
			 select
				P.IdPredmeta
				,@IdKretanja
				,@Sada
				,@IdKorisnika
				,'Aktiviran predmet. Promenjen status predmeta sa ' + isnull(P.Status, 'B') + ' na O.'
				,null
			from Predmeti as P
			where P.IdPredmeta = @IdPredmeta and
			      P.Status = 'B'

			update Predmeti
			set Status = 'O'
			where IdPredmeta = @IdPredmeta and
			      Status = 'B'
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	
	set nocount off
end