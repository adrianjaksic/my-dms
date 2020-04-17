go
if OBJECT_ID('klase_insp_VratiKlaseInspektora','P') is not null
	drop procedure klase_insp_VratiKlaseInspektora
go
/*
klase_insp_VratiKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klase_insp_VratiKlaseInspektora(
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on
	
	select
		K.IdKlase,
		K.Oznaka,
		K.Naziv,
		cast(case when T.IdOkruga is not null then 1 else 0 end as bit) as Izabran,
		O.Naziv as NazivOrgana,
		O.Oznaka as OznakaOrgana,
		k.IdOrgana
	from Klase as K

	join Organi as O
	on O.IdOrgana = K.IdOrgana

	left outer join KlaseInspektora as T
	on T.IdKorisnika = @IdKorisnika and
	   K.IdOkruga = T.IdOkruga and
	   K.IdOrgana = T.IdOrgana and
	   K.IdKlase = T.IdKlase  
	where K.IdOkruga = @IdOkruga
	order by O.Oznaka, K.Oznaka
	
	set nocount off
end