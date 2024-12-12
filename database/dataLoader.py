import os
import pymysql
from dotenv import load_dotenv
from multiprocessing import Pool, cpu_count
from concurrent.futures import ThreadPoolExecutor
from threading import Lock

print_lock = Lock()

# Load environment variables from .env file
load_dotenv()

# MySQL connection configuration
connection_config = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "root"),
    "database": os.getenv("DB_NAME", "ThirteenF"),
    "port": int(os.getenv("DB_PORT", 8889)),
    "local_infile": True
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Initialize database schema
def initialize_db():
    schema_path = os.path.join(BASE_DIR, '13F_DB_init.sql')
    connection = pymysql.connect(**connection_config)
    with connection.cursor() as cursor:
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
            for statement in schema_sql.split(';'):
                statement = statement.strip()
                if statement:
                    cursor.execute(statement)
    connection.commit()
    connection.close()
    print("Database initialized successfully.")

# Paths to directories
SUBMISSION_DIR = os.path.join(BASE_DIR, 'EdgarDataSource/SUBMISSION')
COVERPAGE_DIR = os.path.join(BASE_DIR, 'EdgarDataSource/COVERPAGE')
INFOTABLE_DIR = os.path.join(BASE_DIR, 'EdgarDataSource/INFOTABLE')
INDUSTRY_FILE = os.path.abspath(os.path.join(BASE_DIR, 'indData.csv'))

def load_indicators():
    print("Loading industry data...")
    connection = pymysql.connect(**connection_config)
    query = f"""
        LOAD DATA LOCAL INFILE '{INDUSTRY_FILE}'
        INTO TABLE INDUSTRY
        FIELDS TERMINATED BY ',' ENCLOSED BY '"'
        LINES TERMINATED BY '\\n'
        IGNORE 1 LINES
        (CIK, CompanyName, Symbol, Exchange, CUSIP, AssetType, Sector);
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute(query)
        connection.commit()
        print("Industry data loaded successfully.")
    except Exception as e:
        print(f"Error loading industry data: {str(e)}")
    finally:
        connection.close()

def create_index(query, index_name):
    connection = pymysql.connect(**connection_config)
    try:
        with connection.cursor() as cursor:
            cursor.execute(query)
        connection.commit()
        with print_lock:
            print(f"Index created for {index_name}")
    except Exception as e:
        with print_lock:
            print(f"Error creating index for {index_name}: {str(e)}")
    finally:
        connection.close()

def create_indexes():
    index_queries = [
        ("CREATE INDEX idx_industry_cusip ON INDUSTRY(CUSIP);", "INDUSTRY.CUSIP"),
        ("CREATE INDEX idx_submission_accession_number ON SUBMISSION(ACCESSION_NUMBER);", "SUBMISSION.ACCESSION_NUMBER"),
        ("CREATE INDEX idx_submission_filing_date ON SUBMISSION(FILING_DATE);", "SUBMISSION.FILING_DATE"),
        ("CREATE INDEX idx_submission_cik ON SUBMISSION(CIK);", "SUBMISSION.CIK"),
        ("CREATE INDEX idx_coverpage_accession_number ON COVERPAGE(ACCESSION_NUMBER);", "COVERPAGE.ACCESSION_NUMBER"),
        ("CREATE INDEX idx_coverpage_filing_manager_name ON COVERPAGE(FILINGMANAGER_NAME);", "COVERPAGE.FILINGMANAGER_NAME"),
        ("CREATE INDEX idx_infotable_accession_number ON INFOTABLE(ACCESSION_NUMBER);", "INFOTABLE.ACCESSION_NUMBER"),
        ("CREATE INDEX idx_infotable_infotable_sk ON INFOTABLE(INFOTABLE_SK);", "INFOTABLE.INFOTABLE_SK"),
        ("CREATE INDEX idx_infotable_name_of_issuer ON INFOTABLE(NAMEOFISSUER);", "INFOTABLE.NAMEOFISSUER"),
        ("CREATE INDEX idx_infotable_cusip ON INFOTABLE(CUSIP);", "INFOTABLE.CUSIP"),
        ("CREATE INDEX idx_infotable_value ON INFOTABLE(VALUE);", "INFOTABLE.VALUE")
    ]

    with ThreadPoolExecutor(max_workers=7) as executor:
        executor.map(lambda x: create_index(*x), index_queries)

    print("All index creation tasks have been submitted.")

# Function to load a single file into MySQL
def load_file(args):
    file_path, table_name, columns, date_columns = args
    print(f"Loading {file_path} into {table_name}...")
    connection = pymysql.connect(**connection_config)
    if date_columns:
        set_clause = ", ".join([f"{col} = STR_TO_DATE(@{col}, '%d-%b-%Y')" for col in date_columns])
        query = f"""
            LOAD DATA LOCAL INFILE '{file_path}'
            INTO TABLE {table_name}
            FIELDS TERMINATED BY '\\t'
            LINES TERMINATED BY '\\n'
            IGNORE 1 LINES
            ({','.join(columns)})
            SET {set_clause};
        """
    else:
        query = f"""
            LOAD DATA LOCAL INFILE '{file_path}'
            INTO TABLE {table_name}
            FIELDS TERMINATED BY '\\t'
            LINES TERMINATED BY '\\n'
            IGNORE 1 LINES
            ({','.join(columns)});
        """
    with connection.cursor() as cursor:
        cursor.execute(query)
    connection.commit()
    connection.close()

if __name__ == "__main__":
    # Initialize the database schema
    initialize_db()

    # Load industry data
    load_indicators()

    # Prepare tasks for multiprocessing
    tasks = []

    # Add SUBMISSION files to tasks
    for file in os.listdir(SUBMISSION_DIR):
        if file.endswith('.tsv'):
            file_path = os.path.join(SUBMISSION_DIR, file)
            tasks.append((file_path, 'SUBMISSION', ['ACCESSION_NUMBER', '@FILING_DATE', 'SUBMISSIONTYPE', 'CIK', '@PERIODOFREPORT'], ['FILING_DATE', 'PERIODOFREPORT']))

    # Add COVERPAGE files to tasks
    for file in os.listdir(COVERPAGE_DIR):
        if file.endswith('.tsv'):
            file_path = os.path.join(COVERPAGE_DIR, file)
            tasks.append((file_path, 'COVERPAGE', ['ACCESSION_NUMBER', '@REPORTCALENDARORQUARTER', 'ISAMENDMENT', 'AMENDMENTNO', 'AMENDMENTTYPE', 'CONFDENIEDEXPIRED', 'DATEDENIEDEXPIRED', 'DATEREPORTED', 'REASONFORNONCONFIDENTIALITY','FILINGMANAGER_NAME'], ['REPORTCALENDARORQUARTER']))

    # Add INFOTABLE files to tasks
    for file in os.listdir(INFOTABLE_DIR):
        if file.endswith('.tsv'):
            file_path = os.path.join(INFOTABLE_DIR, file)
            tasks.append((file_path, 'INFOTABLE', ['ACCESSION_NUMBER', 'INFOTABLE_SK', 'NAMEOFISSUER', 'TITLEOFCLASS', 'CUSIP', 'FIGI', 'VALUE'], []))

    # Use multiprocessing to load files concurrently
    with Pool(cpu_count()) as pool:
        pool.map(load_file, tasks)

    print("All files loaded successfully!")

    create_indexes()

    print("All done!")