import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/lib/roomStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const hostName = body.hostName || 'Host';

    const result = createRoom(hostName);
    return NextResponse.json({
      success: true,
      room: result.room,
      participantId: result.hostId,
      role: 'host',
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat room' },
      { status: 500 }
    );
  }
}
