import GeneratePage from "@/app/generate/page";

export default async function PremiumRecipeModePage({ params }: { params: Promise<{ mode: string }> }) {
  const resolvedParams = await params;
  return <GeneratePage mode={resolvedParams.mode} />;
}
