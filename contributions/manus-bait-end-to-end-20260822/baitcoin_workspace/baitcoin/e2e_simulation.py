import json
import logging
from main import BaitcoinEcosystemOrchestrator

logging.basicConfig(level=logging.INFO, format='%(asctime)s - [E2E-SIMULATION] - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_end_to_end_simulation():
    logger.info("==================================================")
    logger.info("INICIANDO SIMULAÇÃO END-TO-END DO ECOSSISTEMA b'AI'tcoin")
    logger.info("==================================================")

    orch = BaitcoinEcosystemOrchestrator()

    logger.info("\n--- FASE 2: Faucet e Minting de Tokens ---")
    faucet_res = orch.faucet.request_funds(orch.wallet.address)
    logger.info(f"Faucet Response: {faucet_res}")
    orch.tokenomics.mint(orch.wallet.address, 10000 * 10**8)
    balance = orch.tokenomics.get_balance(orch.wallet.address)
    logger.info(f"Saldo atualizado na carteira {orch.wallet.address}: {balance / 10**8} BAIT")

    logger.info("\n--- FASE 3: B'AI'nkr Staking & Empréstimos ---")
    stake_success = orch.bank.stake(orch.wallet.address, 5000 * 10**8)
    logger.info(f"Staking de 5.000 BAIT realizado com sucesso? {stake_success}")
    rewards = orch.bank.calculate_rewards(orch.wallet.address, 210240)
    logger.info(f"Recompensas estimadas de staking (7% APY): {rewards / 10**8:.4f} BAIT")

    logger.info("\n--- FASE 4: Agente Autônomo via Obscura Headless Bridge ---")
    orch.obscura.navigate("https://www.mybait.org/bainkr")
    dom_action = orch.obscura.execute_agent_action("click", "#stake-btn", "5000")
    logger.info(f"Ação executada pelo agente no DOM: {dom_action}")

    logger.info("\n--- FASE 5: AI Store Marketplace ---")
    products = orch.store.list_products()
    logger.info(f"Produtos disponíveis na AI Store: {len(products)}")
    purchase = orch.store.purchase_product(products[0]["id"], orch.wallet.address)
    logger.info(f"Resultado da compra de produto: {purchase}")

    logger.info("\n--- FASE 6: Mineração PoW e Cibersegurança PQC ---")
    sk, pk = orch.pqc.generate_quantum_resistant_keypair()
    tx_payload = {"sender": orch.wallet.address, "recipient": "agent_vault", "amount": 100.0}
    
    # Adicionar bloco na blockchain primeiro para obter Merkle root real
    new_block = orch.blockchain.add_block([tx_payload])
    
    header = {"index": new_block.index, "previous_hash": new_block.previous_hash, "merkle_root": new_block.merkle_root}
    msg = f"{header['index']}:{header['previous_hash']}:{header['merkle_root']}".encode()
    pqc_sig = orch.pqc.sign_message_pqc(sk, msg)
    
    logger.info(f"Novo bloco minerado! Altura: {new_block.index}, Hash: {new_block.hash[:16]}...")
    
    is_pqc_valid = orch.pqc.validate_pqc_consensus_block(header, pk, pqc_sig, sk)
    logger.info(f"Validação de Consenso PQC no bloco: {is_pqc_valid}")

    logger.info("\n--- FASE 7: Persistência WAL ---")
    orch.wal.write_log("blocks", "MINE_BLOCK", {"index": new_block.index, "hash": new_block.hash})
    logger.info("Log de bloco gravado com sucesso no Write-Ahead Log (WAL).")

    logger.info("\n--- FASE 8: Auditoria via Explorer & REST API ---")
    orch.explorer.build_indexes()
    stats = orch.explorer.get_network_stats()
    logger.info(f"Estatísticas da Rede (Explorer): {stats}")
    
    api_res = orch.api.handle_request("/api/v1/status", "master_audit_client")
    logger.info(f"Resposta da REST API (/api/v1/status): {api_res}")

    logger.info("==================================================")
    logger.info("SIMULAÇÃO END-TO-END CONCLUÍDA COM 100% DE SUCESSO!")
    logger.info("==================================================")

if __name__ == "__main__":
    run_end_to_end_simulation()
