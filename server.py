from bottle import route, run, debug, static_file
import sqlite3
import json
import tables

isTest = False

CONFIG = {
    "database": "warehouse.db",
}

DBCONN = sqlite3.connect(CONFIG["database"])
AVAILABLE_TABLES = tables.SERVER_TABLES


@route("/js/<filename>")
def getJS(filename):
    print(filename)
    return static_file(filename, root="./js/")


@route('/')
def index():
    return static_file('index.html', root='./')


@route('/<tableName>')
def getDataFromTable(tableName):
    # If table does not exist, return
    if tableName not in AVAILABLE_TABLES:
        return []

    # Get data
    tableData = DBCONN.execute("SELECT * FROM {}".format(tableName))

    # Get formatting data
    columnInfo = [
        {"header": "Year"},
        {"header": "Number in Group"}
    ]
    columnInfo.extend(AVAILABLE_TABLES[tableName])

    # Return data, mapped into a formatted state
    return json.dumps([  # A list comprehension of each datum
         formatDatum(datum, columnInfo) for datum in tableData
    ])


def formatDatum(datum, columnInfo):
    formattedDatum = {}

    for index, column in enumerate(columnInfo):
        if "mapFunc" in column:
            formattedValue = column["mapFunc"](str(datum[index]))

        elif "mapping" in column:
            formattedValue = column["mapping"][str(datum[index])]

        else:
            formattedValue = datum[index]

        formattedDatum[column["header"]] = formattedValue

    return formattedDatum

if __name__ == "__main__":
    debug(True)
    run(host='localhost', port=3000)
