go
if OBJECT_ID('jedinica_VratiJedinice','P') is not null
	drop procedure jedinica_VratiJedinice
go

create procedure jedinica_VratiJedinice(
	@IdOrgana smallint,
	@IdJedinice smallint,
	@Aktivan bit
) as
begin
	set nocount on

	select J.IdOrgana, 
	       J.IdJedinice, 
		   J.Oznaka, 
		   J.Naziv, 
		   J.Napomena, 
		   J.Aktivan, 
		   J.Nadleznost
	from Jedinice as J
	where (@IdOrgana is null or J.IdOrgana = @IdOrgana) and
		  (@IdJedinice is null or J.IdJedinice = @IdJedinice) and
		  (@Aktivan is null or J.Aktivan = @Aktivan)
	order by RIGHT('000' + J.Oznaka, 3)

	set nocount off
end