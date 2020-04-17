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