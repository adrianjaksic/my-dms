go
if OBJECT_ID('kret_pred_VratiKretanjaPredmeta','P') is not null
	drop procedure kret_pred_VratiKretanjaPredmeta
go
/*
kret_pred_VratiKretanjaPredmeta
ULAZ:
IZLAZ:
*/
create procedure kret_pred_VratiKretanjaPredmeta(
	@IdKretanjaPredmeta smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select
			IdKretanjaPredmeta,
			Oznaka,
			Naziv,
			Napomena,
			Aktivan,
			Status,
			Zapisnik,
			Primedba,
			isnull(UnosRoka, 0) as UnosRoka,
			NazivZaIstoriju
		from KretanjaPredmeta
		where (@IdKretanjaPredmeta is null or IdKretanjaPredmeta = @IdKretanjaPredmeta) and
		      (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end