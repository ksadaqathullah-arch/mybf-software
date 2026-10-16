import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    let events = await db.event.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        chapter: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    // If no events exist yet in the database, seed initial high-priority NGO community events
    if (events.length === 0) {
      const org = await db.organization.findFirst();
      const manjeriChapter = await db.chapter.findFirst({ where: { slug: 'manjeri' } });

      if (org) {
        const now = new Date();
        const summitStartsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        const summitEndsAt = new Date(summitStartsAt.getTime() + 6 * 60 * 60 * 1000);

        const meetupStartsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
        const meetupEndsAt = new Date(meetupStartsAt.getTime() + 4 * 60 * 60 * 1000);

        await db.event.createMany({
          data: [
            {
              organizationId: org.id,
              chapterId: null, // District level
              title: 'MYBF Malappuram District Youth Business Summit 2026',
              slug: 'mybf-district-summit-2026',
              category: 'SUMMIT',
              description: 'Annual gathering of youth founders, emerging enterprises, and student innovators across all 16 chapters of Malappuram district.',
              venueName: 'Malappuram Trade & Convention Centre',
              venueAddress: 'Kottakkunnu Road, Down Hill, Malappuram - 676505',
              eventType: 'FREE',
              basePriceINR: 0, // 100% Free NGO membership pass
              capacity: 500,
              registeredCount: 0,
              startsAt: summitStartsAt,
              endsAt: summitEndsAt,
              status: 'PUBLISHED',
            },
            {
              organizationId: org.id,
              chapterId: manjeriChapter?.id ?? null,
              title: 'Youth Startup Pitch & Entrepreneurship Showcase',
              slug: 'manjeri-youth-pitch-2026',
              category: 'WORKSHOP',
              description: 'Mentorship round, investor networking, and product showcase for Manjeri and Ernad taluk youth entrepreneurs.',
              venueName: 'Manjeri Youth Innovation Hall',
              venueAddress: 'Court Road, Manjeri - 676121',
              eventType: 'FREE',
              basePriceINR: 0, // 100% Free
              capacity: 120,
              registeredCount: 0,
              startsAt: meetupStartsAt,
              endsAt: meetupEndsAt,
              status: 'PUBLISHED',
            },
          ],
        });

        events = await db.event.findMany({
          where: { status: 'PUBLISHED' },
          include: {
            chapter: { select: { id: true, name: true, slug: true } },
          },
          orderBy: { startsAt: 'asc' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch events.' },
      { status: 500 }
    );
  }
}
