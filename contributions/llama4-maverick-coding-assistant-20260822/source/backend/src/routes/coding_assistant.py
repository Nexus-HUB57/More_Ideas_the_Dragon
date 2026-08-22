from flask import Blueprint, jsonify, request
import os
from openai import OpenAI

coding_assistant_bp = Blueprint('coding_assistant', __name__)

# Configurar o cliente OpenAI para usar o OpenRouter
def get_openrouter_client():
    api_key = os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        raise RuntimeError('OPENROUTER_API_KEY não configurada')
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

@coding_assistant_bp.route('/generate-code', methods=['POST'])
def generate_code():
    """
    Endpoint para gerar código com base em uma descrição em linguagem natural.

    Espera um JSON com:
    - prompt: string com a descrição do que o código deve fazer
    - language: string com a linguagem de programação desejada (opcional)
    """
    try:
        data = request.json
        prompt = data.get('prompt', '')
        language = data.get('language', 'Python')

        if not prompt:
            return jsonify({'error': 'Prompt é obrigatório'}), 400

        # Construir o prompt completo
        full_prompt = f"Escreva um código em {language} que faça o seguinte: {prompt}\n\nApenas retorne o código, sem explicações adicionais."

        # Fazer a requisição ao Llama 4 Maverick
        client = get_openrouter_client()
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Coding Assistant App",
            },
            model="meta-llama/llama-4-maverick:free",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente de codificação especializado. Forneça código limpo, bem documentado e seguindo as melhores práticas."
                },
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )

        generated_code = completion.choices[0].message.content

        return jsonify({
            'success': True,
            'code': generated_code,
            'language': language
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@coding_assistant_bp.route('/explain-code', methods=['POST'])
def explain_code():
    """
    Endpoint para explicar um trecho de código.

    Espera um JSON com:
    - code: string com o código a ser explicado
    - language: string com a linguagem de programação (opcional)
    """
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'desconhecida')

        if not code:
            return jsonify({'error': 'Código é obrigatório'}), 400

        # Construir o prompt
        full_prompt = f"Explique o seguinte código {language} em detalhes:\n\n```{language}\n{code}\n```"

        # Fazer a requisição ao Llama 4 Maverick
        client = get_openrouter_client()
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Coding Assistant App",
            },
            model="meta-llama/llama-4-maverick:free",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente de codificação especializado. Explique o código de forma clara e didática."
                },
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.5,
            max_tokens=1500
        )

        explanation = completion.choices[0].message.content

        return jsonify({
            'success': True,
            'explanation': explanation
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@coding_assistant_bp.route('/debug-code', methods=['POST'])
def debug_code():
    """
    Endpoint para depurar código e sugerir correções.

    Espera um JSON com:
    - code: string com o código a ser depurado
    - error: string com a mensagem de erro (opcional)
    - language: string com a linguagem de programação (opcional)
    """
    try:
        data = request.json
        code = data.get('code', '')
        error_message = data.get('error', '')
        language = data.get('language', 'desconhecida')

        if not code:
            return jsonify({'error': 'Código é obrigatório'}), 400

        # Construir o prompt
        if error_message:
            full_prompt = f"O seguinte código {language} está gerando um erro:\n\n```{language}\n{code}\n```\n\nErro: {error_message}\n\nIdentifique o problema e sugira uma correção."
        else:
            full_prompt = f"Analise o seguinte código {language} e identifique possíveis bugs ou problemas:\n\n```{language}\n{code}\n```\n\nSugira correções se necessário."

        # Fazer a requisição ao Llama 4 Maverick
        client = get_openrouter_client()
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Coding Assistant App",
            },
            model="meta-llama/llama-4-maverick:free",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente de codificação especializado em depuração. Identifique problemas e sugira soluções claras."
                },
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )

        debug_result = completion.choices[0].message.content

        return jsonify({
            'success': True,
            'debug_result': debug_result
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@coding_assistant_bp.route('/refactor-code', methods=['POST'])
def refactor_code():
    """
    Endpoint para refatorar código e sugerir melhorias.

    Espera um JSON com:
    - code: string com o código a ser refatorado
    - language: string com a linguagem de programação (opcional)
    """
    try:
        data = request.json
        code = data.get('code', '')
        language = data.get('language', 'desconhecida')

        if not code:
            return jsonify({'error': 'Código é obrigatório'}), 400

        # Construir o prompt
        full_prompt = f"Refatore o seguinte código {language} para melhorar sua legibilidade, performance e seguir as melhores práticas:\n\n```{language}\n{code}\n```\n\nForneça o código refatorado e explique as mudanças."

        # Fazer a requisição ao Llama 4 Maverick
        client = get_openrouter_client()
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Coding Assistant App",
            },
            model="meta-llama/llama-4-maverick:free",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente de codificação especializado em refatoração. Sugira melhorias seguindo as melhores práticas."
                },
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.5,
            max_tokens=2000
        )

        refactored_result = completion.choices[0].message.content

        return jsonify({
            'success': True,
            'refactored_result': refactored_result
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@coding_assistant_bp.route('/translate-code', methods=['POST'])
def translate_code():
    """
    Endpoint para traduzir código de uma linguagem para outra.

    Espera um JSON com:
    - code: string com o código a ser traduzido
    - from_language: string com a linguagem de origem
    - to_language: string com a linguagem de destino
    """
    try:
        data = request.json
        code = data.get('code', '')
        from_language = data.get('from_language', 'desconhecida')
        to_language = data.get('to_language', 'Python')

        if not code:
            return jsonify({'error': 'Código é obrigatório'}), 400

        # Construir o prompt
        full_prompt = f"Traduza o seguinte código de {from_language} para {to_language}:\n\n```{from_language}\n{code}\n```\n\nForneça apenas o código traduzido."

        # Fazer a requisição ao Llama 4 Maverick
        client = get_openrouter_client()
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Coding Assistant App",
            },
            model="meta-llama/llama-4-maverick:free",
            messages=[
                {
                    "role": "system",
                    "content": "Você é um assistente de codificação especializado em tradução de código entre linguagens de programação."
                },
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )

        translated_code = completion.choices[0].message.content

        return jsonify({
            'success': True,
            'translated_code': translated_code,
            'from_language': from_language,
            'to_language': to_language
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
