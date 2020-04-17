go
if OBJECT_ID('inspekcije_VratiKlaseIJedinice','P') is not null
	drop procedure inspekcije_VratiKlaseIJedinice
go

create procedure inspekcije_VratiKlaseIJedinice(
	@IdInspekcije smallint,
	@IdOkruga smallint
) as
begin
	set nocount on

	select
		IKJ.IdOrgana,
		O.Oznaka + '-' + O.Naziv as NazivOrgana,
		IKJ.IdKlase,
		K.Oznaka + '-' + K.Naziv as NazivKlase,
		IKJ.IdJedinice,
		J.Oznaka + '-' + J.Naziv as NazivJedinice
	from InspekcijeKlaseIJedinice as IKJ

	join Organi as O
	on O.IdOrgana = IKJ.IdOrgana

	join Klase as K
	on K.IdOkruga = IKJ.IdOkruga and
	   K.IdOrgana = IKJ.IdOrgana and
	   K.IdKlase = IKJ.IdKlase

	left outer join Jedinice as J
	on J.IdOrgana = IKJ.IdOrgana and
	   J.IdJedinice = IKJ.IdJedinice

	where IKJ.IdInspekcije = @IdInspekcije and
	      IKJ.IdOkruga = @IdOkruga


	set nocount off
end