import os
import pydantic;

USER_AGENT = os.getenv('USERAGENT')
EDGAR_URL = "https://www.sec.gov/edgar/browse/?CIK="
RSS_URL = "https://data.sec.gov/rss?cik={thisCik}&count={count}"
DESIRED_RECORD_COUNT = 40