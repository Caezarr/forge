import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { appState } from '@/lib/db/schema';

const STATE_ID = process.env.FORGE_STATE_ID || 'gabriel';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function disabled() {
  return NextResponse.json({ error: 'State sync disabled' }, { status: 503 });
}

function isAuthorized(req: NextRequest): boolean {
  const token = process.env.FORGE_SYNC_TOKEN;
  if (!token) return false;

  const auth = req.headers.get('authorization');
  const bearer = auth?.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer === token;
}

async function ensureStateTable() {
  if (!db) return;
  await db.run(sql`
    create table if not exists app_state (
      id text primary key,
      data text not null,
      updated_at text not null
    )
  `);
}

export async function GET(req: NextRequest) {
  if (!db || !process.env.FORGE_SYNC_TOKEN) return disabled();
  if (!isAuthorized(req)) return unauthorized();

  await ensureStateTable();
  const row = await db.select().from(appState).where(eq(appState.id, STATE_ID)).get();

  if (!row) {
    return NextResponse.json({ profile: null, updatedAt: null });
  }

  return NextResponse.json({
    profile: JSON.parse(row.data),
    updatedAt: row.updatedAt,
  });
}

export async function PUT(req: NextRequest) {
  if (!db || !process.env.FORGE_SYNC_TOKEN) return disabled();
  if (!isAuthorized(req)) return unauthorized();

  const body = await req.json();
  if (!body?.profile || typeof body.profile !== 'object') {
    return NextResponse.json({ error: 'Missing profile' }, { status: 400 });
  }

  await ensureStateTable();

  const updatedAt = new Date().toISOString();
  const data = JSON.stringify(body.profile);

  await db
    .insert(appState)
    .values({ id: STATE_ID, data, updatedAt })
    .onConflictDoUpdate({
      target: appState.id,
      set: { data, updatedAt },
    });

  return NextResponse.json({ ok: true, updatedAt });
}
