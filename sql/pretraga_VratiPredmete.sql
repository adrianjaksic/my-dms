go
if OBJECT_ID('pretraga_VratiPredmete','P') is not null
	drop procedure pretraga_VratiPredmete
go

create procedure pretraga_VratiPredmete(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@BrojPredmeta int,
	@Godina int,
	@OdDatuma smalldatetime,
	@DoDatuma smalldatetime,
	@IdJedinice smallint,
	@Status char(1),
	@IdVrstePredmeta smallint,
	@IdInspektora int,
	@Podnosilac nvarchar(300),
	@LiceKontrole nvarchar(300),
	@Sadrzaj nvarchar(2000),
	@IdTakse smallint,
	@StraniBroj nchar(10),
	@Rok smallint,
	@PreRoka bit,
	@DatumKretanja smalldatetime,
	@IdKretanjaPredmeta smallint,
	@OpisKretanja nvarchar(2000),
	@IdUlogovanogKorisnika int,
	@IdOpstine smallint,
	@OznakaOrgana char(3),
	@OznakaKlase char(3),
	@OznakaJedinice char(3),
	@GledanjeDatumaKreiranja bit,
	@IdMestaOpstine smallint,
	@RokCuvanja nvarchar(2000) = null
) as
begin
	set nocount on

	declare @Sada smalldatetime
	select @Sada = getdate()

	declare @IdKorisnikaSvojihPredmeta int

	select @IdKorisnikaSvojihPredmeta = IdKorisnika
	from Korisnici
	where IdKorisnika = @IdUlogovanogKorisnika and SamoSvojePredmete = 1

	select P.IdPredmeta,
		   P.BrojPredmeta,
		   P.IdOkruga,
		   OK.Oznaka as OznakaOkruga,
		   P.IdOrgana,
		   OG.Oznaka as OznakaOrgana,
		   P.IdKlase,
		   KL.Oznaka as OznakaKlase,
		   P.IdJedinice,
		   J.Oznaka as OznakaJedinice,
		   year(P.VremeRezervacije) as Godina,
		   P.Podnosilac,
		   P.IdInspektora,
		   K.KorisnickoIme + '( ' + K.ImeIPrezime + ' )' as NazivInspektora,
		   P.Sadrzaj,
		   P.IdVrstePredmeta,
		   case
		    when P.LiceKontroleJedinstveniBroj is not null and P.LiceKontrole is not null then P.LiceKontroleJedinstveniBroj + '-' + P.LiceKontrole
			when P.LiceKontrole is not null then P.LiceKontrole
			else P.LiceKontroleJedinstveniBroj
		   end as LiceKontrole 
	from Predmeti as P

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

	left outer join VrstePredmeta as VP
	on VP.IdVrstePredmeta = P.IdVrstePredmeta

	left outer join (
		select IdPredmeta, max(IdKretanja) as MaxIdKretanja
		from IstorijaPredmeta
		where IdKretanjaPredmeta is not null
		group by IdPredmeta
	) as A
	on A.IdPredmeta = P.IdPredmeta

	left outer join IstorijaPredmeta as IP
	on IP.IdPredmeta = A.IdPredmeta and
	   IP.IdKretanja = A.MaxIdKretanja
	   
	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
		J.IdJedinice = P.IdJedinice

	join KlaseInspektora as KI
	on KI.IdOkruga = P.IdOkruga and
	   KI.IdOrgana = P.IdOrgana and
	   KI.IdKlase = P.IdKlase and
	   KI.IdKorisnika = @IdUlogovanogKorisnika

	where (@IdOkruga is null or P.IdOkruga = @IdOkruga) and
	      (@IdOpstine is null or P.IdOpstine = @IdOpstine) and
	      (@IdOrgana is null or P.IdOrgana = @IdOrgana) and
		  (@IdKlase is null or P.IdKlase = @IdKlase) and
		  (@IdMestaOpstine is null or P.IdMesta = @IdMestaOpstine) and
		  (@BrojPredmeta is null or P.BrojPredmeta = @BrojPredmeta) and
		  (@Godina is null or year(P.VremeRezervacije) = @Godina) and
		  (@OdDatuma is null or datediff(day, @OdDatuma, 
		    case
			 when @GledanjeDatumaKreiranja = 1 then P.VremeKreiranja
			 else isnull(IP.Vreme, P.VremeRezervacije)
			end) >= 0) and
		  (@DoDatuma is null or datediff(day, @DoDatuma, 
		    case
			 when @GledanjeDatumaKreiranja = 1 then P.VremeKreiranja
			 else isnull(IP.Vreme, P.VremeRezervacije)
			end) <= 0) and
		  (@IdJedinice is null or P.IdJedinice = @IdJedinice) and
		  (
		   @Status is null or 
		   @Status = P.Status
		  ) and
		  (@IdVrstePredmeta is null or P.IdVrstePredmeta = @IdVrstePredmeta) and
		  (@IdInspektora is null or P.IdInspektora = @IdInspektora) and
		  (@Podnosilac is null or P.Podnosilac collate Latin1_General_CI_AI LIKE '%' + @Podnosilac + '%' collate Latin1_General_CI_AI) and
		  (@LiceKontrole is null or P.LiceKontrole collate Latin1_General_CI_AI LIKE '%' + @LiceKontrole + '%' collate Latin1_General_CI_AI) and
		  (@Sadrzaj is null or P.Sadrzaj collate Latin1_General_CI_AI LIKE '%' + @Sadrzaj + '%' collate Latin1_General_CI_AI) and
		  (@IdTakse is null or P.IdTakse = @IdTakse) and
		  (@StraniBroj is null or P.StraniBroj LIKE @StraniBroj) and
		  (@IdKorisnikaSvojihPredmeta is null or P.IdKreatora = @IdKorisnikaSvojihPredmeta or P.IdInspektora = @IdKorisnikaSvojihPredmeta) and
		  (
		   (@IdKretanjaPredmeta is null and @DatumKretanja is null and @OpisKretanja is null) or
		   (
		    (@IdKretanjaPredmeta is null or IP.IdKretanjaPredmeta = @IdKretanjaPredmeta) and
			(@DatumKretanja is null or IP.Vreme = @DatumKretanja) and
			(@OpisKretanja is null or IP.Opis = @OpisKretanja)
           )
		  ) and	       
		  (@Rok is null or
			(isnull(@PreRoka, 0) = 0 and datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, 0) >= @Rok) or 
			(isnull(@PreRoka, 0) = 1 and datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, 0) <= @Rok)
		  ) and
		  (@OznakaOrgana is null or OG.Oznaka = @OznakaOrgana) and
		  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and
		  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
		  (@GledanjeDatumaKreiranja = 1 or IP.IdKretanjaPredmeta is not null) and
		  (@RokCuvanja is null or P.IdPredmeta in (select IdPredmeta 
												   from [IstorijaPredmeta]
												   where [IdKretanjaPredmeta] = 11 and
														 Napomena like '%' + @RokCuvanja + '%'))
	order by OK.Oznaka, OG.Oznaka, KL.Oznaka, P.BrojPredmeta
	
	set nocount off
end