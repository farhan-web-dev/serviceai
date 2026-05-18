"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarHeart, FileText } from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const providerName = searchParams.get("providerName");

  return (
    <div className="flex flex-col h-screen bg-gray-50 items-center justify-center p-6 text-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
      <p className="text-gray-600 mb-8">
        Your service with <span className="font-semibold text-primary">{providerName}</span> has been successfully booked.
      </p>

      <Card className="p-4 bg-blue-50 border-blue-100 flex items-center mb-8 w-full max-w-sm">
        <CalendarHeart className="w-6 h-6 text-blue-500 mr-3" />
        <div className="text-left">
          <p className="text-sm font-medium text-blue-900">Reminder Scheduled</p>
          <p className="text-xs text-blue-700">We'll notify you 30 minutes before the provider arrives.</p>
        </div>
      </Card>

      <Button 
        onClick={() => router.push("/logs")}
        variant="outline" 
        className="w-full max-w-sm mb-3 flex items-center h-12"
      >
        <FileText className="w-5 h-5 mr-2" /> View AI Workflow Logs
      </Button>
      
      <Button 
        onClick={() => router.push("/")}
        className="w-full max-w-sm h-12"
      >
        Back to Home
      </Button>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
