go
if OBJECT_ID('pretraga_VratiObrisanePredmete','P') is not null
	drop procedure pretraga_VratiObrisanePredmete
go
/*
pretraga_VratiObrisanePredmete
ULAZ:
IZLAZ:
*/
create procedure pretraga_VratiObrisanePredmete(
	@IdOkruga smallint,
	@IdOrgana smallint,
	@IdKlase smallint,
	@OznakaKlase char(3),
	@BrojPredmeta int,
	@Godina int,
	@IdJedinice smallint,
	@OznakaJedinice char(3),
	@IdKorisnika int
) as
begin
	set nocount on

	if(not exists (select top(1) 1
	               from Korisnici
				   where IdKorisnika = @IdKorisnika and
				         IdOkruga is not null and
						 Administracija = 1))
	begin
		raiserror('Nemate prava pristupa.', 14, 1)
	end
	else
	begin
		declare @Sada smalldatetime
		select @Sada = getdate()

		declare @IdKorisnikaSvojihPredmeta int

		select @IdKorisnikaSvojihPredmeta = IdKorisnika
		from Korisnici
		where IdKorisnika = @IdKorisnika and SamoSvojePredmete = 1

		select P.IdPredmeta,
			   P.BrojPredmeta,
			   P.IdOkruga,
			   OK.Oznaka as OznakaOkruga,
			   P.IdOrgana,
			   OG.Oznaka as OznakaOrgana,
			   P.IdKlase,
			   KL.Oznaka as OznakaKlase,
			   P.IdJedinice,
			   J.Oznaka as OznakaJedinice,
			   year(P.VremeRezervacije) as Godina,
			   P.Podnosilac,
			   P.IdInspektora,
			   K.KorisnickoIme + '( ' + K.ImeIPrezime + ' )' as NazivInspektora,
			   P.Sadrzaj
		from Predmeti as P

		join KlaseInspektora as KI
		on KI.IdOkruga = P.IdOkruga and
		   KI.IdOrgana = P.IdOrgana and
		   KI.IdKlase = P.IdKlase and
		   KI.IdKorisnika = @IdKorisnika

		left outer join Korisnici as K
		on K.IdKorisnika = P.IdInspektora

		join Okruzi as OK
		on OK.IdOkruga = P.IdOkruga

		join Organi as OG
		on OG.IdOrgana = P.IdOrgana

		join Klase as KL
		on KL.IdOkruga = P.IdOkruga and
		   KL.IdOrgana = P.IdOrgana and
		   KL.IdKlase = P.IdKlase

		left outer join VrstePredmeta as VP
		on VP.IdVrstePredmeta = P.IdVrstePredmeta
	   
		join Jedinice as J
		on J.IdOrgana = P.IdOrgana and
			J.IdJedinice = P.IdJedinice

		where (@IdOkruga is null or P.IdOkruga = @IdOkruga) and
			  (@IdOrgana is null or P.IdOrgana = @IdOrgana) and

			  (@IdKlase is null or P.IdKlase = @IdKlase) and
			  (@OznakaKlase is null or KL.Oznaka = @OznakaKlase) and

			  (@BrojPredmeta is null or P.BrojPredmeta = @BrojPredmeta) and
			  (@Godina is null or year(P.VremeRezervacije) = @Godina) and
			  
			  (@IdJedinice is null or P.IdJedinice = @IdJedinice) and
			  (@OznakaJedinice is null or J.Oznaka = @OznakaJedinice) and
			  
			  (@IdKorisnikaSvojihPredmeta is null or P.IdKreatora = @IdKorisnikaSvojihPredmeta or P.IdInspektora = @IdKorisnikaSvojihPredmeta) and
			  P.Status = 'B'
		order by OK.Oznaka, OG.Oznaka, KL.Oznaka, P.BrojPredmeta
	end

	set nocount off
end