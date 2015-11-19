import datamappings

# Instructions for use in the warehouse script to create tables
WAREHOUSE_TABLES = [
    {
        "dropPrevious": True,
        "verbose": True,
        "sourceDB": "mortality.db",
        "sourceTable": "mortality",
        "destDB": "warehouse.db",
        "destTable": "EducationAndCause39",
        "selections":
            [
                "Education",
                "Cause_Recode_39",
            ]
    },

    {
        "dropPrevious": True,
        "verbose": True,
        "sourceDB": "mortality.db",
        "sourceTable": "mortality",
        "destDB": "warehouse.db",
        "destTable": "AgeAndCause39",
        "selections":
            [
                "Age_Value",
                "Cause_Recode_39",
            ]
    },

    {
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
]

# Defined columns for use in server table.
# Each column must have a "header" key.
# Additionally, if the value should be mapped
# via a function or dictionary, that instruction
# can be included by adding either a "mapFunc" or
# "mapping" key.
#
# "mapFunc" is checked first, and should map a single
# value to an output.
# If no "mapFunc" is specified, "mapping" will be checked.
# If specified, "mapping" should be a dictionary.
# If neither "mapFunc" nor "mapping" is specified, the
# value will be left as is.
COLUMNS = {
    "Education": {
        "header": "Education",
        "mapping": datamappings.educationLevel
    },

    "Cause of Death": {
        "header": "Cause of Death",
        "mapping": datamappings.causeRecode39Headers
    },

    "Age": {
        "header": "Age (Years)",
        "mapFunc": lambda x: int(x)
    },
}

# The tables that are available for use by the server
# and the column information the server should be aware of
SERVER_TABLES = {
    "EducationAndCause39": [
        COLUMNS["Education"],
        COLUMNS["Cause of Death"]
    ],

    "AgeAndCause39": [
        COLUMNS["Age"],
        COLUMNS["Cause of Death"]
    ],

    "EducationAndAge": [
        COLUMNS["Education"],
        COLUMNS["Age"],
    ]
}
