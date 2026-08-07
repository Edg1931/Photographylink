import { NextResponse } from "next/server";
import { addClient, updateClient, removeClient, ClientInput } from "@/lib/backend";
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
  if (!slug) return NextResponse.json({ ok: false, error: "Not signed in as a company" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Partial<ClientInput>;
  if (!body.name) return NextResponse.json({ ok: false, error: "name is required" }, { status: 400 });
  const client = await addClient(slug, {
    name: body.name,
    brokerage: body.brokerage,
    email: body.email,
    phone: body.phone,
    notes: body.notes,
  });
  return NextResponse.json({ ok: true, client }, { status: 201 });
}

export async function PATCH(req: Request) {
  const slug = await requireCompany();
  if (!slug) return NextResponse.json({ ok: false, error: "Not signed in as a company" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { id?: string } & Partial<ClientInput>;
  if (!body.id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  const { id, ...patch } = body;
  const client = await updateClient(slug, id, patch);
  return NextResponse.json({ ok: true, client });
}

export async function DELETE(req: Request) {
  const slug = await requireCompany();
  if (!slug) return NextResponse.json({ ok: false, error: "Not signed in as a company" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  await removeClient(slug, id);
  return NextResponse.json({ ok: true });
}
