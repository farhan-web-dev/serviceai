"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ServerCog, Loader2 } from "lucide-react";

interface WorkflowLog {
  _id: string;
  step: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/logs");
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Auto-refresh logs every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16 overflow-y-auto">
      <header className="bg-slate-900 text-white p-4 flex items-center shadow-md sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 text-white hover:bg-slate-800">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <ServerCog className="w-6 h-6 mr-2" />
        <h1 className="text-xl font-bold">AI Workflow Logs</h1>
      </header>

      <main className="p-4">
        {loading && logs.length === 0 ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log._id} className="p-4 border-l-4 border-l-primary bg-white font-mono text-sm shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800">{log.step}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 mb-2">{log.description}</p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="bg-slate-50 p-2 rounded text-xs text-slate-700 overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </Card>
            ))}
            {logs.length === 0 && (
              <p className="text-center text-gray-500 mt-10">No workflow logs available.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
