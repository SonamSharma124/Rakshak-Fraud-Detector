import sqlite3

conn = sqlite3.connect("traces.db")
cursor = conn.cursor()
cursor.execute("SELECT * FROM spans")
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()