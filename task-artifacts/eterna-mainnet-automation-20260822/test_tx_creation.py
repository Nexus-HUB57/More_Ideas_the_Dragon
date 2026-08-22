from bitcoinlib.transactions import Transaction

tx = Transaction(network='bitcoin')
tx.add_input(prev_txid="0" * 64, output_n=0, value=100000, address="113aNq2MZDE2HFKsUe7uXLNrfnF5iSHQug")
tx.add_output(value=10000, address="bc1qwwgdhzdgy97ysqqtd9z7rwv76fwktg0w4tvwf8")
print("Raw hex:", tx.raw_hex())
print("As hex:", tx.as_hex())
