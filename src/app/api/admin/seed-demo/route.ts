// TEMPORARY ENDPOINT — Remove or disable (ALLOW_DEMO_SEED=false) after the showcase.
// Triggers the demo seed without needing terminal access (e.g. Railway deployments).

import { NextRequest, NextResponse } from "next/server";
import { seedDemoData } from "../../../../../scripts/seed-demo";

export async function GET(req: NextRequest) {
  // Gate 1: feature flag must be explicitly enabled
  if (process.env.ALLOW_DEMO_SEED !== "true") {
    return NextResponse.json({ error: "Demo seeding is disabled." }, { status: 403 });
  }

  // Gate 2: secret must be configured in the environment
  const configuredSecret = process.env.DEMO_SEED_SECRET;
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "DEMO_SEED_SECRET is not configured on the server." },
      { status: 500 }
    );
  }

  // Gate 3: caller must supply the matching secret
  const providedSecret = req.nextUrl.searchParams.get("secret");
  if (!providedSecret || providedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Invalid or missing secret." }, { status: 401 });
  }

  try {
    const summary = await seedDemoData();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
