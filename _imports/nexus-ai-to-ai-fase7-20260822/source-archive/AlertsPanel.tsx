import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useState } from "react";

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  timestamp: Date;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
}

export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedAlerts((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    onDismiss?.(id);
  };

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));
  const criticalAlerts = visibleAlerts.filter((a) => a.severity === "critical");
  const warningAlerts = visibleAlerts.filter((a) => a.severity === "warning");
  const infoAlerts = visibleAlerts.filter((a) => a.severity === "info");

  const getAlertStyles = (severity: "info" | "warning" | "critical") => {
    switch (severity) {
      case "critical":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: "text-red-400",
          title: "text-red-400",
          text: "text-red-300/80",
        };
      case "warning":
        return {
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          icon: "text-yellow-400",
          title: "text-yellow-400",
          text: "text-yellow-300/80",
        };
      case "info":
        return {
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          icon: "text-cyan-400",
          title: "text-cyan-400",
          text: "text-cyan-300/80",
        };
    }
  };

  const renderAlertIcon = (severity: "info" | "warning" | "critical") => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
    }
  };

  const renderAlertGroup = (title: string, alerts: Alert[], severity: "info" | "warning" | "critical") => {
    if (alerts.length === 0) return null;

    const styles = getAlertStyles(severity);

    return (
      <div key={severity} className="mb-4">
        <h3 className={`${styles.title} font-bold mb-2 text-sm`}>
          {title} ({alerts.length})
        </h3>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`${styles.bg} ${styles.border} border rounded-lg p-3 flex items-start gap-3 group hover:border-opacity-50 transition-all`}
            >
              <div className={`${styles.icon} mt-0.5 flex-shrink-0`}>
                {renderAlertIcon(severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`${styles.title} font-semibold text-sm`}>{alert.title}</p>
                <p className={`${styles.text} text-xs mt-1`}>{alert.description}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className={`w-4 h-4 ${styles.icon}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <div>
          <p className="text-green-400 font-semibold text-sm">All Systems Operational</p>
          <p className="text-green-300/70 text-xs mt-1">No active alerts or warnings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderAlertGroup("Critical Alerts", criticalAlerts, "critical")}
      {renderAlertGroup("Warnings", warningAlerts, "warning")}
      {renderAlertGroup("Information", infoAlerts, "info")}
    </div>
  );
}
