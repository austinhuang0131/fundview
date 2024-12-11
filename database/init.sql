DROP SCHEMA IF EXISTS ThirteenF;

CREATE SCHEMA IF NOT EXISTS ThirteenF;

USE ThirteenF;

drop table if exists SUBMISSION;
drop table if exists COVERPAGE;

-- 5.1 SUBMISSION
CREATE TABLE SUBMISSION (
    ACCESSION_NUMBER VARCHAR(25) NOT NULL PRIMARY KEY,
    FILING_DATE DATE NOT NULL,
    SUBMISSIONTYPE VARCHAR(10) NOT NULL,
    CIK VARCHAR(10) NOT NULL,
    PERIODOFREPORT DATE NOT NULL
);

-- 5.2 COVERPAGE
CREATE TABLE COVERPAGE (
    ACCESSION_NUMBER VARCHAR(25) NOT NULL,
    REPORTCALENDARORQUARTER DATE NOT NULL,
    ISAMENDMENT CHAR(1),
    AMENDMENTNO VARCHAR(20),
    AMENDMENTTYPE VARCHAR(20),
    CONFDENIEDEXPIRED CHAR(1),
    DATEDENIEDEXPIRED DATE,
    DATEREPORTED DATE,
    REASONFORNONCONFIDENTIALITY VARCHAR(40),
    FILINGMANAGER_NAME VARCHAR(150) NOT NULL,
    FILINGMANAGER_STREET1 VARCHAR(40),
    FILINGMANAGER_STREET2 VARCHAR(40),
    FILINGMANAGER_CITY VARCHAR(30),
    FILINGMANAGER_STATEORCOUNTRY CHAR(2),
    FILINGMANAGER_ZIPCODE VARCHAR(10),
    REPORTTYPE VARCHAR(30) NOT NULL,
    FORM13FFILENUMBER VARCHAR(17),
    CRDNUMBER VARCHAR(9),
    SECFILENUMBER VARCHAR(17),
    PROVIDEINFOFORINSTRUCTION5 CHAR(1) NOT NULL,
    ADDITIONALINFORMATION VARCHAR(4000),
    PRIMARY KEY (ACCESSION_NUMBER)
);

-- 5.3 OTHERMANAGER
CREATE TABLE OTHERMANAGER (
    ACCESSION_NUMBER VARCHAR(25) NOT NULL,
    OTHERMANAGER_SK BIGINT NOT NULL, 
    CIK VARCHAR(10),
    FORM13FFILENUMBER VARCHAR(17),
    NAME VARCHAR(150) NOT NULL,
    PRIMARY KEY (ACCESSION_NUMBER, OTHERMANAGER_SK)
);

-- 5.4 SIGNATURE
CREATE TABLE SIGNATURE (
    ACCESSION_NUMBER VARCHAR(25) NOT NULL,
    NAME VARCHAR(150) NOT NULL,
    TITLE VARCHAR(60) NOT NULL,
    PHONE VARCHAR(20),
    SIGNATURE VARCHAR(150) NOT NULL,
    CITY VARCHAR(30) NOT NULL,
    STATEORCOUNTRY CHAR(2) NOT NULL,
    SIGNATUREDATE DATE NOT NULL,
    PRIMARY KEY (ACCESSION_NUMBER)
);

-- 5.5 SUMMARYPAGE
CREATE TABLE SUMMARYPAGE (
    ACCESSION_NUMBER VARCHAR(25) NOT NULL,
    OTHERINCLUDEDMANAGERSCOUNT SMALLINT, 
    TABLEENTRYTOTAL INT, 
    TABLEVALUETOTAL BIGINT, 
    ISCONFIDENTIALOMITTED CHAR(1),
    PRIMARY KEY (ACCESSION_NUMBER)
);

-- 5.6 OTHERMANAGER2
CREATE TABLE OTHERMANAGER2 (
    ACCESSION_NUMBER VARCHAR(25) NOT NULL,
    SEQUENCENUMBER SMALLINT NOT NULL, 
    CIK VARCHAR(10),
    FORM13FFILENUMBER VARCHAR(17),
    NAME VARCHAR(150) NOT NULL,
    PRIMARY KEY (ACCESSION_NUMBER, SEQUENCENUMBER)
);

-- 5.7 INFOTABLE
CREATE TABLE INFOTABLE (
    ACCESSION_NUMBER VARCHAR(25) NOT NULL,
    INFOTABLE_SK BIGINT NOT NULL, 
    NAMEOFISSUER VARCHAR(200) NOT NULL,
    TITLEOFCLASS VARCHAR(150) NOT NULL,
    CUSIP CHAR(9) NOT NULL,
    VAL BIGINT NOT NULL,
    SSHPRNAMT BIGINT, 
    SSHPRNAMTTYPE VARCHAR(10),
    PUTCALL VARCHAR(10),
    INVESTMENTDISCRETION VARCHAR(10),
    OTHERMANAGER VARCHAR(100),
    VOTING_AUTH_SOLE BIGINT , 
    VOTING_AUTH_SHARED BIGINT , 
    VOTING_AUTH_NONE BIGINT, 
    PRIMARY KEY (ACCESSION_NUMBER, INFOTABLE_SK)
);

# Verify that we can load data
SET GLOBAL local_infile=1;
SHOW VARIABLES LIKE "secure_file_priv"; #should be set to the directory the data is at; only setable on setup of on my.cnf
SHOW VARIABLES LIKE "local_infile"; #should be set to ON

LOAD DATA INFILE '/Users/suape/WorkDir/FundView/database/EdgarDataSource/SUBMISSION.tsv'
INTO TABLE SUBMISSION
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(
    ACCESSION_NUMBER,
    @FILING_DATE,
    SUBMISSIONTYPE,
    CIK,
    @PERIODOFREPORT
)
SET 
    FILING_DATE = STR_TO_DATE(@FILING_DATE, '%d-%b-%Y'),
    PERIODOFREPORT = STR_TO_DATE(@PERIODOFREPORT, '%d-%b-%Y');
    
LOAD DATA INFILE '/Users/suape/WorkDir/FundView/database/EdgarDataSource/INFOTABLE.tsv'
INTO TABLE INFOTABLE
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(
    ACCESSION_NUMBER,
    INFOTABLE_SK,
    NAMEOFISSUER,
    TITLEOFCLASS,
    CUSIP,
    @FIGI, -- Skip the FIGI column
    @VAL,
    @SSHPRNAMT,
    @SSHPRNAMTTYPE,
    @PUTCALL,
    @INVESTMENTDISCRETION,
    @OTHERMANAGER,
    @VOTING_AUTH_SOLE,
    @VOTING_AUTH_SHARED,
    @VOTING_AUTH_NONE
)
SET
    VAL = CASE WHEN @VAL = '' THEN 0 ELSE @VAL END;
    
LOAD DATA INFILE '/Users/suape/WorkDir/FundView/database/EdgarDataSource/COVERPAGE.tsv'
INTO TABLE COVERPAGE
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(
    ACCESSION_NUMBER,
    @REPORTCALENDARORQUARTER,
    ISAMENDMENT,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    FILINGMANAGER_NAME,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP,
    @SKIP
)
SET
    REPORTCALENDARORQUARTER = STR_TO_DATE(@REPORTCALENDARORQUARTER, '%d-%b-%Y');
