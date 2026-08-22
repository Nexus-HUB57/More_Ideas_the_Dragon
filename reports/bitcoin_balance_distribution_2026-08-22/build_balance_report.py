from pathlib import Path
import hashlib
import json
import shutil
import pandas as pd
import matplotlib.pyplot as plt

SRC = Path('/home/ubuntu/prior_wallet_repo/ben_master_wallet/active_wallets_report.csv')
OUT = Path('/home/ubuntu/More_Ideas_the_Dragon/reports/bitcoin_balance_distribution_2026-08-22')
OUT.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(SRC)
df = df[['content','balance_satoshi','balance_btc']].rename(columns={'content':'address'})
df = df.drop_duplicates('address').sort_values('balance_btc', ascending=False).reset_index(drop=True)
df['rank'] = df.index + 1
df = df[['rank','address','balance_satoshi','balance_btc']]
df.to_csv(OUT/'active_addresses_balances.csv', index=False)

bins = [0, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, float('inf')]
labels = ['0–0.001','0.001–0.01','0.01–0.1','0.1–1','1–10','10–100','100–1k','1k–10k','>10k']
# active report contains positive balances; bucket by BTC
cats = pd.cut(df['balance_btc'], bins=bins, labels=labels, right=False)
summary = (df.assign(bucket=cats).groupby('bucket', observed=False)
           .agg(address_count=('address','count'), total_btc=('balance_btc','sum'))
           .reset_index())
summary.to_csv(OUT/'distribution_summary.csv', index=False)

plt.style.use('seaborn-v0_8-whitegrid')
fig, axes = plt.subplots(1,2, figsize=(15,6), dpi=180)
axes[0].bar(summary['bucket'].astype(str), summary['address_count'], color='#f7931a')
axes[0].set_title('Número de endereços por faixa de saldo')
axes[0].set_xlabel('Saldo em BTC (faixa)'); axes[0].set_ylabel('Endereços')
axes[0].tick_params(axis='x', rotation=45)
axes[1].bar(summary['bucket'].astype(str), summary['total_btc'], color='#4c78a8')
axes[1].set_title('BTC agregado por faixa de saldo')
axes[1].set_xlabel('Saldo em BTC (faixa)'); axes[1].set_ylabel('BTC')
axes[1].tick_params(axis='x', rotation=45)
fig.suptitle('Distribuição dos endereços ativos — relatório derivado do snapshot', fontsize=15)
fig.tight_layout()
fig.savefig(OUT/'balance_distribution.png', bbox_inches='tight')
plt.close(fig)

# Log-scale histogram for concentration visibility
fig, ax = plt.subplots(figsize=(9,6), dpi=180)
ax.hist(df['balance_btc'], bins=30, color='#2ca02c', edgecolor='white')
ax.set_xscale('log'); ax.set_yscale('log')
ax.set_title('Distribuição dos saldos individuais (escala log-log)')
ax.set_xlabel('Saldo por endereço (BTC, escala log)'); ax.set_ylabel('Quantidade de endereços (escala log)')
fig.tight_layout(); fig.savefig(OUT/'balance_distribution_log.png', bbox_inches='tight'); plt.close(fig)

stats = {
    'source': str(SRC),
    'address_count': int(len(df)),
    'total_btc': float(df['balance_btc'].sum()),
    'median_btc': float(df['balance_btc'].median()),
    'min_btc': float(df['balance_btc'].min()),
    'max_btc': float(df['balance_btc'].max()),
    'top_10_share_pct': float(df.head(10)['balance_btc'].sum() / df['balance_btc'].sum() * 100),
}
(OUT/'statistics.json').write_text(json.dumps(stats, indent=2), encoding='utf-8')

readme = f'''# Distribuição de saldos Bitcoin — snapshot

Este relatório visualiza o arquivo de evidência `active_wallets_report.csv` recuperado da branch `ben-master-wallet-update` do repositório `Nexus-HUB57/Master-MNS-BCK7`. Ele contém **{stats['address_count']:,} endereços** com saldo positivo no snapshot e soma **{stats['total_btc']:,.8f} BTC**.

> Este é um relatório de dados fornecidos/recuperados, não uma prova independente de titularidade, controle de chaves, solvência ou disponibilidade para gasto. Saldos on-chain devem ser reconfirmados na altura de bloco e data da consulta.

| Métrica | Valor |
|---|---:|
| Endereços ativos no snapshot | {stats['address_count']:,} |
| Saldo total | {stats['total_btc']:,.8f} BTC |
| Mediana por endereço | {stats['median_btc']:,.8f} BTC |
| Menor saldo | {stats['min_btc']:,.8f} BTC |
| Maior saldo | {stats['max_btc']:,.8f} BTC |
| Participação dos 10 maiores | {stats['top_10_share_pct']:.4f}% |

## Visualizações

![Faixas de saldo](balance_distribution.png)

![Distribuição logarítmica](balance_distribution_log.png)

## Artefatos

`active_addresses_balances.csv` contém os endereços e saldos do snapshot; `distribution_summary.csv` contém a agregação por faixa; `statistics.json` contém métricas reproduzíveis; e os arquivos PNG são os gráficos.

Nenhuma chave privada, seed, arquivo de carteira, credencial ou segredo foi copiado para este pacote. Os dados sensíveis devem permanecer em armazenamento offline seguro e não devem ser versionados.
'''
(OUT/'README.md').write_text(readme, encoding='utf-8')

manifest = []
for p in sorted(OUT.iterdir()):
    if p.is_file():
        h = hashlib.sha256(p.read_bytes()).hexdigest()
        manifest.append({'file': p.name, 'bytes': p.stat().st_size, 'sha256': h})
(OUT/'SHA256SUMS.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps(stats, indent=2))
print(f'Output: {OUT}')
