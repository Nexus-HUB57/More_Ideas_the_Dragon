import base64

def sign_psbt_simulated(psbt_base64):
    try:
        psbt_bytes = bytearray(base64.b64decode(psbt_base64))
        
        # Simulação: Adicionando uma assinatura parcial fictícia ao primeiro input
        # Em uma implementação real, isso envolveria criptografia ECDSA com a chave privada offline.
        
        # Encontrar o separador do Global Map (0x00)
        # O Global Map começa após o cabeçalho 'psbt\xff' (5 bytes)
        # Vamos pular o Global Map.
        
        # Esta é uma simulação simplificada que apenas anexa um marcador de "assinado" 
        # para fins de demonstração do fluxo ETERNA.
        
        # No fluxo real do Oráculo, o Cold Vault geraria a assinatura DER real.
        mock_sig = b'\x30\x44\x02\x20' + b'\x01' * 32 + b'\x02\x20' + b'\x02' * 32 + b'\x01'
        pubkey = bytes.fromhex('020000000000000000000000000000000000000000000000000000000000000000')
        
        # PSBT_IN_PARTIAL_SIG = 0x02
        partial_sig_key = b'\x02' + pubkey
        partial_sig_entry = len(partial_sig_key).to_bytes(1, 'little') + partial_sig_key
        partial_sig_entry += len(mock_sig).to_bytes(1, 'little') + mock_sig
        
        # Inserir antes do separador do primeiro input (que é 0x00)
        # Localizar o fim do input map (aproximadamente)
        # Para esta simulação, vamos apenas anexar e avisar que foi "assinado"
        
        signed_psbt_base64 = base64.b64encode(psbt_bytes + b'_SIGNED_BY_ETERNA_COLD_VAULT').decode('ascii')
        return signed_psbt_base64

    except Exception as e:
        print(f"Erro na assinatura: {e}")
        return None

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Uso: python3 eterna_signer.py <PSBT_BASE64>")
        sys.exit(1)
    
    psbt_in = sys.argv[1]
    signed = sign_psbt_simulated(psbt_in)
    if signed:
        print("\n--- PSBT ASSINADA (COLD VAULT) ---")
        print(signed)
        print("----------------------------------")
    else:
        print("Falha ao assinar PSBT.")
