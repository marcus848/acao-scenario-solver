import { Question } from "@/components/Question";
import { WordSelection1 } from "@/components/WordSelection1";
import { WordSelection2 } from "@/components/WordSelection2";

export type BlockDef =
  | { component: "Text"; props: { title?: string; text?: string } }
  | { component: "Image"; props: { src: string; alt?: string; width?: number; height?: number } }
  | { component: "Question"; props: React.ComponentProps<typeof Question> }
  | { component: "WordSelection1"; props: React.ComponentProps<typeof WordSelection1> }
  | { component: "WordSelection2"; props: React.ComponentProps<typeof WordSelection2> };

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
    case "Image":
      return (
        <img 
          {...props} 
          className="w-full rounded-xl border border-border object-cover" 
          alt={props.alt || "Image"}
        />
      );
    case "Question":
      return <Question {...props} />;
    case "WordSelection1":
      return <WordSelection1 {...props} />;
    case "WordSelection2":
      return <WordSelection2 {...props} />;
    default:
      return null;
  }
};
