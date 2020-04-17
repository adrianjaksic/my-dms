go
if OBJECT_ID('adm_RebuildIndexes','P') is not null
	drop procedure adm_RebuildIndexes
go
/*
adm_RebuildIndexes
ULAZ:
IZLAZ:
*/
create procedure adm_RebuildIndexes 
as
begin
	set nocount on	
	
	DECLARE @fillfactor INT 
	DECLARE @cmd NVARCHAR(500)  
	
	set @fillfactor = 80

	DECLARE @TableName varchar(255) 
	DECLARE TableCursor CURSOR FOR 
	SELECT table_name FROM information_schema.tables
	WHERE table_type = 'base table'
	ORDER BY table_name

	OPEN TableCursor 
	FETCH NEXT FROM TableCursor INTO @TableName 
	WHILE @@FETCH_STATUS = 0 
	BEGIN 
	  exec('ALTER INDEX ALL ON ' + @TableName + ' REBUILD')

		IF ((@TableName not like 'KNF_%' and @TableName not like 'OSN_%') or @TableName in ('OSN_MestaFirme', 'OSN_KursnaLista', 'OSN_NacinObracunaPDV', 'OSN_Regioni', 'OSN_AdreseMesta', 'OSN_KalendarPeriodi', 'OSN_KalendarPromenePerioda'))
		BEGIN 
			SET @cmd = 'ALTER INDEX ALL ON ' + @TableName + ' REBUILD WITH (FILLFACTOR = ' + CONVERT(VARCHAR(3),@fillfactor) + ')'
			EXEC (@cmd) 
		END
		ELSE
		BEGIN
			SET @cmd = 'ALTER INDEX ALL ON ' + @TableName + ' REBUILD'
			EXEC (@cmd) 
		END

	  FETCH NEXT FROM TableCursor INTO @TableName 
	END 
	CLOSE TableCursor 
	DEALLOCATE TableCursor
		
	DBCC FREEPROCCACHE

	set nocount off
end
go


go
if OBJECT_ID('dokument_DodajDokument','P') is not null
	drop procedure dokument_DodajDokument
go

create procedure dokument_DodajDokument(
	@IdPredmeta bigint,
	@IdDokumenta smallint output,
	@IdKreatora int,
	@Naziv nvarchar(200),
	@Putanja nvarchar(200),
	@Napomena nvarchar(2000),
	@Hashcode char(32),
	@Ekstenzija varchar(20)
) as
begin
	set nocount on

	set @IdDokumenta = isnull((select max(IdDokumenta)+1
								from DokumentiPredmeta
								where IdPredmeta = @IdPredmeta),
								1)

	insert into DokumentiPredmeta (
		IdPredmeta,
		IdDokumenta,
		IdKreatora,
		VremeUnosa,
		Naziv,
		Putanja,
		Napomena,
		VremeBrisanja,
		Hashcode,
		Ekstenzija
	) values (
		@IdPredmeta,
		@IdDokumenta,
		@IdKreatora,
		getdate(),
		@Naziv,
		@Putanja,
		@Napomena,
		null,
		@Hashcode,
		@Ekstenzija
	)

	set nocount off
end
go


go
if OBJECT_ID('dokument_ObrisiDokument','P') is not null
	drop procedure dokument_ObrisiDokument
go

create procedure dokument_ObrisiDokument(
	@IdPredmeta bigint,
	@IdDokumenta smallint,
	@IdKorisnika int,
	@Napomena nvarchar(2000)
) as
begin
	set nocount on
	
	if exists (select top(1) 1 from DokumentiPredmeta
						where IdPredmeta = @IdPredmeta and
							IdDokumenta = @IdDokumenta)
	begin
	    
		declare @Sada smalldatetime
	    declare @IdKretanja smallint
		declare @Poruka nvarchar(2000)

		select @Sada = getdate()
		set @IdKretanja = isnull((select max(IdKretanja) + 1
										from IstorijaPredmeta
										where IdPredmeta = @IdPredmeta), 1)        

		set @Poruka = 'Obrisan dokument. Razlog: ' + @Napomena

        INSERT INTO IstorijaPredmeta
		(
		    IdPredmeta,
			IdKretanja,
			IdKretanjaPredmeta,
			Vreme,
			IdKorisnika,
			Opis,
			Napomena)
		values (
			@IdPredmeta,
			@IdKretanja,
			null,
			@Sada,
			@IdKorisnika,
			@Poruka,
			null
		)
	    
		update DokumentiPredmeta
		set VremeBrisanja = @Sada,
		    IdKreatoraBrisanja = @IdKorisnika,
			Napomena = @Napomena
		where IdPredmeta = @IdPredmeta and
				IdDokumenta = @IdDokumenta
	end

	set nocount off
end
go


go
if OBJECT_ID('dokument_VratiDetaljeDokumenta','P') is not null
	drop procedure dokument_VratiDetaljeDokumenta
go

create procedure dokument_VratiDetaljeDokumenta(
	@IdPredmeta bigint,
	@IdDokumenta smallint
) as
begin
	set nocount on
	
	select K.KorisnickoIme + ' (' + K.ImeIPrezime + ')' as NazivKreatora,
	       KB.KorisnickoIme + ' (' + KB.ImeIPrezime + ')' as NazivKreatoraBrisanja,
	       D.Naziv,
		   D.VremeUnosa,
		   D.VremeBrisanja,
		   D.Putanja,
		   D.Hashcode,
		   D.Napomena,
		   D.Ekstenzija
	from DokumentiPredmeta as D

	join Korisnici as K
	on K.IdKorisnika = D.IdKreatora

	left outer join Korisnici as KB
	on KB.IdKorisnika = D.IdKreatoraBrisanja

	where D.IdPredmeta = @IdPredmeta and
	      D.IdDokumenta = @IdDokumenta
	
	set nocount off
end
go


go
if OBJECT_ID('dokument_VratiDokumentePredmeta','P') is not null
	drop procedure dokument_VratiDokumentePredmeta
go

create procedure dokument_VratiDokumentePredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on
	
	select IdDokumenta,
	       Naziv,
		   isnull(case 
		    when VremeBrisanja is null then cast(0 as bit) 
			else cast(1 as bit) 
		   end, 0) as Obrisan,
		   Ekstenzija
	from DokumentiPredmeta
	where IdPredmeta = @IdPredmeta
	
	set nocount off
end
go


go
if OBJECT_ID('dokument_VratiObrisaniDokument','P') is not null
	drop procedure dokument_VratiObrisaniDokument
go

create procedure dokument_VratiObrisaniDokument(
	@IdPredmeta bigint,
	@IdDokumenta smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	if exists (select top(1) 1 from DokumentiPredmeta
						where IdPredmeta = @IdPredmeta and
							IdDokumenta = @IdDokumenta)
	begin
		declare @Sada smalldatetime
		declare @IdKretanja smallint
		declare @Poruka nvarchar(200)

		select @Sada = getdate()
		set @IdKretanja = isnull((select max(IdKretanja) + 1
										from IstorijaPredmeta
										where IdPredmeta = @IdPredmeta), 1)        

		set @Poruka = 'Vraćen obrisan dokument.'

		INSERT INTO IstorijaPredmeta
		(
			IdPredmeta,
			IdKretanja,
			IdKretanjaPredmeta,
			Vreme,
			IdKorisnika,
			Opis,
			Napomena)
		values (
			@IdPredmeta,
			@IdKretanja,
			null,
			@Sada,
			@IdKorisnika,
			@Poruka,
			null
		)

		update DokumentiPredmeta
		set VremeBrisanja = null
		where IdPredmeta = @IdPredmeta and
			  IdDokumenta = @IdDokumenta
	end
	
	set nocount off
end
go


go
if OBJECT_ID('inspekcija_ObrisiKlaseIJedinice','P') is not null
	drop procedure inspekcija_ObrisiKlaseIJedinice
go

create procedure inspekcija_ObrisiKlaseIJedinice(
	@IdInspekcije smallint,
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
	begin
		delete InspekcijeKlaseIJedinice
		where IdInspekcije = @IdInspekcije and
		      IdOkruga = @IdOkruga
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('inspekcija_SacuvajKlasuIJedinicu','P') is not null
	drop procedure inspekcija_SacuvajKlasuIJedinicu
go

create procedure inspekcija_SacuvajKlasuIJedinicu(
	@IdInspekcije smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@IdJedinice smallint,
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
	begin
		declare @IdInspekcijeProvere smallint
		select top(1) @IdInspekcijeProvere = IdInspekcije
		from InspekcijeKlaseIJedinice
		where IdOkruga = @IdOkruga and
			  IdOrgana = @IdOrgana and
			  IdKlase = @IdKlase and
			  (IdJedinice = @IdJedinice or IdJedinice = 0) and
			  IdInspekcije <> @IdInspekcije

		if(@IdInspekcijeProvere is not null)
		begin
			declare @Poruka nvarchar(200)
			declare @OznakaOrgana char(3)
			declare @OznakaKlase char(3)
			declare @OznakaJedinice char(3)

			select @OznakaOrgana = Oznaka
			from Organi
			where IdOrgana = @IdOrgana

			select @OznakaJedinice = Oznaka
			from Jedinice
			where IdOrgana = @IdOrgana and
			      IdJedinice = @IdJedinice

			select @OznakaKlase = Oznaka
			from Klase
			where IdOkruga = @IdOkruga and
			      IdOrgana = @IdOrgana and
				  IdKlase = @IdKlase

			declare @NazivInspekcije nvarchar(100)
			select @NazivInspekcije = Naziv
			from Inspekcije
			where IdInspekcije = @IdInspekcije

			set @Poruka = 'Kombijancija organa (' + @OznakaOrgana + '), klase (' + @OznakaKlase + ') i jedinice (' + @OznakaJedinice + ') je već dodeljena inspekciji (' + @NazivInspekcije + ').'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			insert into InspekcijeKlaseIJedinice (
				IdInspekcije,
				IdOkruga,
				IdOrgana,
				IdKlase,
				IdJedinice
			) values (
				@IdInspekcije,
				@IdOkruga,
				@IdOrgana,
				@IdKlase,
				@IdJedinice
			)
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('inspekcije_ObrisiInspekciju','P') is not null
	drop procedure inspekcije_ObrisiInspekciju
go

create procedure inspekcije_ObrisiInspekciju(
	@IdInspekcije smallint,
	@IdKorisnika int,
	@IdOkruga smallint
) as
begin
	set nocount on

	if exists(select top(1) 1 from Klase where IdOkruga = @IdOkruga and IdInspekcije = @IdInspekcije)
	begin
		raiserror('Postoji klasa sa izabranom inspekcijom. Nije moguće brisanje.', 14, 1)
	end
	else
	begin
		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
		begin

			delete Inspekcije
			where IdInspekcije = @IdInspekcije
		end
		else
		begin
			raiserror('Nemate prava pristupa.', 14, 1)
		end
	end

	set nocount off
end
go


go
if OBJECT_ID('inspekcije_SnimiInspekciju','P') is not null
	drop procedure inspekcije_SnimiInspekciju
go

create procedure inspekcije_SnimiInspekciju(
	@IdInspekcije smallint output,
	@Naziv nvarchar(100),
	@IdKorisnika int,
	@IdOkruga smallint
) as
begin
	set nocount on

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1) -- and isnull(IdOkruga, @IdOkruga) = @IdOkruga) pre je bio master admin koji nije imao dozvole za menjanje podataka
	begin		
		if exists(select top(1) 1 from Inspekcije where IdInspekcije <> isnull(@IdInspekcije, 0) and Naziv = @Naziv)
		begin
			declare @Poruka nvarchar(200)
		    set @Poruka = 'Postoji inspekcija sa oznakom: ' + @Naziv + '. Nije mogu�e snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin		
			if not exists(select top(1) 1 from Inspekcije where IdInspekcije = @IdInspekcije)
			begin
				set @IdInspekcije = isnull((select max(IdInspekcije) + 1 from Inspekcije ), 1)

				insert into Inspekcije (
					IdInspekcije,
					Naziv
				) values (
					@IdInspekcije,
					@Naziv
				)
			end
			else
			begin
				update Inspekcije
				set Naziv = @Naziv
				where IdInspekcije = @IdInspekcije
			end			
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('inspekcije_VratiInspekcije','P') is not null
	drop procedure inspekcije_VratiInspekcije
go

create procedure inspekcije_VratiInspekcije(
	@IdInspekcije smallint
) as
begin
	set nocount on

	select IdInspekcije, Naziv
	from Inspekcije
	where @IdInspekcije is null or IdInspekcije = @IdInspekcije

	set nocount off
end
go


go
if OBJECT_ID('inspekcije_VratiKlaseIJedinice','P') is not null
	drop procedure inspekcije_VratiKlaseIJedinice
go

create procedure inspekcije_VratiKlaseIJedinice(
	@IdInspekcije smallint,
	@IdOkruga smallint
) as
begin
	set nocount on

	select
		IKJ.IdOrgana,
		O.Oznaka + '-' + O.Naziv as NazivOrgana,
		IKJ.IdKlase,
		K.Oznaka + '-' + K.Naziv as NazivKlase,
		IKJ.IdJedinice,
		J.Oznaka + '-' + J.Naziv as NazivJedinice
	from InspekcijeKlaseIJedinice as IKJ

	join Organi as O
	on O.IdOrgana = IKJ.IdOrgana

	join Klase as K
	on K.IdOkruga = IKJ.IdOkruga and
	   K.IdOrgana = IKJ.IdOrgana and
	   K.IdKlase = IKJ.IdKlase

	left outer join Jedinice as J
	on J.IdOrgana = IKJ.IdOrgana and
	   J.IdJedinice = IKJ.IdJedinice

	where IKJ.IdInspekcije = @IdInspekcije and
	      IKJ.IdOkruga = @IdOkruga


	set nocount off
end
go


go
if OBJECT_ID('istorija_ObrisiKretanjePredmeta','P') is not null
	drop procedure istorija_ObrisiKretanjePredmeta
go

create procedure istorija_ObrisiKretanjePredmeta(
	@IdPredmeta bigint,
	@IdKretanja smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	update IstorijaPredmeta
	set DatumBrisanja = getdate(),
	    Obrisao = @IdKorisnika
	where IdPredmeta = @IdPredmeta and
	      IdKretanja = @IdKretanja
		  
	declare @IdKretanjaPredmeta smallint
	select @IdKretanjaPredmeta = IdKretanjaPredmeta
	from IstorijaPredmeta	      
	where IdPredmeta = @IdPredmeta and
	      IdKretanja = @IdKretanja

	if (@IdKretanjaPredmeta is not null)
	begin

		declare @Status char(1)
		select @Status = [Status]
		from KretanjaPredmeta
		where IdKretanjaPredmeta = @IdKretanjaPredmeta

		if (@Status is not null)
		begin

			update P
			set Status = KK.Status
			from Predmeti as P
			join
			(
				select I.IdPredmeta, MAX(I.IdKretanja) as MaxIdKretanja
				from IstorijaPredmeta as I
				join KretanjaPredmeta as K
				on I.IdKretanjaPredmeta = K.IdKretanjaPredmeta
				where I.IdPredmeta = @IdPredmeta and
				      I.Obrisao is null and
					  K.Status is not null
				group by I.IdPredmeta
			) as X
			on P.IdPredmeta = X.IdPredmeta
			join IstorijaPredmeta as II
			on II.IdPredmeta = X.IdPredmeta and
			   II.IdKretanja = X.MaxIdKretanja
			join KretanjaPredmeta as KK
			on II.IdKretanjaPredmeta = KK.IdKretanjaPredmeta
			where P.IdPredmeta = @IdPredmeta

		end

	end

	set nocount off
end
go


go
if OBJECT_ID('istorija_SnimiKretanjePredmeta','P') is not null
	drop procedure istorija_SnimiKretanjePredmeta
go

create procedure istorija_SnimiKretanjePredmeta(
	@IdPredmeta bigint,
	@IdKorisnika int,
	@IdKretanjaPredmeta smallint,
	@Napomena nvarchar(2000),
	@DatumRoka smalldatetime
) as
begin
	set nocount on
	
	declare @IdKretanja smallint
	declare @Sada smalldatetime
	select @Sada = getdate()
	declare @Broj int
	declare @BrojUGodini int
	declare @Zapisnik bit

	select @Zapisnik = Zapisnik
	from KretanjaPredmeta as K
	where K.IdKretanjaPredmeta = @IdKretanjaPredmeta

	if (@Zapisnik = 1 and @IdKretanjaPredmeta is not null)
	BEGIN

		set @Broj = isnull((select MAX(Broj) + 1
					from IstorijaPredmeta as I 
					join Predmeti as P 
					on I.IdPredmeta = P.IdPredmeta 
					join Predmeti as IP 
					on IP.IdPredmeta = @IdPredmeta and
					   IP.IdOkruga = P.IdOkruga and
					   IP.IdOrgana = P.IdOrgana and
					   IP.IdKlase = P.IdKlase and
					   YEAR(IP.VremeKreiranja) = YEAR(P.VremeKreiranja)), 1)

		set @BrojUGodini = isnull((select MAX(BrojUGodini) + 1
					from IstorijaPredmeta as I 
					join Predmeti as P 
					on I.IdPredmeta = P.IdPredmeta 
					join Predmeti as IP 
					on IP.IdPredmeta = @IdPredmeta and
					   IP.IdOkruga = P.IdOkruga and
					   IP.IdOrgana = P.IdOrgana and
					   IP.IdJedinice = P.IdJedinice and
					   YEAR(IP.VremeKreiranja) = YEAR(P.VremeKreiranja)), 1)

	END

	set @IdKretanja = isnull((select max(IdKretanja) + 1
									from IstorijaPredmeta
									where IdPredmeta = @IdPredmeta),
									1)
	
	declare @Naziv nvarchar(200)
	declare @Status char(1)

	select @Naziv = NazivZaIstoriju,
	       @Status = case
		              when Status <> 'X' then Status
					  else null
					 end
	from KretanjaPredmeta
	where IdKretanjaPredmeta = @IdKretanjaPredmeta

	if(@Status is not null)
	begin

		update Predmeti
		set Status = case 
		              when IdNadredjenogPredmeta is not null and @Status = 'Z' then 'E'
					  else @Status
					 end,
		    IdKreatora = case
					      when Status = 'R' and isnull(@Status, 'X') = 'O' then @IdKorisnika
						  else IdKreatora
					     end,
			VremeKreiranja = case
					          when Status = 'R' and isnull(@Status, 'X') = 'O' then @Sada
						      else VremeKreiranja
						     end,
			VremeArhiviranja = case
			                    when isnull(@Status, 'X') in ('Z', 'E') then @Sada
								else VremeArhiviranja
							   end,
			IdArhivatora = case
			                    when isnull(@Status, 'X') in ('Z', 'E') then @IdKorisnika
								else IdArhivatora
							   end
		where IdPredmeta = @IdPredmeta

		if (@Status = 'Z' or @Status = 'E')
		begin
			
			declare @IdPodPred bigint
			DECLARE db_cursor CURSOR FOR  
			SELECT IdPRedmeta 
			FROM Predmeti
			WHERE IdNadredjenogPredmeta = @IdPredmeta and
			      Status not in ('R', 'Z', 'E')

			OPEN db_cursor   
			FETCH NEXT FROM db_cursor INTO @IdPodPred   

			WHILE @@FETCH_STATUS = 0   
			BEGIN   
				   
				   exec istorija_SnimiKretanjePredmeta
							@IdPodPred,
							@IdKorisnika,
							@IdKretanjaPredmeta,
							@Napomena,
							@DatumRoka

				   FETCH NEXT FROM db_cursor INTO @IdPodPred   
			END   

			CLOSE db_cursor   
			DEALLOCATE db_cursor

		end

	end

	insert into IstorijaPredmeta (
		IdPredmeta,
		IdKretanja,
		IdKretanjaPredmeta,
		Vreme,
		IdKorisnika,
		Opis,
		Napomena,
		Broj,
		DatumRoka,
		BrojUGodini
	) values (
		@IdPredmeta,
		@IdKretanja,
		@IdKretanjaPredmeta,
		@Sada,
		@IdKorisnika,
		@Naziv,
		@Napomena,
		@Broj,
		@DatumRoka,
		@BrojUGodini
	)

	select @IdKretanja as IdKretanja
		
	set nocount off
end
go


go
if OBJECT_ID('istorija_VratiIstorijuPredmeta','P') is not null
	drop procedure istorija_VratiIstorijuPredmeta
go

create procedure istorija_VratiIstorijuPredmeta(
	@IdPredmeta bigint,
	@Istorija bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Administrator bit
	set @Administrator = isnull((select top(1) 1
	                             from Korisnici
								 where IdKorisnika = @IdKorisnika and
									   Administracija = 1 and
									   Aktivan = 1), 0)
	
	select IP.Vreme,
		   IP.Opis,
		   IP.Napomena,
		   K.KorisnickoIme + ' (' + K.ImeIPrezime + ')' as NazivKorisnika,
		   IP.IdKretanja,
		   IP.DatumBrisanja,
		   KOM.KorisnickoIme + ' (' + KOM.ImeIPrezime + ')' as Obrisao,
		   IP.DatumRoka
	from IstorijaPredmeta as IP

	join Korisnici as K
	on K.IdKorisnika = IP.IdKorisnika

	left outer join Korisnici as KOM
	on KOM.IdKorisnika = IP.Obrisao

	where IP.IdPredmeta = @IdPredmeta and
	      (
		   (isnull(@Istorija, 0) = 0 and (@Administrator = 1 or isnull(IP.SamoAdministrator, 0) = 0)) or
		   (@Istorija = 1 and IP.IdKretanjaPredmeta is not null and IP.DatumBrisanja is null)
		  )
	order by IP.IdKretanja
	      
	set nocount off
end
go


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
go


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
go


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
go


go
if OBJECT_ID('izvestaji_VratiPredmeteSaRokom','P') is not null
	drop procedure izvestaji_VratiPredmeteSaRokom
go
/*
izvestaji_VratiPredmeteSaRokom
ULAZ:
IZLAZ:
*/
create procedure izvestaji_VratiPredmeteSaRokom(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@OznakaKlase char(3),
	@BrojPredmeta int,
	@Godina int,
	@IdJedinice smallint,
	@OznakaJedinice char(3),
	@IdKorisnika int
) as
begin
	set nocount on

	if(not exists (select top(1) 1
	               from Korisnici
				   where IdKorisnika = @IdKorisnika and
				         (Administracija = 1 or Inspektor = 0)))
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end
	else
	begin
		declare @Sada smalldatetime
		select @Sada = getdate()

		declare @IdKorisnikaSvojihPredmeta int

		select @IdKorisnikaSvojihPredmeta = IdKorisnika
		from Korisnici
		where IdKorisnika = @IdKorisnika and SamoSvojePredmete = 1

		select P.IdPredmeta,
			   P.BrojPredmeta,
			   OK.Oznaka as OznakaOkruga,
			   OG.Oznaka as OznakaOrgana,
			   KL.Oznaka as OznakaKlase,
			   J.Oznaka as OznakaJedinice,
			   year(P.VremeRezervacije) as Godina,
			   P.Podnosilac,
			   K.KorisnickoIme + ' (' + K.ImeIPrezime + ')' as NazivInspektora,
			   P.Sadrzaj,
			   IP.DatumRoka
		from Predmeti as P

		join KlaseInspektora as KI
		on KI.IdOkruga = P.IdOkruga and
		   KI.IdOrgana = P.IdOrgana and
		   KI.IdKlase = P.IdKlase and
		   KI.IdKorisnika = @IdKorisnika

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
	   
		join Jedinice as J
		on J.IdOrgana = P.IdOrgana and
			J.IdJedinice = P.IdJedinice

		join (
			select IdPredmeta, max(IdKretanja) as MaxIdKretanja
			from IstorijaPredmeta
			where IdKretanjaPredmeta is not null
			group by IdPredmeta
		) as A
		on A.IdPredmeta = P.IdPredmeta

		join IstorijaPredmeta as IP
		on IP.IdPredmeta = A.IdPredmeta and
		   IP.IdKretanja = A.MaxIdKretanja

		where P.IdOkruga = @IdOkruga and
			  (@IdOrgana is null or P.IdOrgana = @IdOrgana) and
			  (@IdKlase is null or P.IdKlase = @IdKlase) and
			  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and
			  (@BrojPredmeta is null or P.BrojPredmeta = @BrojPredmeta) and
			  (@Godina is null or year(P.VremeRezervacije) = @Godina) and
			  (@IdJedinice is null or P.IdJedinice = @IdJedinice) and
			  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
			  (@IdKorisnikaSvojihPredmeta is null or P.IdKreatora = @IdKorisnikaSvojihPredmeta or P.IdInspektora = @IdKorisnikaSvojihPredmeta) and
			  IP.DatumRoka is not null
		order by OK.Oznaka, OG.Oznaka, KL.Oznaka, P.BrojPredmeta
	end

	set nocount off
end
go


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
go


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
go


go
if OBJECT_ID('izvestaj_VratiDetaljePredmeta','P') is not null
	drop procedure izvestaj_VratiDetaljePredmeta
go

create procedure izvestaj_VratiDetaljePredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on
	
	select
		P.IdPredmeta,
		P.IdNadredjenogPredmeta,
		OKR.Oznaka as OznakaOkruga,
		OKR.Naziv as NazivOkruga,
		OKR.Mesto,
		ORG.Oznaka as OznakaOrgana,
		ORG.Naziv as NazivOrgana,
		K.Oznaka as OznakaKlase,
		K.Naziv as NazivKlase,
		P.BrojPredmeta,
		J.Oznaka as OznakaJedinice,
		J.Naziv as NazivJedinice,
		KOR.ImeIPrezime as ImeIPrezimeKreatora,
		KOR.KorisnickoIme as KorisnickoImeKreatora,
		P.PodnosilacJeInspektor,
		P.Podnosilac,
		P.PodnosilacJedinstveniBroj,
		P.LiceKontrole,
		P.LiceKontroleJedinstveniBroj,
		P.VremeRezervacije,
		P.VremeKreiranja,
		VP.Oznaka as OznakaVrstePredmeta,
		VP.Naziv as NazivVrstePredmeta,
		VP.Rok,
		VP.OznakaZaStampu as OznakaVrstePredmetaZaStampu,
		INS.ImeIPrezime as ImeIPrezimeInspektora,
		INS.KorisnickoIme as KorisnickoImeInspektora,
		P.Prilog,
		P.Sadrzaj,
		T.Naziv as NazivTakse,
		T.OznakaZaStampu as OznakaTakseZaStampu,
		P.StraniBroj,
		P.Napomena,
		P.Status,
		dateadd(day, VP.Rok, isnull(POV.PrvoVremeKreiranja, P.VremeKreiranja)) as VremeIstekaRoka
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

	join Korisnici as KOR
	on KOR.IdKorisnika = P.IdKreatora

	left outer join VrstePredmeta as VP
	on VP.IdVrstePredmeta = P.IdVrstePredmeta

	left outer join Korisnici as INS
	on INS.IdKorisnika = P.IdInspektora

	left outer join Takse as T
	on T.IdTakse = P.IdTakse

	left outer join
	(
		select IdNadredjenogPredmeta, MIN(VremeKreiranja) as PrvoVremeKreiranja
		from Predmeti
		where IdNadredjenogPredmeta is not null
		group by IdNadredjenogPredmeta
	) as POV
	on POV.IdNadredjenogPredmeta = P.IdPredmeta

	where P.IdPredmeta = @IdPredmeta
	
	set nocount off
end
go


go
if OBJECT_ID('izvestaj_VratiStavkeIstorijePredmeta','P') is not null
	drop procedure izvestaj_VratiStavkeIstorijePredmeta
go

create procedure izvestaj_VratiStavkeIstorijePredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on
	
	select
		KP.Naziv as NazivKretanjaPredmeta,
		KOR.ImeIPrezime as ImeIPrezimeKorisnika,
		KOR.KorisnickoIme as KorisnickoImeKorisnika,
		IP.Opis,
		IP.Napomena,
		IP.Vreme
	from IstorijaPredmeta as IP

	join Korisnici as KOR
	on KOR.IdKorisnika = IP.IdKorisnika

	left outer join KretanjaPredmeta as KP
	on KP.IdKretanjaPredmeta = IP.IdKretanjaPredmeta

	where IP.IdPredmeta = @IdPredmeta
	
	set nocount off
end
go


go
if OBJECT_ID('jedinica_ObrisiJedinicu','P') is not null
	drop procedure jedinica_ObrisiJedinicu
go

create procedure jedinica_ObrisiJedinicu(
	@IdOrgana smallint,
	@IdJedinice smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)
	select @Sada = getdate()
	
	if exists(select top(1) 1 from Predmeti where IdOrgana = @IdOrgana and IdJedinice = @IdJedinice)
	begin
		raiserror('Izabrana jedinica poseduje predmete. Nije moguæe brisanje.', 14, 1)
	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
		begin		

			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

			declare @Naziv nvarchar (200)

			select @Naziv = Naziv
			from Jedinice
			where IdOrgana = @IdOrgana and
				  IdJedinice = @IdJedinice

			delete
			from Jedinice
			where IdOrgana = @IdOrgana and
				  IdJedinice = @IdJedinice

			set @Poruka = 'Obrisana jedinica sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
		
	set nocount off
end
go


go
if OBJECT_ID('jedinica_SnimiJedinicu','P') is not null
	drop procedure jedinica_SnimiJedinicu
go

create procedure jedinica_SnimiJedinicu(
	@IdOrgana smallint,
	@IdJedinice smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@Nadleznost nvarchar(4000)
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1)
	begin		
		if exists(select top(1) 1 from Jedinice where IdOrgana = @IdOrgana and IdJedinice <> isnull(@IdJedinice, 0) and Oznaka = @Oznaka and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji jedinica sa oznakom: ' + @Oznaka + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Jedinice
							where IdOrgana = @IdOrgana and
							   	  IdJedinice = @IdJedinice)
			begin
				set @IdJedinice = isnull((select max(IdJedinice) + 1
									   from Jedinice
									   where IdOrgana = @IdOrgana), 1)

				insert into Jedinice (
					IdOrgana,
					IdJedinice,
					Oznaka,
					Naziv,
					Napomena,
					Aktivan,
					Nadleznost
				) values (
					@IdOrgana,
					@IdJedinice,
					@Oznaka,
					@Naziv,
					@Napomena,
					@Aktivan,
					@Nadleznost
				)			

				set @Poruka = 'Kreirana jedinica sa nazivom: ' + @Naziv + '.'

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
				update Jedinice
				set Oznaka = @Oznaka,
					Naziv = @Naziv,
					Napomena = @Napomena,
					Aktivan = @Aktivan,
					Nadleznost = @Nadleznost
				where IdOrgana = @IdOrgana and
					  IdJedinice = @IdJedinice

				set @Poruka = 'Izmenjena jedinica sa nazivom: ' + @Naziv + '.'

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
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('jedinica_VratiJedinice','P') is not null
	drop procedure jedinica_VratiJedinice
go

create procedure jedinica_VratiJedinice(
	@IdOrgana smallint,
	@IdJedinice smallint,
	@Aktivan bit
) as
begin
	set nocount on

	select J.IdOrgana, 
	       J.IdJedinice, 
		   J.Oznaka, 
		   J.Naziv, 
		   J.Napomena, 
		   J.Aktivan, 
		   J.Nadleznost
	from Jedinice as J
	where (@IdOrgana is null or J.IdOrgana = @IdOrgana) and
		  (@IdJedinice is null or J.IdJedinice = @IdJedinice) and
		  (@Aktivan is null or J.Aktivan = @Aktivan)
	order by RIGHT('000' + J.Oznaka, 3)

	set nocount off
end
go


go
if OBJECT_ID('jedinica_VratiSveJedinice','P') is not null
	drop procedure jedinica_VratiSveJedinice
go

create procedure jedinica_VratiSveJedinice as
begin
	set nocount on

	select J.Oznaka, MIN(J.Naziv) as Naziv
	from Jedinice as J
	where J.Aktivan = 1
	group by J.Oznaka
	order by RIGHT('000' + J.Oznaka, 3)

	set nocount off
end
go


go

if OBJECT_ID('klasa_ObrisiKlasu','P') is not null
	drop procedure klasa_ObrisiKlasu
go
/*
klasa_ObrisiKlasu
ULAZ:
IZLAZ:
*/
create procedure klasa_ObrisiKlasu(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Predmeti where IdOrgana = @IdOrgana and IdKlase = @IdKlase)
	begin
		raiserror('Izabrana klasa poseduje predmete. Nije moguæe brisanje.', 14, 1)
	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
		begin		

			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

			declare @Naziv nvarchar (200)

			select @Naziv = Naziv
			from Klase
			where IdOkruga = @IdOkruga and
			      IdOrgana = @IdOrgana and
				  IdKlase = @IdKlase

			delete
			from Klase
			where IdOkruga = @IdOkruga and
			      IdOrgana = @IdOrgana and
				  IdKlase = @IdKlase

			set @Poruka = 'Obrisana klasa sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
	
	
	set nocount off
end

go
go


go
if OBJECT_ID('klasa_SnimiKlasu','P') is not null
	drop procedure klasa_SnimiKlasu
go
/*
klasa_SnimiKlasu
ULAZ:
IZLAZ:
*/
create procedure klasa_SnimiKlasu(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@Nadleznost nvarchar(4000) = null,
	@IdInspekcije smallint = null,
	@IzuzmiIzProvere bit = null
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1) -- and isnull(IdOkruga, @IdOkruga) = @IdOkruga) pre je bio master admin koji nije imao dozvole za menjanje podataka
	begin		
		if exists(select top(1) 1 from Klase where IdOkruga = @IdOkruga and IdOrgana = @IdOrgana and IdKlase <> isnull(@IdKlase, 0) and Oznaka = @Oznaka and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji klasa sa oznakom: ' + @Oznaka + '. Nije moguće snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Klase
							where IdOkruga = @IdOkruga and
								  IdOrgana = @IdOrgana and
							   	  IdKlase = @IdKlase)
			begin
				set @IdKlase = isnull((select max(IdKlase) + 1
									   from Klase
									   where IdOkruga = @IdOkruga and
										     IdOrgana = @IdOrgana), 1)

				insert into Klase (
					IdOkruga,
					IdOrgana,
					IdKlase,
					Oznaka,
					Naziv,
					Napomena,
					Aktivan,
					Nadleznost,
					IdInspekcije,
					IzuzmiIzProvere
				) values (
					@IdOkruga,
					@IdOrgana,
					@IdKlase,
					@Oznaka,
					@Naziv,
					@Napomena,
					@Aktivan,
					@Nadleznost,
					@IdInspekcije,
					@IzuzmiIzProvere
				)			

				set @Poruka = 'Kreirana klasa sa nazivom: ' + @Naziv + '.'

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
				update Klase
				set Oznaka = @Oznaka,
					Naziv = @Naziv,
					IdInspekcije = @IdInspekcije,
					Napomena = @Napomena,
					Aktivan = @Aktivan,
					Nadleznost = @Nadleznost,
					IzuzmiIzProvere = @IzuzmiIzProvere
				where IdOkruga = @IdOkruga and
					  IdOrgana = @IdOrgana and
					  IdKlase = @IdKlase

				set @Poruka = 'Izmenjena klasa sa nazivom: ' + @Naziv + '.'

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
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('klasa_VratiKlase','P') is not null
	drop procedure klasa_VratiKlase
go
/*
klasa_VratiKlase
ULAZ:
IZLAZ:
*/
create procedure klasa_VratiKlase(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOkruga, IdOrgana, IdKlase, Oznaka, Naziv, Napomena, Aktivan, Nadleznost, IdInspekcije, IzuzmiIzProvere
		from Klase
		where (@IdOkruga is null or IdOkruga = @IdOkruga) and
		      (@IdOrgana is null or IdOrgana = @IdOrgana) and
			  (@IdKlase is null or IdKlase = @IdKlase) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by Oznaka

	set nocount off
end
go


go
if OBJECT_ID('klasa_VratiKlaseInspektora','P') is not null
	drop procedure klasa_VratiKlaseInspektora
go
/*
klasa_VratiKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klasa_VratiKlaseInspektora(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	select K.IdOkruga, K.IdOrgana, K.IdKlase, K.Oznaka, K.Naziv, K.Napomena, K.Aktivan, K.Nadleznost
	from Klase as K
	join KlaseInspektora as KI
	on K.IdOkruga = KI.IdOkruga and
	   K.IdOrgana = KI.IdOrgana and
	   K.IdKlase = KI.IdKlase and
	   KI.IdKorisnika = @IdKorisnika
	where (@IdOkruga is null or K.IdOkruga = @IdOkruga) and
		    (@IdOrgana is null or K.IdOrgana = @IdOrgana) and
			(@IdKlase is null or K.IdKlase = @IdKlase) and
		    (@Aktivan is null or Aktivan = @Aktivan)
	order by RIGHT('000' + K.Oznaka, 3)

	set nocount off
end
go


go
if OBJECT_ID('klasa_VratiSveKlaseInspektora','P') is not null
	drop procedure klasa_VratiSveKlaseInspektora
go
/*
klasa_VratiSveKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klasa_VratiSveKlaseInspektora(
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	select K.Oznaka, MIN(K.Naziv) as Naziv
	from Klase as K
	join KlaseInspektora as KI
	on K.IdOkruga = KI.IdOkruga and
	   K.IdOrgana = KI.IdOrgana and
	   K.IdKlase = KI.IdKlase and
	   KI.IdKorisnika = @IdKorisnika
	where (@IdOkruga is null or K.IdOkruga = @IdOkruga) and
	      K.Aktivan = 1
	group by K.Oznaka
	order by RIGHT('000' + K.Oznaka, 3)

	set nocount off
end
go


go
if OBJECT_ID('klase_insp_ObrisiKlaseInspektora','P') is not null
	drop procedure klase_insp_ObrisiKlaseInspektora
go
/*
klase_insp_ObrisiKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klase_insp_ObrisiKlaseInspektora(
	@IdKorisnika int
) as
begin
	set nocount on

	delete 
	from KlaseInspektora
	where IdKorisnika = @IdKorisnika

	set nocount off
end
go


go
if OBJECT_ID('klase_insp_SnimiKlasuInspektora','P') is not null
	drop procedure klase_insp_SnimiKlasuInspektora
go
/*
klase_insp_SnimiKlasuInspektora
ULAZ:
IZLAZ:
*/
create procedure klase_insp_SnimiKlasuInspektora(
	@IdKorisnika int,
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint
) as
begin
	set nocount on

	insert into KlaseInspektora	(
		IdKorisnika,
		IdOkruga,
		IdOrgana,
		IdKlase
	) values (
		@IdKorisnika,
		@IdOkruga,
		@IdOrgana,
		@IdKlase
	)

	set nocount off
end
go


go
if OBJECT_ID('klase_insp_VratiKlaseInspektora','P') is not null
	drop procedure klase_insp_VratiKlaseInspektora
go
/*
klase_insp_VratiKlaseInspektora
ULAZ:
IZLAZ:
*/
create procedure klase_insp_VratiKlaseInspektora(
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on
	
	select
		K.IdKlase,
		K.Oznaka,
		K.Naziv,
		cast(case when T.IdOkruga is not null then 1 else 0 end as bit) as Izabran,
		O.Naziv as NazivOrgana,
		O.Oznaka as OznakaOrgana,
		k.IdOrgana
	from Klase as K

	join Organi as O
	on O.IdOrgana = K.IdOrgana

	left outer join KlaseInspektora as T
	on T.IdKorisnika = @IdKorisnika and
	   K.IdOkruga = T.IdOkruga and
	   K.IdOrgana = T.IdOrgana and
	   K.IdKlase = T.IdKlase  
	where K.IdOkruga = @IdOkruga
	order by O.Oznaka, K.Oznaka
	
	set nocount off
end
go


go
if OBJECT_ID('korisnik_PrijaviGresku','P') is not null
	drop procedure korisnik_PrijaviGresku
go

create procedure korisnik_PrijaviGresku(
	@IdKorisnika int,
	@PrijavljenaGreska nvarchar(max),
	@Url nvarchar(255)
) as
begin
	set nocount on

	declare @IdPrijave int
	set @IdPrijave = isnull((select max(IdPrijave) + 1 from PrijavljeneGreske), 1)

	insert into PrijavljeneGreske (
		IdPrijave,
		IdKorisnika,
		Vreme,
		PrijavljenaGreska,
		Url
	) values (
		@IdPrijave,
		@IdKorisnika,
		getdate(),
		@PrijavljenaGreska,
		@Url
	)

	set nocount off
end
go


go
if OBJECT_ID('korisnik_SnimiKorisnika','P') is not null
	drop procedure korisnik_SnimiKorisnika
go
/*
korisnik_SnimiKorisnika
ULAZ:
IZLAZ:
*/
create procedure korisnik_SnimiKorisnika(
	@IdKorisnikaZaUnos int output,
	@KorisnickoIme nvarchar(50),
	@Inspektor bit,
	@IdOkruga smallint,
	@UnosNovogPredmeta bit,
	@DozvolaRezervisanja bit,
	@IzmenaPredmeta bit,
	@BrisanjePredmeta bit,
	@Administracija bit,
	@PregledIzvestaja bit,
	@Email nvarchar(200),
	@Telefon nvarchar(200),
	@Jmbg nchar(13),
	@ImeIPrezime nvarchar(200),
	@Napomena nvarchar(200),
	@Aktivan bit,
	@IdKorisnika int,
	@Lozinka varbinary(8000),
	@NovaLozinka varbinary(8000) = null,
	@SamoSvojePredmete bit = null,
	@IdOrgana smallint = null,
	@MaksimalniBrojPredmeta smallint = null,
	@MaxBrojRezervisanihPredmeta smallint = null,
	@MaksimalniBrojPredmetaGodine smallint = null,
	@StrogoPoverljivi bit = 0
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	declare @IdOkrugaKorisnika smallint

	select @IdOkrugaKorisnika = IdOkruga
	from Korisnici
	where IdKorisnika = @IdKorisnika

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1)
	begin
		
		if exists(select top(1) 1 from Korisnici where IdKorisnika <> isnull(@IdKorisnikaZaUnos, 0) and KorisnickoIme = @KorisnickoIme and Aktivan = 1 and @Aktivan = 1)
		begin
		    set @Poruka = 'Postoji korisnik sa korisni�kim imenom: ' + @KorisnickoIme + '. Nije mogu�e snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Korisnici
							where IdKorisnika = @IdKorisnikaZaUnos)
			begin
				set @IdKorisnikaZaUnos = isnull((select max(IdKorisnika) + 1
										from Korisnici), 1)

				insert into Korisnici(
					IdKorisnika,
					KorisnickoIme,
					Lozinka,
					Inspektor,
					IdOkruga,
					UnosNovogPredmeta,
					DozvolaRezervisanja,
					IzmenaPredmeta,
					BrisanjePredmeta,
					Administracija,
					PregledIzvestaja,
					SamoSvojePredmete,
					Email,
					Telefon,
					Jmbg,
					ImeIPrezime,
					Napomena,
					Aktivan,
					Guid,
					IdOrgana,
					MaksimalniBrojPredmeta,
					MaxBrojRezervisanihPredmeta,
					MaksimalniBrojPredmetaGodine,
					StrogoPoverljivi
				) values (
					@IdKorisnikaZaUnos,
					@KorisnickoIme,
					@Lozinka,
					@Inspektor,
					isnull(@IdOkrugaKorisnika, @IdOkruga),
					@UnosNovogPredmeta,
					@DozvolaRezervisanja,
					@IzmenaPredmeta,
					@BrisanjePredmeta,
					@Administracija,
					@PregledIzvestaja,
					@SamoSvojePredmete,
					@Email,
					@Telefon,
					@Jmbg,
					@ImeIPrezime,
					@Napomena,
					@Aktivan,
					null,
					@IdOrgana,
					@MaksimalniBrojPredmeta,
					@MaxBrojRezervisanihPredmeta,
					@MaksimalniBrojPredmetaGodine,
					@StrogoPoverljivi
				)			

				set @Poruka = 'Kreiran korisnik sa korisni�kim imenom: ' + @KorisnickoIme + '.'

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

				-- insert precica
				insert into PreciceKorisnika (
					IdKorisnika,
					IdPrecice,
					Tekst
				)
				values
				(
					@IdKorisnikaZaUnos,
					1,
					'Precica 1'
				),
				(
					@IdKorisnikaZaUnos,
					2,
					'Precica 2'
				),
				(
					@IdKorisnikaZaUnos,
					3,
					'Precica 3'
				),
				(
					@IdKorisnikaZaUnos,
					4,
					'Precica 4'
				),
				(
					@IdKorisnikaZaUnos,
					5,
					'Precica 5'
				),
				(
					@IdKorisnikaZaUnos,
					6,
					'Precica 6'
				),
				(
					@IdKorisnikaZaUnos,
					7,
					'Precica 7'
				),
				(
					@IdKorisnikaZaUnos,
					8,
					'Precica 8'
				),
				(
					@IdKorisnikaZaUnos,
					9,
					'Precica 9'
				)
			end
			else
			begin
				update Korisnici
				set Inspektor = @Inspektor,
					UnosNovogPredmeta = @UnosNovogPredmeta,
					DozvolaRezervisanja = @DozvolaRezervisanja,
					IzmenaPredmeta = @IzmenaPredmeta,
					BrisanjePredmeta = @BrisanjePredmeta,
					Administracija = @Administracija,
					PregledIzvestaja = @PregledIzvestaja,
					SamoSvojePredmete = @SamoSvojePredmete,
					Email = @Email,
					Telefon = @Telefon,
					Jmbg = @Jmbg,
					ImeIPrezime = @ImeIPrezime,
					Napomena = @Napomena,
					Aktivan = @Aktivan,
					IdOkruga = isnull(@IdOkrugaKorisnika, @IdOkruga),
					IdOrgana = @IdOrgana,
					Lozinka = case
					           when len(@NovaLozinka) > 0 then @NovaLozinka
							   else Lozinka
							  end,
					MaksimalniBrojPredmeta = @MaksimalniBrojPredmeta,
					MaxBrojRezervisanihPredmeta = @MaxBrojRezervisanihPredmeta,
					MaksimalniBrojPredmetaGodine = @MaksimalniBrojPredmetaGodine,
					StrogoPoverljivi = @StrogoPoverljivi
				where IdKorisnika = @IdKorisnikaZaUnos and
				      (@IdOkrugaKorisnika is null or IdOkruga = @IdOkrugaKorisnika)

				set @Poruka = 'Izmenjen korisnik sa korisni�kim imenom: ' + @KorisnickoIme + '.'

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
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('korisnik_VratiArhivatore','P') is not null
	drop procedure korisnik_VratiArhivatore
go

create procedure korisnik_VratiArhivatore(
	@IdOkruga smallint
) as
begin
	set nocount on

	select IdKorisnika, KorisnickoIme, ImeIPrezime
	from Korisnici
	where IdOkruga = @IdOkruga and
	      Administracija = 0 and
		  Inspektor = 0 and
		  Aktivan = 1

	set nocount off
end
go


go
if OBJECT_ID('korisnik_VratiInspektore','P') is not null
	drop procedure korisnik_VratiInspektore
go
/*
korisnik_VratiInspektore
ULAZ:
IZLAZ:
*/
create procedure korisnik_VratiInspektore(
	@IdOkruga smallint,
	@IdPredmeta bigint
) as
begin
	set nocount on

	select IdKorisnika, KorisnickoIme, ImeIPrezime			   
	from Korisnici
	where Inspektor = 1 and
		  ((IdOkruga = @IdOkruga and
		  Aktivan = 1) or IdKorisnika in ( select IdInspektora from Predmeti
											where IdPredmeta = @IdPredmeta and IdInspektora is not null))

	set nocount off
end
go


go
if OBJECT_ID('korisnik_VratiKorisnike','P') is not null
	drop procedure korisnik_VratiKorisnike
go
/*
korisnik_VratiKorisnike
ULAZ:
IZLAZ:
*/
create procedure korisnik_VratiKorisnike(
	@IdKorisnika int,
	@Aktivan bit,
	@IdOkruga smallint
) as
begin
	set nocount on

		select IdKorisnika,
			   KorisnickoIme,
			   Inspektor,
			   IdOkruga,
			   UnosNovogPredmeta,
			   DozvolaRezervisanja,
			   IzmenaPredmeta,
			   BrisanjePredmeta,
			   Administracija,
			   PregledIzvestaja,
			   Email,
			   Telefon,
			   Jmbg,
			   ImeIPrezime,
			   Napomena,
			   Aktivan,
			   SamoSvojePredmete,
			   IdOrgana,
			   MaksimalniBrojPredmeta,
			   MaxBrojRezervisanihPredmeta,
			   MaksimalniBrojPredmetaGodine,
			   StrogoPoverljivi
		from Korisnici
		where (@IdKorisnika is null or IdKorisnika = @IdKorisnika) and
		      (@Aktivan is null or Aktivan = @Aktivan) and
			  (@IdOkruga is null or IdOkruga = @IdOkruga)

	set nocount off
end
go


go
if OBJECT_ID('kret_pred_ObrisiKretanjePredmeta','P') is not null
	drop procedure kret_pred_ObrisiKretanjePredmeta
go
/*
kret_pred_ObrisiKretanjePredmeta
ULAZ:
IZLAZ:
*/
create procedure kret_pred_ObrisiKretanjePredmeta(
	@IdKretanjaPredmeta smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		

		declare @IdLoga bigint

		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

		declare @Naziv nvarchar (200)

		select @Naziv = Naziv
		from KretanjaPredmeta
		where IdKretanjaPredmeta = @IdKretanjaPredmeta

		delete
		from KretanjaPredmeta
		where IdKretanjaPredmeta = @IdKretanjaPredmeta

		set @Poruka = 'Obrisano kretanje predmeta sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
		raiserror('Nemate prava pristupa', 14, 1)
	end
	
	set nocount off
end
go


go
if OBJECT_ID('kret_pred_SnimiKretanjePredmeta','P') is not null
	drop procedure kret_pred_SnimiKretanjePredmeta
go
/*
kret_pred_SnimiKretanjePredmeta
ULAZ:
IZLAZ:
*/
create procedure kret_pred_SnimiKretanjePredmeta(
	@IdKretanjaPredmeta smallint output,
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@Status char(1) = null,
	@Zapisnik bit = 0,
	@Primedba nvarchar(100) = null,
	@UnosRoka bit = null,
	@Oznaka char(3) = '',
	@NazivZaIstoriju nvarchar(200) = ''
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		
		
		declare @IdLoga bigint

			
		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)
		
		if not exists(select top(1) 1 from KretanjaPredmeta
						where IdKretanjaPredmeta = @IdKretanjaPredmeta)
		begin
			set @IdKretanjaPredmeta = isnull((select max(IdKretanjaPredmeta) + 1
									from KretanjaPredmeta), 1)

			insert into KretanjaPredmeta (
				IdKretanjaPredmeta,
				Oznaka,
				Naziv,
				NazivZaIstoriju,
				Napomena,
				Aktivan,
				Status,
				Zapisnik,
				Primedba,
				UnosRoka
			) values (
				@IdKretanjaPredmeta,
				@Oznaka,
				@Naziv,
				@NazivZaIstoriju,
				@Napomena,
				@Aktivan,
				@Status,
				@Zapisnik,
				@Primedba,
				@UnosRoka
			)			

			set @Poruka = 'Kreirano kretanje predmeta sa nazivom: ' + @Naziv + '.'

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
			
			update KretanjaPredmeta
			set Naziv = @Naziv,
			    NazivZaIstoriju = @NazivZaIstoriju,
				Napomena = @Napomena,
				Aktivan = @Aktivan,
				Status = @Status,
				Zapisnik = @Zapisnik,
				Primedba = @Primedba,
				UnosRoka = @UnosRoka,
				Oznaka = @Oznaka
			where IdKretanjaPredmeta = @IdKretanjaPredmeta

			set @Poruka = 'Izmenjeno kretanje predmeta sa nazivom: ' + @Naziv + '.'

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
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('kret_pred_VratiKretanjaPredmeta','P') is not null
	drop procedure kret_pred_VratiKretanjaPredmeta
go
/*
kret_pred_VratiKretanjaPredmeta
ULAZ:
IZLAZ:
*/
create procedure kret_pred_VratiKretanjaPredmeta(
	@IdKretanjaPredmeta smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select
			IdKretanjaPredmeta,
			Oznaka,
			Naziv,
			Napomena,
			Aktivan,
			Status,
			Zapisnik,
			Primedba,
			isnull(UnosRoka, 0) as UnosRoka,
			NazivZaIstoriju
		from KretanjaPredmeta
		where (@IdKretanjaPredmeta is null or IdKretanjaPredmeta = @IdKretanjaPredmeta) and
		      (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end
go


go
if OBJECT_ID('logovanje_OdlogujKorisnika','P') is not null
	drop procedure logovanje_OdlogujKorisnika
go
/*
logovanje_OdlogujKorisnika
ULAZ:
IZLAZ:
*/
create procedure logovanje_OdlogujKorisnika(
	@KorisnickoIme nvarchar(50)
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)
	declare @IdLoga bigint			
	declare @IdKorisnika int

	select @Sada = getdate()

	select @IdKorisnika = IdKorisnika 
	from Korisnici
	where KorisnickoIme = @KorisnickoIme

	update Korisnici
	set Guid = null
	where KorisnickoIme = @KorisnickoIme

	set @Poruka = 'Odlogovan korisnik.'

	set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

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

	set nocount off
end
go


go
if OBJECT_ID('logovanje_PromeniLozinkuKorisnika','P') is not null
	drop procedure logovanje_PromeniLozinkuKorisnika
go
/*
logovanje_PromeniLozinkuKorisnika
ULAZ:
IZLAZ:
*/
create procedure logovanje_PromeniLozinkuKorisnika(
	@IdKorisnika int,
	@StaraLozinka varbinary(8000),
	@NovaLozinka varbinary(8000)
) as
begin
	set nocount on
	
	if exists (select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Lozinka = @StaraLozinka)
	begin

		declare @Sada smalldatetime
		declare @IdLoga bigint
		declare @Poruka nvarchar(200)

		set @Sada = getdate()

		
		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

		update Korisnici
		set Korisnici.Lozinka = @NovaLozinka
		where IdKorisnika = @IdKorisnika and
		      Lozinka = @StaraLozinka
		
		set @Poruka = 'Promenjena lozinka korisnika.'

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
	    raiserror('Podaci nisu ispravni', 14, 1)
	end
	
	set nocount off
end
go


go
if OBJECT_ID('logovanje_UlogujKorisnika','P') is not null
	drop procedure dbo.logovanje_UlogujKorisnika
go
/*
logovanje_UlogujKorisnika
ULAZ:
IZLAZ:
*/
create procedure logovanje_UlogujKorisnika (
	@KorisnickoIme nvarchar(30),
	@Lozinka varbinary(8000),
	@Jezik nvarchar(10) = null
)
as
begin
	set nocount on

	declare @IdKorisnika int

	set @IdKorisnika = (SELECT TOP(1) IdKorisnika 
	                    from Korisnici 
						where KorisnickoIme = @KorisnickoIme and
						      Lozinka = @Lozinka and
							  Aktivan = 1)

	IF (@IdKorisnika is null)
	BEGIN
	
		raiserror('Podaci za logovanje nisu ispravni.' , 14, 1)

	END
	ELSE
	BEGIN
		declare @IdLoga bigint
		set @IdLoga = isnull((select MAX(IdLoga) + 1 from LogoviKorisnika where IdKorisnika = @IdKorisnika), 1)
		
		declare @Guid char(36)
		set @Guid = CAST(NEWID() AS CHAR(36))

		update Korisnici
		set Guid = @Guid,
		    Jezik = @Jezik
		where IdKorisnika = @IdKorisnika

		INSERT INTO [dbo].[LogoviKorisnika]
			   ([IdKorisnika]
			   ,[IdLoga]
			   ,[Vreme]
			   ,[Opis])
		 VALUES
			   (@IdKorisnika
			   ,@IdLoga
			   ,getdate()
			   ,'Ulogovan korisnik')

		SELECT [IdKorisnika]
		  ,case
			when K.Administracija = 1 then cast(0 as bit)
			else K.Inspektor
		   end as Inspektor
		  ,K.[IdOkruga]
		  ,K.[UnosNovogPredmeta]
		  ,K.[DozvolaRezervisanja]
		  ,K.[IzmenaPredmeta]
		  ,K.[BrisanjePredmeta]
		  ,K.[Administracija]
		  ,K.[PregledIzvestaja]
		  ,K.[SamoSvojePredmete]
		  ,K.[Email]
		  ,K.[Telefon]
		  ,K.[Jmbg]
		  ,K.[ImeIPrezime]
		  ,K.[Napomena]
		  ,K.[Guid]
		  ,K.IdOrgana
		  ,O.Napomena as NapomenaOkruga
		  ,K.StrogoPoverljivi
		FROM Korisnici as K
		left outer join Okruzi as O
		on O.IdOkruga = K.IdOkruga
		where K.IdKorisnika = @IdKorisnika

	END

	set nocount off
end
go


go
if OBJECT_ID('logovanje_VratiUlogovaneKorisnike','P') is not null
	drop procedure dbo.logovanje_VratiUlogovaneKorisnike
go

create procedure logovanje_VratiUlogovaneKorisnike
as
begin
	set nocount on

	SELECT K.[IdKorisnika]
	  ,K.[KorisnickoIme]
      ,case
	    when K.Administracija = 1 then cast(0 as bit)
		else K.Inspektor
	   end as Inspektor
      ,K.[IdOkruga]
      ,K.[UnosNovogPredmeta]
      ,K.[DozvolaRezervisanja]
      ,K.[IzmenaPredmeta]
      ,K.[BrisanjePredmeta]
      ,K.[Administracija]
      ,K.[PregledIzvestaja]
	  ,K.[SamoSvojePredmete]
      ,K.[Email]
      ,K.[Telefon]
      ,K.[Jmbg]
      ,K.[ImeIPrezime]
      ,K.[Napomena]
	  ,K.[Guid]
	  ,K.IdOrgana
	  ,K.Jezik
	  ,O.Napomena as NapomenaOkruga
	  ,K.StrogoPoverljivi
	FROM Korisnici as K
	left outer join Okruzi as O
	on O.IdOkruga = K.IdOkruga
	where K.Guid is not null

	set nocount off
end
go


go
if OBJECT_ID('mesta_ObrisiMesto','P') is not null
	drop procedure mesta_ObrisiMesto
go
/*
mesta_ObrisiMesto
ULAZ:
IZLAZ:
*/
create procedure mesta_ObrisiMesto(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@IdMesta int,
	@IdKorisnika int
) as
begin
	set nocount on

	if exists(select top(1) 1 from Predmeti where IdOkruga = IdOkruga and IdOpstine = @IdOpstine and IdMesta = @IdMesta)
	begin
		raiserror('Postoji predmet sa izabranim mestom. Nije moguce brisanje.', 14, 1)
	end
	else
	begin
		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
		begin

			delete Mesta
			where IdOkruga = @IdOkruga and
				  IdOpstine = @IdOpstine and
				  IdMesta = @IdMesta
		end
		else
		begin
			raiserror('Nemate prava pristupa.', 14, 1)
		end
	end

	set nocount off
end
go


go
if OBJECT_ID('mesta_SnimiMesto','P') is not null
	drop procedure mesta_SnimiMesto
go
/*
mesta_SnimiMesto
ULAZ:
IZLAZ:
*/
create procedure mesta_SnimiMesto(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@IdMesta int output,
	@Naziv nvarchar(200),
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Poruka nvarchar(200)

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
	begin
		if(not exists (select top(1) 1
					   from Mesta
					   where IdOkruga = @IdOkruga and
							 IdOpstine = @IdOpstine and
							 IdMesta = @IdMesta))
		begin

			if(exists (select top(1) 1
					   from Mesta
					   where IdOkruga = @IdOkruga and
							 IdOpstine = @IdOpstine and
							 Naziv = @Naziv and
							 Aktivan = 1))
			begin
				set @Poruka = 'Postoji mesto sa nazivom: ' + @Naziv + '. Nije moguce snimanje.'
				raiserror(@Poruka, 14, 1)
			end
			else
			begin

				set @IdMesta = isnull((select max(IdMesta) + 1
									   from Mesta
									   where IdOkruga = @IdOkruga and
											 IdOpstine = @IdOpstine), 1)

				insert into Mesta (
					IdOkruga,
					IdOpstine,
					IdMesta,
					Naziv,
					Aktivan
				) values (
					@IdOkruga,
					@IdOpstine,
					@IdMesta,
					@Naziv,
					@Aktivan
				)

			end
		end
		else
		begin
			if(exists (select top(1) 1
					   from Mesta
					   where IdOkruga = @IdOkruga and
							 IdOpstine = @IdOpstine and
							 Naziv = @Naziv and
							 IdMesta <> @IdMesta and
							 Aktivan = 1))
			begin
				set @Poruka = 'Postoji mesto sa nazivom: ' + @Naziv + '. Nije moguce snimanje.'
				raiserror(@Poruka, 14, 1)
			end
			else
			begin

				update Mesta
				set Naziv = @Naziv,
				    Aktivan = @Aktivan
				where IdOkruga = @IdOkruga and
					  IdOpstine = @IdOpstine and
					  IdMesta = @IdMesta

			end
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('mesta_VratiMesta','P') is not null
	drop procedure mesta_VratiMesta
go
/*
mesta_VratiMesta
ULAZ:
IZLAZ:
*/
create procedure mesta_VratiMesta(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@IdMesta int,
	@Aktivan bit
) as
begin
	set nocount on

	select IdMesta, Naziv, Aktivan
	from Mesta
	where IdOkruga = @IdOkruga and
	      IdOpstine = @IdOpstine and
		  (@IdMesta is null or IdMesta = @IdMesta) and
		  (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end
go


go
if OBJECT_ID('okrug_ObrisiOkrug','P') is not null
	drop procedure okrug_ObrisiOkrug
go
/*
okrug_ObrisiOkrug
ULAZ:
IZLAZ:
*/
create procedure okrug_ObrisiOkrug(
	@IdOkruga smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Okruzi where IdOkruga = @IdOkruga)
	begin
		raiserror('Izabrani okrug poseduje organe. Nije moguæe brisanje.', 14, 1)
	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
		begin		

			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

			declare @Naziv nvarchar (200)

			select @Naziv = Naziv
			from Okruzi
			where IdOkruga = @IdOkruga

			delete
			from Okruzi
			where IdOkruga = @IdOkruga

			set @Poruka = 'Obrisan okrug sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
	
	
	set nocount off
end
go


go

if OBJECT_ID('okrug_SnimiOkrug','P') is not null
	drop procedure okrug_SnimiOkrug
go
/*
okrug_SnimiOkrug
ULAZ:
IZLAZ:
*/
create procedure okrug_SnimiOkrug(
	@IdOkruga smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
	@Mesto nvarchar(200) = null,
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin
		
		if exists(select top(1) 1 from Okruzi where IdOkruga <> isnull(@IdOkruga, 0) and Oznaka = @Oznaka and Aktivan = 1 and @Aktivan = 1)
		begin
		    set @Poruka = 'Postoji okrug sa oznakom: ' + @Oznaka + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Okruzi
							where IdOkruga = @IdOkruga)
			begin
				set @IdOkruga = isnull((select max(IdOkruga) + 1
										from Okruzi), 1)

				insert into Okruzi (
					IdOkruga,
					Oznaka,
					Naziv,
					Mesto,
					Napomena,
					Aktivan
				) values (
					@IdOkruga,
					@Oznaka,
					@Naziv,
					isnull(@Mesto,'-'),
					@Napomena,
					@Aktivan
				)			

				set @Poruka = 'Kreiran okrug sa nazivom: ' + @Naziv + '.'

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
				update Okruzi
				set Oznaka = @Oznaka,
				    Naziv = @Naziv,
					Mesto = isnull(@Mesto, Mesto),
					Napomena = @Napomena,
					Aktivan = @Aktivan
				where IdOkruga = @IdOkruga

				set @Poruka = 'Izmenjen okrug sa nazivom: ' + @Naziv + '.'

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
		end
	end
	else
	begin
		
		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga = @IdOkruga)
		begin
			update Okruzi
			set Napomena = @Napomena
			where IdOkruga = @IdOkruga

			set @Poruka = 'Izmenjen okrug sa nazivom: ' + @Naziv + '.'

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

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

	set nocount off
end
go


go
if OBJECT_ID('okrug_VratiOkruge','P') is not null
	drop procedure okrug_VratiOkruge
go
/*
okrug_VratiOkruge
ULAZ:
IZLAZ:
*/
create procedure okrug_VratiOkruge(
	@IdOkruga smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOkruga, Oznaka, Naziv, Napomena, Aktivan, Mesto
		from Okruzi
		where (@IdOkruga is null or IdOkruga = @IdOkruga) and
		      (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end
go


go

if OBJECT_ID('opstina_ObrisiOpstinu','P') is not null
	drop procedure opstina_ObrisiOpstinu
go
/*
opstina_ObrisiOpstinu
ULAZ:
IZLAZ:
*/
create procedure opstina_ObrisiOpstinu(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Predmeti where IdOkruga = IdOkruga and IdOpstine = @IdOpstine)
	begin
		raiserror('Izabrana opština poseduje predmete. Nije moguce brisanje.', 14, 1)
	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
		begin		

			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

			declare @Naziv nvarchar (200)

			select @Naziv = Naziv
			from Opstine
			where IdOkruga = @IdOkruga and
			      IdOpstine = @IdOpstine
			
			delete Mesta
			where IdOkruga = @IdOkruga and
				  IdOpstine = @IdOpstine

			delete
			from Opstine
			where IdOkruga = @IdOkruga and
			      IdOpstine = @IdOpstine

			set @Poruka = 'Obrisana opština sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
	
	
	set nocount off
end

go
go


go

if OBJECT_ID('opstina_SnimiOpstinu','P') is not null
	drop procedure opstina_SnimiOpstinu
go
/*
opstina_SnimiOpstinu
ULAZ:
IZLAZ:
*/
create procedure opstina_SnimiOpstinu(
	@IdOkruga smallint,
	@IdOpstine smallint output,
	@PostanskiBroj char(5),
	@Naziv nvarchar(200),
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and isnull(IdOkruga, @IdOkruga) = @IdOkruga)
	begin		
		if exists(select top(1) 1 from Opstine where IdOkruga = @IdOkruga and IdOpstine <> isnull(@IdOpstine, 0) and Naziv = @Naziv and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji opština sa nazivom: ' + @Naziv + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Opstine
							where IdOkruga = @IdOkruga and
							   	  IdOpstine = @IdOpstine)
			begin
				set @IdOpstine = isnull((select max(IdOpstine) + 1
									   from Opstine
									   where IdOkruga = @IdOkruga), 1)

				insert into Opstine (
					IdOkruga,
					IdOpstine,
					Naziv,
					Aktivan,
					PostanskiBroj
				) values (
					@IdOkruga,
					@IdOpstine,
					@Naziv,
					@Aktivan,
					@PostanskiBroj
				)			

				set @Poruka = 'Kreirana opština sa nazivom: ' + @Naziv + '.'

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
				update Opstine
				set Naziv = @Naziv,
					Aktivan = @Aktivan,
					PostanskiBroj = @PostanskiBroj
				where IdOkruga = @IdOkruga and
					  IdOpstine = @IdOpstine

				set @Poruka = 'Izmenjena opština sa nazivom: ' + @Naziv + '.'

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
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go

if OBJECT_ID('opstina_VratiOpstine','P') is not null
	drop procedure opstina_VratiOpstine
go
/*
opstina_VratiOpstine
ULAZ:
IZLAZ:
*/
create procedure opstina_VratiOpstine(
	@IdOkruga smallint,
	@IdOpstine smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOkruga, IdOpstine, PostanskiBroj, Naziv, Aktivan
		from Opstine
		where (@IdOkruga is null or IdOkruga = @IdOkruga) and
		      (@IdOpstine is null or IdOpstine = @IdOpstine) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by Naziv

	set nocount off
end
go


go
if OBJECT_ID('organ_ObrisiOrgan','P') is not null
	drop procedure organ_ObrisiOrgan
go
/*
organ_ObrisiOrgan
ULAZ:
IZLAZ:
*/
create procedure organ_ObrisiOrgan(
	@IdOrgana smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	
	if exists(select top(1) 1 from Klase where IdOrgana = @IdOrgana)
	begin
		raiserror('Izabrani organ poseduje klase. Nije moguæe brisanje.', 14, 1)
	end
	else
	begin

		if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
		begin		

			declare @IdLoga bigint

			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)

			declare @Naziv nvarchar (200)

			select @Naziv = Naziv
			from Organi
			where IdOrgana = @IdOrgana

			delete
			from Organi
			where IdOrgana = @IdOrgana

			set @Poruka = 'Obrisan organ sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
	
	
	set nocount off
end
go


go
if OBJECT_ID('organ_SnimiOrgan','P') is not null
	drop procedure organ_SnimiOrgan
go
/*
organ_SnimiOrgan
ULAZ:
IZLAZ:
*/
create procedure organ_SnimiOrgan(
	@IdOrgana smallint output,
	@Oznaka char(3),
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		
		if exists(select top(1) 1 from Organi where IdOrgana <> isnull(@IdOrgana, 0) and Oznaka = @Oznaka and Aktivan = 1)
		begin
		    set @Poruka = 'Postoji organ sa oznakom: ' + @Oznaka + '. Nije moguæe snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from Organi
							where IdOrgana = @IdOrgana)
			begin
				set @IdOrgana = isnull((select max(IdOrgana) + 1
										from Organi), 1)

				insert into Organi (
					IdOrgana,
					Oznaka,
					Naziv,
					Napomena,
					Aktivan
				) values (
					@IdOrgana,
					@Oznaka,
					@Naziv,
					@Napomena,
					@Aktivan
				)			

				set @Poruka = 'Kreiran organ sa nazivom: ' + @Naziv + '.'

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
				update Organi
				set Oznaka = @Oznaka,
					Naziv = @Naziv,
					Napomena = @Napomena,
					Aktivan = @Aktivan
				where IdOrgana = @IdOrgana

				set @Poruka = 'Izmenjen organ sa nazivom: ' + @Naziv + '.'

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
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('organ_VratiOrgane','P') is not null
	drop procedure organ_VratiOrgane
go
/*
organ_VratiOrgane
ULAZ:
IZLAZ:
*/
create procedure organ_VratiOrgane(
	@IdOrgana smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdOrgana, Oznaka, Naziv, Napomena, Aktivan
		from Organi
		where (@IdOrgana is null or IdOrgana = @IdOrgana) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by Oznaka

	set nocount off
end
go


go
if OBJECT_ID('organ_VratiOrganeInspektora','P') is not null
	drop procedure organ_VratiOrganeInspektora
go
/*
organ_VratiOrganeInspektora
ULAZ:
IZLAZ:
*/
create procedure organ_VratiOrganeInspektora(
	@IdOrgana smallint,
	@Aktivan bit,
	@IdKorisnika int
) as
begin
	set nocount on

		select IdOrgana, Oznaka, Naziv, Napomena, Aktivan
		from Organi
		where (@IdOrgana is null or IdOrgana = @IdOrgana) and
		      (@Aktivan is null or Aktivan = @Aktivan) and
			  (IdOrgana in (select IdOrgana from KlaseInspektora where IdKorisnika = @IdKorisnika))
		order by Oznaka

	set nocount off
end
go


go
if OBJECT_ID('precica_SnimiPrecicu','P') is not null
	drop procedure precica_SnimiPrecicu
go
/*
precica_SnimiPrecicu
ULAZ:
IZLAZ:
*/
create procedure precica_SnimiPrecicu(
	@IdKorisnika int,
	@IdPrecice tinyint,
	@Tekst nvarchar(2000)
) as
begin
    
	set nocount on
		update PreciceKorisnika
		set Tekst = @Tekst
		where IdKorisnika = @IdKorisnika and
		      IdPrecice = @IdPrecice
	set nocount off
end
go


go
if OBJECT_ID('precica_VratiPreciceKorisnika','P') is not null
	drop procedure precica_VratiPreciceKorisnika
go
/*
precica_VratiPreciceKorisnika
ULAZ:
IZLAZ:
*/
create procedure precica_VratiPreciceKorisnika(
	@IdKorisnika int
) as
begin
	set nocount on
	
	select IdPrecice, Tekst
	from PreciceKorisnika
	where IdKorisnika = @IdKorisnika
	
	set nocount off
end
go


go
if OBJECT_ID('precica_VratiPrecicu','P') is not null
	drop procedure precica_VratiPrecicu
go
/*
precica_VratiPrecicu
ULAZ:
IZLAZ:
*/
create procedure precica_VratiPrecicu(
	@IdKorisnika int,
	@IdPrecice tinyint
) as
begin
	set nocount on
	
	select Tekst
	from PreciceKorisnika
	where IdKorisnika = @IdKorisnika and
	      IdPrecice = @IdPrecice
	
	set nocount off
end
go


go
if OBJECT_ID('predmet_AktivirajPredmet','P') is not null
	drop procedure predmet_AktivirajPredmet
go
/*
predmet_AktivirajPredmet
ULAZ:
IZLAZ:
*/
create procedure predmet_AktivirajPredmet(
	@IdPredmeta bigint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	declare @IdOkruga smallint
	set @IdOkruga = (select IdOkruga from Predmeti where IdPredmeta = @IdPredmeta)
	
	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga = @IdOkruga)
	begin
		if exists(select top(1) 1 from Predmeti where IdPredmeta = @IdPredmeta and Status = 'B')
		begin
		    declare @IdKretanja smallint

			set @IdKretanja = isnull((select max(IdKretanja) + 1
									from IstorijaPredmeta
									where IdPredmeta = @IdPredmeta), 1)

			insert into IstorijaPredmeta (
			   IdPredmeta,
			   IdKretanja,
			   Vreme,
			   IdKorisnika,
			   Opis,
			   Napomena
			)
			 select
				P.IdPredmeta
				,@IdKretanja
				,@Sada
				,@IdKorisnika
				,'Aktiviran predmet. Promenjen status predmeta sa ' + isnull(P.Status, 'B') + ' na O.'
				,null
			from Predmeti as P
			where P.IdPredmeta = @IdPredmeta and
			      P.Status = 'B'

			update Predmeti
			set Status = 'O'
			where IdPredmeta = @IdPredmeta and
			      Status = 'B'
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	
	set nocount off
end
go


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
go


go
if OBJECT_ID('predmet_ObrisiPredmet','P') is not null
	drop procedure predmet_ObrisiPredmet
go
/*
predmet_ObrisiPredmet
ULAZ:
IZLAZ:
*/
create procedure predmet_ObrisiPredmet(
	@IdPredmeta bigint,
	@IdKorisnika int,
	@RazlogBrisanja nvarchar(2000)
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	declare @IdOkruga smallint
	set @IdOkruga = (select IdOkruga from Predmeti where IdPredmeta = @IdPredmeta)
	
	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and BrisanjePredmeta = 1 and IdOkruga = @IdOkruga)
	begin
		if exists(select top(1) 1 from Predmeti where IdPredmeta = @IdPredmeta)
		begin
		    declare @IdLoga bigint
		    declare @IdKretanja smallint

			set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

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
				   ,'Obrisan predmet. Promenjen status predmeta sa ' + isnull(P.Status, 'O') + ' na B.'
				   ,@RazlogBrisanja
			FROM Predmeti as P
			where P.IdPredmeta = @IdPredmeta

			update Predmeti
			set Status = 'B'
			where IdPredmeta = @IdPredmeta
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	
	set nocount off
end
go


go

if OBJECT_ID('predmet_PredmetPripadaKlasiInspektora','P') is not null
	drop procedure predmet_PredmetPripadaKlasiInspektora
go
/*
predmet_PredmetPripadaKlasiInspektora
ULAZ:
IZLAZ:
*/
create procedure predmet_PredmetPripadaKlasiInspektora(
	@IdPredmeta bigint,
	@IdKorisnika int
) as
begin
	set nocount on

	select 
		case
		 when K.IdKorisnika is not null then cast(1 as bit)
		 else cast(0 as bit)
		end as Pripada
	from Predmeti as P

	left outer join KlaseInspektora as K
	on K.IdOkruga = P.IdOkruga and
	   K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase and
	   K.IdKorisnika = @IdKorisnika

	where IdPredmeta = @IdPredmeta
	     

	set nocount off
end

go
go


﻿go
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
go


go

if OBJECT_ID('predmet_SnimiAktivnostPredmeta','P') is not null
	drop procedure predmet_SnimiAktivnostPredmeta
go
/*
predmet_SnimiAktivnostPredmeta
ULAZ:
IZLAZ:
*/
create procedure predmet_SnimiAktivnostPredmeta(
	@IdPredmeta bigint,
	@IdKorisnika int,
	@Opis nvarchar(2000)
) as
begin
	set nocount on

	declare @Sada smalldatetime
	declare @IdKretanja smallint

	select @Sada = getdate()

	set @IdKretanja = isnull((select max(IdKretanja) + 1
							  from IstorijaPredmeta
							  where IdPredmeta = @IdPredmeta), 1)

	insert into IstorijaPredmeta (
		IdPredmeta,
		IdKretanja,
		IdKretanjaPredmeta,
		Vreme,
		IdKorisnika,
		Opis,
		Napomena,
		Broj,
		DatumBrisanja,
		Obrisao,
		SamoAdministrator
	) values (
		@IdPredmeta,
		@IdKretanja,
		null,
		@Sada,
		@IdKorisnika,
		@Opis,
		null,
		null,
		null,
		null,
		1
	)

	set nocount off
end

go
go


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

			set @Greska = 'Nije moguce snimanje. Prekorac�en je maskimalni broj predmeta dodeljenih inspektoru. Inspektor ima ' + cast(isnull(@BrojPredmetaZaProveru, 0) as nvarchar) + ' aktivnih'
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

				set @Greska = 'Nije moguce snimanje. Prekorac�en je maskimalni broj aktivnih predmeta u godini dodeljenih inspektoru. Inspektor ima ' + cast(isnull(@BrojPredmetaZaProveru, 0) as nvarchar) + ' aktivnih predmeta u godini'
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

					set @Greska = 'Nije moguce snimanje. Prekorac�en je maskimalni broj rezervisanih predmeta dodeljenih inspektoru. Inspektor ima ' + 
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
go


go

if OBJECT_ID('predmet_VratiBrojPredmeta','P') is not null
	drop procedure predmet_VratiBrojPredmeta
go
/*
predmet_VratiBrojPredmeta
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiBrojPredmeta(
	@IdPredmeta bigint
) as
begin
	set nocount on

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

	set nocount off
end

go
go


go
if OBJECT_ID('predmet_VratiGodine','P') is not null
	drop procedure predmet_VratiGodine
go
/*
predmet_VratiGodine
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiGodine
as
begin
	set nocount on
	
	select year(VremeKreiranja) as Godina
	from Predmeti
	group by year(VremeKreiranja)
	order by year(VremeKreiranja)
	
	set nocount off
end
go


go

if OBJECT_ID('predmet_VratiIdPredmetaPrekoBroja','P') is not null
	drop procedure predmet_VratiIdPredmetaPrekoBroja
go
/*
predmet_VratiIdPredmetaPrekoBroja
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiIdPredmetaPrekoBroja(
	@BrojPredmeta nvarchar(200)
) as
begin
	set nocount on

	select P.IdPredmeta
	from Predmeti as P with (nolock)

	join Okruzi as O with (nolock)
	on O.IdOkruga = P.IdOkruga

	join Organi as ORG with (nolock)
	on ORG.IdOrgana = P.IdOrgana

	join Klase as K with (nolock)
	on K.IdOkruga = P.IdOkruga and
	   K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase

	join Jedinice as J with (nolock)
	on J.IdOrgana = P.IdOrgana and
	   J.IdJedinice = P.IdJedinice
	
	where (O.Oznaka + '-' + 
		   ORG.Oznaka + '-' + 
		   K.Oznaka + '-' + 
		   RIGHT('000000' + cast(P.BrojPredmeta as nvarchar), 6) + '/' +
		   cast(YEAR(P.VremeRezervacije) as nvarchar) + '-' + 
		   J.Oznaka) = @BrojPredmeta

	set nocount off
end

go
go


go

if OBJECT_ID('predmet_VratiPovezanePredmete','P') is not null
	drop procedure predmet_VratiPovezanePredmete
go
/*
predmet_VratiPovezanePredmete
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiPovezanePredmete(
	@IdPredmeta bigint
) as
begin
	set nocount on

	select
		P.IdPredmeta,
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
	
	where P.IdNadredjenogPredmeta = @IdPredmeta

	set nocount off
end

go
go


go
if OBJECT_ID('predmet_VratiPredmet','P') is not null
	drop procedure predmet_VratiPredmet
go
/*
predmet_VratiPredmet
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiPredmet(
	@IdPredmeta bigint
) as
begin
	set nocount on

		select P.IdPredmeta
			  ,P.IdNadredjenogPredmeta
			  ,P.BrojPredmeta
			  ,O.IdOkruga
			  ,O.Naziv as NazivOkruga
			  ,O.Oznaka as OznakaOkruga
			  ,P.IdOrgana
			  ,ORG.Oznaka as OznakaOrgana
			  ,P.IdKlase
			  ,K.Oznaka as OznakaKlase
			  ,P.IdJedinice
			  ,J.Oznaka as OznakaJedinice
			  ,P.IdOpstine
			  ,OP.Naziv as NazivOpstine
			  ,P.IdKreatora
			  ,KOR.KorisnickoIme + ' (' + KOR.ImeIPrezime + ')' as NazivKreatora
			  ,P.PodnosilacJeInspektor
			  ,P.PodnosilacJedinstveniBroj
			  ,P.Podnosilac
			  ,P.LiceKontroleJedinstveniBroj
			  ,P.LiceKontrole
			  ,case
			    when P.Status = 'R' then getdate()
				else P.VremeKreiranja
			   end as VremeKreiranja
			  ,P.VremeKreiranja as StvarnoVremeKreiranja
			  ,P.VremeRezervacije
			  ,YEAR(P.VremeRezervacije) as Godina
			  ,P.IdVrstePredmeta
			  ,VP.Naziv as NazivVrstePredmeta
			  ,VP.Oznaka as OznakaVrstePredmeta
			  ,P.IdInspektora
			  ,INS.ImeIPrezime as NazivInspektora
			  ,P.Prilog
			  ,P.Sadrzaj
			  ,P.IdTakse
			  ,P.StraniBroj
			  ,P.Napomena
			  ,P.Status
			  ,P.PutanjaArhiviranjaDokumenata	
			  ,P.IdMesta
			  ,M.Naziv as NazivMesta
			  ,P.StrogoPoverljiv
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

		left outer join Mesta as M
		on M.IdOkruga = P.IdOkruga and
		   M.IdOpstine = P.IdOpstine and
		   M.IdMesta = P.IdMesta

		left outer join VrstePredmeta as VP
		on VP.IdVrstePredmeta = P.IdVrstePredmeta

		join Korisnici as KOR
		on KOR.IdKorisnika = P.IdKreatora

		left outer join Korisnici as INS
		on INS.IdKorisnika = P.IdInspektora

		left outer join Opstine as OP
		on OP.IdOkruga = P.IdOkruga and
		   OP.IdOpstine = P.IdOpstine

		where P.IdPredmeta = @IdPredmeta

	set nocount off
end
go


go

if OBJECT_ID('predmet_VratiSledeciSlobodanBrojPredmeta','P') is not null
	drop procedure predmet_VratiSledeciSlobodanBrojPredmeta
go
/*
predmet_VratiSledeciSlobodanBrojPredmeta
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiSledeciSlobodanBrojPredmeta(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint
) as
begin
	set nocount on

	declare @Sada smalldatetime
	select @Sada = getdate()

	select isnull(
				  (select max(BrojPredmeta) + 1
				   from Predmeti
				   where YEAR(VremeRezervacije) = YEAR(@Sada) and
				         IdOkruga = @IdOkruga and
						 IdOrgana = @IdOrgana and
						 IdKlase = @IdKlase
						 ),
				   1) as SledeciBroj
	
	

	set nocount off
end

go
go


go
if OBJECT_ID('pretraga_VratiObrisanePredmete','P') is not null
	drop procedure pretraga_VratiObrisanePredmete
go
/*
pretraga_VratiObrisanePredmete
ULAZ:
IZLAZ:
*/
create procedure pretraga_VratiObrisanePredmete(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@OznakaKlase char(3),
	@BrojPredmeta int,
	@Godina int,
	@IdJedinice smallint,
	@OznakaJedinice char(3),
	@IdKorisnika int
) as
begin
	set nocount on

	if(not exists (select top(1) 1
	               from Korisnici
				   where IdKorisnika = @IdKorisnika and
				         IdOkruga is not null and
						 Administracija = 1))
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end
	else
	begin
		declare @Sada smalldatetime
		select @Sada = getdate()

		declare @IdKorisnikaSvojihPredmeta int

		select @IdKorisnikaSvojihPredmeta = IdKorisnika
		from Korisnici
		where IdKorisnika = @IdKorisnika and SamoSvojePredmete = 1

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
			   P.Sadrzaj
		from Predmeti as P

		join KlaseInspektora as KI
		on KI.IdOkruga = P.IdOkruga and
		   KI.IdOrgana = P.IdOrgana and
		   KI.IdKlase = P.IdKlase and
		   KI.IdKorisnika = @IdKorisnika

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
	   
		join Jedinice as J
		on J.IdOrgana = P.IdOrgana and
			J.IdJedinice = P.IdJedinice

		where (@IdOkruga is null or P.IdOkruga = @IdOkruga) and
			  (@IdOrgana is null or P.IdOrgana = @IdOrgana) and

			  (@IdKlase is null or P.IdKlase = @IdKlase) and
			  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and

			  (@BrojPredmeta is null or P.BrojPredmeta = @BrojPredmeta) and
			  (@Godina is null or year(P.VremeRezervacije) = @Godina) and
			  
			  (@IdJedinice is null or P.IdJedinice = @IdJedinice) and
			  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
			  
			  (@IdKorisnikaSvojihPredmeta is null or P.IdKreatora = @IdKorisnikaSvojihPredmeta or P.IdInspektora = @IdKorisnikaSvojihPredmeta) and
			  P.Status = 'B'
		order by OK.Oznaka, OG.Oznaka, KL.Oznaka, P.BrojPredmeta
	end

	set nocount off
end
go


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
go


go
if OBJECT_ID('pretraga_VratiPredmeteRokovnika','P') is not null
	drop procedure pretraga_VratiPredmeteRokovnika
go
/*
pretraga_VratiPredmeteRokovnika
ULAZ:
IZLAZ:
*/
create procedure pretraga_VratiPredmeteRokovnika(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@OznakaKlase char(3),
	@BrojPredmeta int,
	@Godina int,
	@IdJedinice smallint,
	@OznakaJedinice char(3),
	@IdKorisnika int
) as
begin
	set nocount on

	if(not exists (select top(1) 1
	               from Korisnici
				   where IdKorisnika = @IdKorisnika and
				         IdOkruga is not null and
						 Administracija = 1))
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end
	else
	begin
		declare @Sada smalldatetime
		select @Sada = getdate()

		declare @IdKorisnikaSvojihPredmeta int

		select @IdKorisnikaSvojihPredmeta = IdKorisnika
		from Korisnici
		where IdKorisnika = @IdKorisnika and SamoSvojePredmete = 1

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
			   P.Sadrzaj
		from Predmeti as P

		join KlaseInspektora as KI
		on KI.IdOkruga = P.IdOkruga and
		   KI.IdOrgana = P.IdOrgana and
		   KI.IdKlase = P.IdKlase and
		   KI.IdKorisnika = @IdKorisnika

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
	   
		join Jedinice as J
		on J.IdOrgana = P.IdOrgana and
			J.IdJedinice = P.IdJedinice

		where (@IdOkruga is null or P.IdOkruga = @IdOkruga) and
			  (@IdOrgana is null or P.IdOrgana = @IdOrgana) and

			  (@IdKlase is null or P.IdKlase = @IdKlase) and
			  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and

			  (@BrojPredmeta is null or P.BrojPredmeta = @BrojPredmeta) and
			  (@Godina is null or year(P.VremeRezervacije) = @Godina) and
			  
			  (@IdJedinice is null or P.IdJedinice = @IdJedinice) and
			  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
			  
			  (@IdKorisnikaSvojihPredmeta is null or P.IdKreatora = @IdKorisnikaSvojihPredmeta or P.IdInspektora = @IdKorisnikaSvojihPredmeta) and
			  P.Status = 'D'
		order by OK.Oznaka, OG.Oznaka, KL.Oznaka, P.BrojPredmeta
	end

	set nocount off
end
go


go
if OBJECT_ID('server_Start','P') is not null
	drop procedure server_Start
go

create procedure server_Start(
	@PromenaDatumaPredmeta bit
) as
begin
	set nocount on

	if (not exists (select TOP(1) 1 from PodesavanjeServera where Id = 1))
	begin

		INSERT INTO [dbo].[PodesavanjeServera]
			   ([Id]
			   ,[DozvoljenoMenjanjeDatuma]
			   ,[BrojRestarta]
			   ,[DatumPoslednjegRestarta])
		 VALUES
			   (1
			   ,@PromenaDatumaPredmeta
			   ,1
			   ,getdate())

	end
	else
	begin

		update PodesavanjeServera
		set DozvoljenoMenjanjeDatuma = @PromenaDatumaPredmeta,
		    BrojRestarta = BrojRestarta + 1,
			DatumPoslednjegRestarta = getdate()
		where Id = 1

	end

	set nocount off
end
go


go
if OBJECT_ID('taksa_ObrisiTaksu','P') is not null
	drop procedure taksa_ObrisiTaksu
go
/*
taksa_ObrisiTaksu
ULAZ:
IZLAZ:
*/
create procedure taksa_ObrisiTaksu(
	@IdTakse smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		

		declare @IdLoga bigint

		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

		declare @Naziv nvarchar (200)

		select @Naziv = Naziv
		from Takse
		where IdTakse = @IdTakse

		delete
		from Takse
		where IdTakse = @IdTakse

		set @Poruka = 'Obrisana taksa sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
	
	set nocount off
end
go


go
if OBJECT_ID('taksa_SnimiTaksu','P') is not null
	drop procedure taksa_SnimiTaksu
go
/*
taksa_SnimiTaksu
ULAZ:
IZLAZ:
*/
create procedure taksa_SnimiTaksu(
	@IdTakse smallint output,
	@Naziv nvarchar(200),
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@OznakaZaStampu nvarchar(30) = null
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		
		
		declare @IdLoga bigint

			
		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)
		
		if not exists(select top(1) 1 from Takse
						where IdTakse = @IdTakse)
		begin
			set @IdTakse = isnull((select max(IdTakse) + 1
									from Takse), 1)

			insert into Takse (
				IdTakse,
				Naziv,
				Napomena,
				Aktivan,
				OznakaZaStampu
			) values (
				@IdTakse,
				@Naziv,
				@Napomena,
				@Aktivan,
				@OznakaZaStampu
			)			

			set @Poruka = 'Kreirana taksa sa nazivom: ' + @Naziv + '.'

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
			update Takse
			set Naziv = @Naziv,
				Napomena = @Napomena,
				Aktivan = @Aktivan,
				OznakaZaStampu = @OznakaZaStampu
			where IdTakse = @IdTakse

			set @Poruka = 'Izmenjena taksa sa nazivom: ' + @Naziv + '.'

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
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('taksa_VratiTakse','P') is not null
	drop procedure taksa_VratiTakse
go
/*
taksa_VratiTakse
ULAZ:
IZLAZ:
*/
create procedure taksa_VratiTakse(
	@IdTakse smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdTakse, Naziv, Napomena, Aktivan, OznakaZaStampu
		from Takse
		where (@IdTakse is null or IdTakse = @IdTakse) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by IdTakse

	set nocount off
end
go


go
if OBJECT_ID('vrsta_pred_ObrisiVrstuPredmeta','P') is not null
	drop procedure vrsta_pred_ObrisiVrstuPredmeta
go
/*
vrsta_pred_ObrisiVrstuPredmeta
ULAZ:
IZLAZ:
*/
create procedure vrsta_pred_ObrisiVrstuPredmeta(
	@IdVrstePredmeta smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()
	

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin		

		declare @IdLoga bigint

		set @IdLoga = isnull((select max(IdLoga) + 1
								from LogoviKorisnika
								where IdKorisnika = @IdKorisnika), 1)

		declare @Naziv nvarchar (200)

		select @Naziv = Naziv
		from VrstePredmeta
		where IdVrstePredmeta = @IdVrstePredmeta

		delete
		from VrstePredmeta
		where IdVrstePredmeta = @IdVrstePredmeta

		set @Poruka = 'Obrisana taksa sa nazivom: ' + isnull(@Naziv, 'ne postoji') + '.'

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
	
	set nocount off
end
go


go
if OBJECT_ID('vrsta_pred_SnimiVrstuPredmeta','P') is not null
	drop procedure vrsta_pred_SnimiVrstuPredmeta
go
/*
vrsta_pred_SnimiVrstuPredmeta
ULAZ:
IZLAZ:
*/
create procedure vrsta_pred_SnimiVrstuPredmeta(
	@IdVrstePredmeta smallint output,
	@Naziv nvarchar(200),
	@Oznaka char(3) = null,
	@Napomena nvarchar(2000),
	@Aktivan bit,
	@IdKorisnika int,
	@Rok smallint = null,
	@OznakaZaStampu nvarchar(30) = null
) as
begin
	set nocount on

	declare @Sada smalldatetime

	declare @Poruka nvarchar(200)

	select @Sada = getdate()

	if exists(select top(1) 1 from Korisnici where IdKorisnika = @IdKorisnika and Administracija = 1 and IdOkruga is null)
	begin
		if exists(select top(1) 1 from VrstePredmeta where IdVrstePredmeta <> isnull(@IdVrstePredmeta, 0) and Oznaka = @Oznaka and Aktivan = 1 and @Aktivan = 1)
		begin
		    set @Poruka = 'Postoji vrsta predmeta sa oznakom: ' + @Oznaka + '. Nije moguće snimanje.'
			raiserror(@Poruka, 14, 1)
		end
		else		
		begin
			declare @IdLoga bigint

			
			set @IdLoga = isnull((select max(IdLoga) + 1
									from LogoviKorisnika
									where IdKorisnika = @IdKorisnika), 1)
		
			if not exists(select top(1) 1 from VrstePredmeta
							where IdVrstePredmeta = @IdVrstePredmeta)
			begin
				set @IdVrstePredmeta = isnull((select max(IdVrstePredmeta) + 1
										from VrstePredmeta), 1)

				insert into VrstePredmeta (
					IdVrstePredmeta,
					Oznaka,
					Naziv,
					Rok,
					Napomena,
					Aktivan,
					OznakaZaStampu
				) values (
					@IdVrstePredmeta,
					@Oznaka,
					@Naziv,
					@Rok,
					@Napomena,
					@Aktivan,
					@OznakaZaStampu
				)			

				set @Poruka = 'Kreirana vrsta predmeta sa nazivom: ' + @Naziv + '.'

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
				update VrstePredmeta
				set Naziv = @Naziv,
				    Oznaka = @Oznaka,
					Rok = @Rok,
					Napomena = @Napomena,
					Aktivan = @Aktivan,
					OznakaZaStampu = @OznakaZaStampu
				where IdVrstePredmeta = @IdVrstePredmeta

				set @Poruka = 'Izmenjena vrsta predmeta sa nazivom: ' + @Naziv + '.'

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
		end
	end
	else
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end

	set nocount off
end
go


go
if OBJECT_ID('vrsta_pred_VratiVrstePredmeta','P') is not null
	drop procedure vrsta_pred_VratiVrstePredmeta
go
/*
vrsta_pred_VratiVrstePredmeta
ULAZ:
IZLAZ:
*/
create procedure vrsta_pred_VratiVrstePredmeta(
	@IdVrstePredmeta smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdVrstePredmeta, Naziv, Oznaka, Napomena, Aktivan, Rok, OznakaZaStampu
		from VrstePredmeta
		where (@IdVrstePredmeta is null or IdVrstePredmeta = @IdVrstePredmeta) and
		      (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end
go


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
go


