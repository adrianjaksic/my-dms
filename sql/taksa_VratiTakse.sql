go
if OBJECT_ID('taksa_VratiTakse','P') is not null
	drop procedure taksa_VratiTakse
go
/*
taksa_VratiTakse
ULAZ:
IZLAZ:
*/
create procedure taksa_VratiTakse(
	@IdTakse smallint,
	@Aktivan bit
) as
begin
	set nocount on

		select IdTakse, Naziv, Napomena, Aktivan, OznakaZaStampu
		from Takse
		where (@IdTakse is null or IdTakse = @IdTakse) and
		      (@Aktivan is null or Aktivan = @Aktivan)
		order by IdTakse

	set nocount off
end