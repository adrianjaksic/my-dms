go
if OBJECT_ID('istorija_ObrisiKretanjePredmeta','P') is not null
	drop procedure istorija_ObrisiKretanjePredmeta
go

create procedure istorija_ObrisiKretanjePredmeta(
	@IdPredmeta bigint,
	@IdKretanja smallint,
	@IdKorisnika int
) as
begin
	set nocount on

	update IstorijaPredmeta
	set DatumBrisanja = getdate(),
	    Obrisao = @IdKorisnika
	where IdPredmeta = @IdPredmeta and
	      IdKretanja = @IdKretanja
		  
	declare @IdKretanjaPredmeta smallint
	select @IdKretanjaPredmeta = IdKretanjaPredmeta
	from IstorijaPredmeta	      
	where IdPredmeta = @IdPredmeta and
	      IdKretanja = @IdKretanja

	if (@IdKretanjaPredmeta is not null)
	begin

		declare @Status char(1)
		select @Status = [Status]
		from KretanjaPredmeta
		where IdKretanjaPredmeta = @IdKretanjaPredmeta

		if (@Status is not null)
		begin

			update P
			set Status = KK.Status
			from Predmeti as P
			join
			(
				select I.IdPredmeta, MAX(I.IdKretanja) as MaxIdKretanja
				from IstorijaPredmeta as I
				join KretanjaPredmeta as K
				on I.IdKretanjaPredmeta = K.IdKretanjaPredmeta
				where I.IdPredmeta = @IdPredmeta and
				      I.Obrisao is null and
					  K.Status is not null
				group by I.IdPredmeta
			) as X
			on P.IdPredmeta = X.IdPredmeta
			join IstorijaPredmeta as II
			on II.IdPredmeta = X.IdPredmeta and
			   II.IdKretanja = X.MaxIdKretanja
			join KretanjaPredmeta as KK
			on II.IdKretanjaPredmeta = KK.IdKretanjaPredmeta
			where P.IdPredmeta = @IdPredmeta

		end

	end

	set nocount off
end