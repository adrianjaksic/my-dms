go
if OBJECT_ID('izvestaji_VratiPredmetePoOpstinama','P') is not null
	drop procedure izvestaji_VratiPredmetePoOpstinama
go

create procedure izvestaji_VratiPredmetePoOpstinama (
	@OdDatuma smalldatetime,
	@DoDatuma smalldatetime,
	@IdUlogovanogKorisnika int
)  
as
begin
	set nocount on

	SELECT 
		OPS.PostanskiBroj as PostanskiBrojOpstine,
		OPS.Naziv as NazivOpstine,
		O.Oznaka as Organ,
		O.Naziv as NazivOrgana,
		K.Oznaka as Klasa,
		K.Naziv as NazivKlase,
		J.Oznaka as Jedinica,
		J.Naziv as NazivJedinice,
		VP.Oznaka as VrstaPredmeta,
		VP.Naziv as NazivVrstePredmeta,
		count(*) as BrojPredmeta
	FROM Predmeti as P
	join KlaseInspektora as KI
	on KI.IdOkruga = P.IdOkruga and
	   KI.IdOrgana = P.IdOrgana and
	   KI.IdKlase = P.IdKlase and
	   KI.IdKorisnika = @IdUlogovanogKorisnika
	join Organi as O
	on O.IdOrgana = P.IdOrgana
	join Klase as K 
	on K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase
	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
	   J.IdJedinice = P.IdJedinice
	left outer join Opstine as OPS
	on OPS.IdOkruga = P.IdOkruga and
	   OPS.IdOpstine = P.IdOpstine
	join VrstePredmeta as VP
	on VP.IdVrstePredmeta = P.IdVrstePredmeta
	where datediff(day, P.VremeKreiranja, @OdDatuma) < 0 and 
		  datediff(day, P.VremeKreiranja, @DoDatuma) > 0 and 
		  P.Status <> 'R'
	group by OPS.PostanskiBroj,
		OPS.Naziv,
		O.Oznaka,
		O.Naziv,
		K.Oznaka,
		K.Naziv,
		J.Oznaka,
		J.Naziv,
		VP.Oznaka,
		VP.Naziv
	order by OPS.PostanskiBroj,
		O.Oznaka,
		K.Oznaka,
		J.Oznaka,
		VP.Oznaka

	set nocount off
end