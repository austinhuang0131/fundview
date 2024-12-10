Setup:

    python -m venv venv
    . venv/bin/activate
    pip install -r requirements.txt

Run the development server:

    uvicorn main:app --reload

Data Store:
    - To get a specific filing from someone: 
      - https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=`CIK`&type=`13F%25`&dateb=&owner=exclude&start=0&count=`300`

