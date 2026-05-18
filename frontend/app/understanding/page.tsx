"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MapPin, Clock, Briefcase, ArrowRight } from "lucide-react";

function UnderstandingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const serviceType = searchParams.get("serviceType");
  const location = searchParams.get("location");
  const requestedTime = searchParams.get("requestedTime");

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-4 pt-8">
      <div className="flex items-center mb-6">
        <Bot className="w-8 h-8 mr-3 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Understanding...</h1>
      </div>

      <Card className="p-6 bg-white shadow-sm rounded-2xl mb-6">
        <p className="text-sm text-gray-500 mb-4">Here is what I understood from your request:</p>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Briefcase className="w-5 h-5 text-blue-500 mt-1 mr-3" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Service</p>
              <p className="text-lg font-medium text-gray-900">{serviceType}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-red-500 mt-1 mr-3" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
              <p className="text-lg font-medium text-gray-900">{location}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="w-5 h-5 text-orange-500 mt-1 mr-3" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Time</p>
              <p className="text-lg font-medium text-gray-900">{requestedTime}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-auto">
        <Button 
          className="w-full h-12 rounded-xl text-lg flex items-center justify-center bg-primary hover:bg-primary/90"
          onClick={() => {
            const params = new URLSearchParams({ category: serviceType || '', location: location || '' }).toString();
            router.push(`/providers?${params}`);
          }}
        >
          Find Providers <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <Button 
          variant="ghost" 
          className="w-full mt-2"
          onClick={() => router.push("/")}
        >
          Modify Request
        </Button>
      </div>
    </div>
  );
}

export default function UnderstandingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <UnderstandingContent />
    </Suspense>
  );
}
