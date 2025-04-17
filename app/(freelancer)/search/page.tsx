import UserSearch from '@/components/freelancer/search/UserSearch';

export default function SearchPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Find Freelancers</h1>
        <p className="text-gray-400">Discover talented freelancers to follow and collaborate with</p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <UserSearch />
        </div>
      </div>
      
      <div className="mt-12 flex justify-center">
        <div className="text-center max-w-md">
          <p className="text-gray-300">
            Try searching for a name, or browse by skills to find the perfect match
            for your project needs.
          </p>
        </div>
      </div>
    </div>
  );
} 