go
if OBJECT_ID('izvestaj_AktivniPredmeti','P') is not null
	drop procedure izvestaj_AktivniPredmeti
go

create procedure izvestaj_AktivniPredmeti(
	@Datum smalldatetime,
	@IdUlogovanogKorisnika int
) as
begin
	set nocount on

	declare @OdDatuma smalldatetime
	set @OdDatuma = DATEADD(year, -10, @Datum)

	select isnull(I.Naziv, O.Oznaka + '-' + K.Oznaka + '-' + J.Oznaka + '/' + K.Naziv + '-' + J.Naziv) as Inspekcija, 
		   YEAR(P.VremeRezervacije) as Godina, 
		   count(*) as BrojPredmeta
	from Predmeti as P
	join KlaseInspektora as KI
	on KI.IdOkruga = P.IdOkruga and
	   KI.IdOrgana = P.IdOrgana and
	   KI.IdKlase = P.IdKlase and
	   KI.IdKorisnika = @IdUlogovanogKorisnika
	join Organi as O
	on O.IdOrgana = P.IdOrgana
	join Klase as K
	on K.IdOkruga = P.IdOkruga and
	   K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase
	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
	   J.IdJedinice = P.IdJedinice
	left outer join InspekcijeKlaseIJedinice as IKJ1
	on IKJ1.IdOkruga = K.IdOkruga and
	   IKJ1.IdOrgana = K.IdOrgana and
	   IKJ1.IdKlase = K.IdKlase and
	   IKJ1.IdOrgana = J.IdOrgana and
	   IKJ1.IdJedinice = J.IdJedinice
	left outer join InspekcijeKlaseIJedinice as IKJ2
	on IKJ2.IdOkruga = K.IdOkruga and
	   IKJ2.IdOrgana = K.IdOrgana and
	   IKJ2.IdKlase = K.IdKlase and
	   IKJ2.IdOrgana = J.IdOrgana and
	   IKJ2.IdJedinice = 0
	left outer join Inspekcije as I
	on I.IdInspekcije = isnull(IKJ1.IdInspekcije, IKJ2.IdInspekcije)
	
	left outer join
	(
		select I.IdPredmeta, MAX(I.IdKretanja) as IdKretanja
		from IstorijaPredmeta as I
		join KretanjaPredmeta as K
		on I.IdKretanjaPredmeta = K.IdKretanjaPredmeta
		where I.Obrisao is null and 
		      K.Status <> 'X' and  
			  datediff(day, I.Vreme, @Datum) >= 0
		group by I.IdPredmeta
	) as KRET
	on KRET.IdPredmeta = P.IdPredmeta
	
	left outer join IstorijaPredmeta as IST
	on IST.IdPredmeta = P.IdPredmeta and
	   IST.IdKretanja = KRET.IdKretanja

	left outer join KretanjaPredmeta as KR
	on KR.IdKretanjaPredmeta = IST.IdKretanjaPredmeta

	where isnull(KR.Status, P.Status) = 'O' and
	      P.Status <> 'B' and
		  P.Status <> 'R' and
		  datediff(day, P.VremeRezervacije, @Datum) >= 0 and
		  YEAR(P.VremeRezervacije) >= YEAR(@OdDatuma)

	group by isnull(I.Sortiranje, 0),
	         isnull(I.Naziv, O.Oznaka + '-' + K.Oznaka + '-' + J.Oznaka + '/' + K.Naziv + '-' + J.Naziv), 
			 YEAR(P.VremeRezervacije)
	order by isnull(I.Sortiranje, 0),
	         isnull(I.Naziv, O.Oznaka + '-' + K.Oznaka + '-' + J.Oznaka + '/' + K.Naziv + '-' + J.Naziv), 
			 YEAR(P.VremeRezervacije)

	set nocount off
end