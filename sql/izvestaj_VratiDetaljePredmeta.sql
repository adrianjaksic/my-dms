go
if OBJECT_ID('izvestaj_VratiDetaljePredmeta','P') is not null
	drop procedure izvestaj_VratiDetaljePredmeta
go

create procedure izvestaj_VratiDetaljePredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on
	
	select
		P.IdPredmeta,
		P.IdNadredjenogPredmeta,
		OKR.Oznaka as OznakaOkruga,
		OKR.Naziv as NazivOkruga,
		OKR.Mesto,
		ORG.Oznaka as OznakaOrgana,
		ORG.Naziv as NazivOrgana,
		K.Oznaka as OznakaKlase,
		K.Naziv as NazivKlase,
		P.BrojPredmeta,
		J.Oznaka as OznakaJedinice,
		J.Naziv as NazivJedinice,
		KOR.ImeIPrezime as ImeIPrezimeKreatora,
		KOR.KorisnickoIme as KorisnickoImeKreatora,
		P.PodnosilacJeInspektor,
		P.Podnosilac,
		P.PodnosilacJedinstveniBroj,
		P.LiceKontrole,
		P.LiceKontroleJedinstveniBroj,
		P.VremeRezervacije,
		P.VremeKreiranja,
		VP.Oznaka as OznakaVrstePredmeta,
		VP.Naziv as NazivVrstePredmeta,
		VP.Rok,
		VP.OznakaZaStampu as OznakaVrstePredmetaZaStampu,
		INS.ImeIPrezime as ImeIPrezimeInspektora,
		INS.KorisnickoIme as KorisnickoImeInspektora,
		P.Prilog,
		P.Sadrzaj,
		T.Naziv as NazivTakse,
		T.OznakaZaStampu as OznakaTakseZaStampu,
		P.StraniBroj,
		P.Napomena,
		P.Status,
		dateadd(day, VP.Rok, isnull(POV.PrvoVremeKreiranja, P.VremeKreiranja)) as VremeIstekaRoka
	from Predmeti as P

	join Okruzi as OKR
	on OKR.IdOkruga = P.IdOkruga

	join Organi as ORG
	on ORG.IdOrgana = P.IdOrgana

	join Klase as K
	on K.IdOkruga = P.IdOkruga and
	   K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase

	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
	   J.IdJedinice = P.IdJedinice

	join Korisnici as KOR
	on KOR.IdKorisnika = P.IdKreatora

	left outer join VrstePredmeta as VP
	on VP.IdVrstePredmeta = P.IdVrstePredmeta

	left outer join Korisnici as INS
	on INS.IdKorisnika = P.IdInspektora

	left outer join Takse as T
	on T.IdTakse = P.IdTakse

	left outer join
	(
		select IdNadredjenogPredmeta, MIN(VremeKreiranja) as PrvoVremeKreiranja
		from Predmeti
		where IdNadredjenogPredmeta is not null
		group by IdNadredjenogPredmeta
	) as POV
	on POV.IdNadredjenogPredmeta = P.IdPredmeta

	where P.IdPredmeta = @IdPredmeta
	
	set nocount off
end