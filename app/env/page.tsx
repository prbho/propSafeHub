// app/debug/env/page.tsx
export default function DebugEnvPage() {
  const envVars = {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    NEXT_PUBLIC_APPWRITE_PROJECT_ID:
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY
      ? '***' + process.env.APPWRITE_API_KEY.slice(-4)
      : null,
    NEXT_PUBLIC_APPWRITE_DATABASE_ID:
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID:
      process.env.NEXT_PUBLIC_APPWRITE_AGENTS_TABLE_ID,
    NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID:
      process.env.NEXT_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID,
    NEXT_PUBLIC_APPWRITE_REVIEWS_TABLE_ID:
      process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_TABLE_ID,
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
      <div className="space-y-3">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{key}</code>
            <span
              className={
                value
                  ? 'text-green-600 font-medium'
                  : 'text-red-600 font-medium'
              }
            >
              {value ? `✓ ${value}` : '✗ Missing'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
