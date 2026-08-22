import { useState } from 'react';
import './App.css';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';

function App() {
  const [address, setAddress] = useState('');
  const [utxos, setUtxos] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [rawTx, setRawTx] = useState('');
  const [message, setMessage] = useState('');
  const [senderAddress, setSenderAddress] = useState('');

  const handleGetUtxos = async () => {
    setMessage('Buscando UTXOs...');
    try {
      const response = await fetch(`/api/bitcoin/utxos/${address}`);
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      setUtxos(JSON.stringify(data, null, 2));
      setMessage('UTXOs carregados com sucesso.');
    } catch (error) {
      setMessage(`Erro ao buscar UTXOs: ${error.message}`);
      console.error('Erro ao buscar UTXOs:', error);
    }
  };

  const handleCreateTransaction = async () => {
    setMessage('Criando transação hexadecimal...');
    try {
      const utxosParsed = JSON.parse(utxos);
      const response = await fetch('/api/bitcoin/create_raw_transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          utxos: utxosParsed,
          recipient_address: recipient,
          amount_btc: parseFloat(amount),
          sender_address: senderAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setRawTx(data.raw_tx_hex);
      setMessage('Transação hexadecimal não assinada gerada com sucesso. Copie e assine manualmente.');
    } catch (error) {
      setMessage(`Erro ao criar transação: ${error.message}`);
      console.error('Erro ao criar transação:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Broadcast de Transações Bitcoin</h1>

      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço Bitcoin (para buscar UTXOs):</label>
        <Input
          type="text"
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Digite o endereço Bitcoin"
          className="mt-1 block w-full"
        />
        <Button onClick={handleGetUtxos} className="mt-2">Buscar UTXOs</Button>
      </div>

      <div className="mb-4">
        <label htmlFor="utxos" className="block text-sm font-medium text-gray-700">UTXOs (JSON):</label>
        <Textarea
          id="utxos"
          value={utxos}
          onChange={(e) => setUtxos(e.target.value)}
          placeholder="Cole os UTXOs aqui em formato JSON"
          rows="5"
          className="mt-1 block w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="senderAddress" className="block text-sm font-medium text-gray-700">Endereço do Remetente (para troco):</label>
        <Input
          type="text"
          id="senderAddress"
          value={senderAddress}
          onChange={(e) => setSenderAddress(e.target.value)}
          placeholder="Digite o endereço do remetente"
          className="mt-1 block w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Endereço do Destinatário:</label>
        <Input
          type="text"
          id="recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Digite o endereço do destinatário"
          className="mt-1 block w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Quantidade (BTC):</label>
        <Input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="any"
          className="mt-1 block w-full"
        />
      </div>

      <Button onClick={handleCreateTransaction} className="w-full mb-4">Criar Transação Hexadecimal</Button>

      <div className="mb-4">
        <label htmlFor="rawTx" className="block text-sm font-medium text-gray-700">Transação Hexadecimal (para assinatura manual):</label>
        <Textarea
          id="rawTx"
          value={rawTx}
          readOnly
          rows="7"
          className="mt-1 block w-full bg-gray-100"
        />
      </div>

      {message && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        **Atenção:** A assinatura da transação e o broadcast para a Mainnet devem ser realizados manualmente pelo usuário.
      </p>
    </div>
  );
}

export default App;

