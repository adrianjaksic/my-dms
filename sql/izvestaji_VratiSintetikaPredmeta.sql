go
if OBJECT_ID('izvestaji_VratiSintetikaPredmeta','P') is not null
	drop procedure izvestaji_VratiSintetikaPredmeta
go

create procedure izvestaji_VratiSintetikaPredmeta(
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

	declare @IdKorisnikaSvojihPredmeta int

	select @IdKorisnikaSvojihPredmeta = IdKorisnika
	from Korisnici
	where IdKorisnika = @IdUlogovanogKorisnika and SamoSvojePredmete = 1

	declare @RokBezVrste bit
	select @RokBezVrste = isnull(RokBezVrste, 60)
	from PodesavanjeServera
	where Id = 1

	declare @Sada smalldatetime
	select @Sada = getdate()
	
	select case @Grupisanje
	          when 1 then K.ImeIPrezime + ' (' + K.KorisnickoIme + ')'
			  when 2 then I.ImeIPrezime + ' (' + I.KorisnickoIme + ')'
			  when 3 then OG.Oznaka + ' - ' + OG.Naziv
			  when 4 then KL.Oznaka + ' - ' + KL.Naziv
			  when 5 then P.Sadrzaj
			  when 6 then cast(P.Status as nvarchar)
			 end as Grupisanje,
			case @Grupisanje
	          when 1 then cast(K.IdKorisnika as nvarchar)
			  when 2 then cast(I.IdKorisnika as nvarchar)
			  when 3 then cast(OG.IdOrgana as nvarchar)
			  when 4 then cast(KL.IdOrgana as nvarchar) + '|' + cast(KL.IdKlase as nvarchar)
			  when 5 then cast(P.Sadrzaj as nvarchar)
			  when 6 then cast(P.Status as nvarchar)
		    end as IdGrupisanja,
		   count(*) as UkupanBrojPredmeta,
		   sum(case
		        when P.Status = 'R' then 1
				else 0
			   end		        
		   ) as BrojRezervisanihPredmeta,
		   sum(case
		        when P.Status = 'O' then 1
				else 0
			   end		        
		   ) as BrojAktivnihPredmeta,
		   sum(case
		        when P.Status = 'D' then 1
				else 0
			   end		        
		   ) as BrojURokovnikuPredmeta,
		   sum(case
		        when P.Status = 'P' then 1
				else 0
			   end		        
		   ) as BrojPrezavedenihPredmeta,
		   sum(case
		        when P.Status = 'Z' then 1
				else 0
			   end		        
		   ) as BrojZatvorenihPredmeta,
		   sum(case
		        when P.Status = 'E' then 1
				else 0
			   end		        
		   ) as BrojPrezavedenihArhiviranihPredmeta,
		   sum(case
		        when P.Status = 'B' then 1
				else 0
			   end		        
		   ) as BrojObrisanihhPredmeta,
		   sum(case
		        when P.Status = 'R' and datediff(day, P.VremeRezervacije, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0 then 1
				else 0
			   end		        
		   ) as BrojRezervisanihPredmetaPrekoRoka,
		   sum(case
		        when P.Status = 'O' and datediff(day, P.VremeRezervacije, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0 then 1
				else 0
			   end		        
		   ) as BrojOtvorenihPredmetaPrekoRoka
	from Predmeti as P

	join Korisnici as K
	on K.IdKorisnika = P.IdKreatora

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

	left outer join VrstePredmeta as VP
	on VP.IdVrstePredmeta = P.IdVrstePredmeta	   

	join Jedinice as J
	on J.IdOrgana = P.IdOrgana and
		J.IdJedinice = P.IdJedinice
	
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
		  (@GledanjeDatumaKreiranja = 1 or IP.IdKretanjaPredmeta is not null) and
		  P.Status not in ('Z', 'E')
	group by case @Grupisanje
	          when 1 then K.ImeIPrezime + ' (' + K.KorisnickoIme + ')'
			  when 2 then I.ImeIPrezime + ' (' + I.KorisnickoIme + ')'
			  when 3 then OG.Oznaka + ' - ' + OG.Naziv
			  when 4 then KL.Oznaka + ' - ' + KL.Naziv
			  when 5 then P.Sadrzaj
			  when 6 then cast(P.Status as nvarchar)
			 end,
			 case @Grupisanje
	          when 1 then cast(K.IdKorisnika as nvarchar)
			  when 2 then cast(I.IdKorisnika as nvarchar)
			  when 3 then cast(OG.IdOrgana as nvarchar)
			  when 4 then cast(KL.IdOrgana as nvarchar) + '|' + cast(KL.IdKlase as nvarchar)
			  when 5 then cast(P.Sadrzaj as nvarchar)
			  when 6 then cast(P.Status as nvarchar)
		    end

	union all

	select case @Grupisanje
	          when 1 then K.ImeIPrezime + ' (' + K.KorisnickoIme + ')'
			  when 2 then I.ImeIPrezime + ' (' + I.KorisnickoIme + ')'
			  when 3 then OG.Oznaka + ' - ' + OG.Naziv
			  when 4 then KL.Oznaka + ' - ' + KL.Naziv
			  when 5 then P.Sadrzaj
			  when 6 then cast(P.Status as nvarchar)
			 end as Grupisanje,
			case @Grupisanje
	          when 1 then cast(K.IdKorisnika as nvarchar)
			  when 2 then cast(I.IdKorisnika as nvarchar)
			  when 3 then cast(OG.IdOrgana as nvarchar)
			  when 4 then cast(KL.IdOrgana as nvarchar) + '|' + cast(KL.IdKlase as nvarchar)
			  when 5 then cast(P.Sadrzaj as nvarchar)
			  when 6 then cast(P.Status as nvarchar)
		    end as IdGrupisanja,
		   count(*) as UkupanBrojPredmeta,
		   0 as BrojRezervisanihPredmeta,
		   0 as BrojAktivnihPredmeta,
		   0 as BrojURokovnikuPredmeta,
		   0 as BrojPrezavedenihPredmeta,
		   sum(case
		        when P.Status = 'Z' then 1
				else 0
			   end		        
		   ) as BrojZatvorenihPredmeta,
		   sum(case
		        when P.Status = 'E' then 1
				else 0
			   end		        
		   ) as BrojPrezavedenihArhiviranihPredmeta,
		   0 as BrojObrisanihhPredmeta,
		   0 as BrojRezervisanihPredmetaPrekoRoka,
		   0 as BrojOtvorenihPredmetaPrekoRoka
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
		   @Status = P.Status
		  ) and
		  (@IdVrstePredmeta is null or P.IdVrstePredmeta = @IdVrstePredmeta) and
		  (@IdKreatora is null or P.IdKreatora = @IdKreatora) and
		  (@IdInspektora is null or P.IdInspektora = @IdInspektora) and
		  (@Podnosilac is null or P.Podnosilac LIKE '%' + @Podnosilac + '%') and
		  (@LiceKontrole is null or P.LiceKontrole LIKE @LiceKontrole) and
		  (@Sadrzaj is null or P.Sadrzaj LIKE '%' + @Sadrzaj + '%') and
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
		  (@GledanjeDatumaKreiranja = 1 or IP.IdKretanjaPredmeta is not null) and
		  P.Status in ('Z', 'E')
	group by case @Grupisanje
	          when 1 then K.ImeIPrezime + ' (' + K.KorisnickoIme + ')'
			  when 2 then I.ImeIPrezime + ' (' + I.KorisnickoIme + ')'
			  when 3 then OG.Oznaka + ' - ' + OG.Naziv
			  when 4 then KL.Oznaka + ' - ' + KL.Naziv
			  when 5 then P.Sadrzaj
			  when 6 then cast(P.Status as nvarchar)
			 end,
			 case @Grupisanje
	          when 1 then cast(K.IdKorisnika as nvarchar)
			  when 2 then cast(I.IdKorisnika as nvarchar)
			  when 3 then cast(OG.IdOrgana as nvarchar)
			  when 4 then cast(KL.IdOrgana as nvarchar) + '|' + cast(KL.IdKlase as nvarchar)
			  when 5 then cast(P.Sadrzaj as nvarchar)
			  when 6 then cast(P.Status as nvarchar)
		    end

	order by case @Grupisanje
	          when 1 then K.ImeIPrezime + ' (' + K.KorisnickoIme + ')'
			  when 2 then I.ImeIPrezime + ' (' + I.KorisnickoIme + ')'
			  when 3 then OG.Oznaka + ' - ' + OG.Naziv
			  when 4 then KL.Oznaka + ' - ' + KL.Naziv
			  when 5 then P.Sadrzaj
			  when 6 then cast(P.Status as nvarchar)
			 end
	
	set nocount off
end