go
if OBJECT_ID('istorija_VratiIstorijuPredmeta','P') is not null
	drop procedure istorija_VratiIstorijuPredmeta
go

create procedure istorija_VratiIstorijuPredmeta(
	@IdPredmeta bigint,
	@Istorija bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Administrator bit
	set @Administrator = isnull((select top(1) 1
	                             from Korisnici
								 where IdKorisnika = @IdKorisnika and
									   Administracija = 1 and
									   Aktivan = 1), 0)
	
	select IP.Vreme,
		   IP.Opis,
		   IP.Napomena,
		   K.KorisnickoIme + ' (' + K.ImeIPrezime + ')' as NazivKorisnika,
		   IP.IdKretanja,
		   IP.DatumBrisanja,
		   KOM.KorisnickoIme + ' (' + KOM.ImeIPrezime + ')' as Obrisao,
		   IP.DatumRoka
	from IstorijaPredmeta as IP

	join Korisnici as K
	on K.IdKorisnika = IP.IdKorisnika

	left outer join Korisnici as KOM
	on KOM.IdKorisnika = IP.Obrisao

	where IP.IdPredmeta = @IdPredmeta and
	      (
		   (isnull(@Istorija, 0) = 0 and (@Administrator = 1 or isnull(IP.SamoAdministrator, 0) = 0)) or
		   (@Istorija = 1 and IP.IdKretanjaPredmeta is not null and IP.DatumBrisanja is null)
		  )
	order by IP.IdKretanja
	      
	set nocount off
end