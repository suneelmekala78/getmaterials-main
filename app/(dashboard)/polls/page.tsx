import type { Metadata } from "next";
import PollsPage from "@/components/polls/PollsBrowser";
import { connectDB, Poll } from "@/lib/database";
import { DEFAULT_POLL_IMAGE, listingMetadata, plainText } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ poll?: string | string[] }>;
}

function firstParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  return decodeURIComponent(String(raw || "")).trim();
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const key = firstParam((await searchParams).poll);
  if (!key) {
    return listingMetadata({
      title: "Student Polls",
      description: "Vote in student polls on GetMaterials and see what your campus thinks.",
      path: "/polls",
      keywords: ["student polls", "campus poll", "GetMaterials"],
      image: DEFAULT_POLL_IMAGE,
      imageAlt: "GetMaterials polls",
    });
  }

  await connectDB();
  const isId = /^[a-f0-9]{24}$/i.test(key);
  const item = await Poll.findOne(
    isId ? { _id: key, isActive: true } : { slug: key.toLowerCase(), isActive: true },
  )
    .select("question description thumbnailUrl slug")
    .lean<{
      question?: string;
      description?: string;
      thumbnailUrl?: string;
      slug?: string;
    } | null>();

  if (!item?.question) {
    return listingMetadata({
      title: "Poll",
      description: "Vote in this poll on GetMaterials.",
      path: `/polls?poll=${encodeURIComponent(key)}`,
      image: DEFAULT_POLL_IMAGE,
      imageAlt: "GetMaterials poll",
    });
  }

  const description = plainText(item.description) || `Vote: ${plainText(item.question, 180)}`;
  const id = item.slug || key;
  return listingMetadata({
    title: plainText(item.question, 70),
    description,
    path: `/polls?poll=${encodeURIComponent(id)}`,
    keywords: [item.question, "poll", "student poll", "GetMaterials"],
    image: item.thumbnailUrl || DEFAULT_POLL_IMAGE,
    imageAlt: item.question,
  });
}

export default function PollsRoute() {
  return <PollsPage />;
}
