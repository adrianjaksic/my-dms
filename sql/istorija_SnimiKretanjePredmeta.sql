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