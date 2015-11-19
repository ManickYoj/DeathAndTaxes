"""
warehouse.py
------------
Nick & Filippos

Purpose:
This script uses the TABLE_CONFIG to convert rows of
operational data from the sourceDB/sourceTable into
amalgated rows of a destDB/destTable.

Motivation:
Querying the ~2,500,000 rows of operational data in a single year is a
non-starter for a visualization. By grouping the data, for example by
Year, Education, and Cause of Death, this script contains all of the data
we need to construct a number of visualzations and only contains approximately
720 rows of digested per year.

Usage:
The data will be grouped based on the selections array. The year is
automatically added for each new row, as is the number of entries that
match that row's criteria.

For example, if the selections are "Education" and "Cause_Recode_39",
it will generate a new table that looks like this.

 Year | Num_in_Group | Education | Cause_Recode_39
--------------------------------------------------
 2013 | 1234         | 00        | 00
 2013 | 1500         | 00        | 01
 2013 | 39           | 01        | 00
 2013 | 90           | 01        | 01

 Num_in_Group then represents that, EG, 1234 people with educational
 attaiment 00 (refer to the data user guide) and death cause 00
 died in the year 2013.

 The parameters are as follows:
    - year (int): the year to attach to the data being converted
    - dropPrevious (bool): if the destination table already exists, should
        it be dropped before inserting the new data
    - verbose (bool): should the script print status updates
    - sourceDB (str): from which file should data be drawn
    - sourceTable (str): from which table in the sourceDB should data be drawn
    - destDB (str): into which database should data be inserted (it will be
        created if it does not yet exist)
    - destTable (str): into which table in the destDB should data be inserted
        (it will be created if it does not yet exist)
    - selections (list of strs): What columns of the source should be read,
        grouped, and output into the destination database

"""

import sqlite3
import tables

# -- Config -- #
# Define a list of dictionaries of settings for the tables
# you would like to generate. Each item in the list will
# generate a new table.
#
# A year and count of people in the group is automatically
# added to each table.
TABLE_CONFIG = tables.SERVER_TABLES


# -- Code Definitions -- #
class Table:
    def __init__(self, config):
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
        formattedGroupings = ", ".join(groupings)
        selections = ["Data_Year", "count(*)"]
        selections.extend(self.headers)

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
    for tableConfig in TABLE_CONFIG:
        t = Table(tableConfig)
        t.convertRows()
        t.close()
