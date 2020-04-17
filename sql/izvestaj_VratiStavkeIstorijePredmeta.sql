go
if OBJECT_ID('izvestaj_VratiStavkeIstorijePredmeta','P') is not null
	drop procedure izvestaj_VratiStavkeIstorijePredmeta
go

create procedure izvestaj_VratiStavkeIstorijePredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on
	
	select
		KP.Naziv as NazivKretanjaPredmeta,
		KOR.ImeIPrezime as ImeIPrezimeKorisnika,
		KOR.KorisnickoIme as KorisnickoImeKorisnika,
		IP.Opis,
		IP.Napomena,
		IP.Vreme
	from IstorijaPredmeta as IP

	join Korisnici as KOR
	on KOR.IdKorisnika = IP.IdKorisnika

	left outer join KretanjaPredmeta as KP
	on KP.IdKretanjaPredmeta = IP.IdKretanjaPredmeta

	where IP.IdPredmeta = @IdPredmeta
	
	set nocount off
end