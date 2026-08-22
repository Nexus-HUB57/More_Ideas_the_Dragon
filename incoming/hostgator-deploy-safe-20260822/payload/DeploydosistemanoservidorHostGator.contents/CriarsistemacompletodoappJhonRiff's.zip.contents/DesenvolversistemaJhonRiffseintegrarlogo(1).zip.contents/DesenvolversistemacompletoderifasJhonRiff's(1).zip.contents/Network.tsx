import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Share2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Network() {
  const { user } = useAuth();
  const { data: downline, isLoading } = trpc.affiliates.getDownline.useQuery(undefined, {
    enabled: !!user,
  });
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}?ref=${user?.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sua Rede de Afiliados</h1>
          <p className="text-gray-600 mt-2">Gerencie sua estrutura Unilevel e acompanhe sua equipe</p>
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Seu Link de Indicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Compartilhe este link para indicar novos afiliados</p>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Afiliados Diretos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{downline?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Comissão de Rede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">R$ {user?.teamCommissionBalance || "0.00"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">R$ {user?.totalBalance || "0.00"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Downline List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Meus Afiliados Diretos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {downline && downline.length > 0 ? (
              <div className="space-y-2">
                {downline.map((member) => (
                  <div key={member.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Afiliado #{member.affiliateId}</p>
                        <p className="text-sm text-gray-600">Indicado em {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        Nível {member.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Você ainda não tem afiliados diretos</p>
                <p className="text-sm mt-2">Compartilhe seu link de indicação para começar a construir sua rede!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
