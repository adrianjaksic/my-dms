go
if OBJECT_ID('dokument_VratiDetaljeDokumenta','P') is not null
	drop procedure dokument_VratiDetaljeDokumenta
go

create procedure dokument_VratiDetaljeDokumenta(
	@IdPredmeta bigint,
	@IdDokumenta smallint
) as
begin
	set nocount on
	
	select K.KorisnickoIme + ' (' + K.ImeIPrezime + ')' as NazivKreatora,
	       KB.KorisnickoIme + ' (' + KB.ImeIPrezime + ')' as NazivKreatoraBrisanja,
	       D.Naziv,
		   D.VremeUnosa,
		   D.VremeBrisanja,
		   D.Putanja,
		   D.Hashcode,
		   D.Napomena,
		   D.Ekstenzija
	from DokumentiPredmeta as D

	join Korisnici as K
	on K.IdKorisnika = D.IdKreatora

	left outer join Korisnici as KB
	on KB.IdKorisnika = D.IdKreatoraBrisanja

	where D.IdPredmeta = @IdPredmeta and
	      D.IdDokumenta = @IdDokumenta
	
	set nocount off
end