interface VideoBlockProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export const VideoBlock = ({ 
  src, 
  poster, 
  autoPlay = false, 
  muted = false, 
  loop = false, 
  controls = true 
}: VideoBlockProps) => {
  return (
    <div className="w-full rounded-lg overflow-hidden bg-black/20">
      <video
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        controls={controls}
        className="w-full h-auto"
        style={{ maxHeight: '500px' }}
      >
        Seu navegador não suporta reprodução de vídeo.
      </video>
    </div>
  );
};
