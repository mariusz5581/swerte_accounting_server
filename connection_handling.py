# connection_handling.py
import websockets
import asyncio
from server_functions import add_transaction, update_transaction, delete_transaction

async def server_app(websocket, path):
    try:
        data = await websocket.recv()
        data = data.split(' ')
        action = data[0]

        # Responding to client
        if action == 'add':
            date = data[1]
            title = data[2]
            category = data[3]
            base_ammount = float(data[4])
            procent_of_tax = float(data[5])
            ammount_of_tax = float(data[6])
            from_account = data[7]
            to_account = data[8]
            add_transaction(date, title, category, base_ammount, procent_of_tax, ammount_of_tax, from_account, to_account)
            await websocket.send('Transaction added successfully')
        elif action == 'update':
            transaction_id = int(data[1])
            date = data[2]
            title = data[3]
            category = data[4]
            base_ammount = float(data[5])
            procent_of_tax = float(data[6])
            ammount_of_tax = float(data[7])
            from_account = data[8]
            to_account = data[9]
            update_transaction(transaction_id, date, title, category, base_ammount, procent_of_tax, ammount_of_tax, from_account, to_account)
            await websocket.send('Transaction updated successfully')
        elif action == 'delete':
            transaction_id = int(data[1])
            delete_transaction(transaction_id)
            await websocket.send('Transaction deleted successfully')
        else:
            await websocket.send('No such action')

    finally:
        pass


start_server = websockets.serve(server_app, 'localhost', 5678)
