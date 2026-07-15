import { getPromptsByIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const idsParam = new URL(req.url).searchParams.get("ids");
  if (!idsParam) return Response.json({ prompts: [] });
  const ids = idsParam
    .split(",")
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
  const prompts = await getPromptsByIds(ids);
  return Response.json({ prompts });
}
