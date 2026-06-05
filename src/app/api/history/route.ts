import { readHistory, clearHistory, deleteHistoryEntry } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const history = readHistory();
  return Response.json(history);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const deleted = deleteHistoryEntry(id);
    if (!deleted) {
      return Response.json({ error: 'Entry not found' }, { status: 404 });
    }
    return Response.json({ success: true });
  }

  clearHistory();
  return Response.json({ success: true });
}
