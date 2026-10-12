import ContestRoom from "@/components/practice/ContestRoom";

export default async function ContestPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContestRoom slug={slug} />;
}
