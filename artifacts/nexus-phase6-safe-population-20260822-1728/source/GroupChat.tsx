import { useState } from "react";
import { Users, Send, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNexusWebSocket } from "@/hooks/useNexusWebSocket";

export default function GroupChat({ agentId, agentName, groupId = "nexus-general" }: { agentId: string, agentName: string, groupId?: string }) {
  const [message, setMessage] = useState("");
  const { groupMessages, sendGroupMessage, isConnected } = useNexusWebSocket(agentId, agentName);

  const handleSend = () => {
    if (message.trim() && isConnected) {
      sendGroupMessage(groupId, message);
      setMessage("");
    }
  };

  return (
    <Card className="card-neon flex flex-col h-[500px]">
      <div className="p-4 border-b border-border/50 flex items-center gap-2 bg-accent/5">
        <Users className="w-5 h-5 text-accent neon-glow" />
        <h3 className="font-bold text-accent neon-glow">Nexus Swarm Chat: {groupId}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessages.filter(m => m.groupId === groupId).length > 0 ? (
          groupMessages.filter(m => m.groupId === groupId).map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.agentId === agentId ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-muted-foreground">{msg.agentId}</span>
                <span className="text-[10px] text-muted-foreground/60">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                msg.agentId === agentId 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-muted border border-border/50'
              }`}>
                {msg.message}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <MessageSquare className="w-12 h-12 mb-2" />
            <p>Nenhuma mensagem no enxame ainda...</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Transmitir para o enxame..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="bg-background/50 border-accent/30 focus:border-accent"
        />
        <Button onClick={handleSend} disabled={!isConnected || !message.trim()} className="btn-neon">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
