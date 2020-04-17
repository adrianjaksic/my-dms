go
if OBJECT_ID('izvestaji_VratiPredmetePoRazvodjenju','P') is not null
	drop procedure izvestaji_VratiPredmetePoRazvodjenju
go

create procedure izvestaji_VratiPredmetePoRazvodjenju(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@OznakaKlase char(3),
	@BrojPredmeta int,
	@Godina int,
	@IdJedinice smallint,
	@OznakaJedinice char(3),
	@IdKorisnika int,
	@OdDatuma smalldatetime,
	@DoDatuma smalldatetime,
	@IdArhivatora int
) as
begin
	set nocount on
	
	declare @Sada smalldatetime
	select @Sada = getdate()

	declare @IdKorisnikaSvojihPredmeta int

	select @IdKorisnikaSvojihPredmeta = IdKorisnika
	from Korisnici
	where IdKorisnika = @IdKorisnika and SamoSvojePredmete = 1

	select P.RazvodjenjeAkata, count(*) as BrojPredmeta
	
	from Predmeti as P

	join KlaseInspektora as KI
	on KI.IdOkruga = P.IdOkruga and
		KI.IdOrgana = P.IdOrgana and
		KI.IdKlase = P.IdKlase and
		KI.IdKorisnika = @IdKorisnika
	
	join Klase as KL
	on KL.IdOkruga = P.IdOkruga and
		KL.IdOrgana = P.IdOrgana and
		KL.IdKlase = P.IdKlase
	   
	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
		J.IdJedinice = P.IdJedinice
				
	where P.IdOkruga = @IdOkruga and
			(@IdOrgana is null or P.IdOrgana = @IdOrgana) and
			(@IdKlase is null or P.IdKlase = @IdKlase) and
			(@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and
			(@BrojPredmeta is null or P.BrojPredmeta = @BrojPredmeta) and
			(@Godina is null or year(P.VremeRezervacije) = @Godina) and
			(@IdJedinice is null or P.IdJedinice = @IdJedinice) and
			(@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
			(@IdKorisnikaSvojihPredmeta is null or P.IdKreatora = @IdKorisnikaSvojihPredmeta or P.IdInspektora = @IdKorisnikaSvojihPredmeta) and
			datediff(day, @OdDatuma, isnull(P.VremeArhiviranja, P.VremeRezervacije)) >= 0 and
		    datediff(day, @DoDatuma, isnull(P.VremeArhiviranja, P.VremeRezervacije)) <= 0 and
			(@IdArhivatora is null or isnull(P.IdArhivatora, P.IdKreatora) = @IdArhivatora) and
			P.RazvodjenjeAkata is not null and
			P.Status in ('Z', 'E')			
	group by P.RazvodjenjeAkata
	order by P.RazvodjenjeAkata

	set nocount off
end