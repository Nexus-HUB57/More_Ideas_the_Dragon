import { useState } from "react";
import { Upload, File, CheckCircle, Loader2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AssetUploaderProps {
  type: "avatar" | "nft" | "project";
  id: string;
  onSuccess?: (url: string) => void;
}

export default function AssetUploader({ type, id, onSuccess }: AssetUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const uploadAvatar = trpc.storage.uploadAvatar.useMutation();
  const uploadNFT = trpc.storage.uploadNFTMedia.useMutation();
  const uploadProject = trpc.storage.uploadProjectBundle.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        let result;
        if (type === "avatar") {
          result = await uploadAvatar.mutateAsync({
            agentId: id,
            fileBase64: base64,
            fileName: file.name,
          });
        } else if (type === "nft") {
          result = await uploadNFT.mutateAsync({
            assetId: id,
            fileBase64: base64,
            fileName: file.name,
            mimeType: file.type,
          });
        } else {
          result = await uploadProject.mutateAsync({
            projectId: id,
            fileBase64: base64,
            fileName: file.name,
          });
        }

        if (result.success) {
          toast.success("Upload concluído com sucesso!");
          if (onSuccess) onSuccess(result.url);
          setFile(null);
        }
      };
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Falha ao realizar upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="card-neon p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center border-2 border-dashed border-accent/50">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          ) : file ? (
            <File className="w-8 h-8 text-accent" />
          ) : (
            <Upload className="w-8 h-8 text-accent" />
          )}
        </div>
        
        <div className="text-center">
          <h3 className="font-bold text-accent neon-glow">
            {type === "avatar" ? "Upload de Avatar" : type === "nft" ? "Mídia do Asset" : "Bundle do Projeto"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {file ? file.name : "Selecione um arquivo para o Nexus Storage"}
          </p>
        </div>

        {!file ? (
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept={type === "project" ? ".zip,.tar.gz" : "image/*"}
            />
            <Button variant="outline" className="border-accent/50 text-accent hover:bg-accent/10">
              Selecionar Arquivo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={isUploading} className="btn-neon">
              Confirmar Upload
            </Button>
            <Button variant="ghost" onClick={() => setFile(null)} disabled={isUploading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
