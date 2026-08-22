// FênixWallet - Frontend JavaScript
class FenixWallet {
    constructor() {
        this.currentWallet = 'fenix';
        this.walletData = {};
        this.selectedFile = null;
        
        this.initializeEventListeners();
        this.loadWallets();
    }
    
    initializeEventListeners() {
        // Tabs de carteiras
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchWallet(e.target.dataset.wallet);
            });
        });
        
        // Botões principais
        document.getElementById('importBtn').addEventListener('click', () => {
            this.openImportModal();
        });
        
        document.getElementById('loadBtn').addEventListener('click', () => {
            this.loadWalletBalances();
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadWalletBalances();
        });
        
        // Modal de importação
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
        
        // Drag and drop
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent)';
            uploadArea.style.background = 'rgba(0, 255, 204, 0.05)';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = 'transparent';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.selectedFile = files[0];
                this.updateUploadButton();
            }
        });
    }
    
    async loadWallets() {
        try {
            const response = await fetch('/api/wallets');
            const data = await response.json();
            
            if (data.success) {
                this.walletData = {};
                data.wallets.forEach(wallet => {
                    this.walletData[wallet.id] = wallet;
                });
                
                this.updateWalletTabs();
            } else {
                this.showError('Erro ao carregar carteiras: ' + data.error);
            }
        } catch (error) {
            this.showError('Erro de conexão: ' + error.message);
        }
    }
    
    updateWalletTabs() {
        // Atualiza as abas com informações das carteiras importadas
        const importedTab = document.querySelector('[data-wallet="imported"]');
        const importedWallets = Object.values(this.walletData).filter(w => w.type === 'imported');
        
        if (importedWallets.length > 0) {
            importedTab.innerHTML = `
                <i class="fas fa-file-import"></i> 
                Importadas (${importedWallets.length})
            `;
        }
    }
    
    switchWallet(walletId) {
        // Remove active de todas as tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Adiciona active na tab selecionada
        document.querySelector(`[data-wallet="${walletId}"]`).classList.add('active');
        
        this.currentWallet = walletId;
        this.clearTable();
        this.updateSummaryCards(0, 0, 0);
    }
    
    async loadWalletBalances() {
        const loadBtn = document.getElementById('loadBtn');
        const progressBar = document.getElementById('progressBar');
        
        // Desabilita o botão e mostra progresso
        loadBtn.disabled = true;
        loadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        progressBar.style.width = '10%';
        
        try {
            let walletId = this.currentWallet;
            
            // Se for "imported", pega a primeira carteira importada
            if (walletId === 'imported') {
                const importedWallets = Object.values(this.walletData).filter(w => w.type === 'imported');
                if (importedWallets.length === 0) {
                    this.showError('Nenhuma carteira importada encontrada');
                    return;
                }
                walletId = importedWallets[0].id;
            }
            
            progressBar.style.width = '50%';
            
            const response = await fetch(`/api/wallets/${walletId}/balances`);
            const data = await response.json();
            
            progressBar.style.width = '100%';
            
            if (data.success) {
                this.updateSummaryCards(
                    data.total_confirmed,
                    data.total_unconfirmed,
                    data.total_transactions
                );
                
                this.updateTable(data.addresses);
                this.showToast('Saldos carregados com sucesso!', 'success');
            } else {
                this.showError('Erro ao carregar saldos: ' + data.error);
            }
            
        } catch (error) {
            this.showError('Erro de conexão: ' + error.message);
        } finally {
            // Restaura o botão
            loadBtn.disabled = false;
            loadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Carregar Saldos';
            
            // Esconde a barra de progresso após um tempo
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 1000);
        }
    }
    
    updateSummaryCards(confirmed, unconfirmed, transactions) {
        document.getElementById('totalConfirmed').textContent = `${confirmed.toFixed(8)} BTC`;
        document.getElementById('totalUnconfirmed').textContent = `${unconfirmed.toFixed(8)} BTC`;
        document.getElementById('totalTransactions').textContent = transactions;
    }
    
    updateTable(addresses) {
        const tbody = document.querySelector('#saldoTable tbody');
        tbody.innerHTML = '';
        
        if (!addresses || addresses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                        Nenhum endereço encontrado nesta carteira
                    </td>
                </tr>
            `;
            return;
        }
        
        addresses.forEach((addr, index) => {
            const row = document.createElement('tr');
            
            const statusClass = this.getStatusClass(addr.status);
            const statusText = this.getStatusText(addr.status);
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <span class="address-cell">${addr.wif}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${addr.wif}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </td>
                <td>
                    <span class="address-cell">${addr.address}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${addr.address}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </td>
                <td>${addr.confirmed_balance.toFixed(8)}</td>
                <td>${addr.unconfirmed_balance.toFixed(8)}</td>
                <td>${addr.transaction_count}</td>
                <td>
                    <span class="status-indicator ${statusClass}"></span>
                    ${statusText}
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'confirmed': return 'status-confirmed';
            case 'pending': return 'status-pending';
            case 'error': return 'status-error';
            default: return 'status-empty';
        }
    }
    
    getStatusText(status) {
        switch (status) {
            case 'confirmed': return 'Confirmado';
            case 'pending': return 'Pendente';
            case 'error': return 'Erro';
            default: return 'Vazio';
        }
    }
    
    clearTable() {
        const tbody = document.querySelector('#saldoTable tbody');
        tbody.innerHTML = `
            <tr class="loading">
                <td colspan="7">
                    <div class="spinner"></div>
                    <div>Selecione uma carteira e clique em "Carregar Saldos"</div>
                </td>
            </tr>
        `;
    }
    
    openImportModal() {
        document.getElementById('importModal').style.display = 'flex';
    }
    
    closeImportModal() {
        document.getElementById('importModal').style.display = 'none';
        this.selectedFile = null;
        document.getElementById('fileInput').value = '';
        document.getElementById('walletPassword').value = '';
        document.getElementById('uploadBtn').disabled = true;
    }
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.updateUploadButton();
        }
    }
    
    updateUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        if (this.selectedFile) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = `<i class="fas fa-upload"></i> Importar ${this.selectedFile.name}`;
        } else {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Importar';
        }
    }
    
    async uploadWallet() {
        if (!this.selectedFile) {
            this.showError('Nenhum arquivo selecionado');
            return;
        }
        
        const uploadBtn = document.getElementById('uploadBtn');
        const password = document.getElementById('walletPassword').value;
        
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importando...';
        
        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            if (password) {
                formData.append('password', password);
            }
            
            const response = await fetch('/api/wallets/import', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast(data.message, 'success');
                this.closeImportModal();
                await this.loadWallets(); // Recarrega a lista de carteiras
                
                // Muda para a aba "Importadas"
                this.switchWallet('imported');
            } else {
                this.showError('Erro na importação: ' + data.error);
            }
            
        } catch (error) {
            this.showError('Erro de conexão: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Importar';
        }
    }
    
    async exportCSV() {
        try {
            let walletId = this.currentWallet;
            
            // Se for "imported", pega a primeira carteira importada
            if (walletId === 'imported') {
                const importedWallets = Object.values(this.walletData).filter(w => w.type === 'imported');
                if (importedWallets.length === 0) {
                    this.showError('Nenhuma carteira importada encontrada');
                    return;
                }
                walletId = importedWallets[0].id;
            }
            
            const response = await fetch(`/api/wallets/${walletId}/export`);
            const data = await response.json();
            
            if (data.success) {
                // Cria e baixa o arquivo CSV
                const blob = new Blob([data.csv_content], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = data.filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showToast('CSV exportado com sucesso!', 'success');
            } else {
                this.showError('Erro na exportação: ' + data.error);
            }
            
        } catch (error) {
            this.showError('Erro de conexão: ' + error.message);
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('errorMsg');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
}

// Funções globais
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        window.fenixWallet.showToast('Copiado para a área de transferência!', 'success');
    }).catch(() => {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        window.fenixWallet.showToast('Copiado para a área de transferência!', 'success');
    });
}

function closeImportModal() {
    window.fenixWallet.closeImportModal();
}

function handleFileSelect(event) {
    window.fenixWallet.handleFileSelect(event);
}

function uploadWallet() {
    window.fenixWallet.uploadWallet();
}

function exportCSV() {
    window.fenixWallet.exportCSV();
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.fenixWallet = new FenixWallet();
});

