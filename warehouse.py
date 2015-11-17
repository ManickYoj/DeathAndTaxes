import sqlite3
import copy

# Define settings for this table
# A year and count of people in the group is automatically
# added to each table.
TABLE_CONFIG = {
    "year": 2013,
    "dropPrevious": False,
    "sourceDB": "mortality.db",
    "sourceTable": "mortality",
    "destDB": "warehouse.db",
    "destTable": "EducationAndCause39",
    "selections":
        [
            "Education",
            "Cause_Recode_39",
        ]
}


class Table:
    def __init__(self, config=TABLE_CONFIG):
        self.config = config
        self.sourceTable = config["sourceTable"]
        self.destTable = config["destTable"]
        self.headers = config["selections"]
        self.year = config["year"]

        self.sourceConn = sqlite3.connect(self.config["sourceDB"])
        self.destConn = sqlite3.connect(self.config["destDB"])

        if (config["dropPrevious"]):
            self.dropTable()
        self.createTable()

    def close(self):
        self.sourceConn.close()
        self.destConn.close()

    def dropTable(self):
        self.destConn.execute(
            "DROP TABLE IF EXISTS {}".format(
                self.destTable
            )
        )

    def createTable(self):
        headers = ["Year integer", "Number_in_Group integer"]
        headers.extend([h + " text" for h in self.headers])
        formattedHeaders = ", ".join(headers)

        self.destConn.execute(
            "CREATE TABLE IF NOT EXISTS {} ({})".format(
                self.destTable,
                formattedHeaders
            )
        )

    def convertRows(self):
        groupings = ", ".join(self.headers)
        selections = copy.deepcopy(self.headers)
        selections.insert(0, "count(*)")

        results = self.sourceConn.execute(
            "SELECT {} FROM {} GROUP BY {}".format(
                    ", ".join(selections),
                    self.sourceTable,
                    groupings
                )
        )

        for result in results:
            values = [self.year]
            values.extend(result)
            values[1] = int(values[1])

            self.destConn.execute(
                "INSERT INTO {} VALUES ({})".format(
                    self.destTable,
                    ", ".join(["?"]*len(values))
                ),
                values
            )

        self.destConn.commit()

        selection = self.destConn.execute(
            "SELECT * from {}".format(self.destTable)
        )

        for r in selection:
            print(r)

if __name__ == "__main__":
    print("-- Copying Records --")
    t = Table(drop=True)
    t.convertRows()
    t.close()
    print("-- Done --")
