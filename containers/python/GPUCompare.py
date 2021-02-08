import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
#import codecs
import psycopg2

# [{name, 3dmark}] -> [{name, relative}]
def makeRelative(data):
    # Find largest 3dmark score to compare to
    highest = -1
    for gpu in data:
        if (gpu['3dmark'] > highest):
            highest = gpu['3dmark']

    # add relative scores
    for gpu in data:
        gpu['relative'] = gpu['3dmark']/highest
        # remove unnecesary 3dmark scores
        del gpu['3dmark']
    return data

def get3dmark():
    driver = webdriver.Remote(
        command_executor='http://chromedriver:4444',
        options=chromeoptions
    )
    print("Connection made!")
    # Gets data from 3DMark site
    driver.get("https://benchmarks.ul.com/compare/best-gpus?amount=0&sortBy=SCORE&reverseOrder=true&types=DESKTOP&minRating=0")
    html = driver.page_source
    driver.quit()

    soup = BeautifulSoup(html, "html.parser")
    table = soup.find(id="productTable")

    # Get table body
    rows = []  # store final rows in here
    tbody = table.find("tbody")

    # FORMAT: Rank, Name, MSRP, Score, Value, Popularity
    for row in tbody.findAll("tr"):  # Whole table body
        pagedata = row.findAll("td")  # All elements of row
        textrow = {}
        for element in pagedata:  # Every td element
            soup = BeautifulSoup(str(element), "html.parser")
            # only names have a hyperlink
            if soup.find("a"):
                name = soup.find("a").text
                textrow["name"] = name
            # only scores are of the "small-pr1" class
            elif soup.find("td", attrs={"class": "small-pr1"}):
                score = soup.text.strip()
                textrow["3dmark"] = float(score)
        rows.append(textrow)
    return rows

def __init__():
    print("Starting python script")
    
    # set postgres credentials from environment variables
    PGHOST = os.environ.get("PGHOST")
    PGPORT = os.environ.get("PGPORT")
    PGDATABASE = os.environ.get("PGDATABASE")
    PGUSER = os.environ.get("PGUSER")
    PGPASSWORD = os.environ.get("PGPASSWORD")     

    while(True):
        # obtain data from 3dmark, and make the scores relative
        print("Getting new data")
        data = makeRelative(get3dmark())

        # replace data in postgres db
        # init Postgres object
        print("Connecting to postgres")
        pgdb = psycopg2.connect(dbname=PGDATABASE, user=PGUSER, password=PGPASSWORD, host=PGHOST, port=PGPORT)
        cur = pgdb.cursor()
        # delete old data
        print("Deleting old gpus and scores")
        cur.execute("DELETE FROM gpulist")
        # add new data
        print("Adding new gpus and scores")
        for gpu in data:
            cur.execute("INSERT INTO gpulist (name, relative) VALUES (%s, %s);", (gpu["name"], gpu["relative"]))
        pgdb.commit()
        cur.close()
        pgdb.close()

        print("Sleeping for 24h before checking again")
        time.sleep(60 * 60 * 24)

# set chrome options
chromeoptions = webdriver.chrome.options.Options()
chromeoptions.add_argument("--headless")
chromeoptions.add_argument("window-size=1024,768")
chromeoptions.add_argument("--no-sandbox")
__init__()
