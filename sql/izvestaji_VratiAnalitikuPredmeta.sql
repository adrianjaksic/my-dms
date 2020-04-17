go
if OBJECT_ID('izvestaji_VratiAnalitikuPredmeta','P') is not null
	drop procedure izvestaji_VratiAnalitikuPredmeta
go

create procedure izvestaji_VratiAnalitikuPredmeta(
	@Grupisanje tinyint,
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
	@IdKreatora int = null,
	@IdUlogovanogKorisnika int = null,
	@IdOpstine smallint = null,
	@OznakaOrgana char(3) = null,
	@OznakaKlase char(3) = null,
	@OznakaJedinice char(3) = null,
	@IdKorisnika int = null,
	@GledanjeDatumaKreiranja bit = 1,
	@IdMestaOpstine smallint = null
) as
begin
	set nocount on

	declare @Sada smalldatetime
	select @Sada = getdate()

	declare @IdKorisnikaSvojihPredmeta int

	select @IdKorisnikaSvojihPredmeta = IdKorisnika
	from Korisnici
	where IdKorisnika = @IdUlogovanogKorisnika and SamoSvojePredmete = 1

	declare @RokBezVrste bit
	select @RokBezVrste = isnull(RokBezVrste, 60)
	from PodesavanjeServera
	where Id = 1

	select case @Grupisanje
	          when 1 then K.ImeIPrezime + ' (' + K.KorisnickoIme + ')'
			  when 2 then I.ImeIPrezime + ' (' + I.KorisnickoIme + ')'
			  when 3 then OG.Oznaka + ' - ' + OG.Naziv
			  when 4 then KL.Oznaka + ' - ' + KL.Naziv
			  when 5 then P.Sadrzaj
			  when 6 then P.Status
			 end as Grupisanje,
		   P.IdPredmeta,
		   P.BrojPredmeta,
		   P.IdOkruga,
		   OK.Oznaka as OznakaOkruga,
		   P.IdOrgana,
		   OG.Oznaka as OznakaOrgana,
		   P.IdKlase,
		   P.IdJedinice,
		   J.Oznaka as OznakaJedinice,
		   KL.Oznaka as OznakaKlase,
		   year(P.VremeRezervacije) as Godina,
		   P.Podnosilac,
		   P.IdInspektora,
		   I.KorisnickoIme + '( ' + I.ImeIPrezime + ' )' as NazivInspektora,
		   P.Sadrzaj,
		   case
		    when P.LiceKontroleJedinstveniBroj is not null and P.LiceKontrole is not null then P.LiceKontroleJedinstveniBroj + '-' + P.LiceKontrole
			when P.LiceKontrole is not null then P.LiceKontrole
			else P.LiceKontroleJedinstveniBroj
		   end as LiceKontrole
	from Predmeti as P

	join Korisnici as K
	on K.IdKorisnika = isnull(P.IdArhivatora, P.IdKreatora)

	left outer join Korisnici as I
	on I.IdKorisnika = P.IdInspektora

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

	left outer join VrstePredmeta as VP
	on VP.IdVrstePredmeta = P.IdVrstePredmeta	

	join KlaseInspektora as KI
	on KI.IdOkruga = P.IdOkruga and
	   KI.IdOrgana = P.IdOrgana and
	   KI.IdKlase = P.IdKlase and
	   KI.IdKorisnika = @IdUlogovanogKorisnika

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
		   @Status = P.Status or
		   (@Status = 'Z' and P.Status = 'Z' and P.IdNadredjenogPredmeta is null) or
		   (@Status = 'P' and P.Status = 'Z' and P.IdNadredjenogPredmeta is not null)
		  ) and

		  (@IdVrstePredmeta is null or P.IdVrstePredmeta = @IdVrstePredmeta) and
		  (@IdKreatora is null or P.IdKreatora = @IdKreatora) and
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
			(@PreRoka = 0 and datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) >= @Rok) or 
			(@PreRoka = 1 and datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) <= @Rok)
		  ) and
		  (@OznakaOrgana is null or OG.Oznaka = @OznakaOrgana) and
		  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and
		  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
		  (@GledanjeDatumaKreiranja = 1 or IP.IdKretanjaPredmeta is not null)
	order by case @Grupisanje
	          when 1 then K.ImeIPrezime + ' (' + K.KorisnickoIme + ')'
			  when 2 then I.ImeIPrezime + ' (' + I.KorisnickoIme + ')'
			  when 3 then OG.Oznaka + ' - ' + OG.Naziv
			  when 4 then KL.Oznaka + ' - ' + KL.Naziv
			  when 5 then P.Sadrzaj
			  when 6 then P.Status
			 end,	          
			 OK.Oznaka, OG.Oznaka, KL.Oznaka, P.BrojPredmeta
	
	set nocount off
end