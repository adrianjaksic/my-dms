go

if OBJECT_ID('predmet_PredmetPripadaKlasiInspektora','P') is not null
	drop procedure predmet_PredmetPripadaKlasiInspektora
go
/*
predmet_PredmetPripadaKlasiInspektora
ULAZ:
IZLAZ:
*/
create procedure predmet_PredmetPripadaKlasiInspektora(
	@IdPredmeta bigint,
	@IdKorisnika int
) as
begin
	set nocount on

	select 
		case
		 when K.IdKorisnika is not null then cast(1 as bit)
		 else cast(0 as bit)
		end as Pripada
	from Predmeti as P

	left outer join KlaseInspektora as K
	on K.IdOkruga = P.IdOkruga and
	   K.IdOrgana = P.IdOrgana and
	   K.IdKlase = P.IdKlase and
	   K.IdKorisnika = @IdKorisnika

	where IdPredmeta = @IdPredmeta
	     

	set nocount off
end

go