go
if OBJECT_ID('logovanje_VratiUlogovaneKorisnike','P') is not null
	drop procedure dbo.logovanje_VratiUlogovaneKorisnike
go

create procedure logovanje_VratiUlogovaneKorisnike
as
begin
	set nocount on

	SELECT K.[IdKorisnika]
	  ,K.[KorisnickoIme]
      ,case
	    when K.Administracija = 1 then cast(0 as bit)
		else K.Inspektor
	   end as Inspektor
      ,K.[IdOkruga]
      ,K.[UnosNovogPredmeta]
      ,K.[DozvolaRezervisanja]
      ,K.[IzmenaPredmeta]
      ,K.[BrisanjePredmeta]
      ,K.[Administracija]
      ,K.[PregledIzvestaja]
	  ,K.[SamoSvojePredmete]
      ,K.[Email]
      ,K.[Telefon]
      ,K.[Jmbg]
      ,K.[ImeIPrezime]
      ,K.[Napomena]
	  ,K.[Guid]
	  ,K.IdOrgana
	  ,K.Jezik
	  ,O.Napomena as NapomenaOkruga
	  ,K.StrogoPoverljivi
	FROM Korisnici as K
	left outer join Okruzi as O
	on O.IdOkruga = K.IdOkruga
	where K.Guid is not null

	set nocount off
end