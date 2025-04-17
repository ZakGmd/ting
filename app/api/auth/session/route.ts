import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  
  // Return session data or null if no session
  return NextResponse.json(session || { user: null });
} 