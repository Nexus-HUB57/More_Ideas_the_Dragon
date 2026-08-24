import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'GenesisFlow | Nexus Orchestration Dashboard',
  description: 'Hybrid orchestration architecture for Nexus Genesis Agent',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code&display=swap" rel="stylesheet" />
        {/* [PROTOCOL_ANTI_METAMASK_13.0]: Erradicação imediata e imutável de provedores de navegador */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const suppress = () => {
                try {
                  const nullProvider = {
                    isMetaMask: false,
                    isBraveWallet: false,
                    request: () => Promise.reject(new Error('[NEXUS_SECURITY]: Web3 Legado Erradicado.')),
                    on: () => {},
                    removeListener: () => {},
                    enable: () => Promise.reject(new Error('[NEXUS_SECURITY]: MetaMask Bloqueado.')),
                    send: () => Promise.reject(new Error('[NEXUS_SECURITY]: Envio bloqueado.'))
                  };

                  if (!window.ethereum || window.ethereum.isMetaMask) {
                    Object.defineProperty(window, 'ethereum', {
                      value: nullProvider,
                      writable: false,
                      configurable: false
                    });
                  }
                  
                  window.web3 = undefined;
                  console.log('[NEXUS_SECURITY]: Protocolo Anti-MetaMask 13.0 Ativo.');
                } catch (e) {}
              };
              suppress();
              window.addEventListener('load', suppress);
              window.addEventListener('ethereum#initialized', suppress);
            })();
          `
        }} />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
