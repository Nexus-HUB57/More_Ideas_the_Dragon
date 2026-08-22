import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { generateBindCode, formatBindCode } from "@/lib/validators";
import { Copy, RefreshCw } from "lucide-react";

interface CreateBindCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateBindCodeDialog({ open, onOpenChange }: CreateBindCodeDialogProps) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.bindCodes.create.useMutation();
  const utils = trpc.useUtils();

  const handleGenerateCode = () => {
    const newCode = generateBindCode();
    setCode(newCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Por favor, gere ou insira um código");
      return;
    }

    setIsLoading(true);
    try {
      await createMutation.mutateAsync({
        code: code.trim(),
        description: description.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      toast.success(`Código criado: ${formatBindCode(code)}`);
      setCode("");
      setDescription("");
      setExpiresAt("");
      onOpenChange(false);
      
      // Invalidate and refetch
      utils.bindCodes.list.invalidate();
    } catch (error) {
      toast.error("Erro ao criar código de bind");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    const formatted = formatBindCode(code);
    navigator.clipboard.writeText(formatted);
    toast.success("Código copiado para a área de transferência");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Código de Bind</DialogTitle>
          <DialogDescription>
            Gere um novo código para vincular um núcleo orquestrador ao Telegram
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Section */}
          <div className="space-y-3">
            <Label htmlFor="code">Código de Bind</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Clique em gerar ou insira um código"
                className="font-mono"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateCode}
                disabled={isLoading}
                title="Gerar código aleatório"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              {code && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCode}
                  disabled={isLoading}
                  title="Copiar código formatado"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
            {code && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Formato:</p>
                <p className="font-mono text-sm font-semibold">{formatBindCode(code)}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Código para núcleo primário de produção"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Expiration */}
          <div className="space-y-3">
            <Label htmlFor="expiresAt">Data de Expiração (Opcional)</Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? "Criando..." : "Criar Código"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
