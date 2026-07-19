import { photographers, companies } from "@/lib/data";
import { JobDetail } from "@/components/JobDetail";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Job · Photographylink",
};

export default function JobDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <JobDetail
      id={params.id}
      photographers={photographers}
      companies={companies}
    />
  );
}
