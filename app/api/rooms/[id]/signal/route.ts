import { NextRequest, NextResponse } from 'next/server';
import { addSignal, getSignals, getRoom } from '@/lib/roomStore';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const participantId = searchParams.get('participantId');
  const since = parseInt(searchParams.get('since') || '0', 10);

  if (!participantId) {
    return NextResponse.json(
      { success: false, error: 'participantId diperlukan' },
      { status: 400 }
    );
  }

  const signals = getSignals(id, participantId, since);
  const room = getRoom(id);

  return NextResponse.json({
    success: true,
    signals,
    roomStatus: room?.status || 'waiting',
    participants: room?.participants || {},
    currentPoseIndex: room?.currentPoseIndex ?? 0,
    countdownNumber: room?.countdownNumber ?? null,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  const { senderId, type, payload, targetId } = body;

  if (!senderId || !type) {
    return NextResponse.json(
      { success: false, error: 'senderId dan type diperlukan' },
      { status: 400 }
    );
  }

  const signal = addSignal(id, senderId, type, payload, targetId);

  return NextResponse.json({
    success: !!signal,
    signal,
  });
}
