from bottle import route, run, template, debug, static_file
import sqlite3
import json
import datamappings

isTest = False

CONFIG = {
    "database": "warehouse.db",
    "testDatabase": "testwarehouse.db"
}

DBCONN = {
    "dbConn":sqlite3.connect(CONFIG["database"]),
    "dbConnTest":sqlite3.connect(CONFIG["testDatabase"])
}

def getTable(test,table):
    if not test:
        result = DBCONN["dbConn"].execute("SELECT * FROM {}".format(table))
    else:
        result = DBCONN["dbConnTest"].execute("SELECT * FROM {}".format(table))

    return result.fetchall()


@route('/')
def index():
    return static_file('index.html', root='./')

@route('/test')
def testRun():
    isTest = True
    data = getTable(isTest, "CauseAndAgeTable")
    if not data:
        return []
    else:
        return json.dumps([
            mapTestColumns(datum, ["Age of Death", "Cause Of Death"])
            for datum in data
        ])            

@route('/EducationAndCause')
def eduAndCause():
    data = getTable(isTest, "EducationAndCause39")
    if not data:
        return []
    else:
        return json.dumps([
            mapColumns(datum, ["Education", "Cause Of Death"])
            for datum in data
        ])

def mapTestColumns(datum, headerNames):
    return datum
    # TODO: JSON should look like
    #  {"Year":2003, "Cause Of Death": Cancer, "Average Age Of Death": 40.3}


def mapColumns(datum, headerNames):
    jsonItem = {
        "Year": datum[0],
        "Number in Group": datum[1]
    }

    for index, header in enumerate(headerNames):
        if (header == "Education"):
            jsonItem[header] = datamappings.educationLevel[datum[index+2]]
        elif (header == "Cause Of Death"):
            jsonItem[header] = datamappings.causeRecode39Headers[int(datum[index+2])-1]

    return jsonItem

if __name__ == "__main__":
    debug(True)
    run(host='localhost', port=3000)
