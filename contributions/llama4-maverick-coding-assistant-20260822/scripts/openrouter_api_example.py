"""
Exemplo de código para usar o Llama 4 Maverick via OpenRouter API
Fonte: https://openrouter.ai/meta-llama/llama-4-maverick:free/api
"""

from openai import OpenAI

# Configurar o cliente OpenAI para usar o OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="<OPENROUTER_API_KEY>",  # Substituir pela chave de API real
)

# Exemplo de requisição para o Llama 4 Maverick
completion = client.chat.completions.create(
    extra_headers={
        "HTTP-Referer": "<YOUR_SITE_URL>",  # Opcional. URL do site para rankings no openrouter.ai
        "X-Title": "<YOUR_SITE_NAME>",  # Opcional. Nome do site para rankings no openrouter.ai
    },
    extra_body={},
    model="meta-llama/llama-4-maverick:free",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What is in this image?"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                    }
                }
            ]
        }
    ]
)

print(completion.choices[0].message.content)

# Para requisições apenas de texto (sem imagens):
# messages=[
#     {
#         "role": "user",
#         "content": "Escreva uma função Python para calcular o fatorial de um número."
#     }
# ]
