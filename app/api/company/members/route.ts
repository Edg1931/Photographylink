import { NextResponse } from "next/server";
import {
  addMember,
  removeMember,
  approveMember,
  AddMemberInput,
} from "@/lib/backend";
import { currentAccount } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireCompany() {
  const account = await currentAccount();
  if (!account || account.role !== "company" || !account.companySlug) return null;
  return account.companySlug;
}

export async function POST(req: Request) {
  const slug = await requireCompany();
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Not signed in as a company" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Partial<AddMemberInput>;
  if (!body.name || !body.email) {
    return NextResponse.json({ ok: false, error: "name and email are required" }, { status: 400 });
  }
  const member = await addMember(slug, {
    name: body.name,
    email: body.email,
    phone: body.phone,
    rate: body.rate ? Number(body.rate) : undefined,
  });
  return NextResponse.json({ ok: true, member }, { status: 201 });
}

export async function PATCH(req: Request) {
  const slug = await requireCompany();
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Not signed in as a company" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { id?: string; action?: string };
  if (!body.id || body.action !== "approve") {
    return NextResponse.json({ ok: false, error: "id and action=approve required" }, { status: 400 });
  }
  const member = await approveMember(slug, body.id);
  return NextResponse.json({ ok: true, member });
}

export async function DELETE(req: Request) {
  const slug = await requireCompany();
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Not signed in as a company" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await removeMember(slug, id);
  return NextResponse.json({ ok: true });
}
