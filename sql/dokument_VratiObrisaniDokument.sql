go
if OBJECT_ID('dokument_VratiObrisaniDokument','P') is not null
	drop procedure dokument_VratiObrisaniDokument
go

create procedure dokument_VratiObrisaniDokument(
	@IdPredmeta bigint,
	@IdDokumenta smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	if exists (select top(1) 1 from DokumentiPredmeta
						where IdPredmeta = @IdPredmeta and
							IdDokumenta = @IdDokumenta)
	begin
		declare @Sada smalldatetime
		declare @IdKretanja smallint
		declare @Poruka nvarchar(200)

		select @Sada = getdate()
		set @IdKretanja = isnull((select max(IdKretanja) + 1
										from IstorijaPredmeta
										where IdPredmeta = @IdPredmeta), 1)        

		set @Poruka = 'Vraćen obrisan dokument.'

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
		set VremeBrisanja = null
		where IdPredmeta = @IdPredmeta and
			  IdDokumenta = @IdDokumenta
	end
	
	set nocount off
end