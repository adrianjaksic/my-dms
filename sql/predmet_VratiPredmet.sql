go
if OBJECT_ID('predmet_VratiPredmet','P') is not null
	drop procedure predmet_VratiPredmet
go
/*
predmet_VratiPredmet
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiPredmet(
	@IdPredmeta bigint
) as
begin
	set nocount on

		select P.IdPredmeta
			  ,P.IdNadredjenogPredmeta
			  ,P.BrojPredmeta
			  ,O.IdOkruga
			  ,O.Naziv as NazivOkruga
			  ,O.Oznaka as OznakaOkruga
			  ,P.IdOrgana
			  ,ORG.Oznaka as OznakaOrgana
			  ,P.IdKlase
			  ,K.Oznaka as OznakaKlase
			  ,P.IdJedinice
			  ,J.Oznaka as OznakaJedinice
			  ,P.IdOpstine
			  ,OP.Naziv as NazivOpstine
			  ,P.IdKreatora
			  ,KOR.KorisnickoIme + ' (' + KOR.ImeIPrezime + ')' as NazivKreatora
			  ,P.PodnosilacJeInspektor
			  ,P.PodnosilacJedinstveniBroj
			  ,P.Podnosilac
			  ,P.LiceKontroleJedinstveniBroj
			  ,P.LiceKontrole
			  ,case
			    when P.Status = 'R' then getdate()
				else P.VremeKreiranja
			   end as VremeKreiranja
			  ,P.VremeKreiranja as StvarnoVremeKreiranja
			  ,P.VremeRezervacije
			  ,YEAR(P.VremeRezervacije) as Godina
			  ,P.IdVrstePredmeta
			  ,VP.Naziv as NazivVrstePredmeta
			  ,VP.Oznaka as OznakaVrstePredmeta
			  ,P.IdInspektora
			  ,INS.ImeIPrezime as NazivInspektora
			  ,P.Prilog
			  ,P.Sadrzaj
			  ,P.IdTakse
			  ,P.StraniBroj
			  ,P.Napomena
			  ,P.Status
			  ,P.PutanjaArhiviranjaDokumenata	
			  ,P.IdMesta
			  ,M.Naziv as NazivMesta
			  ,P.StrogoPoverljiv
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

		left outer join Mesta as M
		on M.IdOkruga = P.IdOkruga and
		   M.IdOpstine = P.IdOpstine and
		   M.IdMesta = P.IdMesta

		left outer join VrstePredmeta as VP
		on VP.IdVrstePredmeta = P.IdVrstePredmeta

		join Korisnici as KOR
		on KOR.IdKorisnika = P.IdKreatora

		left outer join Korisnici as INS
		on INS.IdKorisnika = P.IdInspektora

		left outer join Opstine as OP
		on OP.IdOkruga = P.IdOkruga and
		   OP.IdOpstine = P.IdOpstine

		where P.IdPredmeta = @IdPredmeta

	set nocount off
end