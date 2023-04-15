# this is start.py
import socket
import asyncio
import sqlite3
import pandas as pd
import os

import websockets
from connection_handling import server_app

# Constants
credentials_path = 'credentials.xlsx'

# Creating database
conn = sqlite3.connect('accounting_db.db')
cursor = conn.cursor()

def setup_database():
    # Create transactions table
    cursor.execute("""CREATE TABLE IF NOT EXISTS transactions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        date TEXT NOT NULL,
                        title TEXT NOT NULL,
                        category TEXT NOT NULL,
                        base_ammount REAL NOT NULL,
                        procent_of_tax REAL NOT NULL,
                        ammount_of_tax REAL NOT NULL,
                        from_account TEXT NOT NULL,
                        to_account TEXT NOT NULL)
                    """)

    # Create users table
    cursor.execute("""CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL)
                    """)

    conn.commit()

setup_database()

# Credentials handling
def read_credentials():
    if os.path.exists(credentials_path):
        df = pd.read_excel(credentials_path, index_col='id')
        print(f'Read credentials:\n{df}')  # Debug message
        return df
    else:
        print('Credentials file not found, creating one with test users.')  # Debug message
        df = pd.DataFrame(columns=['id', 'username', 'password'])
        test_users = [{'id': 1, 'username': 't', 'password': '1'},
                      {'id': 2, 'username': 'tt', 'password': '11'}]

        for user in test_users:
            df = df.append(user, ignore_index=True)

        write_credentials(df)
        return df


def write_credentials(df):
    df.to_excel(credentials_path, index=False)


def add_user(username, password):
    df = read_credentials()
    user_id = len(df) + 1
    new_user = pd.DataFrame({'id': [user_id], 'username': [username], 'password': [password]})
    df = df.append(new_user, ignore_index=True)
    write_credentials(df)
    print(f'User added: {username}')  # Debug message


def verify_user(username, password):
    df = read_credentials()
    user = df.loc[df['username'] == username]
    success = not user.empty and user.iloc[0]['password'] == password
    print(f'User verification: {username}, success: {success}')  # Debug message
    return success


def update_password(username, new_password):
    df = read_credentials()
    user_index = df.loc[df['username'] == username].index
    if not user_index.empty:
        df.at[user_index[0], 'password'] = new_password
        write_credentials(df)
        print(f'Password updated for user: {username}')  # Debug message
    else:
        print(f'User not found: {username}')  # Debug message


async def shutdown():
    while True:
        user_input = input()
        if user_input.lower() == 'q':
            print("Shutting down the server...")
            for task in asyncio.all_tasks():
                task.cancel()
            break

# Run the WebSocket server
if __name__ == '__main__':
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    server_task = loop.create_task(websockets.serve(server_app, '167.86.88.177', 5678))
    shutdown_task = loop.create_task(shutdown())
    loop.run_until_complete(asyncio.gather(server_task, shutdown_task))
    loop.run_forever()