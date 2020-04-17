go

if OBJECT_ID('predmet_VratiSledeciSlobodanBrojPredmeta','P') is not null
	drop procedure predmet_VratiSledeciSlobodanBrojPredmeta
go
/*
predmet_VratiSledeciSlobodanBrojPredmeta
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiSledeciSlobodanBrojPredmeta(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint
) as
begin
	set nocount on

	declare @Sada smalldatetime
	select @Sada = getdate()

	select isnull(
				  (select max(BrojPredmeta) + 1
				   from Predmeti
				   where YEAR(VremeRezervacije) = YEAR(@Sada) and
				         IdOkruga = @IdOkruga and
						 IdOrgana = @IdOrgana and
						 IdKlase = @IdKlase
						 ),
				   1) as SledeciBroj
	
	

	set nocount off
end

go