import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { userProfiles, skills, questTemplates, dayLogs, questEntries } from '@/lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Sync backend disabled' }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const since = req.nextUrl.searchParams.get('since');

  const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get();
  const userSkills = await db.select().from(skills).where(eq(skills.userId, userId)).all();
  const templates = await db.select().from(questTemplates).where(eq(questTemplates.userId, userId)).all();

  let logs;
  if (since) {
    logs = await db.select().from(dayLogs)
      .where(and(eq(dayLogs.userId, userId), gte(dayLogs.date, since)))
      .all();
  } else {
    logs = await db.select().from(dayLogs).where(eq(dayLogs.userId, userId)).all();
  }

  const logIds = logs.map(l => l.id);
  let entries: (typeof questEntries.$inferSelect)[] = [];
  if (logIds.length > 0) {
    entries = await db.select().from(questEntries)
      .where(eq(questEntries.userId, userId))
      .all();
    if (since) {
      entries = entries.filter(e => logIds.includes(e.dayLogId));
    }
  }

  return NextResponse.json({
    profile,
    skills: userSkills,
    questTemplates: templates,
    dayLogs: logs,
    questEntries: entries,
    serverTime: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Sync backend disabled' }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json();

  if (body.profile) {
    const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get();
    const profileData = {
      ...body.profile,
      userId,
      poisons: JSON.stringify(body.profile.poisons || []),
      unlockedApps: JSON.stringify(body.profile.unlockedApps || []),
      attributes: JSON.stringify(body.profile.attributes || []),
      updatedAt: new Date(),
    };
    if (existing) {
      await db.update(userProfiles).set(profileData).where(eq(userProfiles.userId, userId));
    } else {
      await db.insert(userProfiles).values(profileData);
    }
  }

  if (body.skills?.length) {
    for (const skill of body.skills) {
      const existing = await db.select().from(skills).where(eq(skills.id, skill.id)).get();
      const skillData = { ...skill, userId, updatedAt: new Date() };
      if (existing) {
        await db.update(skills).set(skillData).where(eq(skills.id, skill.id));
      } else {
        await db.insert(skills).values(skillData);
      }
    }
  }

  if (body.questTemplates?.length) {
    for (const tmpl of body.questTemplates) {
      const existing = await db.select().from(questTemplates).where(eq(questTemplates.id, tmpl.id)).get();
      const tmplData = { ...tmpl, userId };
      if (existing) {
        await db.update(questTemplates).set(tmplData).where(eq(questTemplates.id, tmpl.id));
      } else {
        await db.insert(questTemplates).values(tmplData);
      }
    }
  }

  if (body.dayLogs?.length) {
    for (const log of body.dayLogs) {
      const existing = await db.select().from(dayLogs).where(eq(dayLogs.id, log.id)).get();
      const logData = { ...log, userId, updatedAt: new Date() };
      delete logData.quests;
      if (existing) {
        await db.update(dayLogs).set(logData).where(eq(dayLogs.id, log.id));
      } else {
        await db.insert(dayLogs).values(logData);
      }

      if (log.quests?.length) {
        for (const entry of log.quests) {
          const existingEntry = await db.select().from(questEntries).where(eq(questEntries.id, entry.id)).get();
          const entryData = { ...entry, dayLogId: log.id, userId };
          if (existingEntry) {
            await db.update(questEntries).set(entryData).where(eq(questEntries.id, entry.id));
          } else {
            await db.insert(questEntries).values(entryData);
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, serverTime: new Date().toISOString() });
}
