"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, FileText, Play, Video, X, ZoomIn, ZoomOut } from "lucide-react";
import DownloadButton from "@/components/DownloadButton";
import { officeViewerUrl } from "@/lib/file-kinds";

export type PreviewItem = {
  kind: "pdf" | "image" | "video" | "office";
  title: string;
  url: string;
  thumbnail?: string;
  youtubeId?: string | null;
  officeKind?: string;
};

const PDFJS_VERSION = "3.11.174";
const pdfDocCache = new Map<string, Promise<any>>();
let pdfjsLoader: Promise<any> | null = null;

function loadPdfJs() {
  if (typeof window === "undefined") return Promise.reject(new Error("window missing"));
  if ((window as any).pdfjsLib) return Promise.resolve((window as any).pdfjsLib);
  if (pdfjsLoader) return pdfjsLoader;
  pdfjsLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
      resolve(lib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return pdfjsLoader;
}

export function pdfProxyUrl(url: string) {
  return url;
}

function getPdfDoc(url: string) {
  if (!pdfDocCache.has(url)) {
    const loading = loadPdfJs()
      .then((pdfjs) =>
        pdfjs.getDocument({
          url,
          withCredentials: false,
          disableRange: false,
          disableStream: false,
        }).promise
      )
      .catch((error: unknown) => {
        pdfDocCache.delete(url);
        throw error;
      });
    pdfDocCache.set(url, loading);
  }
  return pdfDocCache.get(url)!;
}

async function renderPdfPage(url: string, pageNum: number, scale: number) {
  const doc = await getPdfDoc(url);
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/jpeg", scale >= 1 ? 0.86 : 0.72);
}

function youtubeEmbed(id?: string | null) {
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
}

export function FileAttachmentsSection({
  files,
  materialId,
}: {
  materialId: string;
  files: { title: string; url: string; fileName?: string; size?: string | null; kind: string }[];
}) {
  if (!files.length) return null;
  const items: PreviewItem[] = files.map((file) => ({
    kind: file.kind.toLowerCase() === "pdf" ? "pdf" : "office",
    title: file.fileName || file.title,
    url: file.url,
    officeKind: file.kind,
  }));
  return <DocumentsPreview items={items} files={files} materialId={materialId} />;
}

export function PreviewSection({
  items,
  files = [],
  materialId,
}: {
  items: PreviewItem[];
  files?: { title: string; url: string; fileName?: string; size?: string | null; kind: string }[];
  materialId?: string;
}) {
  const docs = items.filter((item) => item.kind === "pdf" || item.kind === "office");
  const images = items.filter((item) => item.kind === "image");
  if (!docs.length && !images.length) return null;
  return (
    <>
      {docs.length > 0 ? <DocumentsPreview items={docs} files={files} materialId={materialId} /> : null}
      {images.length > 0 ? <ImagePreview items={images} /> : null}
    </>
  );
}

function DocumentsPreview({
  items,
  files = [],
  materialId,
}: {
  items: PreviewItem[];
  files?: { title: string; url: string; fileName?: string; size?: string | null; kind: string }[];
  materialId?: string;
}) {
  const [active, setActive] = useState(0);
  const current = items[Math.min(active, items.length - 1)] || items[0];
  const downloadFiles =
    files.length > 0
      ? files
      : items.map((item) => ({
          title: item.title,
          url: item.url,
          fileName: item.title,
          size: null as string | null,
          kind: item.kind === "pdf" ? "PDF" : item.officeKind || "Document",
        }));

  if (items.length === 1 && current.kind === "pdf") {
    return <PdfPreview url={current.url} title={current.title} />;
  }
  if (items.length === 1 && current.kind === "office") {
    return (
      <OfficePreview
        url={current.url}
        title={current.title}
        kind={current.officeKind || "Document"}
        files={downloadFiles}
        materialId={materialId}
      />
    );
  }

  return (
    <section id="preview" className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-1">Preview</h2>
      <p className="text-sm text-slate-500 mb-4">{items.length} files — tap a file to preview it</p>
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`w-[148px] shrink-0 rounded-xl border bg-white overflow-hidden transition-all ${
              index === active ? "border-violet-400 shadow-sm ring-2 ring-violet-100" : "border-slate-200 hover:border-violet-300"
            }`}
          >
            <div className="aspect-[3/4] bg-slate-50 flex flex-col items-center justify-center px-3 text-center">
              <FileText className={`w-10 h-10 mb-2 ${item.kind === "pdf" ? "text-red-600" : "text-amber-600"}`} />
              <p className="text-xs font-bold text-slate-800">{item.kind === "pdf" ? "PDF" : item.officeKind || "Document"}</p>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{item.title}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-5">
        {current.kind === "pdf" ? (
          <PdfPreview url={current.url} title={current.title} hideShell />
        ) : (
          <OfficePreview
            url={current.url}
            title={current.title}
            kind={current.officeKind || "Document"}
            hideShell
          />
        )}
      </div>
      {downloadFiles.length > 0 && materialId ? (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {downloadFiles.map((file, index) => (
            <li key={`${file.url}-${index}`} className="py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{file.fileName || file.title}</p>
                <p className="text-xs text-slate-500">
                  {file.kind}
                  {file.size ? ` · ${file.size}` : ""}
                </p>
              </div>
              <DownloadButton
                materialId={materialId}
                fileUrl={file.url}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Download
              </DownloadButton>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function OfficePreview({
  url,
  title,
  kind,
  files = [],
  materialId,
  hideShell = false,
}: {
  url: string;
  title: string;
  kind: string;
  files?: { title: string; url: string; fileName?: string; size?: string | null; kind: string }[];
  materialId?: string;
  hideShell?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.75;
  const MAX_ZOOM = 1.75;
  const ZOOM_STEP = 0.25;
  const embed = officeViewerUrl(url);

  const adjustZoom = useCallback((delta: number) => {
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(current + delta).toFixed(2))));
  }, []);

  useEffect(() => {
    setOpen(false);
    setZoom(1);
  }, [url]);

  const modal = open ? (
        <div className="gm-overlay fixed inset-0 z-[100] flex flex-col bg-black/80">
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="font-semibold truncate min-w-0">
              {title} · {kind}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => adjustZoom(-ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="min-w-[3.25rem] text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => adjustZoom(ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
                className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto bg-slate-900 p-4">
            <div
              className="mx-auto bg-white rounded-xl overflow-hidden"
              style={{ width: `${Math.round(zoom * 100)}%`, minHeight: "100%" }}
            >
              <iframe title={`${kind} preview`} src={embed} className="w-full h-[calc(100vh-7rem)] bg-white" />
            </div>
          </div>
        </div>
  ) : null;

  const body = (
    <>
      {hideShell ? null : (
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-[148px] shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-violet-300 hover:shadow-sm transition-all"
        >
          <div className="aspect-[3/4] bg-slate-50 flex flex-col items-center justify-center px-3 text-center">
            <FileText className="w-10 h-10 text-amber-600 mb-2" />
            <p className="text-xs font-bold text-slate-800">{kind}</p>
            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{title}</p>
          </div>
        </button>
      </div>
      )}
      <div className={`${hideShell ? "" : "mt-5 "}rounded-xl border border-slate-200 py-3 flex justify-center`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-8 py-2 rounded-lg border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-sm hover:bg-violet-50 transition-colors"
        >
          View Full Preview
        </button>
      </div>
      {!hideShell && files.length > 0 && materialId ? (
        <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
          {files.map((file) => (
            <li key={file.url} className="py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{file.fileName || file.title}</p>
                <p className="text-xs text-slate-500">
                  {file.kind}
                  {file.size ? ` · ${file.size}` : ""}
                </p>
              </div>
              <DownloadButton
                materialId={materialId}
                fileUrl={file.url}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:opacity-90"
              >
                <Download className="w-4 h-4" />
                Download
              </DownloadButton>
            </li>
          ))}
        </ul>
      ) : null}
      {modal}
    </>
  );

  if (hideShell) return body;
  return (
    <section id="preview" className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
      {body}
    </section>
  );
}

function PdfPreview({ url, title, hideShell = false }: { url: string; title: string; hideShell?: boolean }) {
  const [thumbs, setThumbs] = useState<Record<number, string>>({});
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [openPage, setOpenPage] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setThumbs({});
    setTotal(0);
    setError("");

    (async () => {
      try {
        const doc = await getPdfDoc(url);
        if (cancelled) return;
        setTotal(doc.numPages);
        for (let page = 1; page <= doc.numPages; page += 1) {
          const src = await renderPdfPage(url, page, 0.42);
          if (cancelled) return;
          setThumbs((current) => ({ ...current, [page]: src }));
        }
      } catch {
        if (!cancelled) setError("Unable to render this PDF preview.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  const scrollByCard = (direction: number) => {
    scrollerRef.current?.scrollBy({ left: direction * 164, behavior: "smooth" });
  };

  const loadedCount = Object.keys(thumbs).length;
  const placeholders = Math.max(0, (total || 6) - loadedCount);

  const body = (
    <>
      {error ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">{error}</p>
          <iframe
            title={title}
            src={url}
            className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
          />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="hidden sm:flex w-8 h-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Previous pages"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div ref={scrollerRef} className="flex-1 flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: total || loadedCount }, (_, index) => {
                const page = index + 1;
                const src = thumbs[page];
                if (!src) return null;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setOpenPage(page)}
                    className="w-[148px] shrink-0 rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-violet-300 hover:shadow-sm transition-all"
                  >
                    <div className="aspect-[3/4] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Page ${page}`} className="w-full h-full object-contain object-top" />
                    </div>
                  </button>
                );
              })}
              {Array.from({ length: placeholders }, (_, index) => (
                <div
                  key={`sk-${index}`}
                  className="w-[148px] shrink-0 aspect-[3/4] rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="hidden sm:flex w-8 h-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Next pages"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 py-3 flex justify-center">
            <button
              type="button"
              onClick={() => setOpenPage(1)}
              disabled={!thumbs[1]}
              className="px-8 py-2 rounded-lg border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-sm hover:bg-violet-50 transition-colors disabled:opacity-50"
            >
              View Full Preview
            </button>
          </div>
        </>
      )}
      {openPage !== null && total > 0 && (
        <PdfGalleryModal
          url={url}
          title={title}
          thumbs={thumbs}
          total={total}
          initialPage={openPage}
          onClose={() => setOpenPage(null)}
        />
      )}
    </>
  );

  if (hideShell) return body;
  return (
    <section id="preview" className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
      {body}
    </section>
  );
}

function PdfGalleryModal({
  url,
  title,
  thumbs,
  total,
  initialPage,
  onClose,
}: {
  url: string;
  title: string;
  thumbs: Record<number, string>;
  total: number;
  initialPage: number;
  onClose: () => void;
}) {
  const MIN_ZOOM = 0.75;
  const MAX_ZOOM = 2.5;
  const ZOOM_STEP = 0.25;

  const [page, setPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [fullSrc, setFullSrc] = useState(thumbs[initialPage] || "");
  const stripRef = useRef<HTMLDivElement>(null);

  const adjustZoom = useCallback((delta: number) => {
    setZoom((current) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(current + delta).toFixed(2))));
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (next < 1 || next > total) return;
      setPage(next);
    },
    [total]
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goTo(page - 1);
      if (event.key === "ArrowRight") goTo(page + 1);
      if (event.key === "+" || event.key === "=") adjustZoom(ZOOM_STEP);
      if (event.key === "-" || event.key === "_") adjustZoom(-ZOOM_STEP);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, goTo, page, adjustZoom]);

  useEffect(() => {
    let cancelled = false;
    setFullSrc(thumbs[page] || "");
    (async () => {
      try {
        const src = await renderPdfPage(url, page, Math.min(3, 1.4 * zoom));
        if (!cancelled) setFullSrc(src);
      } catch {
        /* keep thumb */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, url, thumbs, zoom]);

  useEffect(() => {
    const current = stripRef.current?.querySelector(`[data-page="${page}"]`);
    current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [page]);

  return (
    <div className="gm-overlay fixed inset-0 z-[100] flex flex-col bg-black/80">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
        <p className="font-semibold truncate min-w-0">
          {title} · Page {page} / {total}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => adjustZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="min-w-[3.25rem] text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => adjustZoom(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-white/10" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="relative flex-1 min-h-0">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-slate-800 flex items-center justify-center disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div
          className="h-full overflow-auto px-14"
          onWheel={(event) => {
            if (!event.ctrlKey && !event.metaKey) return;
            event.preventDefault();
            adjustZoom(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
          }}
        >
          <div className="min-h-full flex items-center justify-center py-4">
            {fullSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fullSrc}
                alt={`Page ${page}`}
                className="rounded-md bg-white shadow-2xl"
                style={{
                  maxHeight: `${Math.round(zoom * 78)}vh`,
                  maxWidth: `${Math.round(zoom * 92)}%`,
                  width: "auto",
                  height: "auto",
                }}
              />
            ) : (
              <div className="w-[min(70vw,520px)] aspect-[3/4] bg-white/10 rounded-md animate-pulse" />
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= total}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-slate-800 flex items-center justify-center disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="px-4 py-3">
        <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1">
          {Array.from({ length: total }, (_, index) => {
            const num = index + 1;
            const src = thumbs[num];
            const active = num === page;
            return (
              <button
                key={num}
                type="button"
                data-page={num}
                onClick={() => goTo(num)}
                className={`w-16 shrink-0 aspect-[3/4] rounded-md overflow-hidden border-2 ${
                  active ? "border-violet-400" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`Page ${num}`} className="w-full h-full object-contain bg-white" />
                ) : (
                  <div className="w-full h-full bg-white/20" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ImagePreview({ items }: { items: PreviewItem[] }) {
  const [active, setActive] = useState<number | null>(null);
  const current = active !== null ? items[active] : null;

  useEffect(() => {
    if (active === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowLeft") setActive((value) => (value === null ? value : Math.max(0, value - 1)));
      if (event.key === "ArrowRight") setActive((value) => (value === null ? value : Math.min(items.length - 1, value + 1)));
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [active, items.length]);

  return (
    <section id="preview" className="scroll-mt-28 bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Preview</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className="w-[148px] shrink-0 rounded-xl border border-slate-200 overflow-hidden bg-white"
          >
            <div className="aspect-[3/4] bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnail || item.url} alt="" className="w-full h-full object-cover" />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 py-3 flex justify-center">
        <button
          type="button"
          onClick={() => setActive(0)}
          className="px-8 py-2 rounded-lg border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-sm hover:bg-violet-50"
        >
          View Full Preview
        </button>
      </div>
      {current && (
        <div className="gm-overlay fixed inset-0 z-[100] flex flex-col bg-black/80">
          <div className="flex justify-end px-4 py-3">
            <button type="button" onClick={() => setActive(null)} className="p-2 text-white" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center px-14">
            <button
              type="button"
              onClick={() => setActive((value) => (value === null ? 0 : Math.max(0, value - 1)))}
              className="absolute left-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.url} alt={current.title} className="max-h-full max-w-full object-contain" />
            <button
              type="button"
              onClick={() => setActive((value) => (value === null ? 0 : Math.min(items.length - 1, value + 1)))}
              className="absolute right-3 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {items.map((item, index) => (
              <button
                key={item.url}
                type="button"
                onClick={() => setActive(index)}
                className={`w-16 shrink-0 aspect-[3/4] rounded-md overflow-hidden border-2 ${
                  index === active ? "border-violet-400" : "border-transparent opacity-70"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnail || item.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function VideoSection({ videos }: { videos: PreviewItem[] }) {
  const [active, setActive] = useState<PreviewItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (videos.length === 0) return null;

  const embed = active?.youtubeId ? youtubeEmbed(active.youtubeId) : null;

  return (
    <section id="videos" className="scroll-mt-28">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">YouTube Videos</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {videos.map((video, index) => (
          <button
            key={`${video.url}-${index}`}
            type="button"
            onClick={() => setActive(video)}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 transition-colors text-left group"
          >
            <div className="relative aspect-video bg-slate-100">
              {video.youtubeId || video.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 ml-0.5" />
                </span>
              </span>
            </div>
            <div className="p-4">
              <p className="font-semibold text-slate-900 text-sm line-clamp-2">{video.title}</p>
              <p className="text-xs text-slate-400 mt-1">
                {video.youtubeId ? "Watch on YouTube" : "Video"} · Click to preview
              </p>
            </div>
          </button>
        ))}
      </div>
      {active && (
        <div className="gm-overlay fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close" onClick={() => setActive(null)} />
          <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <p className="font-semibold text-slate-900 truncate">{active.title}</p>
              <button type="button" onClick={() => setActive(null)} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            {embed ? (
              <div className="aspect-video bg-black">
                <iframe
                  src={embed}
                  title={active.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="p-10 text-center">
                <a href={active.url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-semibold">
                  Open video
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
