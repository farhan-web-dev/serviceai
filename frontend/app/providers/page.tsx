"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProviderCard, Provider } from "@/components/ProviderCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

function ProvidersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category");
  const location = searchParams.get("location");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const query = new URLSearchParams({ category: category || '', location: location || '' });
        const res = await fetch(`http://localhost:5000/api/providers?${query.toString()}`);
        const data = await res.json();
        setProviders(data);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [category, location]);

  const handleBook = async (providerId: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          serviceType: category,
          location: location,
          requestedTime: "As soon as possible"
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/booking?bookingId=${data.booking._id}&providerName=${encodeURIComponent(data.provider.name)}`);
      }
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16 overflow-y-auto">
      <header className="bg-white p-4 flex items-center shadow-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Recommended for You</h1>
      </header>

      <main className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : providers.length > 0 ? (
          providers.map((p) => (
            <ProviderCard key={p._id} provider={p} onBook={handleBook} />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No providers found for your request.</p>
            <Button onClick={() => router.push("/")} className="mt-4">Try a different search</Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ProvidersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ProvidersContent />
    </Suspense>
  );
}
