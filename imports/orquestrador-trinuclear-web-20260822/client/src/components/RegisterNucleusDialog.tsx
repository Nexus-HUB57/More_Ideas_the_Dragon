import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface RegisterNucleusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegisterNucleusDialog({ open, onOpenChange }: RegisterNucleusDialogProps) {
  const [nucleusId, setNucleusId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"primary" | "secondary" | "tertiary">("primary");
  const [isLoading, setIsLoading] = useState(false);

  const createMutation = trpc.nucleus.createOrUpdate.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nucleusId.trim() || !name.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      await createMutation.mutateAsync({
        nucleusId: nucleusId.trim(),
        name: name.trim(),
        type,
      });

      toast.success(`Núcleo "${name}" registrado com sucesso`);
      setNucleusId("");
      setName("");
      setType("primary");
      onOpenChange(false);

      // Invalidate and refetch
      utils.nucleus.list.invalidate();
    } catch (error) {
      toast.error("Erro ao registrar núcleo");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Novo Núcleo</DialogTitle>
          <DialogDescription>
            Registre um novo núcleo orquestrador trinuclear no sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nucleus ID */}
          <div className="space-y-3">
            <Label htmlFor="nucleusId">ID do Núcleo *</Label>
            <Input
              id="nucleusId"
              value={nucleusId}
              onChange={(e) => setNucleusId(e.target.value)}
              placeholder="Ex: nucleus-primary-001"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Identificador único do núcleo (alfanumérico, hífens e underscores)</p>
          </div>

          {/* Name */}
          <div className="space-y-3">
            <Label htmlFor="name">Nome do Núcleo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Núcleo Primário de Produção"
              disabled={isLoading}
            />
          </div>

          {/* Type */}
          <div className="space-y-3">
            <Label htmlFor="type">Tipo de Núcleo</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "primary" | "secondary" | "tertiary")}
              disabled={isLoading}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="primary">Primário</option>
              <option value="secondary">Secundário</option>
              <option value="tertiary">Terciário</option>
            </select>
            <p className="text-xs text-muted-foreground">Classificação do núcleo na arquitetura trinuclear</p>
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
              disabled={isLoading || !nucleusId.trim() || !name.trim()}
            >
              {isLoading ? "Registrando..." : "Registrar Núcleo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
