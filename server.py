from bottle import route, run, template
import sqlite3


@route('/')
def index():
    return '<b>Hello</b>!'

if __name__ == "__main__":
    run(host='localhost', port=3000)
