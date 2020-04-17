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