/* Read-only SQL Server discovery. Run in SSMS against the ROHITH instance. */
SELECT @@SERVERNAME AS ServerName,
       SERVERPROPERTY('ProductVersion') AS ProductVersion,
       SERVERPROPERTY('ProductMajorVersion') AS ProductMajorVersion,
       SERVERPROPERTY('Edition') AS Edition;

SELECT name AS DatabaseName, state_desc AS State
FROM sys.databases
ORDER BY name;
