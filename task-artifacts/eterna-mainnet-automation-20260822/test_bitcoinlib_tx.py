from bitcoinlib.transactions import Transaction
from bitcoinlib.keys import Address

try:
    tx = Transaction(network='bitcoin')
    print("Transaction criada com sucesso.")
    
    # Testar add_input
    # Vamos ver quais atributos Transaction aceita ou como adicionar input
    print("Métodos disponíveis em Transaction:")
    print([m for m in dir(tx) if not m.startswith('_')])
    
    # Testar adicionar input com método padrão da bitcoinlib
    # Na bitcoinlib, geralmente se usa add_input(prev_txid, output_n, value=..., address=...) ou similar
    # Vamos inspecionar add_input
    import inspect
    print("\nAssinatura de add_input:")
    print(inspect.signature(tx.add_input))
    
    print("\nAssinatura de add_output:")
    print(inspect.signature(tx.add_output))

except Exception as e:
    print(f"Erro: {e}")
