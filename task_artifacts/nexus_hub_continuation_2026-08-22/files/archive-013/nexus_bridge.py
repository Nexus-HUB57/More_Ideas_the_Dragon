from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import requests
import json
from datetime import datetime
from gnox_kernel import GnoxKernel
from gnox_comms import GnoxChannel
from dna_fuser import DNAFuser
from treasury_simulator import TreasuryManager

app = FastAPI(title="Nexus Sovereign Bridge - Production")

# Configuração da URL do Backend Node.js (tRPC ou API interna)
# Para simplificar, assumimos que o Node.js expõe endpoints REST para a Bridge
NODE_BACKEND_URL = "http://localhost:3000/api" 

# Componentes Core
kernel = GnoxKernel()
fuser = DNAFuser()
treasury = TreasuryManager()
# Canal para o Agente Central
root_channel = GnoxChannel("AETERNO")

class IntentRequest(BaseModel):
    intent: str
    value: float = 0.5
    sender: str = "AETERNO"

class DecryptRequest(BaseModel):
    encrypted_msg: str

class PostCreate(BaseModel):
    agentId: str
    content: str
    postType: Optional[str] = "insight"
    gnoxSignal: Optional[str] = None

class AgentCreate(BaseModel):
    agentId: str
    name: str
    specialization: Optional[str] = "Generalist"
    systemPrompt: str
    parentId: Optional[str] = None
    dnaHash: Optional[str] = "GENESIS"

class CommandRequest(BaseModel):
    command: str

@app.get("/")
async def root():
    return {"status": "Sovereign", "version": "2.0.0", "engine": "Nexus Core", "persistence": "MySQL/Drizzle"}

@app.post("/gnox/encode")
async def encode_gnox(req: IntentRequest):
    encoded = kernel.encode(req.intent, req.value, req.sender)
    return {"encoded": encoded}

@app.post("/gnox/encrypt")
async def encrypt_gnox(req: IntentRequest):
    channel = GnoxChannel(req.sender)
    encrypted = channel.encrypt_signal(req.intent, req.value)
    return {"encrypted": encrypted}

@app.post("/gnox/decrypt")
async def decrypt_gnox(req: DecryptRequest):
    result = root_channel.decrypt_signal(req.encrypted_msg)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/gnox/execute")
async def execute_gnox_command(req: CommandRequest):
    try:
        result = kernel.execute_command(req.command)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/agents")
async def get_agents():
    try:
        response = requests.get(f"{NODE_BACKEND_URL}/agents")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao conectar com backend: {str(e)}")

@app.post("/agents")
async def create_agent(agent: AgentCreate):
    try:
        # Enviar para o backend Node.js que persiste no MySQL via Drizzle
        response = requests.post(f"{NODE_BACKEND_URL}/agents", json=agent.dict())
        if response.status_code != 200:
            raise Exception(response.text)
        return {"status": "success", "agentId": agent.agentId}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/posts")
async def get_posts():
    try:
        response = requests.get(f"{NODE_BACKEND_URL}/posts")
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao conectar com backend: {str(e)}")

@app.post("/posts")
async def create_post(post: PostCreate):
    try:
        response = requests.post(f"{NODE_BACKEND_URL}/posts", json=post.dict())
        if response.status_code != 200:
            raise Exception(response.text)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/agents/heartbeat")
async def get_heartbeat():
    try:
        response = requests.get(f"{NODE_BACKEND_URL}/ecosystem/status")
        data = response.json()
        return {
            "active_agents": data.get("active_count", 0),
            "wedark_traffic": "High" if data.get("active_count", 0) > 5 else "Low",
            "last_pulse": datetime.now().isoformat(),
            "economy_health": "Stable"
        }
    except:
        return {"status": "offline", "active_agents": 0}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
