go
if OBJECT_ID('dokument_DodajDokument','P') is not null
	drop procedure dokument_DodajDokument
go

create procedure dokument_DodajDokument(
	@IdPredmeta bigint,
	@IdDokumenta smallint output,
	@IdKreatora int,
	@Naziv nvarchar(200),
	@Putanja nvarchar(200),
	@Napomena nvarchar(2000),
	@Hashcode char(32),
	@Ekstenzija varchar(20)
) as
begin
	set nocount on

	set @IdDokumenta = isnull((select max(IdDokumenta)+1
								from DokumentiPredmeta
								where IdPredmeta = @IdPredmeta),
								1)

	insert into DokumentiPredmeta (
		IdPredmeta,
		IdDokumenta,
		IdKreatora,
		VremeUnosa,
		Naziv,
		Putanja,
		Napomena,
		VremeBrisanja,
		Hashcode,
		Ekstenzija
	) values (
		@IdPredmeta,
		@IdDokumenta,
		@IdKreatora,
		getdate(),
		@Naziv,
		@Putanja,
		@Napomena,
		null,
		@Hashcode,
		@Ekstenzija
	)

	set nocount off
end