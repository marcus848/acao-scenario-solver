export const Split = ({ 
  left, 
  right 
}: { 
  left?: React.ReactNode; 
  right?: React.ReactNode 
}) => (
  <div className="card-question">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  </div>
);
