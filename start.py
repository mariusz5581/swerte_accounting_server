# main.py
import socket
import asyncio
import sqlite3
import pandas as pd
import os

import websockets
from connection_handling import server_app, start_server

# Constants
credentials_path = 'credentials.xlsx'

# Creating database
conn = sqlite3.connect('accounting_db.db')
cursor = conn.cursor()

# (Database setup code)

# Credentials handling
def read_credentials():
    if os.path.exists(credentials_path):
        return pd.read_excel(credentials_path, index_col='id')
    else:
        return pd.DataFrame(columns=['id', 'username', 'password'])


def write_credentials(df):
    df.to_excel(credentials_path, index=False)


def add_user(username, password):
    df = read_credentials()
    user_id = len(df) + 1
    new_user = pd.DataFrame({'id': [user_id], 'username': [username], 'password': [password]})
    df = df.append(new_user, ignore_index=True)
    write_credentials(df)


def verify_user(username, password):
    df = read_credentials()
    user = df.loc[df['username'] == username]
    return not user.empty and user.iloc[0]['password'] == password

def update_password(username, new_password):
    df = read_credentials()
    user_index = df.loc[df['username'] == username].index
    if not user_index.empty:
        df.at[user_index[0], 'password'] = new_password
        write_credentials(df)

# Run the WebSocket server
if __name__ == '__main__':
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(websockets.serve(server_app, '167.86.88.177', 5678))
    loop.run_forever()
