import Link from "next/link";
import { load } from "cheerio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchParams = {
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: string;
  content?: string;
};

async function fetchFullArticleContent(targetUrl: string): Promise<{ text: string; title?: string; image?: string } | null> {
  try {
    const res = await fetch(targetUrl, {
      cache: "no-store",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = load(html);

    // Remove non-content elements
    $("script,noscript,style,header,footer,nav,aside,form,iframe,svg").remove();

    // Pick the most likely content container
    let $container = $("article").first();
    if (!$container.length) {
      const candidates = [
        ".article-content",
        ".post-content",
        ".entry-content",
        ".story-content",
        ".content",
        "#content",
        "#main",
        "[role=main]",
      ];
      for (const sel of candidates) {
        if ($(sel).length) {
          $container = $(sel).first();
          break;
        }
      }
    }
    if (!$container.length) $container = $("body");

    const paragraphs = $container
      .find("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    const text = paragraphs.join("\n\n");
    const pageTitle =
      $("meta[property='og:title']").attr("content")?.trim() ||
      $("title").text().trim();
    const image =
      $("meta[property='og:image']").attr("content")?.trim() ||
      $("meta[name='twitter:image']").attr("content")?.trim();

    return { text, title: pageTitle, image };
  } catch {
    return null;
  }
}

export default async function ArticlePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const titleFromParams = params.title || "Untitled";
  const description = params.description || "";
  const url = params.url || "";
  const urlToImageParam = params.urlToImage || "";
  const publishedAt = params.publishedAt || "";
  const source = params.source || "Unknown";
  const content = params.content || "";

  let scrapedText = "";
  let scrapedTitle: string | undefined;
  let scrapedImage: string | undefined;

  if (url) {
    const result = await fetchFullArticleContent(url);
    if (result) {
      scrapedText = result.text;
      scrapedTitle = result.title;
      scrapedImage = result.image;
    }
  }

  const finalTitle = scrapedTitle || titleFromParams;
  const heroImage = urlToImageParam || scrapedImage || "";

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
          >
            ← Back to news
          </Link>
        </div>

        <article className="max-w-3xl mx-auto bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {heroImage ? (
            <div className="relative h-72 w-full overflow-hidden">
              <img
                src={heroImage}
                alt={finalTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
            </div>
          ) : null}

          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span className="px-2.5 py-1 rounded-full bg-gray-700/60 border border-gray-600 text-gray-200">
                {source}
              </span>
              {publishedAt ? (
                <time dateTime={publishedAt}>{new Date(publishedAt).toLocaleDateString()}</time>
              ) : null}
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-100 leading-tight">
              {finalTitle}
            </h1>

            {(scrapedText || content || description) ? (
              <div className="mt-8 text-gray-200">
                {description && !scrapedText ? (
                  <p className="text-xl leading-8">
                    {description}
                  </p>
                ) : null}
                {(scrapedText || content) ? (
                  <div className="prose prose-invert max-w-none prose-headings:text-gray-100 prose-p:leading-8 prose-p:text-gray-300 prose-lg md:prose-xl">
                    {(scrapedText || content.replace(/\s*\[\+\d+\s*chars\]$/, '')).split(/\n\n+/).map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {url ? (
              <div className="mt-10">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Read original source
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-7 7a1 1 0 01-.707.293H7a1 1 0 01-1-1v-3a1 1 0 01.293-.707l7-7z" />
                    <path d="M5 13v2a1 1 0 001 1h2l8-8-3-3-8 8z" />
                  </svg>
                </a>
              </div>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}


