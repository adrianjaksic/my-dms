go
if OBJECT_ID('predmet_RezervacijaPredmeta','P') is not null
	drop procedure predmet_RezervacijaPredmeta
go

create procedure predmet_RezervacijaPredmeta(
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
	@IdKorisnika int,
	@Podnosilac nvarchar(300),
	@PodnosilacJedinstveniBroj nvarchar(30),
	@LiceKontroleJedinstveniBroj nvarchar(30),
	@LiceKontrole nvarchar(300),
	@IdOpstine smallint,
	@IdMesta int,
	@Datum smalldatetime,
	@Kolicina smallint
) with recompile as
begin
	set nocount on

	declare @BrojPredmetaZaProveru int
	declare @Greska nvarchar(200)
	declare @RokBezVrste bit

	if (isnull(@Kolicina, 0) <= 0 or isnull(@Kolicina, 0) > 100)
	begin

		raiserror('Količina nije ispravna (količina mora biti između 1 i 99).', 14, 1)

	end
	else
	begin

		declare @Sada smalldatetime
		select @Sada = getdate()

		declare @PromenaDatuma bit
		declare @ProveraRokaVazenjaNaOgranicenjima bit
		select @PromenaDatuma = DozvoljenoMenjanjeDatuma,
		       @ProveraRokaVazenjaNaOgranicenjima = ProveraRokaVazenjaNaOgranicenjima,
			   @RokBezVrste = RokBezVrste
		from PodesavanjeServera 
		where Id = 1

		if (isnull(@PromenaDatuma, 0) = 0) set @Datum = @Sada

		if exists(select top(1) 1
				  from Korisnici
				  where IdKorisnika = @IdKorisnika and
						IdOkruga = @IdOkruga)
		begin		

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

			declare @MaxBrojRezervisanihPredmeta smallint
			declare @MaksimalniBrojPredmeta smallint
			declare @MaksimalniBrojPredmetaGodine smallint
			select @MaxBrojRezervisanihPredmeta = MaxBrojRezervisanihPredmeta,
			       @MaksimalniBrojPredmeta = MaksimalniBrojPredmeta,
				   @MaksimalniBrojPredmetaGodine = MaksimalniBrojPredmetaGodine
			from Korisnici 
			where IdKorisnika = @IdInspektora
		
			if(@IzuzmiIzProvere = 0 and @IdInspektora is not null and @MaksimalniBrojPredmeta is not null and @MaxBrojRezervisanihPredmeta is null and
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
								(P.Status = 'R' or P.Status = 'O') and 
								(isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 0 or datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0) and
								isnull(K.IzuzmiIzProvere, 0) = 0
						group by IdInspektora), 0) + @Kolicina - @MaksimalniBrojPredmeta > 0)
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
						(P.Status = 'R' or P.Status = 'O') and 
						(isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 0 or datediff(day, P.VremeKreiranja, @Sada) - isnull(VP.Rok, @RokBezVrste) > 0) and
						isnull(K.IzuzmiIzProvere, 0) = 0
				group by IdInspektora

				set @Greska = 'Nije moguće snimanje. Prekoračen je maskimalni broj aktivnih predmeta dodeljenih inspektoru. Inspektor ima ' + cast(isnull(@BrojPredmetaZaProveru, 0) as nvarchar) + ' aktivnih i rezervisanih predmeta'
				if (isnull(@ProveraRokaVazenjaNaOgranicenjima, 1) = 1) set @Greska = @Greska + ' sa isteklim rokom'
				set @Greska = @Greska + ', a maksimalno je dozvoljeno da ima ukupno ' + cast(isnull(@MaksimalniBrojPredmeta, 0) as nvarchar) + ' predmeta.'

				raiserror(@Greska, 14, 1)

			end
			else
			begin

				if(@IzuzmiIzProvere = 0 and @IdInspektora is not null and @MaxBrojRezervisanihPredmeta is not null and 
					isnull((select count(*)
							from Predmeti as P
							join Klase as K
							on K.IdOkruga = P.IdOkruga and
							   K.IdOrgana = P.IdOrgana and
							   K.IdKlase = P.IdKlase					
							where P.IdOkruga = @IdOkruga and
								  P.IdInspektora = @IdInspektora and
								  P.Status = 'R' and 
								  year(P.VremeRezervacije) = year(@Datum) and
								  isnull(K.IzuzmiIzProvere, 0) = 0
							group by IdInspektora), 0) + @Kolicina - @MaxBrojRezervisanihPredmeta > 0)
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

					set @Greska = 'Nije moguće snimanje. Prekoračen je maskimalni broj rezervisanih predmeta dodeljenih inspektoru. Inspektor ima ' + 
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
							raiserror('Nije moguće snimanje. Datum nije unutar dozvoljenog opsega.', 14, 1)
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
					
						if (exists(select top(1) 1
									from Korisnici
									where IdKorisnika = @IdKorisnika and
										IdOkruga = @IdOkruga and
										DozvolaRezervisanja = 1))
						begin

							declare @i int
							declare @rows_to_insert int
							set @i = 0
							set @rows_to_insert = @Kolicina

							while @i < @rows_to_insert
							begin

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
										@IdPredmeta + @i
									,null
									,@BrojPredmeta + @i
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
									,'R'
									,null
									,@IdOpstine
									,@IdMesta
									,null
									,null
									,null
									,0
								)

								set @i = @i + 1
							end

					
				
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
							select
								IdPredmeta,
								1,
								null,
								@Sada,
								@IdKorisnika,
								'Rezervisan predmet.',
								null,
								null,
								null
							from Predmeti as P
							where P.IdPredmeta >= @IdPredmeta and
									P.IdPredmeta < @IdPredmeta + @Kolicina
					
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
									,'Datum promenjen na ' + cast(@Datum as nvarchar) + '.'
									,null
							FROM Predmeti as P
							where P.IdPredmeta >= @IdPredmeta and
									P.IdPredmeta < @IdPredmeta + @Kolicina and
									DATEDIFF(day, @Datum, @Sada) <> 0

							insert into LogoviKorisnika (
								IdKorisnika,
								IdLoga,
								Vreme,
								Opis
							) values (
								@IdKorisnika,
								@IdLoga,
								@Sada,
								'Rezervisan predmet.'
							)
						end
						else
						begin
							raiserror('Nemate prava pristupa.', 14, 1)
						end
					end
				end
			end	
		end
		else
		begin
			raiserror('Nemate prava pristupa.', 14, 1)
		end

		select
			P.IdPredmeta,
			OKR.Oznaka + '-' + ORG.Oznaka + '-' + K.Oznaka + '-' + cast(P.BrojPredmeta as nvarchar) + '/' + cast(year(P.VremeRezervacije) as nvarchar) + '-' + J.Oznaka as BrojPredmeta
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

		where IdPredmeta >= @IdPredmeta and
			  IdPredmeta < @IdPredmeta + @Kolicina
	end

	set nocount off
end