from bottle import route, run, template, debug
import sqlite3
import json
import datamappings

CONFIG = {
    "database": "warehouse.db"
}

dbConn = sqlite3.connect(CONFIG["database"])


def getTable(table):
    result = dbConn.execute("SELECT * FROM {}".format(table))
    return result.fetchall()


@route('/')
def index():
    return '<b>Hello</b>!'


@route('/EducationAndCause')
def eduAndCause():
    data = getTable("EducationAndCause39")
    if not data:
        return []
    else:
        return json.dumps([
            mapColumns(datum, ["Education", "Cause Of Death"])
            for datum in data
        ])


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
    run(host='localhost', port=3000, reloader=True)
