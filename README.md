# Death and Taxes
#### (Well, not really taxes. But death!)

### Instructions for Running
Note: A copy of our warehouse database is included. Cloning the repo directly should therefore include all of the correct data to run the viz.

To run the viz, simply run `python server.py` to start the server running on port 3000. Then, in your browser, navigate to localhost:3000 to view the visualization.


### Database in Depth
If, for whatever reason, you need to set up the warehouse database, copy the data you would like (2003, 2008, and 2013 data) into `mortality.db` using the `datamapping.py` provided script. Once the raw data is in `mortality.db` run the `python warehouse.py` command to collate and format the data and copy it into the `warehouse.db` table for use by the server.


### How the Code Fits Together
Backend:
- `makedb.py`: Takes raw data files and maps them into `mortality.db`

- `warehouse.py`: Takes operational data from `mortality.db` and collates it into `warehouse.db` based on parameters in `tables.py`. Also replaces the operational data's numeric coding with readable names using maps in `datamappings.py`

-`server.py`: Runs the server, reading data from `warehouse.db` and also some information about available tables from `tables.py`. Serves `index.html`

Front End:
- `index.html`: Requests all contents of the `\js\` directory for use on the front-end