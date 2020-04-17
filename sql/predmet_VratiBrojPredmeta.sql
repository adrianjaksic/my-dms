go

if OBJECT_ID('predmet_VratiBrojPredmeta','P') is not null
	drop procedure predmet_VratiBrojPredmeta
go
/*
predmet_VratiBrojPredmeta
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiBrojPredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on

	select
		O.Oznaka as OznakaOkruga,
		ORG.Oznaka as OznakaOrgana,
		K.Oznaka as OznakaKlase,
		P.BrojPredmeta,
		YEAR(P.VremeRezervacije) as Godina,
		J.Oznaka as OznakaJedinice
	from Predmeti as P

	join Okruzi as O
	on O.IdOkruga = P.IdOkruga

	join Organi as ORG
	on ORG.IdOrgana = P.IdOrgana

	join Klase as K
	on K.IdOkruga = P.IdOkruga and
	   K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase

	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
	   J.IdJedinice = P.IdJedinice
	
	where P.IdPredmeta = @IdPredmeta

	set nocount off
end

go