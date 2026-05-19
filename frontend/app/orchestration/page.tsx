"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, MapPin, Briefcase, Clock, CalendarCheck, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { ProviderCard } from "@/components/ProviderCard";

export default function OrchestrationPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [liveBooking, setLiveBooking] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('orchestrationResult');
    if (data) {
      const parsed = JSON.parse(data);
      setResult(parsed);
      if (parsed.booking && parsed.booking._id) {
        setLiveBooking(parsed.booking);
      }
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (liveBooking && liveBooking._id && liveBooking.status !== 'Feedback Requested') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/bookings/${liveBooking._id}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.booking) {
            setLiveBooking(data.booking);
            if (data.booking.status === 'Feedback Requested') {
               clearInterval(interval);
            }
          }
        } catch (e) {
          console.error('Polling error', e);
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [liveBooking]);

  if (!result) return <div className="p-8 text-center text-gray-500">Loading Trace...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-y-auto pb-16">
      <header className="bg-primary text-primary-foreground p-4 flex items-center shadow-md sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="mr-2 text-white hover:text-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Google Antigravity Orchestrator
          </h1>
          <p className="text-sm opacity-90 ml-7">Central Brain Live Trace</p>
        </div>
      </header>

      <main className="p-4 max-w-xl mx-auto w-full space-y-6">
        
        {/* AI Confidence Dashboard */}
        {result.confidenceMetrics && (
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
            <Card className="p-3 bg-white border-b-4 border-b-blue-500 shadow-sm text-center transform transition hover:-translate-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Intent</div>
              <div className="text-xl font-black text-blue-600">{result.confidenceMetrics.intent}%</div>
            </Card>
            <Card className="p-3 bg-white border-b-4 border-b-purple-500 shadow-sm text-center transform transition hover:-translate-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Match</div>
              <div className="text-xl font-black text-purple-600">{result.confidenceMetrics.match}%</div>
            </Card>
            <Card className="p-3 bg-white border-b-4 border-b-pink-500 shadow-sm text-center transform transition hover:-translate-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Ranking</div>
              <div className="text-xl font-black text-pink-600">{result.confidenceMetrics.ranking}%</div>
            </Card>
            <Card className="p-3 bg-white border-b-4 border-b-green-500 shadow-sm text-center transform transition hover:-translate-y-1">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Booking</div>
              <div className="text-xl font-black text-green-600">{result.confidenceMetrics.booking}%</div>
            </Card>
          </section>
        )}

        {/* Antigravity Planning Phase */}
        {result.success && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-indigo-500" />
              0. Antigravity Planning Phase
            </h2>
            <Card className="p-4 bg-indigo-50 border-l-4 border-l-indigo-500 shadow-sm">
              <div className="flex items-start">
                <Bot className="w-5 h-5 mr-3 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm text-indigo-900 mb-1">Execution Strategy Formulated</p>
                  <p className="text-sm text-indigo-800 leading-relaxed">The Antigravity Orchestrator has seized control of the request and formulated a strict sequential pipeline: <br/><span className="font-mono text-xs bg-indigo-100 px-1.5 py-0.5 rounded mt-1 inline-block">Intent → Discovery → Ranking → Booking → FollowUp</span> <br/>Delegating tasks to sub-agents...</p>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Intent Extraction Step */}
        {result.intent && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              1. Intent Extracted
            </h2>
            <Card className="p-4 bg-white border-l-4 border-l-blue-500 shadow-sm">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-blue-500"/><span className="font-medium">{result.intent.serviceType}</span></div>
                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-red-500"/><span className="font-medium">{result.intent.location}</span></div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-orange-500"/><span className="font-medium">{result.intent.requestedTime}</span></div>
              </div>
            </Card>
          </section>
        )}

        {/* Errors if any */}
        {!result.success && (
          <section>
             <Card className="p-4 bg-red-50 border border-red-200 text-red-700 flex items-start">
               <AlertTriangle className="w-5 h-5 mr-3 mt-0.5" />
               <div>
                 <p className="font-bold">Workflow Halted</p>
                 <p className="text-sm">{result.error}</p>
               </div>
             </Card>
          </section>
        )}

        {/* Top 3 Ranked Providers */}
        {result.success && result.topProviders && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              2. Top 3 AI Recommendations
            </h2>
            
            {/* Antigravity Decision Explanation Panel */}
            {result.decisionPanel && (
              <Card className="p-4 mb-5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 shadow-md">
                <div className="flex items-start mb-3">
                  <Bot className="w-6 h-6 mr-3 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-extrabold text-sm text-purple-900 mb-1 tracking-tight">Antigravity Decision Panel</p>
                    <p className="text-sm text-purple-800 italic leading-relaxed">"{result.reasoning}"</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-purple-100 text-sm space-y-3 shadow-inner">
                  <div>
                    <p className="font-bold text-green-700 flex items-center mb-1">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Selected Provider: {result.recommendedProvider?.name}
                    </p>
                    <p className="text-gray-700 ml-5 text-xs font-medium bg-green-50 inline-block px-2 py-0.5 rounded">Reason: {result.decisionPanel.selectedReason}</p>
                  </div>
                  
                  {result.decisionPanel.rejectedReasons && result.decisionPanel.rejectedReasons.length > 0 && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="font-bold text-red-600 flex items-center mb-1">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Rejected Providers
                      </p>
                      <ul className="space-y-2 mt-1">
                        {result.decisionPanel.rejectedReasons.map((rj: any, i: number) => (
                          <li key={i} className="text-gray-600 ml-5 text-xs">
                            <span className="font-bold text-gray-800">{rj.name}:</span> <span className="bg-red-50 px-1.5 py-0.5 rounded text-red-700">{rj.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {result.topProviders.map((tp: any, idx: number) => (
                <Card key={idx} className={`p-4 bg-white shadow-sm rounded-xl border ${idx === 0 ? 'border-2 border-green-500 relative' : 'border-gray-200'}`}>
                  {idx === 0 && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md transform rotate-12">
                      Winner!
                    </div>
                  )}
                  <div className="flex items-center mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <span className="bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded-full text-xs mr-2">#{idx + 1}</span>
                        {tp.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex gap-3 mt-1">
                        <span>⭐ {tp.rating}</span>
                        <span>📍 {tp.distanceText || tp.distance}</span>
                        <span className={tp.availability ? "text-green-600" : "text-red-500"}>
                          {tp.availability ? "✓ Available" : "✗ Busy"}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-purple-600">{tp.finalScore}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Score</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100 flex items-start">
                    <Bot className="w-4 h-4 mr-2 text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="italic">"{tp.explanation}"</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Final Booking */}
        {result.success && result.booking && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
              3. Booking Confirmed
            </h2>
            <Card className="p-4 bg-green-50 border border-green-200 text-green-800 flex items-center">
              <CalendarCheck className="w-6 h-6 mr-3 text-green-600" />
              <div>
                <p className="font-bold text-sm">Booking ID: {result.booking._id}</p>
                <p className="text-xs text-green-700">Status: {result.booking.status.toUpperCase()} (with {result.topProviders[0].name})</p>
              </div>
            </Card>
          </section>
        )}

        {/* Live Service Tracking */}
        {result.success && liveBooking && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-blue-500" />
              4. Live Service Tracking
            </h2>
            <Card className="p-5 bg-white shadow-sm border border-gray-200">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {[
                  'Booking Confirmed',
                  'Provider Assigned',
                  'Provider En Route',
                  'Service Started',
                  'Service In Progress',
                  'Service Completed',
                  'Feedback Requested'
                ].map((step, index) => {
                  
                  const steps = ['Booking Confirmed', 'Provider Assigned', 'Provider En Route', 'Service Started', 'Service In Progress', 'Service Completed', 'Feedback Requested'];
                  const currentIndex = steps.indexOf(liveBooking.status);
                  const isCompleted = index < currentIndex;
                  const isActive = index === currentIndex;
                  
                  return (
                    <div key={step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Icon */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isActive ? 'bg-blue-500 text-white animate-pulse' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      
                      {/* Card */}
                      <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm ${isActive ? 'bg-blue-50 border-blue-200 shadow-md' : 'bg-white border-gray-100'}`}>
                        <div className={`font-bold text-sm ${isActive ? 'text-blue-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>{step}</div>
                        {isActive && <div className="text-xs text-blue-600 mt-1 font-medium">Happening now...</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        )}

      </main>
      
      <div className="mt-8 flex justify-center pb-8">
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-full px-8">
          Start New Workflow
        </Button>
      </div>
    </div>
  );
}
