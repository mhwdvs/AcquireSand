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


def relative(data):
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
    print(data)
    return data


def get3dmark(data):
    path = "chromedriver.exe"
    driver = webdriver.Chrome("./chromedriver", chrome_options=chromeoptions)
    # Gets data from 3DMark site
    driver.get("https://benchmarks.ul.com/compare/best-gpus?amount=0&sortBy=SCORE&reverseOrder=true&types=DESKTOP&minRating=0")

    for gpu in data:
        print(gpu)
        search = driver.find_element_by_xpath('//*[@id="search"]')
        search.clear()
        search.send_keys(gpu['name'].split(' ')[1] + webdriver.common.keys.Keys.ENTER) # searches for first work/term in string
        time.sleep(2)
        print(driver.current_url)
        html = driver.page_source
        soup = BeautifulSoup(html, "html.parser")
        table = soup.find(id="productTable")

        # Get table body
        rows = []  # store final rows in here
        tbody = table.find("tbody")

        # FORMAT: Rank, Name, Score, Popularity
        for row in tbody.findAll("tr"):  # Whole table body
            pagedata = row.findAll("td")  # All td elements
            # Get value from every column
            textrow = []
            for column in pagedata:  # Every td element
                soup = BeautifulSoup(str(column), "html.parser")
                if soup.find("a"):
                    text = soup.find("a").text
                    textrow.append(text)
                elif soup.find("td", attrs={"class": "small-pr1"}):
                    text = soup.text.strip()
                    textrow.append(text)
                #print(column)
                #text = column.text
                #textrow.append(text)
            rows.append(textrow)

        # Asks user to chose which listing is correct
        print("Enter the number of the correct listing:")
        print("(1 - " + str(len(rows)))
        print("Or enter 'N' to skip this GPU")
        # Prints the first value of every row (the name of the gpu)
        i = 1
        for row in rows:
            print(str(i) + ": " + row[0])
            i+=1
        selection = input()

        # 3dMark data rows
        if selection == "N":
            print("Skipping!")
            gpu['3dmark'] = -1
        else:
            selection = int(selection) - 1
            rows = rows[selection]
            gpu['3dmark'] = int(rows[1])
    
    driver.quit()
    return data

chromeoptions = Options()
chromeoptions.add_argument("--headless")

with open('gpudb.json') as f:
    # loads a JSON file as a python dict
    data = json.load(f)

data = relative(get3dmark(data))
file = open("gpudb.json", 'w')
json.dump(data, file)
