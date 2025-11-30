export default function PropertyGridLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          {/* Image Skeleton */}
          <div className="h-48 bg-gray-200"></div>
          
          {/* Content Skeleton */}
          <div className="p-4">
            {/* Title */}
            <div className="h-5 bg-gray-200 rounded mb-3 w-3/4"></div>
            
            {/* Address */}
            <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
            
            {/* Price */}
            <div className="h-6 bg-gray-200 rounded mb-3 w-1/2"></div>
            
            {/* Property Details */}
            <div className="flex justify-between border-t pt-3">
              <div className="flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded w-8 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded w-8 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-between mt-3">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}