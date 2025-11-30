export default function PropertyCarouselLoading() {
  return (
    <section className="py-16 bg-linear-to-b from-white to-gray-50/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Enhanced Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12">
          <div className="flex-1 mb-6 lg:mb-0">
            {/* Badge Skeleton */}
            <div className="inline-flex mb-4">
              <div className="h-8 bg-gray-200 rounded-full w-32 animate-pulse"></div>
            </div>

            {/* Title & Subtitle Skeleton */}
            <div className="h-10 bg-gray-200 rounded-lg w-80 mb-3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 max-w-full animate-pulse"></div>
          </div>

          {/* Navigation Controls Skeleton */}
          <div className="flex items-center gap-4">
            {/* View All Button Skeleton */}
            <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>

            {/* Navigation Arrows Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Carousel Skeleton */}
        <div className="relative">
          {/* Gradient Overlays */}

          {/* Carousel Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
              >
                {/* Image Skeleton */}
                <div className="relative aspect-4/3 bg-gray-200 overflow-hidden">
                  {/* Featured Badge Skeleton */}
                  <div className="absolute top-3 left-3 z-10">
                    <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                  </div>

                  {/* Favorite Button Skeleton */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="p-4">
                  {/* Price Skeleton */}
                  <div className="mb-2">
                    <div className="h-7 bg-gray-200 rounded w-32 mb-1"></div>
                  </div>

                  {/* Title Skeleton */}
                  <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>

                  {/* Location Skeleton */}
                  <div className="flex items-center mb-3">
                    <div className="h-3 bg-gray-200 rounded w-4 mr-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>

                  {/* Property Details Skeleton */}
                  <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1">
                      <div className="h-3 bg-gray-200 rounded w-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 bg-gray-200 rounded w-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 bg-gray-200 rounded w-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>

                  {/* Additional Info Skeleton */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-gray-200 rounded w-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dot Indicators Skeleton */}
        <div className="flex sm:hidden justify-center items-center gap-2 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
