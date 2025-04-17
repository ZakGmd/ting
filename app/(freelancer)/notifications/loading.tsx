import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="h-8 w-48 bg-white/10 animate-pulse rounded-md"></div>
      </div>
      
      <div className="flex flex-col space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-white/5 animate-pulse">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                <div className="h-4 w-full bg-white/10 rounded mb-1"></div>
                <div className="h-4 w-1/2 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center items-center mt-8">
        <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
      </div>
    </div>
  );
} 