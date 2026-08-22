import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Check, Mail, Code, Calendar } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const { data: profile, isLoading } = trpc.profile.getProfile.useQuery();

  const handleCopyLink = () => {
    const link = `${window.location.origin}?ref=${profile?.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted mt-1">Gerencie suas informações e configurações</p>
      </div>

      {/* User Avatar and Basic Info */}
      <Card className="p-6 bg-card border border-border">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-foreground">{profile?.name}</h2>
            <p className="text-muted flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" />
              {profile?.email}
            </p>
            <p className="text-xs text-muted mt-2">
              Membro desde {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('pt-BR') : '-'}
            </p>
          </div>
        </div>
      </Card>

      {/* Affiliate Information */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Informações de Afiliado</h2>
        <div className="space-y-4">
          {/* Affiliate Code */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Código de Afiliado
            </label>
            <div className="flex gap-2">
              <Input
                value={profile?.affiliateCode || "-"}
                readOnly
                className="flex-1 bg-background"
              />
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(profile?.affiliateCode || "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                variant="outline"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Link de Indicação
            </label>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}?ref=${profile?.affiliateCode}`}
                readOnly
                className="flex-1 bg-background text-xs"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted mt-2">
              Compartilhe este link para indicar novos afiliados
            </p>
          </div>
        </div>
      </Card>

      {/* Financial Summary */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Resumo Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg border border-border">
            <p className="text-sm text-muted">Comissões Totais</p>
            <p className="text-2xl font-bold text-primary mt-2">
              R$ {profile?.totalCommissions || "0,00"}
            </p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border">
            <p className="text-sm text-muted">Saldo Disponível</p>
            <p className="text-2xl font-bold text-green-500 mt-2">
              R$ {profile?.availableBalance || "0,00"}
            </p>
          </div>
        </div>
      </Card>

      {/* Account Settings */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Configurações da Conta</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Nome
            </label>
            <Input
              value={profile?.name || ""}
              readOnly
              className="w-full bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Email
            </label>
            <Input
              value={profile?.email || ""}
              readOnly
              className="w-full bg-background"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">
              Papel
            </label>
            <Input
              value={profile?.role || ""}
              readOnly
              className="w-full bg-background capitalize"
            />
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-card border border-red-500/20">
        <h2 className="text-lg font-semibold text-red-500 mb-4">Zona de Perigo</h2>
        <p className="text-sm text-muted mb-4">
          Estas ações são irreversíveis. Por favor, tenha cuidado.
        </p>
        <Button variant="destructive" className="w-full">
          Deletar Conta
        </Button>
      </Card>

      {/* Help Section */}
      <Card className="p-6 bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Precisa de Ajuda?</h2>
        <p className="text-sm text-muted mb-4">
          Acesse nossa documentação ou entre em contato com o suporte.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Documentação
          </Button>
          <Button variant="outline" className="flex-1">
            Suporte
          </Button>
        </div>
      </Card>
    </div>
  );
}
