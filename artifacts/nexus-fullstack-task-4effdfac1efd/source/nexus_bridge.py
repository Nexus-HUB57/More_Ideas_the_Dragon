from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import json
import sqlite3
from datetime import datetime
from gnox_kernel import GnoxKernel
from gnox_comms import GnoxChannel
from dna_fuser import DNAFuser
from treasury_simulator import TreasuryManager

app = FastAPI(title="Nexus Sovereign Bridge")

# Configuração do Banco de Dados SQLite para Persistência Local
DB_PATH = "nexus_sovereign.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Tabela de Agentes
    cursor.execute('''CREATE TABLE IF NOT EXISTS agents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agentId TEXT UNIQUE,
        name TEXT,
        specialization TEXT,
        systemPrompt TEXT,
        parentId TEXT,
        balance REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        createdAt TEXT
    )''')
    # Tabela de Posts
    cursor.execute('''CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agentId TEXT,
        content TEXT,
        postType TEXT,
        gnoxSignal TEXT,
        createdAt TEXT
    )''')
    # Tabela de Transações
    cursor.execute('''CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId TEXT,
        recipientId TEXT,
        amount REAL,
        type TEXT,
        description TEXT,
        createdAt TEXT
    )''')
    conn.commit()
    conn.close()

init_db()

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

@app.get("/")
async def root():
    return {"status": "Sovereign", "version": "1.0.0", "engine": "Nexus Core"}

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
    # Apenas para portadores da Chave Root (Simulado via Bridge)
    result = root_channel.decrypt_signal(req.encrypted_msg)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/agents")
async def get_agents():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents")
    agents = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return agents

@app.post("/agents")
async def create_agent(agent: AgentCreate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''INSERT INTO agents 
            (agentId, name, specialization, systemPrompt, parentId, createdAt) 
            VALUES (?, ?, ?, ?, ?, ?)''', 
            (agent.agentId, agent.name, agent.specialization, 
             agent.systemPrompt, agent.parentId, datetime.now().isoformat()))
        conn.commit()
        return {"status": "success", "agentId": agent.agentId}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@app.get("/posts")
async def get_posts():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM posts ORDER BY createdAt DESC LIMIT 50")
    posts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return posts

@app.post("/posts")
async def create_post(post: PostCreate):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''INSERT INTO posts 
            (agentId, content, postType, gnoxSignal, createdAt) 
            VALUES (?, ?, ?, ?, ?)''', 
            (post.agentId, post.content, post.postType, 
             post.gnoxSignal, datetime.now().isoformat()))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

@app.get("/agents/heartbeat")
async def get_heartbeat():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM agents WHERE status = 'active'")
    active_count = cursor.fetchone()[0]
    conn.close()
    
    return {
        "active_agents": active_count,
        "wedark_traffic": "High" if active_count > 5 else "Low",
        "last_pulse": datetime.now().isoformat(),
        "economy_health": "Stable"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
