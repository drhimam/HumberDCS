const renderInline = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );

export const RichText = ({ text, className = "", testId }) => (
  <div className={`space-y-3 ${className}`} data-testid={testId}>
    {(text || "").split(/\n\s*\n/).map((p, i) => (
      <p key={i} className="whitespace-pre-line">{renderInline(p)}</p>
    ))}
  </div>
);
