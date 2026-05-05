import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEMO_SUFFIX = ".demo@ndus.edu";

// ─── Date helpers ─────────────────────────────────────────────────────────────

// Absolute campus date — avoids drift when the seed runs after the showcase day.
// Uses local time so Railway's TZ setting controls the offset (set TZ=America/Chicago).
function cd(year: number, month: number, day: number, hour = 12, min = 0): Date {
  return new Date(year, month - 1, day, hour, min, 0, 0);
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────
// Safety: only deletes records belonging to users whose email ends in
// ".demo@ndus.edu". Real users, real events, and real conversations are
// never touched.

async function clearDemoData() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_SUFFIX } },
    select: { id: true },
  });
  const demoIds = demoUsers.map((u) => u.id);
  if (demoIds.length === 0) return;

  // Find events created by demo users so we can delete their linked conversations.
  // Conversation.event uses onDelete:SetNull, so we must delete conversations
  // before events are cascade-deleted with their creators.
  const demoEvents = await prisma.event.findMany({
    where: { createdById: { in: demoIds } },
    select: { id: true },
  });
  const demoEventIds = demoEvents.map((e) => e.id);

  if (demoEventIds.length > 0) {
    await prisma.conversation.deleteMany({ where: { eventId: { in: demoEventIds } } });
  }

  // Delete standalone conversations created by demo users (direct + group)
  await prisma.conversation.deleteMany({ where: { createdById: { in: demoIds } } });

  // Delete demo users — Prisma cascades:
  //   Events, EventAttendance, EventBookmark, EventLike, EventComment,
  //   Follow (both directions), Message, ConversationParticipant, WordleResult
  await prisma.user.deleteMany({ where: { id: { in: demoIds } } });
}

// ─── Users ────────────────────────────────────────────────────────────────────

const USER_ROWS = [
  { email: "david.alonso.demo@ndus.edu",   username: "david",     firstName: "David",    lastName: "Alonso",   isAdmin: true  },
  { email: "emma.johnson.demo@ndus.edu",    username: "emmaj",     firstName: "Emma",     lastName: "Johnson",  isAdmin: false },
  { email: "liam.anderson.demo@ndus.edu",   username: "liama",     firstName: "Liam",     lastName: "Anderson", isAdmin: false },
  { email: "sofia.martinez.demo@ndus.edu",  username: "sofiam",    firstName: "Sofia",    lastName: "Martinez", isAdmin: false },
  { email: "noah.williams.demo@ndus.edu",   username: "noahw",     firstName: "Noah",     lastName: "Williams", isAdmin: false },
  { email: "ava.thompson.demo@ndus.edu",    username: "avat",      firstName: "Ava",      lastName: "Thompson", isAdmin: false },
  { email: "ethan.brown.demo@ndus.edu",     username: "ethanb",    firstName: "Ethan",    lastName: "Brown",    isAdmin: false },
  { email: "mia.garcia.demo@ndus.edu",      username: "miag",      firstName: "Mia",      lastName: "Garcia",   isAdmin: false },
  { email: "lucas.miller.demo@ndus.edu",    username: "lucasm",    firstName: "Lucas",    lastName: "Miller",   isAdmin: false },
  { email: "isabella.davis.demo@ndus.edu",  username: "isabellad", firstName: "Isabella", lastName: "Davis",    isAdmin: false },
];

async function seedUsers(): Promise<string[]> {
  const ids: string[] = [];
  for (const r of USER_ROWS) {
    const u = await prisma.user.create({
      data: {
        email: r.email,
        username: r.username,
        firstName: r.firstName,
        lastName: r.lastName,
        name: `${r.firstName} ${r.lastName}`,
        role: "STUDENT",
        isActive: true,
        isBanned: false,
        isAdmin: r.isAdmin,
      },
    });
    ids.push(u.id);
  }
  return ids;
  // ids[0]=david, [1]=emma, [2]=liam, [3]=sofia, [4]=noah,
  // [5]=ava, [6]=ethan, [7]=mia, [8]=lucas, [9]=isabella
}

// ─── Events ───────────────────────────────────────────────────────────────────

function buildEventData(createdById: string) {
  // All dates are fixed to the May 2026 showcase calendar.
  // e[0..14] order is intentional — seedInteractions references by index.
  return [
    // e[0] ── Today: May 5, 2026 ──────────────────────────────────────────────
    {
      title: "Community Problem-Solving Project Presentation",
      description:
        "Minot State Honors Program HON 391H Community Problem-Solving students present their class project addressing social isolation and loneliness among elderly populations.",
      location: "Old Main 103",
      startAt: cd(2026, 5, 5, 10, 0),
      endAt:   cd(2026, 5, 5, 11, 30),
      isPublished: true,
      createdById,
    },
    // e[1] ── Ending soon: May 7 ───────────────────────────────────────────────
    {
      title: "Print Journals Available at Gordon B. Olson Library",
      description:
        "The library is reducing print journal holdings to prepare for innovation engineering program construction. Designated journals are available for faculty or departments to take before recycling. Available through Thursday, May 7 at 4:00 PM. No holds available.",
      location: "Gordon B. Olson Library – Lower Level Journals Area",
      startAt: cd(2026, 5, 1, 9, 0),
      endAt:   cd(2026, 5, 7, 16, 0),
      isPublished: true,
      createdById,
    },
    // e[2] ── May 8 ────────────────────────────────────────────────────────────
    {
      title: "Planned Giving Workshop",
      description:
        "The Minot State Development Foundation is sponsoring a workshop on planned giving with presenter Jacob Thrailkill. Free and open to anyone interested. Cookies, refreshments, and door prizes provided.",
      location: "Student Center Conference Center",
      startAt: cd(2026, 5, 8, 15, 0),
      endAt:   cd(2026, 5, 8, 16, 30),
      isPublished: true,
      createdById,
    },
    // e[3] ── May 8 (evening) ──────────────────────────────────────────────────
    {
      title: "Capstone Exhibition Opening Reception: Intersecting Narratives",
      description:
        "Opening reception for the annual MSU Capstone Exhibition featuring six art students. The exhibition, Intersecting Narratives, showcases individual stories, emotions, and perspectives through visual art. Gallery talks begin at 7:00 PM.",
      location: "Northwest Arts Center, Lower Level of Gordon B. Olson Library",
      startAt: cd(2026, 5, 8, 18, 30),
      endAt:   cd(2026, 5, 8, 20, 0),
      isPublished: true,
      createdById,
    },
    // e[4] ── May 9 ────────────────────────────────────────────────────────────
    {
      title: "Megan Kramer Senior Voice Recital",
      description:
        "Senior voice recital hosted by the Department of Fine and Performing Arts. Come celebrate Megan Kramer's senior recital performance.",
      location: "Ann Nicole Nelson Hall",
      startAt: cd(2026, 5, 9, 15, 0),
      endAt:   cd(2026, 5, 9, 16, 30),
      isPublished: true,
      createdById,
    },
    // e[5] ── May 13 ───────────────────────────────────────────────────────────
    {
      title: "Employee Retirement and Recognition Event",
      description:
        "Annual Employee Retirement and Recognition Social and Program honoring Minot State employees for their years of service. Social begins at 2:30 PM, program begins at 3:00 PM.",
      location: "Ann Nicole Nelson Hall",
      startAt: cd(2026, 5, 13, 14, 30),
      endAt:   cd(2026, 5, 13, 16, 0),
      isPublished: true,
      createdById,
    },
    // e[6] ── May 14 ───────────────────────────────────────────────────────────
    {
      title: "Retirement Celebration for Jon Rumney",
      description:
        "The Department of Fine and Performing Arts and Minot Symphony Orchestra invite the campus community to celebrate Professor Jon Rumney's retirement after 32 years at Minot State University.",
      location: "Ann Nicole Nelson Hall Lobby",
      startAt: cd(2026, 5, 14, 16, 0),
      endAt:   cd(2026, 5, 14, 18, 0),
      isPublished: true,
      createdById,
    },
    // e[7] ── May 15 ───────────────────────────────────────────────────────────
    {
      title: "Commencement Stream Team Volunteer Opportunity",
      description:
        "Volunteers are needed to help make graduation day memorable for graduates as part of the Commencement Stream Team. Sign up to support this year's graduating class.",
      location: "Commencement / Campus Event Support",
      startAt: cd(2026, 5, 15, 11, 0),
      endAt:   cd(2026, 5, 15, 12, 0),
      isPublished: true,
      createdById,
    },
    // e[8] ── May 15 (deadline notice) ────────────────────────────────────────
    {
      title: "Federal Work Study Funds Deadline",
      description:
        "Student employees using Federal Work Study funds can use those funds for hours worked through May 15. After this date, departments must use departmental funds for continued student employment. Contact the Financial Aid Office with questions.",
      location: "Financial Aid Office / Campus Departments",
      startAt: cd(2026, 5, 15, 8, 0),
      endAt:   cd(2026, 5, 15, 17, 0),
      isPublished: true,
      createdById,
    },
    // e[9] ── May 18 ───────────────────────────────────────────────────────────
    {
      title: "E-Waste Recycling Program",
      description:
        "Apple Recycling Program is offering free recycling of old University-related electronic equipment. Students, faculty, and staff should submit an ITC work order for pickup. All e-waste must be processed through ITC. Program runs May 18 through July 31.",
      location: "ITC / Campus Pickup via Work Order",
      startAt: cd(2026, 5, 18, 8, 0),
      endAt:   cd(2026, 7, 31, 17, 0),
      isPublished: true,
      createdById,
    },
    // e[10] ── May 20 ──────────────────────────────────────────────────────────
    {
      title: "Final QPR Suicide Prevention Training",
      description:
        "The final Spring 2026 QPR Suicide Prevention Training session for faculty, staff, and students. QPR stands for Question, Persuade, Refer — a simple, evidence-based approach to suicide prevention. Free and open to the campus community.",
      location: "Jones Room",
      startAt: cd(2026, 5, 20, 9, 30),
      endAt:   cd(2026, 5, 20, 10, 30),
      isPublished: true,
      createdById,
    },
    // e[11] ── Ongoing: May 2026 ───────────────────────────────────────────────
    {
      title: "Wellness Center May Group X Schedule",
      description:
        "Wellness Center May Group X fitness classes are in full swing. Hours: Mon–Fri 6 AM–10 PM, Sat 10 AM–6 PM, Sun 12 PM–8 PM. Classes include yoga, spin, Zumba, and more. Check the Wellness Center schedule board for the full lineup.",
      location: "Wellness Center",
      startAt: cd(2026, 5, 5, 6, 0),
      endAt:   cd(2026, 5, 31, 22, 0),
      isPublished: true,
      createdById,
    },
    // e[12] ── May 8–31 (exhibition run) ──────────────────────────────────────
    {
      title: "Northwest Arts Center: Intersecting Narratives Exhibition",
      description:
        "Six Minot State art students exhibit in the annual capstone art exhibition, sharing individual stories, emotions, and perspectives through visual art. The exhibition runs throughout May 2026 at the Northwest Arts Center.",
      location: "Northwest Arts Center",
      startAt: cd(2026, 5, 8, 10, 0),
      endAt:   cd(2026, 5, 31, 17, 0),
      isPublished: true,
      createdById,
    },
    // e[13] ── Ongoing reminder ────────────────────────────────────────────────
    {
      title: "Parking Notice: Communication Disorders Clinic",
      description:
        "Please do not use Clinic Parking near Memorial Hall on 11th Avenue during weekday clinic hours (8:00 AM to 5:30 PM). This parking is reserved for clinic clients who may have mobility challenges or small children.",
      location: "Clinic Parking – Near Memorial Hall on 11th Avenue",
      startAt: cd(2026, 5, 5, 8, 0),
      endAt:   cd(2026, 5, 31, 17, 30),
      isPublished: true,
      createdById,
    },
    // e[14] ── May 6 ───────────────────────────────────────────────────────────
    {
      title: "Staff Senate: How to Reserve Campus Spaces",
      description:
        "Staff Senate shares guidance on reserving campus spaces. Classroom reservations can be made through Ad Astra. Non-classroom facility rentals follow a separate process through Facilities Management. Contact Staff Senate for more information.",
      location: "Campus / Ad Astra Scheduling",
      startAt: cd(2026, 5, 6, 12, 0),
      endAt:   cd(2026, 5, 6, 13, 0),
      isPublished: true,
      createdById,
    },
  ];
}

async function seedEvents(davidId: string): Promise<string[]> {
  const ids: string[] = [];
  for (const data of buildEventData(davidId)) {
    const ev = await prisma.event.create({ data });
    ids.push(ev.id);
  }
  return ids;
}

// ─── Event Conversations ──────────────────────────────────────────────────────

async function seedEventConversations(eventIds: string[], davidId: string) {
  for (const eventId of eventIds) {
    const conv = await prisma.conversation.create({
      data: {
        type: "GROUP",
        eventId,
        createdById: davidId,
      },
    });
    await prisma.conversationParticipant.create({
      data: { conversationId: conv.id, userId: davidId },
    });
  }
}

// ─── Interactions ─────────────────────────────────────────────────────────────

async function seedInteractions(userIds: string[], eventIds: string[]) {
  // u(n) = userIds[n]: 0=david,1=emma,2=liam,3=sofia,4=noah,5=ava,6=ethan,7=mia,8=lucas,9=isabella
  // e(n) = eventIds[n]:
  //   0=Community Problem-Solving (May 5)
  //   1=Print Journals (May 1–7)
  //   2=Planned Giving Workshop (May 8)
  //   3=Capstone Opening Reception (May 8)
  //   4=Megan Kramer Recital (May 9)
  //   5=Employee Retirement Recognition (May 13)
  //   6=Jon Rumney Retirement (May 14)
  //   7=Commencement Stream Team (May 15)
  //   8=FWS Funds Deadline (May 15)
  //   9=E-Waste Recycling (May 18–Jul 31)
  //   10=QPR Training (May 20)
  //   11=Wellness Center Group X (May, ongoing)
  //   12=NW Arts Center Exhibition (May 8–31)
  //   13=Parking Notice (ongoing)
  //   14=Staff Senate: Reserve Spaces (May 6)

  const u = userIds;
  const e = eventIds;

  // ── Attendances ─────────────────────────────────────────────────────────────
  const attendances = [
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((ui) => ({ userId: u[ui], eventId: e[0] })),
    ...[0, 2, 4, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[1] })),
    ...[0, 1, 3, 5, 7, 9].map((ui) => ({ userId: u[ui], eventId: e[2] })),
    ...[0, 1, 3, 4, 7, 9].map((ui) => ({ userId: u[ui], eventId: e[3] })),
    ...[0, 2, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[4] })),
    ...[1, 3, 5, 7, 9].map((ui) => ({ userId: u[ui], eventId: e[5] })),
    ...[0, 1, 4, 8].map((ui) => ({ userId: u[ui], eventId: e[6] })),
    ...[0, 3, 7, 9].map((ui) => ({ userId: u[ui], eventId: e[7] })),
    ...[0, 1, 4, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[8] })),
    ...[0, 2, 5, 7].map((ui) => ({ userId: u[ui], eventId: e[9] })),
    ...[0, 2, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[10] })),
    ...[1, 4, 5, 9].map((ui) => ({ userId: u[ui], eventId: e[11] })),
    ...[0, 2, 4, 6].map((ui) => ({ userId: u[ui], eventId: e[12] })),
    ...[0, 1, 3, 5, 9].map((ui) => ({ userId: u[ui], eventId: e[13] })),
    ...[0, 2, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[14] })),
  ];

  await prisma.eventAttendance.createMany({ data: attendances, skipDuplicates: true });

  // ── Likes ────────────────────────────────────────────────────────────────────
  const likes = [
    ...[0, 1, 2, 3, 4, 5, 6].map((ui) => ({ userId: u[ui], eventId: e[0] })),
    ...[0, 2, 4, 6].map((ui) => ({ userId: u[ui], eventId: e[1] })),
    ...[0, 1, 3, 5, 7].map((ui) => ({ userId: u[ui], eventId: e[2] })),
    ...[0, 1, 3, 7].map((ui) => ({ userId: u[ui], eventId: e[3] })),
    ...[0, 2, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[4] })),
    ...[1, 3, 5, 9].map((ui) => ({ userId: u[ui], eventId: e[5] })),
    ...[0, 4, 8].map((ui) => ({ userId: u[ui], eventId: e[6] })),
    ...[0, 3, 7].map((ui) => ({ userId: u[ui], eventId: e[7] })),
    ...[0, 1, 4, 8].map((ui) => ({ userId: u[ui], eventId: e[8] })),
    ...[0, 5, 7].map((ui) => ({ userId: u[ui], eventId: e[9] })),
    ...[0, 2, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[10] })),
    ...[1, 4, 5].map((ui) => ({ userId: u[ui], eventId: e[11] })),
    ...[0, 2, 4].map((ui) => ({ userId: u[ui], eventId: e[12] })),
    ...[0, 1, 3, 9].map((ui) => ({ userId: u[ui], eventId: e[13] })),
    ...[0, 2, 6, 8].map((ui) => ({ userId: u[ui], eventId: e[14] })),
  ];

  await prisma.eventLike.createMany({ data: likes, skipDuplicates: true });

  // ── Bookmarks ────────────────────────────────────────────────────────────────
  const bookmarks = [
    ...[0, 1].map((ui) => ({ userId: u[ui], eventId: e[0] })),
    ...[0, 4].map((ui) => ({ userId: u[ui], eventId: e[4] })),
    ...[0, 2, 8].map((ui) => ({ userId: u[ui], eventId: e[10] })),
    ...[0, 2, 8].map((ui) => ({ userId: u[ui], eventId: e[14] })),
    ...[1, 4].map((ui) => ({ userId: u[ui], eventId: e[8] })),
    ...[3, 7, 9].map((ui) => ({ userId: u[ui], eventId: e[3] })),
    ...[0, 5].map((ui) => ({ userId: u[ui], eventId: e[9] })),
    ...[1, 6].map((ui) => ({ userId: u[ui], eventId: e[12] })),
    ...[0, 3].map((ui) => ({ userId: u[ui], eventId: e[13] })),
  ];

  await prisma.eventBookmark.createMany({ data: bookmarks, skipDuplicates: true });

  // ── Comments ──────────────────────────────────────────────────────────────────
  type CommentRow = { eventId: string; userId: string; content: string };
  const comments: CommentRow[] = [
    // e[0] Community Problem-Solving Presentation (May 5)
    { eventId: e[0], userId: u[1], content: "So excited to see what HON 391H came up with for addressing elder loneliness!" },
    { eventId: e[0], userId: u[2], content: "Social isolation is such an underrated issue — great choice of topic" },
    { eventId: e[0], userId: u[3], content: "The Honors students always knock it out of the park. Old Main 103 at 10 AM!" },
    { eventId: e[0], userId: u[0], content: "Heading there right after my morning class — should be a great presentation" },
    // e[1] Print Journals (ends May 7)
    { eventId: e[1], userId: u[7], content: "Worth checking before May 7 — found some great psychology journals for my thesis!" },
    { eventId: e[1], userId: u[9], content: "Grabbed a few issues on educational research. Free is free 📚" },
    { eventId: e[1], userId: u[1], content: "Going today after class. Great way to find research material before they recycle everything" },
    // e[2] Planned Giving Workshop (May 8)
    { eventId: e[2], userId: u[1], content: "Free cookies AND door prizes? I'd go for those alone honestly 😄" },
    { eventId: e[2], userId: u[0], content: "Genuinely useful for anyone thinking about estate planning or future giving to the university" },
    { eventId: e[2], userId: u[8], content: "Jacob Thrailkill puts on great workshops — the Development Foundation always does it right" },
    // e[3] Capstone Exhibition Opening Reception (May 8)
    { eventId: e[3], userId: u[0], content: "Can't wait for the gallery talks at 7 PM — the art students this year are incredible 🎨" },
    { eventId: e[3], userId: u[3], content: "Intersecting Narratives is such a beautiful title. Six students, six stories" },
    { eventId: e[3], userId: u[1], content: "Already planning to go with friends from the art club. Lower level of the library at 6:30!" },
    { eventId: e[3], userId: u[7], content: "MSU has so much artistic talent that goes unnoticed. This is the event of the semester" },
    // e[4] Megan Kramer Voice Recital (May 9)
    { eventId: e[4], userId: u[5], content: "Megan has an incredible voice — this is going to be a beautiful afternoon recital! 🎶" },
    { eventId: e[4], userId: u[4], content: "Ann Nicole Nelson Hall acoustics are perfect for vocal performance" },
    { eventId: e[4], userId: u[3], content: "So proud of our Fine Arts seniors. See you all there!" },
    // e[5] Employee Retirement Recognition (May 13)
    { eventId: e[5], userId: u[0], content: "Always great to celebrate the people who make MSU what it is. Well deserved 👏" },
    { eventId: e[5], userId: u[1], content: "Love that the university takes time to recognize long-time faculty and staff" },
    { eventId: e[5], userId: u[8], content: "These events remind you how much history and dedication is behind this campus" },
    // e[6] Jon Rumney Retirement (May 14)
    { eventId: e[6], userId: u[3], content: "32 years at MSU — what an incredible legacy! Congratulations Professor Rumney 🎼" },
    { eventId: e[6], userId: u[5], content: "The music department and the Symphony won't be the same without him. What a send-off" },
    { eventId: e[6], userId: u[0], content: "Stopping by the lobby at 4 PM to celebrate this milestone. Everyone should come!" },
    // e[7] Commencement Stream Team (May 15)
    { eventId: e[7], userId: u[0], content: "Signed up! Such a meaningful way to support the graduating class on their big day 🎓" },
    { eventId: e[7], userId: u[1], content: "This is such a cool volunteer opportunity — graduation day is always emotional" },
    { eventId: e[7], userId: u[2], content: "How do I sign up? I want to be part of this!" },
    { eventId: e[7], userId: u[4], content: "Supporting the graduating class is the least we can do for them. Signing up now" },
    // e[8] FWS Funds Deadline (May 15)
    { eventId: e[8], userId: u[8], content: "Important reminder for anyone on work study — May 15 is the hard cutoff" },
    { eventId: e[8], userId: u[7], content: "Thanks for the heads up! Checking in with my supervisor today about this" },
    { eventId: e[8], userId: u[6], content: "Didn't realize this was the deadline. Good PSA for student workers" },
    // e[9] E-Waste Recycling (May 18+)
    { eventId: e[9], userId: u[2], content: "Finally! I have a pile of old University laptops that desperately need recycling" },
    { eventId: e[9], userId: u[8], content: "Submit through ITC — good to know the process. Cleaning out the lab this week" },
    { eventId: e[9], userId: u[0], content: "Easy way to do the right thing for the environment. Submit that work order! 🌱" },
    // e[10] QPR Training (May 20)
    { eventId: e[10], userId: u[0], content: "QPR training is one of the most valuable things you can do — everyone should take this once" },
    { eventId: e[10], userId: u[1], content: "Signed up for this one. Mental health support on campus is so important" },
    { eventId: e[10], userId: u[3], content: "Jones Room, 9:30 AM — marking my calendar. An hour well spent" },
    { eventId: e[10], userId: u[9], content: "QPR genuinely changed how I approach conversations with struggling friends. Can't recommend enough" },
    // e[11] Wellness Center Group X (ongoing)
    { eventId: e[11], userId: u[5], content: "The Monday morning yoga class is absolutely worth waking up early for 🧘" },
    { eventId: e[11], userId: u[4], content: "Saturday spin class at 10 AM is peak Wellness Center energy 💪" },
    { eventId: e[11], userId: u[0], content: "Good reminder — I've been meaning to check the Group X schedule all week" },
    // e[12] NW Arts Center Exhibition (May 8–31)
    { eventId: e[12], userId: u[7], content: "The exhibition runs all month — so worth visiting even if you miss the opening night" },
    { eventId: e[12], userId: u[9], content: "Love that this showcase celebrates student work. MSU has such talented artists 🖼️" },
    // e[13] Parking Notice
    { eventId: e[13], userId: u[2], content: "Appreciate the reminder — saw a car get towed from clinic parking last week" },
    { eventId: e[13], userId: u[9], content: "Important PSA especially for newer students who might not know about clinic hours" },
    // e[14] Staff Senate: Reserve Campus Spaces
    { eventId: e[14], userId: u[3], content: "Finally a clear guide on how to book spaces on campus. Ad Astra for classrooms!" },
    { eventId: e[14], userId: u[4], content: "Useful info for any club or org trying to reserve a room for events" },
  ];

  await prisma.eventComment.createMany({ data: comments, skipDuplicates: true });

  return {
    attendanceCount: attendances.length,
    likeCount: likes.length,
    bookmarkCount: bookmarks.length,
    commentCount: comments.length,
  };
}

// ─── Social Graph ─────────────────────────────────────────────────────────────

async function seedFollows(userIds: string[]) {
  const u = userIds;
  const pairs: [number, number][] = [
    // David follows
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 6], [0, 8],
    // Mutual follows back to David
    [1, 0], [2, 0], [4, 0], [8, 0],
    // One-way: others follow David
    [3, 0], [7, 0], [9, 0],
    // Peer follows (not involving David)
    [1, 3], [1, 5], [2, 8], [3, 7], [4, 5],
    [5, 9], [6, 2], [7, 9], [8, 6], [9, 1],
    [5, 1], [6, 4], [9, 3],
  ];

  const data = pairs.map(([fi, ti]) => ({ followerId: u[fi], followingId: u[ti] }));
  await prisma.follow.createMany({ data, skipDuplicates: true });
  return data.length;
}

// ─── Chats ────────────────────────────────────────────────────────────────────

async function seedChats(userIds: string[]) {
  const u = userIds;
  let convCount = 0;
  let msgCount = 0;

  async function createConv(
    type: "DIRECT" | "GROUP",
    creatorIdx: number,
    participantIdxs: number[],
    title: string | null,
    messages: { senderIdx: number; content: string }[]
  ) {
    const conv = await prisma.conversation.create({
      data: { type, title, createdById: u[creatorIdx] },
    });
    for (const pi of participantIdxs) {
      await prisma.conversationParticipant.create({
        data: { conversationId: conv.id, userId: u[pi] },
      });
    }
    let offset = 0;
    for (const m of messages) {
      const createdAt = new Date(Date.now() - (messages.length - offset) * 4 * 60_000);
      await prisma.message.create({
        data: { conversationId: conv.id, senderId: u[m.senderIdx], content: m.content, createdAt },
      });
      offset++;
      msgCount++;
    }
    convCount++;
  }

  // ── Direct conversations ───────────────────────────────────────────────────

  // David ↔ Emma — planning for the Capstone Opening Reception on May 8
  await createConv("DIRECT", 0, [0, 1], null, [
    { senderIdx: 1, content: "David! Are you going to the Capstone Opening Reception on Friday?" },
    { senderIdx: 0, content: "Yes! The gallery talks at 7 look amazing 🎨" },
    { senderIdx: 1, content: "Six art students in one show — Intersecting Narratives is such a great title" },
    { senderIdx: 0, content: "Want to go together? I'll meet you at the Library lower level at 6:30" },
    { senderIdx: 1, content: "Perfect! I'll bring Sofia and Mia too, they're obsessed with the art department" },
    { senderIdx: 0, content: "The more the merrier 🙌 See you Friday!" },
  ]);

  // David ↔ Lucas — QPR training and FWS deadline
  await createConv("DIRECT", 0, [0, 8], null, [
    { senderIdx: 8, content: "Hey, are you signing up for the QPR training on May 20?" },
    { senderIdx: 0, content: "Already did — it's only an hour and genuinely important. You should come" },
    { senderIdx: 8, content: "Agreed. I did it last year and it really shifts how you think about these conversations" },
    { senderIdx: 0, content: "Jones Room at 9:30. I'll see you there 👍" },
    { senderIdx: 8, content: "Also heads up — FWS funds deadline is May 15 if you have student workers" },
    { senderIdx: 0, content: "Good call, I'll make sure my team knows. Thanks for flagging it" },
  ]);

  // Liam ↔ Sofia — Voice Recital and Jon Rumney retirement
  await createConv("DIRECT", 2, [2, 3], null, [
    { senderIdx: 3, content: "Are you going to the Megan Kramer recital on Saturday?" },
    { senderIdx: 2, content: "Yes! Ann Nicole Nelson Hall is perfect for a voice recital" },
    { senderIdx: 3, content: "Also — did you see the Jon Rumney retirement celebration on May 14?" },
    { senderIdx: 2, content: "32 years at MSU?? Absolutely going to the lobby at 4 PM 🎼" },
    { senderIdx: 3, content: "Such a legendary send-off. Let's go together!" },
    { senderIdx: 2, content: "Deal. That whole week is going to be full of great campus events" },
  ]);

  // ── Group 1: Capstone Exhibition — planning to attend May 8 ───────────────
  // participants: David(0), Sofia(3), Emma(1), Mia(7)
  await createConv("GROUP", 0, [0, 3, 1, 7], "Capstone Exhibition Night 🎨", [
    { senderIdx: 0, content: "Who's coming to the Capstone Opening Reception this Friday??" },
    { senderIdx: 3, content: "I'm SO going — Intersecting Narratives sounds incredible" },
    { senderIdx: 1, content: "Same! I've been following some of the artists on Instagram" },
    { senderIdx: 7, content: "I didn't know about this — gallery talks start at 7 PM right?" },
    { senderIdx: 0, content: "Yes! 6:30 PM arrival, talks begin at 7. Northwest Arts Center, lower level of the library" },
    { senderIdx: 3, content: "This is honestly the best part of the semester. Campus art is so underrated" },
    { senderIdx: 1, content: "Let's all meet outside the library at 6:20 so we can walk in together?" },
    { senderIdx: 7, content: "I'm in! Can I bring my roommate too?" },
    { senderIdx: 0, content: "Of course! The more people support the art students the better 🎨" },
    { senderIdx: 3, content: "This is going to be such a great night 🌟" },
  ]);

  // ── Group 2: Commencement Stream Team — volunteering May 15 ───────────────
  // participants: David(0), Emma(1), Liam(2), Noah(4)
  await createConv("GROUP", 0, [0, 1, 2, 4], "Commencement Volunteer Team 🎓", [
    { senderIdx: 0, content: "Hey team! I signed us up for the Commencement Stream Team on May 15" },
    { senderIdx: 1, content: "Yesss! I've always wanted to help with graduation day" },
    { senderIdx: 4, content: "That's awesome — what does the Stream Team actually do?" },
    { senderIdx: 0, content: "We help make graduation memorable — crowd support, stream coordination, general event help" },
    { senderIdx: 2, content: "Count me in. Graduation is such an emotional day and I love being part of it" },
    { senderIdx: 1, content: "Show up at 11 AM right? Liam, Noah — you both free that morning?" },
    { senderIdx: 2, content: "Yes! Already blocked it off on my calendar" },
    { senderIdx: 4, content: "Same — this is such a great way to give back to the graduating class 🎓" },
    { senderIdx: 0, content: "Perfect. I'll share the full volunteer brief when it comes in" },
    { senderIdx: 1, content: "The seniors deserve the best send-off. Let's make it special 🙌" },
  ]);

  // ── Group 3: Campus Life & Wellness — QPR training + campus updates ────────
  // participants: Lucas(8), David(0), Ethan(6), Isabella(9)
  await createConv("GROUP", 8, [8, 0, 6, 9], "Campus Life & Wellness 💙", [
    { senderIdx: 8, content: "Did anyone see the QPR training on May 20? I think we should all go as a group" },
    { senderIdx: 6, content: "I've been meaning to do this for a while — what time is it?" },
    { senderIdx: 0, content: "9:30 AM to 10:30 AM in the Jones Room. Just an hour, completely free" },
    { senderIdx: 9, content: "QPR is so valuable. I took it last semester and it really shifts your perspective on how to help people" },
    { senderIdx: 8, content: "Exactly. It's one of those trainings that could genuinely make a difference someday" },
    { senderIdx: 6, content: "Signing up today. Thanks for flagging this — important stuff" },
    { senderIdx: 0, content: "Also the Wellness Center Group X schedule for May just dropped — morning yoga is back!" },
    { senderIdx: 9, content: "Saturday spin class is non-negotiable for me 💪" },
    { senderIdx: 8, content: "Lol valid. But seriously — QPR on May 20, group outing, everyone in?" },
    { senderIdx: 6, content: "QPR crew confirmed 🙌 See you all at the Jones Room" },
  ]);

  return { convCount, msgCount };
}

// ─── Exported seed function ───────────────────────────────────────────────────

export type SeedSummary = {
  users: number;
  events: number;
  follows: number;
  comments: number;
  likes: number;
  bookmarks: number;
  attendances: number;
  conversations: number;
  messages: number;
};

export async function seedDemoData(): Promise<SeedSummary> {
  await clearDemoData();

  const userIds = await seedUsers();
  const davidId = userIds[0];

  const eventIds = await seedEvents(davidId);
  await seedEventConversations(eventIds, davidId);

  const { attendanceCount, likeCount, bookmarkCount, commentCount } =
    await seedInteractions(userIds, eventIds);

  const followCount = await seedFollows(userIds);
  const { convCount, msgCount } = await seedChats(userIds);

  return {
    users: userIds.length,
    events: eventIds.length,
    follows: followCount,
    comments: commentCount,
    likes: likeCount,
    bookmarks: bookmarkCount,
    attendances: attendanceCount,
    conversations: convCount + eventIds.length,
    messages: msgCount,
  };
}

// ─── CLI entry point ──────────────────────────────────────────────────────────
// Only executes when this file is run directly via `tsx scripts/seed-demo.ts`.
// When imported by the API route, this block is skipped.

const scriptPath = process.argv[1] ?? "";
if (scriptPath.endsWith("seed-demo.ts") || scriptPath.endsWith("seed-demo.js")) {
  seedDemoData()
    .then((s) => {
      console.log("\n─────────────────────────────────────────");
      console.log("  Demo Seed Summary");
      console.log("─────────────────────────────────────────");
      console.log(`  Users created:         ${s.users}`);
      console.log(`  Events created:        ${s.events}`);
      console.log(`  Follows:               ${s.follows}`);
      console.log(`  Comments:              ${s.comments}`);
      console.log(`  Likes:                 ${s.likes}`);
      console.log(`  Bookmarks:             ${s.bookmarks}`);
      console.log(`  Attendances:           ${s.attendances}`);
      console.log(`  Conversations:         ${s.conversations}`);
      console.log(`  Messages:              ${s.messages}`);
      console.log("─────────────────────────────────────────\n");
      console.log("✅  Demo seed complete. Log in as:");
      console.log("    david.alonso.demo@ndus.edu  (isAdmin = true)\n");
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
