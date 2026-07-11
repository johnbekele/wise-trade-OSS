export default function StreamingText({ text }) {
  if (!text) return null;
  return (
    <div className="p-6 space-y-2 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
      {text}
      <span className="inline-block w-0.5 h-4 bg-primary animate-typewriter-blink ml-0.5 align-middle" />
    </div>
  );
}
