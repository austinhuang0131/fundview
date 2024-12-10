SELECT * FROM ThirteenF.SUBMISSION where CIK = '0001290668';
select CIK from (select distinct CIK from ThirteenF.SUBMISSION as alias1);
select count(CIK) from ThirteenF.SUBMISSION;