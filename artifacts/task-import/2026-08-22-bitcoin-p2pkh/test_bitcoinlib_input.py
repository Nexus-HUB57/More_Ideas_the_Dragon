from bitcoinlib.transactions import Transaction
tx = Transaction()
import inspect
print(inspect.signature(tx.add_input))
