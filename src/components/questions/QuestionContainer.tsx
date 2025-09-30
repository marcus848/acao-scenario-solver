import { ReactNode } from "react";

interface QuestionContainerProps {
  layout?: "center" | "split";
  left?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
}

export const QuestionContainer = ({ 
  layout = "center", 
  left, 
  right, 
  children 
}: QuestionContainerProps) => {
  if (layout === "split") {
    return (
      <div className="card-simulator p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="flex items-center justify-center">
            {left}
          </div>
          <div className="flex flex-col justify-center">
            {right}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-simulator p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        {children}
      </div>
    </div>
  );
};
