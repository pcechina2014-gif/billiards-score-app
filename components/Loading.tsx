export function Loading({ text = "加载中..." }: { text?: string }) {
  return (
    <div className="grid min-h-48 place-items-center text-sm text-ink/60">
      {text}
    </div>
  );
}
