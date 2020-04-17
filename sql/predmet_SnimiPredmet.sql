go
if OBJECT_ID('predmet_SnimiPredmet','P') is not null
	drop procedure predmet_SnimiPredmet
go

create procedure predmet_SnimiPredmet(
	@IdPredmeta bigint output,
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@IdJedinice smallint,
	@PodnosilacJeInspektor bit,
	@IdVrstePredmeta smallint,
	@IdInspektora int,
	@Prilog nvarchar(200),
	@Sadrzaj nvarchar(2000),
	@IdTakse smallint,
	@StraniBroj nvarchar(200),
	@Napomena nvarchar(2000),
	@Rezervacija bit,
	@IdKorisnika int,
	@Podnosilac nvarchar(300),
	@PodnosilacJedinstveniBroj nvarchar(30),
	@LiceKontroleJedinstveniBroj nvarchar(30),
	@LiceKontrole nvarchar(300),
	@IdOpstine smallint,
	@IdNadredjenogPredmeta bigint,
	@IdMesta int,
	@Datum smalldatetime,
	@StrogoPoverljiv bit = 0
) with recompile as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)
	declare @Zapisnik bit
	declare @Broj int
	declare @BrojUGodini int
	declare @PromenaDatuma bit
	declare @PRoveraOgranicenjaPrilikomAktivacijePredmeta bit
	declare @ProveraRokaVazenjaNaOgranicenjima bit
	declare @BrojPredmetaZaProveru int
	declare @Greska nvarchar(200)
	declare @RokBezVrste bit

	select @Sada = getdate()

	select @PromenaDatuma = DozvoljenoMenjanjeDatuma,
	       @PRoveraOgranicenjaPrilikomAktivacijePredmeta = PRoveraOgranicenjaPrilikomAktivacijePredmeta,
		   @ProveraRokaVazenjaNaOgranicenjima = ProveraRokaVazenjaNaOgranicenjima,
		   @RokBezVrste = isnull(RokBezVrste, 60)
	from PodesavanjeServera 
	where Id = 1

	if (isnull(@PromenaDatuma, 0) = 0) set @Datum = @Sada

	if exists(select top(1) 1
	          from Korisnici
	          where IdKorisnika = @IdKorisnika and
			        IdOkruga = @IdOkruga)
	begin		
		
		set @Broj = isnull((select MAX(Broj) + 1
		            from IstorijaPredmeta as I 
					join Predmeti as P 
					on I.IdPredmeta = P.IdPredmeta 
					where YEAR(P.VremeKreiranja) = YEAR(@Datum) and
					      P.IdOkruga = @IdOkruga and
						  P.IdOrgana = @IdOrgana and
						  P.IdKlase = @IdKlase), 1)

		set @BrojUGodini = isnull((select MAX(BrojUGodini) + 1
		            from IstorijaPredmeta as I 
					join Predmeti as P 
					on I.IdPredmeta = P.IdPredmeta 
					where YEAR(P.VremeKreiranja) = YEAR(@Datum) and
					      P.IdOkruga = @IdOkruga and
						  P.IdOrgana = @IdOrgana and
						  P.IdJedinice = @IdJedinice), 1)

		declare @IdLoga bigint
		declare @IdKretanja smallint
			
		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)
								
		declare @IzuzmiIzProvere bit
		select @IzuzmiIzProvere = isnull(K.IzuzmiIzProvere, 0)
		from Klase as K
		where IdOkruga = @IdOkruga and
			  IdOrgana = @IdOrgana and
			  IdKlase = @IdKlase

		declare @MaksimalniBrojPredmeta smallint
		declare @MaxBrojRezervisanihPredmeta smallint
		declare @MaksimalniBrojPredmetaGodine smallint
		select @MaksimalniBrojPredmeta = MaksimalniBrojPredmeta,
			   @MaxBrojRezervisanihPredmeta = MaxBrojRezervisanihPredmeta,
			   @MaksimalniBrojPredmetaGodine = MaksimalniBrojPredmetaGodine
		from Korisnici 
		where IdKorisnika = @IdInspektora and (@IdPredmeta is null or @PRoveraOgranicenjaPrilikomAktivacijePredmeta = 1)

		if(@IzuzmiIzProvere = 0 and @IdInspektora is not null and @MaksimalniBrojPredmeta is not null and
			isnull((select count(*)
					from Predmeti as P
					join Klase as K
					on K.IdOkruga = P.IdOkruga and
						K.IdOrgana = P.IdOrgana and
						K.IdKlase = P.IdKlase
					left outer join VrstePredmeta as VP
					on VP.IdVrstePredmeta = P.IdVrstePredmeta
					where P.IdOkruga = @IdOkruga and
						  P.IdInspektora = @IdInspektora and
						  (
						   (P.Status = 'R' and @MaxBrojRezervisanihPredmeta is null) or 
						    P.Status = 'O'
						  ) and 
						  (isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 0 or datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0) and
						  isnull(K.IzuzmiIzProvere, 0) = 0
					group by IdInspektora), 0) - @MaksimalniBrojPredmeta >= 0)
		begin
		
			select @BrojPredmetaZaProveru = count(*)
			from Predmeti as P
			join Klase as K
			on K.IdOkruga = P.IdOkruga and
				K.IdOrgana = P.IdOrgana and
				K.IdKlase = P.IdKlase
			left outer join VrstePredmeta as VP
			on VP.IdVrstePredmeta = P.IdVrstePredmeta
			where P.IdOkruga = @IdOkruga and
					P.IdInspektora = @IdInspektora and
					(
					 (P.Status = 'R' and @MaxBrojRezervisanihPredmeta is null) or 
					  P.Status = 'O'
					) and 
					(isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 0 or datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0) and
					isnull(K.IzuzmiIzProvere, 0) = 0
			group by IdInspektora

			set @Greska = 'Nije moguce snimanje. Prekoracen je maskimalni broj predmeta dodeljenih inspektoru. Inspektor ima ' + cast(isnull(@BrojPredmetaZaProveru, 0) as nvarchar) + ' aktivnih'
			if (@MaxBrojRezervisanihPredmeta is null) set @Greska = @Greska + ' i rezervisanih'
			set @Greska = @Greska + ' predmeta'
			if (isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 1) set @Greska = @Greska + ' sa isteklim rokom'
			set @Greska = @Greska + ', a maksimalno je dozvoljeno da ima ukupno ' + cast(isnull(@MaksimalniBrojPredmeta, 0) as nvarchar) + ' predmeta.'

			raiserror(@Greska, 14, 1)

		end
		else
		begin
			if(@IzuzmiIzProvere = 0 and @IdInspektora is not null and @MaksimalniBrojPredmetaGodine is not null and isnull(@Rezervacija, 0) = 0 and
				isnull((select count(*)
						from Predmeti as P
						left outer join VrstePredmeta as VP
						on VP.IdVrstePredmeta = P.IdVrstePredmeta
						join Klase as K
						on K.IdOkruga = P.IdOkruga and
							K.IdOrgana = P.IdOrgana and
							K.IdKlase = P.IdKlase
						where P.IdOkruga = @IdOkruga and
							  P.IdInspektora = @IdInspektora and
							  P.Status = 'O' and 
							  (isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 0 or datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0) and
							  year(P.VremeRezervacije) = year(@Sada) and
							  isnull(K.IzuzmiIzProvere, 0) = 0
						group by IdInspektora), 0) - @MaksimalniBrojPredmetaGodine >= 0)
			begin
			
				select @BrojPredmetaZaProveru = count(*)
				from Predmeti as P
				left outer join VrstePredmeta as VP
				on VP.IdVrstePredmeta = P.IdVrstePredmeta
				join Klase as K
				on K.IdOkruga = P.IdOkruga and
					K.IdOrgana = P.IdOrgana and
					K.IdKlase = P.IdKlase
				where P.IdOkruga = @IdOkruga and
						P.IdInspektora = @IdInspektora and
						P.Status = 'O' and 
						(isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 0 or datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0) and
						year(P.VremeRezervacije) = year(@Sada) and
						isnull(K.IzuzmiIzProvere, 0) = 0
				group by IdInspektora

				set @Greska = 'Nije moguce snimanje. Prekoracen je maskimalni broj aktivnih predmeta u godini dodeljenih inspektoru. Inspektor ima ' + cast(isnull(@BrojPredmetaZaProveru, 0) as nvarchar) + ' aktivnih predmeta u godini'
				if (isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 1) set @Greska = @Greska + ' sa isteklim rokom'
				set @Greska = @Greska + ', a maksimalno je dozvoljeno da ima ' + cast(isnull(@MaksimalniBrojPredmetaGodine, 0) as nvarchar) + ' predmeta u godini.'

				raiserror(@Greska, 14, 1)
			end
			else
			begin
				if(@IzuzmiIzProvere = 0 and @IdInspektora is not null and isnull(@Rezervacija, 0) = 1 and @MaxBrojRezervisanihPredmeta is not null and 
					isnull((select count(*)
							from Predmeti as P
							join Klase as K
							on K.IdOkruga = P.IdOkruga and
								K.IdOrgana = P.IdOrgana and
								K.IdKlase = P.IdKlase					
							where P.IdOkruga = @IdOkruga and
								  P.IdInspektora = @IdInspektora and
								  P.Status = 'R' and 
								  year(P.VremeRezervacije) = year(@Sada) and
								  isnull(K.IzuzmiIzProvere, 0) = 0
							group by IdInspektora), 0) - @MaxBrojRezervisanihPredmeta >= 0)
				begin

					select @BrojPredmetaZaProveru = count(*)
					from Predmeti as P
					join Klase as K
					on K.IdOkruga = P.IdOkruga and
						K.IdOrgana = P.IdOrgana and
						K.IdKlase = P.IdKlase					
					where P.IdOkruga = @IdOkruga and
						  P.IdInspektora = @IdInspektora and
						  P.Status = 'R' and 
						  year(P.VremeRezervacije) = year(@Sada) and
						  isnull(K.IzuzmiIzProvere, 0) = 0
					group by IdInspektora

					set @Greska = 'Nije moguce snimanje. Prekoracen je maskimalni broj rezervisanih predmeta dodeljenih inspektoru. Inspektor ima ' + 
					              cast(isnull(@BrojPredmetaZaProveru, 0) as nvarchar) + ' rezervisanih predmeta, a maksimalno je dozvoljeno da ima ' + 
								  cast(isnull(@MaxBrojRezervisanihPredmeta, 0) as nvarchar) + ' rezervisanih predmeta.'
					raiserror(@Greska, 14, 1)

				end
				else
				begin
					if not exists(select top(1) 1 from Predmeti
									where IdPredmeta = @IdPredmeta)
					begin
						if(abs(DATEDIFF(day, @Datum, @Sada)) > 30)
						begin
							raiserror('Nije moguce snimanje. Datum nije unutar dozvoljenog opsega (vise od 30 dana razlike).', 14, 1)
						end

						set @IdPredmeta = isnull((select max(IdPredmeta) + 1
												from Predmeti), 1)

						declare @BrojPredmeta int
						set @BrojPredmeta = isnull((select max(BrojPredmeta) + 1
												from Predmeti
												where IdOkruga = @IdOkruga and
													  IdOrgana = @IdOrgana and
													  IdKlase = @IdKlase and
													  YEAR(VremeRezervacije) = YEAR(@Datum)), 1)
						if exists(select top(1) 1
								  from Korisnici
								  where IdKorisnika = @IdKorisnika and
										IdOkruga = @IdOkruga and
										(@Rezervacija is null or
											(@Rezervacija = 1 and DozvolaRezervisanja = 1) or
											(@Rezervacija = 0 and UnosNovogPredmeta = 1)
										))
						begin
							declare @Status char(1)
							set @Status = case
											  when @Rezervacija = 1 then 'R'
											  else 'O'
										  end

							insert into Predmeti (
								IdPredmeta
							   ,IdNadredjenogPredmeta
							   ,BrojPredmeta
							   ,IdOkruga
							   ,IdOrgana
							   ,IdKlase
							   ,IdJedinice
							   ,IdKreatora
							   ,PodnosilacJeInspektor
							   ,PodnosilacJedinstveniBroj
							   ,Podnosilac
							   ,LiceKontroleJedinstveniBroj
							   ,LiceKontrole
							   ,VremeKreiranja
							   ,VremeRezervacije
							   ,IdVrstePredmeta
							   ,IdInspektora
							   ,Prilog
							   ,Sadrzaj
							   ,IdTakse
							   ,StraniBroj
							   ,Napomena
							   ,Status
							   ,PutanjaArhiviranjaDokumenata
							   ,IdOpstine
							   ,IdMesta
							   ,RazvodjenjeAkata
							   ,VremeArhiviranja
							   ,IdArhivatora
							   ,StrogoPoverljiv
							) values (
								@IdPredmeta
							   ,@IdNadredjenogPredmeta
							   ,@BrojPredmeta
							   ,@IdOkruga
							   ,@IdOrgana
							   ,@IdKlase
							   ,@IdJedinice
							   ,@IdKorisnika
							   ,@PodnosilacJeInspektor
							   ,@PodnosilacJedinstveniBroj
							   ,@Podnosilac
							   ,@LiceKontroleJedinstveniBroj
							   ,@LiceKontrole
							   ,@Datum
							   ,@Datum
							   ,@IdVrstePredmeta
							   ,@IdInspektora
							   ,@Prilog
							   ,@Sadrzaj
							   ,@IdTakse
							   ,@StraniBroj
							   ,@Napomena
							   ,@Status
							   ,null
							   ,@IdOpstine
							   ,@IdMesta
							   ,null
							   ,null
							   ,null
							   ,@StrogoPoverljiv
							)
				
							set @Poruka = 'Novi predmet.'

							if (@Status = 'R') set @Poruka = 'Rezervisan predmet.'

							select @Zapisnik = Zapisnik
							from KretanjaPredmeta as K
							where K.IdKretanjaPredmeta = 1

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[IdKretanjaPredmeta]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena]
							   ,[Broj]
							   ,[BrojUGodini])
							values (
								@IdPredmeta,
								1,
								case
								 when @Status <> 'R' then 1
								 else null
								end,
								@Sada,
								@IdKorisnika,
								@Poruka,
								null,
								case
								 when @Status <> 'R' then @Broj
								 else null
								end,
								case
								 when @Status <> 'R' then @BrojUGodini
								 else null
								end
							)
					
							-- VremeKreiranja
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Datum promenjen na ' + cast(DAY(@Datum) as nvarchar) + '.' + cast(MONTH(@Datum) as nvarchar) + '.' + cast(YEAR(@Datum) as nvarchar) + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  DATEDIFF(day, @Datum, @Sada) <> 0

							if(@IdNadredjenogPredmeta is not null)
							begin
								INSERT INTO [dbo].[IstorijaPredmeta]
								   ([IdPredmeta]
								   ,[IdKretanja]
								   ,[IdKretanjaPredmeta]
								   ,[Vreme]
								   ,[IdKorisnika]
								   ,[Opis]
								   ,[Napomena]
								   ,[Broj])
								values (
									@IdPredmeta,
									2,
									12,
									@Sada,
									@IdKorisnika,
									'Prezaveden predmet',
									null,
									null
								)

								update Predmeti
								set Status = 'P'
								where IdPredmeta = @IdPredmeta
							end
					
							insert into LogoviKorisnika (
								IdKorisnika,
								IdLoga,
								Vreme,
								Opis
							) values (
								@IdKorisnika,
								@IdLoga,
								@Sada,
								@Poruka
							)
						end
						else
						begin
							raiserror('Nemate prava pristupa.', 14, 1)
						end
					end
					else
					begin
						declare @StariDatum smalldatetime
						select @StariDatum = VremeKreiranja from Predmeti
									where IdPredmeta = @IdPredmeta

						if(abs(DATEDIFF(day, @Datum, @Sada)) > 30 and dateDiff(day, @Datum, @StariDatum) <> 0)
						begin
							raiserror('Nije moguce snimanje. Datum nije unutar dozvoljenog opsega.', 14, 1)
						end

						if exists(select top(1) 1
								  from Korisnici
								  where IdKorisnika = @IdKorisnika and
										IdOkruga = @IdOkruga and
										IzmenaPredmeta = 1)
						begin
				
							declare @StariStatus char(1)
							declare @StariNadredjeniPredmet bigint
				
							select
								@StariStatus = Status,
								@StariNadredjeniPredmet = IdNadredjenogPredmeta
							from Predmeti
							where IdPredmeta = @IdPredmeta
					

							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)
							-- JEDINICA
							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjena jedinica sa ' + isnull(SJ.Naziv, '-') + ' na ' + isnull(NJ.Naziv, '-') + '.'
								   ,null
							FROM Predmeti as P

							join Jedinice as SJ
							on SJ.IdOrgana = P.IdOrgana and
							   SJ.IdJedinice = P.IdJedinice

							join Jedinice as NJ
							on NJ.IdOrgana = P.IdOrgana and
							   NJ.IdJedinice = @IdJedinice

							where P.IdPredmeta = @IdPredmeta and
								  P.IdJedinice <> @IdJedinice

							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							-- OPSTINA
							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjena opstine sa ' + isnull(OPS.Naziv, '-') + ' na ' + isnull(NOPS.Naziv, '-') + '.'
								   ,null
							FROM Predmeti as P

							left outer join Opstine as OPS
							on OPS.IdOkruga = P.IdOkruga and
							   OPS.IdOpstine = P.IdOpstine

							left outer join Opstine as NOPS
							on NOPS.IdOkruga = P.IdOkruga and
							   NOPS.IdOpstine = @IdOpstine

							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.IdOpstine, -1) <> isnull(@IdOpstine, -1)

							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							-- MESTA
							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjeno mesto sa ' + isnull(SM.Naziv, '-') + ' na ' + isnull(NM.Naziv, '-') + '.'
								   ,null
							FROM Predmeti as P

							left outer join Mesta as SM
							on SM.IdOkruga = P.IdOkruga and
							   SM.IdOpstine = P.IdOpstine and
							   SM.IdMesta = P.IdMesta

							left outer join Mesta as NM
							on NM.IdOkruga = P.IdOkruga and
							   NM.IdOpstine = @IdOpstine and
							   NM.IdMesta = @IdMesta

							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.IdOpstine, -1) <> isnull(@IdOpstine, -1) and
								  isnull(P.IdMesta, -1) <> isnull(@IdMesta, -1)

							-- VRSTA PREDMETA
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjena vrsta predmeta sa ' + isnull(SVP.Naziv, '-') + ' na ' + isnull(NVP.Naziv, '-') + '.'
								   ,null
							FROM Predmeti as P

							left outer join VrstePredmeta as SVP
							on SVP.IdVrstePredmeta = P.IdVrstePredmeta

							left outer join VrstePredmeta as NVP
							on NVP.IdVrstePredmeta = @IdVrstePredmeta

							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.IdVrstePredmeta, -1) <> isnull(@IdVrstePredmeta, -1)


							-- TAKSA
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjena taksa sa ' + isnull(ST.Naziv, '-') + ' na ' + isnull(NT.Naziv, '-') + '.'
								   ,null
							FROM Predmeti as P

							left outer join Takse as ST
							on ST.IdTakse = P.IdTakse

							left outer join Takse as NT
							on NT.IdTakse = @IdTakse

							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.IdTakse, -1) <> isnull(@IdTakse, -1)

							-- PODNOSILAC
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjen podnosilac sa ' + isnull(P.Podnosilac, '-') + ' na ' + isnull(@Podnosilac, '-') + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.Podnosilac, '-') <> isnull(@Podnosilac, '-')

							-- LICE KONTROLE
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)				
										
							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjeno lice kontrole sa ' + isnull(P.LiceKontrole, '-') + ' na ' + isnull(@LiceKontrole, '-') + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.LiceKontrole, '-') <> isnull(@LiceKontrole, '-')

							-- INSPEKTOR
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjen inspektor sa ' + isnull(SI.KorisnickoIme, '-') + ' na ' + isnull(NI.KorisnickoIme, '-') + '.'
								   ,null
							FROM Predmeti as P

							left outer join Korisnici as SI
							on SI.IdKorisnika = P.IdInspektora

							left outer join Korisnici as NI
							on NI.IdKorisnika = @IdInspektora

							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.IdInspektora, -1) <> isnull(@IdInspektora, -1)


							-- SADRZAJ
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjen sadrzaj sa ' + isnull(P.Sadrzaj, '-') + ' na ' + isnull(@Sadrzaj, '-') + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.Sadrzaj, '-') <> isnull(@Sadrzaj, '-')

			
							-- PRILOG
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjen prilog sa ' + isnull(P.Prilog, '-') + ' na ' + isnull(@Prilog, '-') + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.Prilog, '-') <> isnull(@Prilog, '-')


							-- STRANI BROJ
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjen strani broj sa ' + isnull(P.StraniBroj, '-') + ' na ' + isnull(@StraniBroj, '-') + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.StraniBroj, '-') <> isnull(@StraniBroj, '-')


							-- VremeKreiranja
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Datum promenjen na ' + cast(DAY(@Datum) as nvarchar) + '.' + cast(MONTH(@Datum) as nvarchar) + '.' + cast(YEAR(@Datum) as nvarchar) + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  DATEDIFF(day, VremeKreiranja, @Datum) <> 0 and
								  DATEDIFF(day, @Datum, @Sada) <> 0 and
								  dateDiff(day, @Datum, @StariDatum) <> 0 and
								  @PromenaDatuma = 1

							-- NAPOMENA
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjena napomena sa ' + isnull(P.Napomena, '-') + ' na ' + isnull(@Napomena, '-') + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.Napomena, '-') <> isnull(@Napomena, '-')

							-- StrogoPoverljiv
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)				
										
							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,@Sada
								   ,@IdKorisnika
								   ,'Promenjeno strogo poverljiv sa ' + cast(isnull(P.StrogoPoverljiv, 0) as nvarchar) + ' na ' + cast(isnull(@StrogoPoverljiv, 0) as nvarchar) + '.'
								   ,null
							FROM Predmeti as P
							where P.IdPredmeta = @IdPredmeta and
								  isnull(P.StrogoPoverljiv, 0) <> isnull(@StrogoPoverljiv, 0)

							update Predmeti
							set IdJedinice = @IdJedinice,
								PodnosilacJeInspektor = @PodnosilacJeInspektor,
								Podnosilac = @Podnosilac,
								PodnosilacJedinstveniBroj = @PodnosilacJedinstveniBroj,
								LiceKontrole = @LiceKontrole,
								LiceKontroleJedinstveniBroj = @LiceKontroleJedinstveniBroj,
								IdVrstePredmeta = @IdVrstePredmeta,
								IdInspektora = @IdInspektora,
								Prilog = @Prilog,
								Sadrzaj = @Sadrzaj,
								IdTakse = @IdTakse,
								StraniBroj = @StraniBroj,
								Napomena = @Napomena,
								IdOpstine = @IdOpstine,
								IdMesta = @IdMesta,
								IdKreatora = case
										  when Status = 'R' and (@Sadrzaj is not null or 
																 @LiceKontrole is not null
																) then @IdKorisnika
										  else IdKreatora
										 end,
								--VremeKreiranja = @Datum,
								VremeKreiranja = case
										  when Status = 'R' and (@Sadrzaj is not null or
																 @LiceKontrole is not null
																) then @Datum
										  when @PromenaDatuma = 1 then @Datum
										  else VremeKreiranja					--@Datum
										 end,
								Status = case
										  when Status = 'R' and (@Sadrzaj is not null or
																 @LiceKontrole is not null
																) then 'O'
										  else Status
										 end,
								IdNadredjenogPredmeta = @IdNadredjenogPredmeta,
								StrogoPoverljiv = @StrogoPoverljiv
							where IdPredmeta = @IdPredmeta

							-- STATUS
							set @IdKretanja = isnull((select max(IdKretanja) + 1
													from IstorijaPredmeta
													where IdPredmeta = @IdPredmeta), 1)

							INSERT INTO [dbo].[IstorijaPredmeta]
							   ([IdPredmeta]
							   ,[IdKretanja]
							   ,[IdKretanjaPredmeta]
							   ,[Vreme]
							   ,[IdKorisnika]
							   ,[Opis]
							   ,[Napomena]
							   ,[Broj]
							   ,[BrojUGodini])
							 SELECT
									P.IdPredmeta
								   ,@IdKretanja
								   ,4
								   ,@Sada
								   ,@IdKorisnika
								   ,'Aktiviran predmet.'
								   ,null
								   ,case
									 when K.Zapisnik = 1 then @Broj
									 else null
									end
								   ,case
									 when K.Zapisnik = 1 then @BrojUGodini
									 else null
									end
							FROM Predmeti as P
							JOIN KretanjaPredmeta as K
							on K.IdKretanjaPredmeta = 4
							where P.IdPredmeta = @IdPredmeta and
								  P.Status = 'O' and
								  @StariStatus = 'R' and (@Sadrzaj is not null or
																 @LiceKontrole is not null
																)							

							set @Poruka = 'Izmenjen predmet. Za detalje pogledati Istoriju Predmeta.'

							insert into LogoviKorisnika (
								IdKorisnika,
								IdLoga,
								Vreme,
								Opis
							) values (
								@IdKorisnika,
								@IdLoga,
								@Sada,
								@Poruka
							)

							if(@StariNadredjeniPredmet is null and @IdNadredjenogPredmeta is not null)
							begin
								set @IdKretanja = isnull((select max(IdKretanja) + 1
														  from IstorijaPredmeta
														  where IdPredmeta = @IdPredmeta), 1)

								INSERT INTO [dbo].[IstorijaPredmeta]
								   ([IdPredmeta]
								   ,[IdKretanja]
								   ,[IdKretanjaPredmeta]
								   ,[Vreme]
								   ,[IdKorisnika]
								   ,[Opis]
								   ,[Napomena]
								   ,[Broj])
								values (
									@IdPredmeta,
									@IdKretanja,
									12,
									@Sada,
									@IdKorisnika,
									'Prezaveden predmet',
									null,
									null
								)

								update Predmeti
								set Status = 'P'
								where IdPredmeta = @IdPredmeta

							end

							if(@StariNadredjeniPredmet is not null and @IdNadredjenogPredmeta is null)
							begin
								set @IdKretanja = isnull((select max(IdKretanja) + 1
														  from IstorijaPredmeta
														  where IdPredmeta = @IdPredmeta), 1)

								INSERT INTO [dbo].[IstorijaPredmeta]
								   ([IdPredmeta]
								   ,[IdKretanja]
								   ,[IdKretanjaPredmeta]
								   ,[Vreme]
								   ,[IdKorisnika]
								   ,[Opis]
								   ,[Napomena]
								   ,[Broj])
								values (
									@IdPredmeta,
									@IdKretanja,
									4,
									@Sada,
									@IdKorisnika,
									'Ponisteno prezavodjenje predmeta',
									null,
									null
								)

								update Predmeti
								set Status = 'O'
								where IdPredmeta = @IdPredmeta

							end

						end
						else
						begin
							raiserror('Nemate prava pristupa.', 14, 1)
						end
					end
				end	
			end
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	select OKR.Oznaka + '-' + ORG.Oznaka + '-' + K.Oznaka + '-' + cast(P.BrojPredmeta as nvarchar) + '/' + cast(year(P.VremeRezervacije) as nvarchar) + '-' + J.Oznaka as BrojPredmeta
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

	where IdPredmeta = @IdPredmeta

	set nocount off
end