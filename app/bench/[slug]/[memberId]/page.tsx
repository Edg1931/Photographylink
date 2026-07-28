import { notFound } from "next/navigation";
import { getCompany, getMember } from "@/lib/backend";
import { BenchClaim } from "@/components/BenchClaim";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; memberId: string };
}) {
  const company = await getCompany(params.slug);
  return { title: company ? `Shoots for you · ${company.name}` : "Your shoots" };
}

export default async function BenchMemberPage({
  params,
}: {
  params: { slug: string; memberId: string };
}) {
  const company = await getCompany(params.slug);
  const member = company ? await getMember(params.slug, params.memberId) : undefined;
  if (!company || !member) notFound();

  return (
    <BenchClaim
      companySlug={params.slug}
      companyName={company.name}
      accent={company.accent}
      logoMark={company.logoMark}
      member={{ id: member.id, name: member.name, avatar: member.avatar ?? "" }}
    />
  );
}
