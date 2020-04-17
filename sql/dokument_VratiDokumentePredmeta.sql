go
if OBJECT_ID('dokument_VratiDokumentePredmeta','P') is not null
	drop procedure dokument_VratiDokumentePredmeta
go

create procedure dokument_VratiDokumentePredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on
	
	select IdDokumenta,
	       Naziv,
		   isnull(case 
		    when VremeBrisanja is null then cast(0 as bit) 
			else cast(1 as bit) 
		   end, 0) as Obrisan,
		   Ekstenzija
	from DokumentiPredmeta
	where IdPredmeta = @IdPredmeta
	
	set nocount off
end