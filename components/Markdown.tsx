import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { publicUrl } from "./copy";

export function Markdown({ children, omitTitle = false }: { children: string; omitTitle?: boolean }) {
  const source = omitTitle ? children.replace(/^#\s+[^\n]+(?:\r?\n)+/, "") : children;
  return <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml disallowedElements={["img", "iframe", "script", "style"]} components={{
    a({ href, children: content }) {
      const safe = href && publicUrl(href);
      return safe ? <a href={safe} target="_blank" rel="noopener noreferrer">{content}</a> : <span>{content}</span>;
    },
  }}>{source}</ReactMarkdown></div>;
}
