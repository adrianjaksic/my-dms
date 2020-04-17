go
if OBJECT_ID('predmet_VratiGodine','P') is not null
	drop procedure predmet_VratiGodine
go
/*
predmet_VratiGodine
ULAZ:
IZLAZ:
*/
create procedure predmet_VratiGodine
as
begin
	set nocount on
	
	select year(VremeKreiranja) as Godina
	from Predmeti
	group by year(VremeKreiranja)
	order by year(VremeKreiranja)
	
	set nocount off
end