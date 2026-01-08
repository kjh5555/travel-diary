import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const mode = searchParams.get('mode') || 'transit';

    if (!origin || !destination) {
        return NextResponse.json(
            { error: 'Origin and destination are required' },
            { status: 400 }
        );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    try {
        // Ensure mode is lowercase for Google API
        const normalizedMode = mode.toLowerCase();

        // Build the base URL
        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${normalizedMode}&key=${apiKey}&language=ko&region=JP`;

        // Add departure_time for transit mode (current time in Unix timestamp)
        if (normalizedMode === 'transit') {
            const departureTime = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
            url += `&departure_time=${departureTime}`;
            console.log('🚇 Transit mode - adding departure_time:', new Date(departureTime * 1000).toISOString());
        }

        console.log('🌐 Server-side API Request:', { origin, destination, mode: normalizedMode, url });

        const response = await fetch(url);
        const data = await response.json();

        console.log('📦 Server-side API Response:', JSON.stringify(data, null, 2));

        return NextResponse.json(data);
    } catch (error) {
        console.error('❌ Server-side API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch directions' },
            { status: 500 }
        );
    }
}
