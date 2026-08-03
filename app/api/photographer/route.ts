import { NextResponse } from "next/server";
import { updatePhotographer } from "@/lib/backend";
import { PhotographerPatch } from "@/lib/backend-types";
import { currentAccount } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const account = await currentAccount();
  if (!account || account.role !== "photographer" || !account.photographerSlug) {
    return NextResponse.json(
      { ok: false, error: "Not signed in as a photographer" },
      { status: 401 },
    );
  }
  const patch = (await req.json().catch(() => ({}))) as PhotographerPatch;
  const photographer = await updatePhotographer(account.photographerSlug, patch);
  if (!photographer) {
    return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, photographer });
}
