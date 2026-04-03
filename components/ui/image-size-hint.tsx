import { cn } from "@/lib/utils";
import {
  getImageSizeGuideText,
  type ImageSizeGuideKey,
} from "@/lib/media/image-guides";

type ImageSizeHintProps = {
  guideKey: ImageSizeGuideKey;
  className?: string;
};

export function ImageSizeHint({ guideKey, className }: ImageSizeHintProps) {
  return (
    <p className={cn("text-xs text-slate-500", className)}>
      {getImageSizeGuideText(guideKey)}
    </p>
  );
}
