import sqlite3

conn = sqlite3.connect('accounting_db.db')
cursor = conn.cursor()

def add_transaction(date, title, category, base_ammount, procent_of_tax, ammount_of_tax, from_account, to_account):
    cursor.execute("""INSERT INTO transactions (date, title, category, base_ammount, 
                    procent_of_tax, ammount_of_tax, from_account, to_account) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)""", 
                    (date, title, category, base_ammount, 
                    procent_of_tax, ammount_of_tax, from_account, to_account))
    conn.commit()
    print(f"Transaction added: {date}, {title}, {category}, {base_ammount}, {procent_of_tax}, {ammount_of_tax}, {from_account}, {to_account}")  # Debug message

def update_transaction(transaction_id, date, title, category, base_ammount, procent_of_tax, ammount_of_tax, from_account, to_account):
    cursor.execute("""UPDATE transactions 
                    SET date = ?, title = ?, category = ?, base_ammount = ?, 
                    procent_of_tax = ?, ammount_of_tax = ?, from_account = ?, to_account = ?
                    WHERE id = ?""", 
                    (date, title, category, base_ammount, 
                    procent_of_tax, ammount_of_tax, from_account, to_account, transaction_id))
    conn.commit()
    print(f"Transaction updated: {transaction_id}, {date}, {title}, {category}, {base_ammount}, {procent_of_tax}, {ammount_of_tax}, {from_account}, {to_account}")  # Debug message

def delete_transaction(transaction_id):
    cursor.execute("DELETE FROM transactions WHERE id = ?", (transaction_id,))
    conn.commit()
    print(f"Transaction deleted: {transaction_id}")  # Debug message
