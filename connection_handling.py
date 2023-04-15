# this is connection_handling.py
import websockets
import asyncio
from server_functions import add_transaction, update_transaction, delete_transaction, verify_user

async def server_app(websocket, path):
    try:
        # Receive authentication data
        auth_data = await websocket.recv()
        auth_data = auth_data.split(' ')
        action, username, password = auth_data[0], auth_data[1], auth_data[2]

        # Verify user credentials
        if action == 'login':
            # Verify user credentials
            if verify_user(username, password):
                await websocket.send('Login successful')
            else:
                await websocket.send('Invalid credentials')
                return
        else:
            await websocket.send('No such action')

        # Receive transaction data
        transaction_data = await websocket.recv()
        transaction_data = transaction_data.split(' ')
        action = transaction_data[0]

        # Responding to client
        if action == 'add':
            date = transaction_data[1]
            title = transaction_data[2]
            category = transaction_data[3]
            base_ammount = float(transaction_data[4])
            procent_of_tax = float(transaction_data[5])
            ammount_of_tax = float(transaction_data[6])
            from_account = transaction_data[7]
            to_account = transaction_data[8]
            add_transaction(date, title, category, base_ammount, procent_of_tax, ammount_of_tax, from_account, to_account)
            await websocket.send('Transaction added successfully')

        elif action == 'update':
            transaction_id = int(transaction_data[1])
            date = transaction_data[2]
            title = transaction_data[3]
            category = transaction_data[4]
            base_ammount = float(transaction_data[5])
            procent_of_tax = float(transaction_data[6])
            ammount_of_tax = float(transaction_data[7])
            from_account = transaction_data[8]
            to_account = transaction_data[9]
            update_transaction(transaction_id, date, title, category, base_ammount, procent_of_tax, ammount_of_tax, from_account, to_account)
            await websocket.send('Transaction updated successfully')

        elif action == 'delete':
            transaction_id = int(transaction_data[1])
            delete_transaction(transaction_id)
            await websocket.send('Transaction deleted successfully')

        else:
            await websocket.send('No such action')

    except websockets.exceptions.ConnectionClosedOK:
        pass
    except Exception as e:
        print(f'Error: {e}')

start_server = websockets.serve(server_app, '167.86.88.177', 5678)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
