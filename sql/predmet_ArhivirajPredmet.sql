go
if OBJECT_ID('predmet_ArhivirajPredmet','P') is not null
	drop procedure predmet_ArhivirajPredmet
go
/*
predmet_ArhivirajPredmet
ULAZ:
IZLAZ:
*/
create procedure predmet_ArhivirajPredmet(
	@IdPredmeta bigint,
	@IdKorisnika int,
	@Napomena nvarchar(2000) = null,
	@Podredjeni bit = 0
) as
begin
	set nocount on
	
	declare @VremeKreiranja smalldatetime
	declare @IdKretanja smallint
	declare @Sada smalldatetime
	declare @Greska nvarchar (200)
	select @Sada = getdate()

	select @VremeKreiranja = VremeKreiranja 
	from Predmeti where IdPredmeta = @IdPredmeta

	IF (isnull(@VremeKreiranja, @Sada) >= isnull((select DatumZaArhivacijuBezDMS from PodesavanjeServera), '2015-06-08') and not exists (select TOP(1) 1 from DokumentiPredmeta where IdPredmeta = @IdPredmeta))
	begin

		if (isnull(@Podredjeni, 0) = 0) 
		begin
			set @Greska = 'Predmet nema nijedan skenirani dokument. Predmet nije moguće arhivirati bez skeniranog dokumenta (Id=' + cast(@IdPredmeta as nvarchar) + ').'
		end
		else 
		begin
			set @Greska = 'Podređeni predmet nema nijedan skenirani dokument. Predmet nije moguće arhivirati bez skeniranog dokumenta (Id=' + cast(@IdPredmeta as nvarchar) + ').'
		end
		raiserror(@Greska, 14, 1)

	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Inspektor = 1)
		begin
			raiserror('Ulogovani korisnik nema pravo arhiviranja predmeta.', 14, 1)
		end
		else
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
				,[Napomena])
			VALUES(
				@IdPredmeta,
				@IdKretanja,
				11,
				@Sada,
				@IdKorisnika,
				'Arhiviran predmet.',
				@Napomena
			)

			update Predmeti
			set Status = case
			              when IdNadredjenogPredmeta is not null then 'E'
						  else 'Z'
						 end,
			    VremeArhiviranja = @Sada,
				IdArhivatora = @IdKorisnika
			where IdPredmeta = @IdPredmeta

			select
				O.Oznaka as OznakaOkruga,
				ORG.Oznaka as OznakaOrgana,
				K.Oznaka as OznakaKlase,
				P.BrojPredmeta,
				YEAR(P.VremeRezervacije) as Godina,
				J.Oznaka as OznakaJedinice
			from Predmeti as P

			join Okruzi as O
			on O.IdOkruga = P.IdOkruga

			join Organi as ORG
			on ORG.IdOrgana = P.IdOrgana

			join Klase as K
			on K.IdOkruga = P.IdOkruga and
			   K.IdOrgana = P.IdOrgana and
			   K.IdKlase = P.IdKlase

			join Jedinice as J
			on J.IdOrgana = P.IdOrgana and
			   J.IdJedinice = P.IdJedinice
	
			where P.IdPredmeta = @IdPredmeta

			declare @IdPodPred bigint
			DECLARE db_cursor2 CURSOR FOR  
			SELECT IdPRedmeta 
			FROM Predmeti
			WHERE IdNadredjenogPredmeta = @IdPredmeta and
			      Status not in ('R', 'Z', 'E')

			OPEN db_cursor2   
			FETCH NEXT FROM db_cursor2 INTO @IdPodPred   

			WHILE @@FETCH_STATUS = 0   
			BEGIN   
				   
				   exec predmet_ArhivirajPredmet
						@IdPodPred,
						@IdKorisnika,
						@Napomena,
						1

				   FETCH NEXT FROM db_cursor2 INTO @IdPodPred   
			END   

			CLOSE db_cursor2   
			DEALLOCATE db_cursor2

		end
	end
	set nocount off
end