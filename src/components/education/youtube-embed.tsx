import { youtubeEmbedUrl, type YoutubeClip } from "@/lib/education/videos";

export function YoutubeEmbed({ clip }: { clip: YoutubeClip }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="relative aspect-video bg-surface-muted">
        <iframe
          src={youtubeEmbedUrl(clip.id)}
          title={clip.title}
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <figcaption className="px-3 py-2 text-xs text-foreground-muted">
        {clip.title} — {clip.author}. Vídeo do YouTube, não produzido pela Bússola.
      </figcaption>
    </figure>
  );
}
