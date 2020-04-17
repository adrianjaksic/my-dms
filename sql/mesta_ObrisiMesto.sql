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