import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Upload properties API called')

    const result = await uploadSimpleProperties()

    return NextResponse.json({
      success: true,
      message: `Upload completed: ${result.successCount} successful, ${result.errorCount} failed`,
      ...result,
    })
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload properties',
      },
      { status: 500 }
    )
  }
}
