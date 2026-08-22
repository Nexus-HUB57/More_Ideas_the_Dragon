import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Network() {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: network, isLoading: networkLoading } = trpc.affiliate.getNetwork.useQuery();
  const { data: referrals, isLoading: referralsLoading } = trpc.affiliate.getDirectReferrals.useQuery();

  if (!user) return null;

  // Generate referral link
  const generateReferralLink = () => {
    const link = `${window.location.origin}/?ref=${user.id}`;
    setReferralLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sua Rede</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus afiliados e estrutura de rede
          </p>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Seu Link de Referência</CardTitle>
            <CardDescription>
              Compartilhe este link para convidar novos afiliados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink || `${window.location.origin}/?ref=${user.id}`}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={referralLink ? copyToClipboard : generateReferralLink}
                variant="outline"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Cada pessoa que se inscrever através deste link será adicionada à sua rede
            </p>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Afiliados Diretos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {referralsLoading ? <Loader2 className="animate-spin w-6 h-6" /> : referrals?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Pessoas que você indicou</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Níveis de Rede</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {networkLoading ? <Loader2 className="animate-spin w-6 h-6" /> : network?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Profundidade da sua rede</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão de Rede</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">Ganhos da sua equipe</p>
            </CardContent>
          </Card>
        </div>

        {/* Direct Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Seus Afiliados Diretos</CardTitle>
            <CardDescription>
              Pessoas que você indicou para a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            ) : referrals && referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">Afiliado #{referral.affiliateId}</p>
                      <p className="text-sm text-muted-foreground">
                        Indicado em {new Date(referral.joinedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem afiliados diretos
                </p>
                <Button>
                  Compartilhar Meu Link de Referência
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Structure Info */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona a Rede Unilevel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Estrutura</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Nível 1:</strong> Seus afiliados diretos</li>
                  <li>• <strong>Nível 2:</strong> Afiliados dos seus afiliados</li>
                  <li>• <strong>Nível 3:</strong> Afiliados do nível 2</li>
                  <li>• <strong>Nível 4+:</strong> Continuação da rede</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Comissões</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Nível 1:</strong> 10% de comissão</li>
                  <li>• <strong>Nível 2:</strong> 5% de comissão</li>
                  <li>• <strong>Nível 3:</strong> 2,5% de comissão</li>
                  <li>• <strong>Nível 4:</strong> 2,5% de comissão</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
