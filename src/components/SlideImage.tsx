import type { Language, Slide } from "../data/deck";

function pngFallback(image: string) {
  return image.replace(/\.webp$/i, ".png");
}

export function SlideImage({
  slide,
  direction,
  language,
  className = "slideImage",
}: {
  slide: Slide;
  direction?: number;
  language: Language;
  className?: string;
}) {
  const title = slide.title[language] || slide.title.zh;

  return (
    <picture className={className} data-direction={direction}>
      <source srcSet={slide.image} type="image/webp" />
      <img src={pngFallback(slide.image)} alt={title} draggable={false} />
    </picture>
  );
}

export function SlidePreview({
  slide,
  language,
  label,
}: {
  slide?: Slide;
  language: Language;
  label: string;
}) {
  if (!slide) return <div className="previewEnd">{label}</div>;

  return (
    <picture className="previewImage">
      <source srcSet={slide.image} type="image/webp" />
      <img src={pngFallback(slide.image)} alt={slide.title[language] || slide.title.zh} draggable={false} />
    </picture>
  );
}
