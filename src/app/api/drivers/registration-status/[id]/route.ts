import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;
    
    if (!driverId) {
      return NextResponse.json(
        { success: false, message: 'Driver ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers/registration-status/${driverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error checking driver registration status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check registration status' },
      { status: 500 }
    );
  }
} 