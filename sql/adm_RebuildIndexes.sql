go
if OBJECT_ID('adm_RebuildIndexes','P') is not null
	drop procedure adm_RebuildIndexes
go
/*
adm_RebuildIndexes
ULAZ:
IZLAZ:
*/
create procedure adm_RebuildIndexes 
as
begin
	set nocount on	
	
	DECLARE @fillfactor INT 
	DECLARE @cmd NVARCHAR(500)  
	
	set @fillfactor = 80

	DECLARE @TableName varchar(255) 
	DECLARE TableCursor CURSOR FOR 
	SELECT table_name FROM information_schema.tables
	WHERE table_type = 'base table'
	ORDER BY table_name

	OPEN TableCursor 
	FETCH NEXT FROM TableCursor INTO @TableName 
	WHILE @@FETCH_STATUS = 0 
	BEGIN 
	  exec('ALTER INDEX ALL ON ' + @TableName + ' REBUILD')

		IF ((@TableName not like 'KNF_%' and @TableName not like 'OSN_%') or @TableName in ('OSN_MestaFirme', 'OSN_KursnaLista', 'OSN_NacinObracunaPDV', 'OSN_Regioni', 'OSN_AdreseMesta', 'OSN_KalendarPeriodi', 'OSN_KalendarPromenePerioda'))
		BEGIN 
			SET @cmd = 'ALTER INDEX ALL ON ' + @TableName + ' REBUILD WITH (FILLFACTOR = ' + CONVERT(VARCHAR(3),@fillfactor) + ')'
			EXEC (@cmd) 
		END
		ELSE
		BEGIN
			SET @cmd = 'ALTER INDEX ALL ON ' + @TableName + ' REBUILD'
			EXEC (@cmd) 
		END

	  FETCH NEXT FROM TableCursor INTO @TableName 
	END 
	CLOSE TableCursor 
	DEALLOCATE TableCursor
		
	DBCC FREEPROCCACHE

	set nocount off
end