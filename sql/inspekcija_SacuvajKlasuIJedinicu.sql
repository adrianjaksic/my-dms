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