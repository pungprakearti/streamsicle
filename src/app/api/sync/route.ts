import { syncTmdbData } from "@/actions/sync";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await syncTmdbData();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed" },
      { status: 500 }
    );
  }
}
