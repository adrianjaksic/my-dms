:: JOINTXT.BAT Usage: jointxt Folder_Name
del 00_Procedure.sql
chcp 1252
@echo off > Procedure.new
pushd %*
for %%j in (*.sql) do (
  type "%%j"
  echo.
  echo.go
  echo.
  echo.
) >> Procedure.new 
ren Procedure.new 00_Procedure.sql
popd
:: End_Of_Batch