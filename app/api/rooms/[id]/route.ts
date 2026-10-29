import { NextRequest, NextResponse } from 'next/server';
import { getRoom, joinRoom, updateParticipant, updateRoomState } from '@/lib/roomStore';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const room = getRoom(id);

  if (!room) {
    return NextResponse.json(
      { success: false, error: 'Room tidak ditemukan' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    room,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  if (action === 'join') {
    const guestName = body.guestName || 'Teman';
    const result = joinRoom(id, guestName);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Room tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room: result.room,
      participantId: result.guestId,
      role: 'guest',
    });
  }

  if (action === 'update_participant') {
    const { participantId, updates } = body;
    const room = updateParticipant(id, participantId, updates);
    return NextResponse.json({ success: !!room, room });
  }

  if (action === 'update_room') {
    const { updates } = body;
    const room = updateRoomState(id, updates);
    return NextResponse.json({ success: !!room, room });
  }

  return NextResponse.json({ success: false, error: 'Aksi tidak dikenal' }, { status: 400 });
}
