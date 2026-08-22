import requests
import json
import re

def get_bitcoin_balance(address):
    try:
        # Using Blockchain.com API
        url = f"https://blockchain.info/balance?active={address}"
        response = requests.get(url)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        data = response.json()

        if data and data.get(address) and data[address].get("final_balance") is not None:
            balance_satoshis = data[address]["final_balance"]
            balance_btc = balance_satoshis / 100_000_000.0
            return balance_btc
        else:
            return 0.0 # Address not found or no balance information
    except requests.exceptions.RequestException as e:
        print(f"Erro ao consultar saldo para {address} (Blockchain.com): {e}")
        return -1.0 # Indicate an error
    except json.JSONDecodeError:
        print(f"Erro ao decodificar JSON para {address} (Blockchain.com)")
        return -1.0

# Read addresses from wallet_analysis.md
addresses_to_check = []
with open("/home/ubuntu/wallet_analysis.md", "r") as f:
    content = f.read()
    # Regex to find Bitcoin addresses (starts with 1, 3 or bc1)
    # This regex is designed to capture addresses that are part of a list or embedded in text.
    # It looks for a word boundary, then (1|3|bc1) followed by 25-34 alphanumeric chars for P2PKH/P2SH
    # or 39+ for Bech32 (bc1) addresses.
    found_addresses = re.findall(r'\b(?:1|3)[a-km-zA-HJ-NP-Z1-9]{25,34}\b|\bbc1[ac-hj-np-z02-9]{39,}\b', content)
    for addr in found_addresses:
        addresses_to_check.append(addr)

# Remove duplicates
addresses_to_check = list(set(addresses_to_check))

print(f"Consultando saldos para {len(addresses_to_check)} endereços...")

balances = {}
for address in addresses_to_check:
    balance = get_bitcoin_balance(address)
    balances[address] = balance

# Generate report
report_content = "# Relatório de Saldos de Carteiras Bitcoin\n\n"
report_content += "## Saldos Individuais\n\n"
for address, balance in balances.items():
    if balance != -1.0:
        report_content += f"- Endereço: {address}\n  Saldo: {balance:.8f} BTC\n\n"
    else:
        report_content += f"- Endereço: {address}\n  Saldo: Erro ao consultar\n\n"

total_balance = sum(b for b in balances.values() if b != -1.0)
report_content += f"\n## Saldo Total Consolidado\n\n"
report_content += f"- Saldo Total: {total_balance:.8f} BTC\n"

with open("/home/ubuntu/bitcoin_balances_report.md", "w") as f:
    f.write(report_content)

print("Relatório de saldos salvo em /home/ubuntu/bitcoin_balances_report.md")


