go
if OBJECT_ID('dokument_ObrisiDokument','P') is not null
	drop procedure dokument_ObrisiDokument
go

create procedure dokument_ObrisiDokument(
	@IdPredmeta bigint,
	@IdDokumenta smallint,
	@IdKorisnika int,
	@Napomena nvarchar(2000)
) as
begin
	set nocount on
	
	if exists (select top(1) 1 from DokumentiPredmeta
						where IdPredmeta = @IdPredmeta and
							IdDokumenta = @IdDokumenta)
	begin
	    
		declare @Sada smalldatetime
	    declare @IdKretanja smallint
		declare @Poruka nvarchar(2000)

		select @Sada = getdate()
		set @IdKretanja = isnull((select max(IdKretanja) + 1
										from IstorijaPredmeta
										where IdPredmeta = @IdPredmeta), 1)        

		set @Poruka = 'Obrisan dokument. Razlog: ' + @Napomena

        INSERT INTO IstorijaPredmeta
		(
		    IdPredmeta,
			IdKretanja,
			IdKretanjaPredmeta,
			Vreme,
			IdKorisnika,
			Opis,
			Napomena)
		values (
			@IdPredmeta,
			@IdKretanja,
			null,
			@Sada,
			@IdKorisnika,
			@Poruka,
			null
		)
	    
		update DokumentiPredmeta
		set VremeBrisanja = @Sada,
		    IdKreatoraBrisanja = @IdKorisnika,
			Napomena = @Napomena
		where IdPredmeta = @IdPredmeta and
				IdDokumenta = @IdDokumenta
	end

	set nocount off
end