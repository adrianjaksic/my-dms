go
if OBJECT_ID('izvestaji_VratiPredmeteSaRokom','P') is not null
	drop procedure izvestaji_VratiPredmeteSaRokom
go
/*
izvestaji_VratiPredmeteSaRokom
ULAZ:
IZLAZ:
*/
create procedure izvestaji_VratiPredmeteSaRokom(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@OznakaKlase char(3),
	@BrojPredmeta int,
	@Godina int,
	@IdJedinice smallint,
	@OznakaJedinice char(3),
	@IdKorisnika int
) as
begin
	set nocount on

	if(not exists (select top(1) 1
	               from Korisnici
				   where IdKorisnika = @IdKorisnika and
				         (Administracija = 1 or Inspektor = 0)))
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end
	else
	begin
		declare @Sada smalldatetime
		select @Sada = getdate()

		declare @IdKorisnikaSvojihPredmeta int

		select @IdKorisnikaSvojihPredmeta = IdKorisnika
		from Korisnici
		where IdKorisnika = @IdKorisnika and SamoSvojePredmete = 1

		select P.IdPredmeta,
			   P.BrojPredmeta,
			   OK.Oznaka as OznakaOkruga,
			   OG.Oznaka as OznakaOrgana,
			   KL.Oznaka as OznakaKlase,
			   J.Oznaka as OznakaJedinice,
			   year(P.VremeRezervacije) as Godina,
			   P.Podnosilac,
			   K.KorisnickoIme + ' (' + K.ImeIPrezime + ')' as NazivInspektora,
			   P.Sadrzaj,
			   IP.DatumRoka
		from Predmeti as P

		join KlaseInspektora as KI
		on KI.IdOkruga = P.IdOkruga and
		   KI.IdOrgana = P.IdOrgana and
		   KI.IdKlase = P.IdKlase and
		   KI.IdKorisnika = @IdKorisnika

		left outer join Korisnici as K
		on K.IdKorisnika = P.IdInspektora

		join Okruzi as OK
		on OK.IdOkruga = P.IdOkruga

		join Organi as OG
		on OG.IdOrgana = P.IdOrgana

		join Klase as KL
		on KL.IdOkruga = P.IdOkruga and
		   KL.IdOrgana = P.IdOrgana and
		   KL.IdKlase = P.IdKlase
	   
		join Jedinice as J
		on J.IdOrgana = P.IdOrgana and
			J.IdJedinice = P.IdJedinice

		join (
			select IdPredmeta, max(IdKretanja) as MaxIdKretanja
			from IstorijaPredmeta
			where IdKretanjaPredmeta is not null
			group by IdPredmeta
		) as A
		on A.IdPredmeta = P.IdPredmeta

		join IstorijaPredmeta as IP
		on IP.IdPredmeta = A.IdPredmeta and
		   IP.IdKretanja = A.MaxIdKretanja

		where P.IdOkruga = @IdOkruga and
			  (@IdOrgana is null or P.IdOrgana = @IdOrgana) and
			  (@IdKlase is null or P.IdKlase = @IdKlase) and
			  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and
			  (@BrojPredmeta is null or P.BrojPredmeta = @BrojPredmeta) and
			  (@Godina is null or year(P.VremeRezervacije) = @Godina) and
			  (@IdJedinice is null or P.IdJedinice = @IdJedinice) and
			  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
			  (@IdKorisnikaSvojihPredmeta is null or P.IdKreatora = @IdKorisnikaSvojihPredmeta or P.IdInspektora = @IdKorisnikaSvojihPredmeta) and
			  IP.DatumRoka is not null
		order by OK.Oznaka, OG.Oznaka, KL.Oznaka, P.BrojPredmeta
	end

	set nocount off
end