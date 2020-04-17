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