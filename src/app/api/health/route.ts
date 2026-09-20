import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db/client";

export async function GET() {
  const dbCheck = await checkDatabaseConnection();

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    database: dbCheck,
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
}
