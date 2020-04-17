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