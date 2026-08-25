export function initializeAnalytics() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
  if (!endpoint || !websiteId || typeof document === "undefined") return;

  try {
    const baseUrl = new URL(endpoint);
    const script = document.createElement("script");
    script.defer = true;
    script.src = `${baseUrl.toString().replace(/\/$/, "")}/umami`;
    script.dataset.websiteId = websiteId;
    document.head.appendChild(script);
  } catch {
    console.warn("[Analytics] Endpoint inválido; analytics desabilitado.");
  }
}
