go

if OBJECT_ID('predmet_VratiIdPredmetaPrekoBroja','P') is not null
	drop procedure predmet_VratiIdPredmetaPrekoBroja
go
/*
predmet_VratiIdPredmetaPrekoBroja
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiIdPredmetaPrekoBroja(
	@BrojPredmeta nvarchar(200)
) as
begin
	set nocount on

	select P.IdPredmeta
	from Predmeti as P with (nolock)

	join Okruzi as O with (nolock)
	on O.IdOkruga = P.IdOkruga

	join Organi as ORG with (nolock)
	on ORG.IdOrgana = P.IdOrgana

	join Klase as K with (nolock)
	on K.IdOkruga = P.IdOkruga and
	   K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase

	join Jedinice as J with (nolock)
	on J.IdOrgana = P.IdOrgana and
	   J.IdJedinice = P.IdJedinice
	
	where (O.Oznaka + '-' + 
		   ORG.Oznaka + '-' + 
		   K.Oznaka + '-' + 
		   RIGHT('000000' + cast(P.BrojPredmeta as nvarchar), 6) + '/' +
		   cast(YEAR(P.VremeRezervacije) as nvarchar) + '-' + 
		   J.Oznaka) = @BrojPredmeta

	set nocount off
end

go