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
		    set @Poruka = 'Postoji inspekcija sa oznakom: ' + @Naziv + '. Nije moguæe snimanje.'
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