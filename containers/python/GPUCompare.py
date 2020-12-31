import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import csv
import pandas as pd
import numpy as np
import time
import re
import requests
import json
import codecs
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
    path = "chromedriver.exe"
    driver = webdriver.Chrome("./chromedriver", chrome_options=chromeoptions)

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
                textrow["3dmark"] = score
        rows.append(textrow)
    return rows

def __init__():
    # set chrome options
    chromeoptions = Options()
    chromeoptions.add_argument("--headless")
    
    # set postgres credentials from environment variables
    PGHOST = os.environ.get("PGHOST")
    PGPORT = os.environ.get("PGPORT")
    PGDATABASE = os.environ.get("PGDATABASE")
    PGUSER = os.environ.get("PGUSER")
    PGPASSWORD = os.environ.get("PGPASSWORD")     

    while(True):
        # obtain data from 3dmark, and make the scores relative
        data = relative(get3dmark())

        # replace data in postgres db
        # init Postgres object
        pgdb = psycopg.connect(dbname=PGDATABASE, user=PGUSER, password=PGPASSWORD, host=PGHOST, port=PGPORT)
        cur = pgdb.cursor()
        # delete old data
        cur.execute("DELETE FROM gpulist WHERE *")
        # add new data
        for gpu in data:
            cur.execute("INSERT INTO gpulist (name, relative) VALUES (%s, %s);", gpu.name, gpu.relative)
        cur.close()

        time.sleep(60 * 60 * 24)

    return 0