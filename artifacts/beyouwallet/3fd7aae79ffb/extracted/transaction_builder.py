
from core.blockchain_api import BlockchainAPI
from config import CUSTODIAL_DESTINATION_ADDRESS, DAILY_BTC_LIMIT
from bitcoinlib.transactions import Transaction, Script, Input, Output
from bitcoinlib.keys import Key

class StrategicTransactionBuilder:
    def __init__(self, state_manager, consolidator):
        self.state_manager = state_manager
        self.consolidator = consolidator # Contém as chaves privadas importadas
        self.api = BlockchainAPI()

    def select_utxos_for_next_batch(self):
        unspent_utxos = self.state_manager.get_unspent_utxos()
        
        # 1. Ordena os UTXOs do menor para o maior valor
        sorted_utxos = sorted(unspent_utxos, key=lambda u: u["value_sats"])
        
        # 2. Seleciona UTXOs até atingir o limite diário
        selected_utxos = []
        current_batch_value_sats = 0
        remaining_daily_allowance_sats = (DAILY_BTC_LIMIT - self.state_manager.state["daily_sent_btc"]) * 1e8
        
        for utxo in sorted_utxos:
            if current_batch_value_sats + utxo["value_sats"] <= remaining_daily_allowance_sats:
                selected_utxos.append(utxo)
                current_batch_value_sats += utxo["value_sats"]
            else:
                break # Limite atingido ou próximo UTXO é muito grande
                
        return selected_utxos, current_batch_value_sats

    def build_and_sign_batch_tx(self):
        selected_utxos, total_value_sats = self.select_utxos_for_next_batch()
        if not selected_utxos:
            return None, [], 0.0

        # Estimar taxa de forma mais realista (ex: 10 sat/byte)
        # Uma transação típica com 1 entrada P2WPKH e 1 saída P2WPKH tem ~140 bytes virtuais
        # Vamos usar uma estimativa conservadora para múltiplas entradas
        estimated_vsize = len(selected_utxos) * 68 + 31 * 2 + 10 # Aproximação para P2WPKH
        fee_per_byte = 10 # satoshis por byte (pode ser dinâmico via API no futuro)
        fee_sats = estimated_vsize * fee_per_byte

        output_value_sats = total_value_sats - fee_sats
        
        if output_value_sats <= 0:
            print("AVISO: Valor total dos UTXOs selecionados é insuficiente para cobrir taxas.")
            return None, [], 0.0

        # Construir a transação usando bitcoinlib
        tx = Transaction()

        # Adicionar entradas
        for utxo in selected_utxos:
            # A bitcoinlib precisa do script_pubkey, não do script_sig
            # O script_pubkey é o script do UTXO que está sendo gasto
            tx.add_input(utxo["txid"], utxo["vout"], utxo["script"])

        # Adicionar saída para o endereço de custódia
        tx.add_output(address=CUSTODIAL_DESTINATION_ADDRESS, amount=output_value_sats)

        # Assinar cada entrada
        for i, utxo in enumerate(selected_utxos):
            # Obter a chave privada (descriptografada, se necessário) usando o consolidator
            private_key_hex = self.consolidator.get_private_key_for_address(utxo["address"])
            # A bitcoinlib espera a chave privada em formato WIF ou hex. O consolidator retorna hex.
            # Se a chave privada for WIF, a Key(wif_string) funciona. Se for hex, Key(hex_string).
            # Vamos garantir que seja hex para a Key.
            
            if not private_key_hex:
                address = utxo["address"]
                raise ValueError(f"Chave privada não encontrada para o endereço {address}")
            
            # Criar objeto Key a partir da chave privada hex
            key = Key(private_key_hex, is_private=True, network='bitcoin')
            
            # Assinar a entrada
            tx.sign(input_n=i, keys=key)
            
        return tx, selected_utxos, total_value_sats / 1e8




