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