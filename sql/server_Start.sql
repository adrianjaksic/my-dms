go
if OBJECT_ID('server_Start','P') is not null
	drop procedure server_Start
go

create procedure server_Start(
	@PromenaDatumaPredmeta bit
) as
begin
	set nocount on

	if (not exists (select TOP(1) 1 from PodesavanjeServera where Id = 1))
	begin

		INSERT INTO [dbo].[PodesavanjeServera]
			   ([Id]
			   ,[DozvoljenoMenjanjeDatuma]
			   ,[BrojRestarta]
			   ,[DatumPoslednjegRestarta])
		 VALUES
			   (1
			   ,@PromenaDatumaPredmeta
			   ,1
			   ,getdate())

	end
	else
	begin

		update PodesavanjeServera
		set DozvoljenoMenjanjeDatuma = @PromenaDatumaPredmeta,
		    BrojRestarta = BrojRestarta + 1,
			DatumPoslednjegRestarta = getdate()
		where Id = 1

	end

	set nocount off
end