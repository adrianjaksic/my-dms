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