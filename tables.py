TABLES = [
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
