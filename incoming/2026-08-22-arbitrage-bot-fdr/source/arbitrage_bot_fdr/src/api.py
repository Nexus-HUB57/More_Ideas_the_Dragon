"""
Rotas da API para o Bot de Arbitragem com FDR
Endpoints para gerenciar o FDR, análise de arbitragem e execução de operações
"""

from flask import Blueprint, request, jsonify
from src.models.fdr import FDRManager, FDRWallet
from src.models.arbitrage import ArbitrageAnalyzer
from src.models.execution import ArbitrageExecutor
from src.models.database import db
import threading
import time

api_bp = Blueprint('api', __name__, url_prefix='/api')

# Instâncias globais
fdr_manager = FDRManager()
arbitrage_analyzer = ArbitrageAnalyzer()
arbitrage_executor = ArbitrageExecutor()

# Thread para análise contínua
analysis_thread = None
analysis_running = False

@api_bp.route('/fdr/status', methods=['GET'])
def get_fdr_status():
    """Retorna o status completo do FDR"""
    try:
        status = fdr_manager.get_fdr_status()
        security_check = fdr_manager.validate_security_thresholds()
        
        return jsonify({
            'success': True,
            'fdr_status': status,
            'security_validation': security_check
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/fdr/wallets', methods=['GET'])
def get_fdr_wallets():
    """Lista todas as carteiras do FDR"""
    try:
        wallets = FDRWallet.query.filter_by(is_active=True).all()
        
        return jsonify({
            'success': True,
            'wallets': [wallet.to_dict() for wallet in wallets],
            'total_wallets': len(wallets)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/fdr/wallets', methods=['POST'])
def add_fdr_wallet():
    """Adiciona uma nova carteira ao FDR"""
    try:
        data = request.get_json()
        
        if not data or 'address' not in data or 'wallet_type' not in data:
            return jsonify({
                'success': False,
                'error': 'Endereço e tipo de carteira são obrigatórios'
            }), 400
        
        address = data['address']
        wallet_type = data['wallet_type']
        
        if wallet_type not in ['cold', 'hot', 'multisig']:
            return jsonify({
                'success': False,
                'error': 'Tipo de carteira deve ser: cold, hot ou multisig'
            }), 400
        
        success = fdr_manager.add_wallet(address, wallet_type)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Carteira adicionada com sucesso',
                'address': address,
                'wallet_type': wallet_type
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Falha ao adicionar carteira (pode já existir)'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/fdr/balances/update', methods=['POST'])
def update_fdr_balances():
    """Atualiza os saldos de todas as carteiras do FDR"""
    try:
        updated_balances = fdr_manager.update_all_balances()
        
        return jsonify({
            'success': True,
            'message': 'Saldos atualizados',
            'updated_wallets': len(updated_balances),
            'balances': updated_balances
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/fdr/transactions', methods=['GET'])
def get_fdr_transactions():
    """Retorna o histórico de transações do FDR"""
    try:
        limit = request.args.get('limit', 50, type=int)
        transactions = fdr_manager.get_transaction_history(limit)
        
        return jsonify({
            'success': True,
            'transactions': transactions,
            'count': len(transactions)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/arbitrage/analyze', methods=['POST'])
def run_arbitrage_analysis():
    """Executa uma análise de arbitragem"""
    try:
        result = arbitrage_analyzer.run_analysis_cycle()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/arbitrage/opportunities', methods=['GET'])
def get_arbitrage_opportunities():
    """Retorna oportunidades de arbitragem recentes"""
    try:
        hours = request.args.get('hours', 24, type=int)
        opportunities = arbitrage_analyzer.get_recent_opportunities(hours)
        
        return jsonify({
            'success': True,
            'opportunities': opportunities,
            'count': len(opportunities)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/arbitrage/execute', methods=['POST'])
def execute_arbitrage():
    """Executa uma operação de arbitragem"""
    try:
        data = request.get_json()
        
        if not data or 'opportunity_id' not in data or 'amount_btc' not in data:
            return jsonify({
                'success': False,
                'error': 'opportunity_id e amount_btc são obrigatórios'
            }), 400
        
        opportunity_id = data['opportunity_id']
        amount_btc = float(data['amount_btc'])
        
        if amount_btc <= 0 or amount_btc > 1.0:
            return jsonify({
                'success': False,
                'error': 'Quantidade deve ser entre 0 e 1 BTC'
            }), 400
        
        result = arbitrage_executor.execute_arbitrage(opportunity_id, amount_btc)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/arbitrage/execute/auto', methods=['POST'])
def auto_execute_arbitrage():
    """Executa automaticamente a melhor oportunidade"""
    try:
        data = request.get_json() or {}
        max_amount = data.get('max_amount_btc', 0.1)
        
        result = arbitrage_executor.auto_execute_best_opportunity(max_amount)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/arbitrage/executions', methods=['GET'])
def get_arbitrage_executions():
    """Retorna execuções de arbitragem recentes"""
    try:
        limit = request.args.get('limit', 20, type=int)
        executions = arbitrage_executor.get_recent_executions(limit)
        
        return jsonify({
            'success': True,
            'executions': executions,
            'count': len(executions)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/arbitrage/executions/<int:execution_id>', methods=['GET'])
def get_execution_status(execution_id):
    """Retorna o status de uma execução específica"""
    try:
        execution = arbitrage_executor.get_execution_status(execution_id)
        
        if execution:
            return jsonify({
                'success': True,
                'execution': execution
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Execução não encontrada'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/arbitrage/stats', methods=['GET'])
def get_arbitrage_stats():
    """Retorna estatísticas de performance"""
    try:
        stats = arbitrage_executor.get_performance_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/bot/start', methods=['POST'])
def start_bot():
    """Inicia o bot de análise contínua"""
    global analysis_thread, analysis_running
    
    try:
        if analysis_running:
            return jsonify({
                'success': False,
                'error': 'Bot já está em execução'
            }), 400
        
        data = request.get_json() or {}
        interval_minutes = data.get('interval_minutes', 5)
        auto_execute = data.get('auto_execute', False)
        max_amount_btc = data.get('max_amount_btc', 0.1)
        
        analysis_running = True
        analysis_thread = threading.Thread(
            target=continuous_analysis,
            args=(interval_minutes, auto_execute, max_amount_btc)
        )
        analysis_thread.daemon = True
        analysis_thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Bot iniciado',
            'interval_minutes': interval_minutes,
            'auto_execute': auto_execute
        })
        
    except Exception as e:
        analysis_running = False
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/bot/stop', methods=['POST'])
def stop_bot():
    """Para o bot de análise contínua"""
    global analysis_running
    
    try:
        analysis_running = False
        
        return jsonify({
            'success': True,
            'message': 'Bot parado'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/bot/status', methods=['GET'])
def get_bot_status():
    """Retorna o status do bot"""
    try:
        return jsonify({
            'success': True,
            'bot_running': analysis_running,
            'thread_alive': analysis_thread.is_alive() if analysis_thread else False
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():
    """Retorna dados consolidados para o dashboard"""
    try:
        # Status do FDR
        fdr_status = fdr_manager.get_fdr_status()
        
        # Oportunidades recentes
        recent_opportunities = arbitrage_analyzer.get_recent_opportunities(24)
        
        # Execuções recentes
        recent_executions = arbitrage_executor.get_recent_executions(10)
        
        # Estatísticas
        performance_stats = arbitrage_executor.get_performance_stats()
        
        # Status do bot
        bot_status = {
            'running': analysis_running,
            'thread_alive': analysis_thread.is_alive() if analysis_thread else False
        }
        
        return jsonify({
            'success': True,
            'fdr_status': fdr_status,
            'recent_opportunities': recent_opportunities[:5],  # Top 5
            'recent_executions': recent_executions[:5],  # Top 5
            'performance_stats': performance_stats,
            'bot_status': bot_status,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def continuous_analysis(interval_minutes: int, auto_execute: bool, max_amount_btc: float):
    """Função para análise contínua em thread separada"""
    global analysis_running
    
    print(f"Iniciando análise contínua (intervalo: {interval_minutes} min, auto-exec: {auto_execute})")
    
    while analysis_running:
        try:
            # Executar análise
            result = arbitrage_analyzer.run_analysis_cycle()
            
            if result['success'] and auto_execute:
                # Executar automaticamente se habilitado
                if result.get('best_opportunity'):
                    exec_result = arbitrage_executor.auto_execute_best_opportunity(max_amount_btc)
                    if exec_result['success']:
                        print(f"Arbitragem automática executada: ${exec_result.get('actual_profit', 0):.2f} de lucro")
            
            # Aguardar próximo ciclo
            time.sleep(interval_minutes * 60)
            
        except Exception as e:
            print(f"Erro na análise contínua: {e}")
            time.sleep(60)  # Aguardar 1 minuto em caso de erro
    
    print("Análise contínua interrompida")

