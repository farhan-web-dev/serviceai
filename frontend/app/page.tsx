"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      // Call the autonomous orchestration workflow
      const response = await fetch("http://localhost:5000/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });
      
      const data = await response.json();
      
      // Save the result to session storage and navigate to the orchestration trace page
      sessionStorage.setItem('orchestrationResult', JSON.stringify(data));
      router.push(`/orchestration`);
    } catch (error) {
      console.error("Failed to execute autonomous workflow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center shadow-md">
        <Bot className="w-8 h-8 mr-3" />
        <div>
          <h1 className="text-xl font-bold">Service Orchestrator</h1>
          <p className="text-sm opacity-90">AI Assistant</p>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-end space-y-4">
        <div className="flex justify-start">
          <Card className="max-w-[80%] p-3 bg-white rounded-2xl rounded-tl-none shadow-sm">
            <p className="text-sm text-gray-800">
              Hello! I can help you find services like plumbers, electricians, or beauticians.
              <br/><br/>
              For example, try typing:<br/>
              <span className="font-semibold text-primary">"Mujhe kal subah G-13 mein AC technician chahiye"</span>
            </p>
          </Card>
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <Input 
            className="flex-1 rounded-full bg-gray-100 border-transparent focus-visible:ring-primary"
            placeholder="Type your request here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button 
            className="rounded-full w-10 h-10 p-0" 
            onClick={handleSend}
            disabled={loading || !message.trim()}
          >
            {loading ? <Bot className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
