go
if OBJECT_ID('jedinica_VratiSveJedinice','P') is not null
	drop procedure jedinica_VratiSveJedinice
go

create procedure jedinica_VratiSveJedinice as
begin
	set nocount on

	select J.Oznaka, MIN(J.Naziv) as Naziv
	from Jedinice as J
	where J.Aktivan = 1
	group by J.Oznaka
	order by RIGHT('000' + J.Oznaka, 3)

	set nocount off
end