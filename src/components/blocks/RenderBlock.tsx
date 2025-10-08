import { Question } from "@/components/Question";
import { WordSelection1 } from "@/components/WordSelection1";
import { WordSelection2 } from "@/components/WordSelection2";
import { RatingQuestion } from "@/components/RatingQuestion";

export type BlockDef =
  | { component: "Text"; props: { title?: string; text?: string } }
  | { component: "Image"; props: { src: string; alt?: string; ratio?: "16/9" | "4/3" | "1/1" | "21/9" } }
  | { component: "Question"; props: React.ComponentProps<typeof Question> }
  | { component: "WordSelection1"; props: React.ComponentProps<typeof WordSelection1> }
  | { component: "WordSelection2"; props: React.ComponentProps<typeof WordSelection2> }
  | { component: "RatingQuestion"; props: React.ComponentProps<typeof RatingQuestion> };

export const RenderBlock = ({ def }: { def?: BlockDef }) => {
  if (!def) return null;
  const { component, props } = def as any;
  
  switch (component) {
    case "Text":
      return (
        <div className="space-y-2">
          {props.title && <h2 className="text-xl font-semibold text-foreground">{props.title}</h2>}
          {props.text && <p className="text-muted-foreground">{props.text}</p>}
        </div>
      );
    case "Image": {
      const { src, alt, ratio = "16/9" } = props;
      const aspectClass = 
        ratio === "4/3" ? "aspect-[4/3]" :
        ratio === "1/1" ? "aspect-square" :
        ratio === "21/9" ? "aspect-[21/9]" :
        "aspect-video"; // 16/9 default
      
      return (
        <div className={`w-full ${aspectClass} overflow-hidden rounded-xl border border-border`}>
          <img 
            src={src} 
            alt={alt ?? ""} 
            className="w-full h-full object-cover" 
          />
        </div>
      );
    }
    case "Question":
      return <Question {...props} />;
    case "WordSelection1":
      return <WordSelection1 {...props} />;
    case "WordSelection2":
      return <WordSelection2 {...props} />;
    case "RatingQuestion":
      return <RatingQuestion {...props} />;
    default:
      return null;
  }
};
