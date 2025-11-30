export default function PropertyDetailsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Loading */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Loading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image Loading */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-96 bg-gray-200 animate-pulse"></div>
            </div>

            {/* Thumbnails Loading */}
            <div className="flex space-x-2 overflow-x-auto pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-20 h-20 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>

            {/* Property Details Loading */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>

              {/* Key Features Loading */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="text-center p-4 bg-gray-100 rounded-lg animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 rounded w-6 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>

              {/* Description Loading */}
              <div className="space-y-3 mb-6">
                <div className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>

              {/* Features & Amenities Loading */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-2 h-2 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Loading */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
              <div className="space-y-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-4 bg-gray-200 rounded w-4 mr-3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Right Column Loading */}
          <div className="space-y-6">
            {/* Price Card Loading */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="h-10 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>

              <div className="space-y-3 mb-6">
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Card Loading */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-4 bg-gray-200 rounded w-4 mr-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Tour Loading */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-36 mb-4 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
