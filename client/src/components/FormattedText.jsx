function cleanPart(text) {
  return text
    
    .replace(/^\s*\*\s+/gm, "• ")
    
    .replace(/\*(\S[^*]*?)\*/g, "$1")

    .replace(/(?<!\s)\*|\*(?!\s)/g, "");
}

export default function FormattedText({ text }) {
  if (!text) return null;

  let parts = text.split("**");

  
  if (parts.length % 2 === 0) {
    const last = parts.length - 1;
    parts = [...parts.slice(0, last - 1), parts[last - 1] + parts[last]];
  }

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i}>{cleanPart(part)}</strong>
        ) : (
          <span key={i}>{cleanPart(part)}</span>
        )
      )}
    </>
  );
}