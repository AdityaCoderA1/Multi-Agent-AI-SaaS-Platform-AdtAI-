import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiExternalLink, FiX } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Download } from "lucide-react";

function useTypewriter(text, isGenerating) {
  const [displayedText, setDisplayedText] = useState(isGenerating ? "" : text);
  const currentIndex = useRef(isGenerating ? 0 : (text || "").length);
  const textRef = useRef(text || "");

  useEffect(() => {
    textRef.current = text || "";
    if (!isGenerating) {
        setDisplayedText(textRef.current);
        currentIndex.current = textRef.current.length;
    }
  }, [text, isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      if (currentIndex.current < textRef.current.length) {
        // Increase speed: Add 4-8 characters at a time, every 10ms
        const charsToAdd = Math.floor(Math.random() * 5) + 4;
        currentIndex.current = Math.min(currentIndex.current + charsToAdd, textRef.current.length);
        setDisplayedText(textRef.current.slice(0, currentIndex.current));
      }
    }, 10);

    return () => clearInterval(interval);
  }, [isGenerating]);

  return isGenerating ? displayedText : text;
}

function MessageBubble({ role, content, images, isGenerating }) {
  const isUser = role === "user";
  const displayedContent = useTypewriter(content, isGenerating);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);

    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode("");
    }, 2000);
  };

  const handleDownload = (url) => {
    const backendUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
    const proxyUrl = `${backendUrl}/api/download?url=${encodeURIComponent(url)}`;
    window.open(proxyUrl, '_self');
  };

  const markdown = (displayedContent || "")
    .replace(/```review/gi, "```")
    .replace(/```text/gi, "```")
    .replace(/```[a-zA-Z0-9_-]+\s+id="[^"]*"/g, "```");
  return (
    <>
      <div
      className={`max-w-[92vw] md:max-w-[72%]
px-4 py-2.5 rounded-2xl
break-words overflow-hidden
leading-relaxed
      ${isUser
          ? "bg-brand-primary/10 text-brand-text rounded-tr-sm shadow-sm"
          : "bg-brand-card border border-brand-border text-brand-text rounded-tl-sm shadow-sm"
        }`}
    >
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                loading="lazy"
                onClick={() => setLightboxSrc(img)}
                onError={(e) => e.currentTarget.remove()}
                className="w-40 h-28 rounded-xl object-cover border border-white/10 cursor-zoom-in hover:opacity-90 transition"
              />
            ))}
          </div>
        )}<ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>
            ),

            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-4 mb-2">{children}</h2>
            ),

            h3: ({ children }) => (
              <h3 className="text-lg font-semibold mt-3 mb-2">{children}</h3>
            ),

            p: ({ children }) => (
              <p className="mb-3 whitespace-pre-wrap break-words">
                {children}
              </p>
            ),

            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-2">
                {children}
              </ul>
            ),

            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2">
                {children}
              </ol>
            ),

            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-brand-border">
                  {children}
                </table>
              </div>
            ),

            th: ({ children }) => (
              <th className="border border-brand-border bg-brand-bg px-3 py-2 text-left">
                {children}
              </th>
            ),

            td: ({ children }) => (
              <td className="border border-brand-border px-3 py-2">
                {children}
              </td>
            ),

            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-[#EA580C] underline hover:text-[#C2410C] inline-flex items-center gap-1 font-medium transition-colors"
              >
                {children}
                <FiExternalLink size={11} />
              </a>
            ),

            img: ({ src, alt }) => {
              if (!src) return null;

              return (
                <div className="group relative w-full max-w-md my-4">
                  <img
                    src={src}
                    alt={alt || "Generated Image"}
                    loading="lazy"
                    onClick={() => setLightboxSrc(src)}
                    onError={(e) => e.currentTarget.remove()}
                    className="w-full h-auto max-h-[420px] rounded-2xl object-cover cursor-zoom-in shadow-sm border border-brand-border transition-all duration-300 group-hover:shadow-md"
                  />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(src);
                      }}
                      className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-md transition-colors shadow-sm cursor-pointer border border-white/20"
                      title="Download Image"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              );
            },

            code({ className, children }) {
              console.log(children)
              const value = String(children)
                .replace(/^\s*```[^\n]*\n/, "")
                .replace(/\n```\s*$/, "")
                .trim();

              if (!className) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-brand-bg border border-brand-border text-[#EA580C] font-['JetBrains_Mono'] text-[13px]">
                    {value}
                  </code>
                );
              }

              const language = className.replace("language-", "");

              return (
                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">

                  <div className="flex items-center justify-between bg-brand-bg border-b border-brand-border px-4 py-2">

                    <span className="uppercase text-[11px] font-bold tracking-wider text-brand-text-muted font-['JetBrains_Mono']">
                      {language}
                    </span>

                    <button
                      onClick={() => copyCode(value)}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-brand-text-muted hover:text-brand-text transition-colors bg-brand-card border border-brand-border px-2 py-1 rounded shadow-sm"
                    >
                      {copiedCode === value ? (
                        <>
                          <Check size={13} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          Copy
                        </>
                      )}
                    </button>

                  </div>

                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    wrapLongLines
                    showLineNumbers
                    customStyle={{
                      margin: 0,
                      padding: "16px",
                      background: "#0d1117",
                      fontSize: "13px",
                    }}
                  >
                    {value}
                  </SyntaxHighlighter>

                </div>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="absolute top-5 right-5 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(lightboxSrc);
              }}
              className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
              title="Download Image"
            >
              <Download size={20} />
            </button>
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
              title="Close"
            >
              <FiX size={20} />
            </button>
          </div>
          <img
            src={lightboxSrc}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl object-contain"
          />
        </div>
      )}
    </>
  );
}

export default MessageBubble;