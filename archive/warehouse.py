
#
# Gather data from mortality.db and push it into warehouses
# of digested data.
#
# See bottom of file for example usage
#

import sqlite3

OPERATIONAL_DB = "mortality.db"
WAREHOUSE_DB = "warehouse.db"


class Table:
    """
    Table is a class for pulling operational data and digesting
    it into a digested, warehoused form. Specifically it creates
    a relation between two columns in the operational database.

    For example, if a Table is created with the columns 'Education'
    and 'Cause_Recode_39' (in that order) then a table will be created
    in which the first column of the row represents the persons of that
    particular educational attainment, and each column in that row represents
    the sum total of persons of that educational attainment who died of the
    cause specified by that column's header.

    By example, for operational rows:

    ID       | Education | Cause_Recode_39
    --------------------------------------
    Person A | 00        | 001
    Person B | 01        | 003
    Person C | 01        | 001
    Person D | 00        | 001
    ...

    A Table would be generated that looks like this:

    Education | Ind1 | Ind2 | Ind 3 | ...
    --------------------------------------------
    00        | 2    | 0    | 0     | ...
    01        | 1    | 0    | 1     | ...
    ...

    Note that the 'Ind' prefix is there because SQLite does not
    allow column headers to begin with an integer. It can be replaced
    by handing an array of column headers to the Table in the
    generateDBTable method. The leftmost column header must always
    be specified in the generateDBTable method (as the headerName param)

    """

    def __init__(
        self,
        numRows,
        numCols,
        rowMap={},
        colMap={},
        row0thInd=True,
        col0thInd=True
    ):
        self.numRows = numRows
        self.numCols = numCols

        self.rowMap = rowMap
        self.colMap = colMap

        self._pyToSQLRowDict = dict(zip(rowMap.values(), rowMap.keys()))
        self._pyToSQLColDict = dict(zip(colMap.values(), colMap.keys()))

        self.row0thInd = row0thInd
        self.col0thInd = col0thInd

        self.table = [[0 for y in range(numCols)] for x in range(numRows)]

        self.sum = 0

    def load(self, rowName, collatedColumnName, table, db, indicators=True):
        if (indicators):
            print("--Loading Data--")

        with sqlite3.connect(db) as conn:
            curs = conn.cursor()
            curs.execute("SELECT {}, {} FROM {}".format(
                rowName,
                collatedColumnName,
                table)
            )

            item = curs.fetchone()

            while item is not None:
                if item[0] != '' and item[1] != '':
                    self._add(item[0], item[1])

                if indicators and not self.sum % 20000:
                    print("loaded records: {}".format(self.sum))

                item = curs.fetchone()

        if indicators:
            print("--{} Data Loaded --\n".format(self.sum))

    def _sqlToPyCol(self, colVal):
        if int(colVal) in self.colMap:
            return self.colMap[int(colVal)]

        return int(colVal)

    def _sqlToPyRow(self, rowVal):
        if int(rowVal) in self.rowMap:
            return self.rowMap[int(rowVal)]

        return int(rowVal)

    def _pyToSQLCol(self, colVal):
        if int(colVal) in self._pyToSQLColDict:
            return str(self._pyToSQLColDict[colVal])

        return str(colVal)

    def _pyToSQLRow(self, rowVal):
        if int(rowVal) in self._pyToSQLRowDict:
            return int(self._pyToSQLRowDict[rowVal])

        return int(rowVal)

    def _add(self, rowVal, colVal):
        colVal = self._sqlToPyCol(colVal)
        rowVal = self._sqlToPyRow(rowVal)
        self.table[rowVal][colVal] += 1
        self.sum += 1

    def generateDBTable(
        self,
        headerName,
        tableName,
        db,
        columnHeaders=None,
        indicators=True,
        drop=False
    ):
        if (indicators):
            print("--Writing Data--")

        with sqlite3.connect(db) as conn:
            curs = conn.cursor()

            # Construct an array of header names
            if not columnHeaders:
                columnHeaders = [
                    "Ind{} integer".format(self._pyToSQLCol(col))
                    for col
                    in range(self.numCols)
                ]

            columnHeaders.insert(0, "{} integer".format(headerName))
            headerNames = ", ".join(columnHeaders)

            # Create table
            if (drop):
                curs.execute(
                    "DROP TABLE IF EXISTS {}".format(
                        tableName
                    )
                )

            curs.execute(
                "CREATE TABLE IF NOT EXISTS {} ({})".format(
                    tableName,
                    headerNames
                )
            )

            # Insert collated data
            for index, row in enumerate(self.table):
                # If there is no 0th index in the row data,
                # just skip outputting the 0th row
                if (not self.row0thInd) and index == 0:
                    continue

                # If there is no 0th index in the column data, just
                # overwrite that index with the first column data
                # rather than inserting
                if self.col0thInd:
                    row.insert(0, self._pyToSQLRow(index))
                else:
                    row[0] = self._pyToSQLRow(index)

                row = ", ".join([str(x) for x in row])
                curs.execute(
                    "INSERT INTO {} VALUES ({})".format(
                        tableName,
                        row
                    )
                )

        if (indicators):
            print("--Data Written--\n")

    def __str__(self):
        toReturn = ""

        for index, row in enumerate(self.table):
            if (not self.row0thInd) and index == 0:
                    continue

            if self.col0thInd:
                row.insert(0, self._pyToSQLRow(index))
            else:
                row[0] = self._pyToSQLRow(index)

            toReturn += str(row) + "\n"

        return toReturn

if __name__ == "__main__":
    # -- Example digest: Collating Cause of Death (recode 39) by Education -- #

    # Create a new Table object with 19 rows and 43 columns
    # The rowMap specifies that while the data user guide specifies
    # that a datum, 99, is provided as a value for education
    # (meaning "not stated"), that data should be temporarily
    # recoded to index 18 of the Table's rows. Its name will be
    # changed back to Int99 in the rolled up database
    #
    # The col0thInd is set to false because in the Cause_Recode_39,
    # the 0 index is not used and, if this is off, it will misrepresent
    # the results as being due to the wrong cause
    causeByEducation = Table(19, 43, rowMap={99: 18}, col0thInd=False)

    # Load data from the OPERATIONAL_DB into the Table. The table's
    # rows will be indexed by "Education" and the column corresponding
    # to each Education value will be the number of deaths of each
    # "Cause_Recode_39" for that Education level
    #
    # 'mortality' is the table within the OPERATIONAL_DB from which
    # the data is drawn
    causeByEducation.load(
        "Education",
        "Cause_Recode_39",
        "mortality",
        OPERATIONAL_DB
    )

    # Pull in column headers for Cause_Recode_39 from another file
    from datamappings import causeRecode39Headers
    columnHeaders = [
        x.replace(" ", "_") + " integer"
        for x in causeRecode39Headers
    ]

    # Once the data is loaded up and digested, write it back into
    # the (about to be created) "cause39ByEducation" table in the
    # WAREHOUSE_DB. The header for the first column will be "Education".
    # Every other column will be headed by Intxx where xx is the educational
    # attainment value (see the data's user guide for the mapping of these).
    # The drop parameter specifies that this operation should drop the
    # "cause39ByEducation" table if it already exists
    causeByEducation.generateDBTable(
        "Education",
        "cause39ByEducation",
        WAREHOUSE_DB,
        columnHeaders=columnHeaders,
        drop=True
    )

    # -- Cause By Disposition -- #
    causeByMannerOfDeath = Table(8, 43, row0thInd=False, col0thInd=False)
    causeByMannerOfDeath.load(
        "Manner_Of_Death",
        "Cause_Recode_39",
        "mortality",
        OPERATIONAL_DB
    )

    # This seems unnecessary, but there is a pass by reference
    # bug somewhere that causes this to get mutated if the
    # column headers are not explicitly redefined
    from datamappings import causeRecode39Headers
    columnHeaders = [
        x.replace(" ", "_") + " integer"
        for x in causeRecode39Headers
    ]

    causeByMannerOfDeath.generateDBTable(
        "Manner_Of_Death",
        "causeByMannerOfDeath",
        WAREHOUSE_DB,
        columnHeaders=columnHeaders,
        drop=True
    )
