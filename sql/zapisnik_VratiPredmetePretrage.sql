go

if OBJECT_ID('zapisnik_VratiPredmetePretrage','P') is not null
	drop procedure zapisnik_VratiPredmetePretrage
go
/*
zapisnik_VratiPredmetePretrage
ULAZ:
IZLAZ:
*/
create procedure zapisnik_VratiPredmetePretrage(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@OznakaKlase char(3),
	@IdJedinice smallint,
	@OznakaJedinice char(3),
	@IdKreatora int,
	@Datum smalldatetime,
	@TipPretrage tinyint,
	@IdKorisnika int,
	@SamoArhivirani bit
) as
begin
	set nocount on

	set @SamoArhivirani = isnull(@SamoArhivirani, 0)

	select
		P.IdPredmeta,
		P.BrojPredmeta,
		IST.Broj,
		O.Oznaka as OznakaOkruga,
		OG.Oznaka as OznakaOrgana,
		OG.Naziv as NazivOrgana,
		KL.Oznaka as OznakaKlase,
		KL.Naziv as NazivKlase,
		J.Oznaka as OznakaJedinice,
		J.Naziv as NazivJedinice,
		I.KorisnickoIme + '( ' + I.ImeIPrezime + ' )' as NazivInspektora,
		P.Sadrzaj,
		P.Podnosilac,
		P.VremeKreiranja,
		YEAR(P.VremeRezervacije) as Godina,
		IST.Opis,
		IST.Napomena,
		KRE.Primedba,
		IST.BrojUGodini,
		KI.KorisnickoIme + '( ' + KI.ImeIPrezime + ' )' as KreatorIstorije
	from Predmeti as P

	join IstorijaPredmeta as IST
	on IST.IdPredmeta = P.IdPredmeta

	join KretanjaPredmeta as KRE
	on KRE.IdKretanjaPredmeta = IST.IdKretanjaPredmeta

	join Korisnici as KI
	on KI.IdKorisnika = IST.IdKorisnika

	join Okruzi as O
	on O.IdOkruga = P.IdOkruga

	left outer join Opstine as OP
	on OP.IdOkruga = P.IdOkruga and
	   OP.IdOpstine = P.IdOpstine

	join Organi as OG
	on OG.IdOrgana = P.IdOrgana

	join Klase as KL
	on KL.IdOkruga = P.IdOkruga and
	   KL.IdOrgana = P.IdOrgana and
	   KL.IdKlase = P.IdKlase

	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
	   J.IdJedinice = P.IdJedinice

	left outer join Korisnici as I
	on I.IdKorisnika = P.IdInspektora

	where P.IdOkruga = @IdOkruga and
	      (@IdOrgana is null or P.IdOrgana = @IdOrgana) and
		  (@IdKlase is null or P.IdKlase = @IdKlase) and
		  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and
		  (@IdJedinice is null or P.IdJedinice = @IdJedinice) and
		  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
	      --(@IdKreatora is null or P.IdKreatora = @IdKreatora) and
		  (@IdKreatora is null or IST.IdKorisnika = @IdKreatora) and
		  IST.DatumBrisanja is null and
		  isnull(IST.Obrisao, 0) = 0 and
		  ((@SamoArhivirani = 0 and KRE.Zapisnik = 1) or (@SamoArhivirani = 1 and KRE.Status in ('Z', 'E'))) and
		  datediff(day, IST.Vreme, @Datum) = 0 and
		  (P.IdKlase in (select IdKlase from KlaseInspektora where IdOkruga = P.IdOkruga and IdOrgana = P.IdOrgana and IdKorisnika = @IdKorisnika))
	order by O.Oznaka, OG.Oznaka, KL.Oznaka, YEAR(IST.Vreme), IST.Broj
	
	set nocount off
end

go