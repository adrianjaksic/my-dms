go
if OBJECT_ID('vrsta_pred_VratiVrstePredmeta','P') is not null
	drop procedure vrsta_pred_VratiVrstePredmeta
go
/*
vrsta_pred_VratiVrstePredmeta
ULAZ:
IZLAZ:
*/
create procedure vrsta_pred_VratiVrstePredmeta(
	@IdVrstePredmeta smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdVrstePredmeta, Naziv, Oznaka, Napomena, Aktivan, Rok, OznakaZaStampu
		from VrstePredmeta
		where (@IdVrstePredmeta is null or IdVrstePredmeta = @IdVrstePredmeta) and
		      (@Aktivan is null or Aktivan = @Aktivan)

	set nocount off
end