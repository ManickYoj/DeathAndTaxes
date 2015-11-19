import sqlite3

# -- Config -- #
# Define settings for this table
# A year and count of people in the group is automatically
# added to each table.
TABLE_CONFIG = {
    "dropPrevious": True,
    "verbose": True,
    "sourceDB": "mortality.db",
    "sourceTable": "mortality",
    "destDB": "warehouse.db",
    "destTable": "EducationAndAge",
    "selections":
        [
            "Education",
            "Age_Value",
        ]
}


# -- Code Definitions -- #
class Table:
    def __init__(self, config=TABLE_CONFIG):
        self.config = config
        self.sourceTable = config["sourceTable"]
        self.destTable = config["destTable"]
        self.headers = config["selections"]
        self.verbose = config["verbose"]

        self.sourceConn = sqlite3.connect(self.config["sourceDB"])
        self.destConn = sqlite3.connect(self.config["destDB"])

        if config["dropPrevious"]:
            self.dropTable()
        self.createTable()

    def close(self):
        """
        Cleans up this class.
        """

        self.sourceConn.close()
        self.destConn.close()

    def dropTable(self):
        """
        Drops this table from the destination DB,
        if it exists.
        """

        if self.verbose:
            print("-- Dropping Table -- ")

        self.destConn.execute(
            "DROP TABLE IF EXISTS {}".format(
                self.destTable
            )
        )

    def createTable(self):
        """
        Creates this table in the destination DB,
        if it does not already exist.
        """

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
        """
        Performs the operation of taking operational data,
        parsing it, and publishing it to the warehouse database.
        """

        # Format selection criteria
        groupings = ["Data_Year"]
        groupings.extend(self.headers)
        print(groupings)
        formattedGroupings = ", ".join(groupings)
        selections = ["Data_Year", "count(*)"]
        selections.extend(self.headers)
        print(selections)

        if self.verbose:
            print("-- Reading Data --")

        # Grab data
        results = self.sourceConn.execute(
            "SELECT {} FROM {} GROUP BY {}".format(
                    ", ".join(selections),
                    self.sourceTable,
                    formattedGroupings
                )
        )

        if self.verbose:
            print("-- Reading completed. Writing data. --")

        total = 0

        # Publish results
        for result in results:
            # Format results
            result = list(result)
            result[0] = int(result[0])
            result[1] = int(result[1])

            # Insert into destination table
            self.destConn.execute(
                "INSERT INTO {} VALUES ({})".format(
                    self.destTable,
                    ", ".join(["?"]*len(result))
                ),
                result
            )

            total += 1

        # Save changes
        self.destConn.commit()

        if self.verbose:
            print("-- Done. {} new warehouse rows created. --".format(total))


# -- Running Code -- #
if __name__ == "__main__":
    t = Table()
    t.convertRows()
    t.close()
