import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface StaticPageProps {
  slug: string;
}

const StaticPage = ({ slug }: StaticPageProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("static_pages")
        .select("title, content")
        .eq("slug", slug)
        .single();
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!content) {
    return <p className="text-muted-foreground text-sm text-center py-8">Страница не найдена</p>;
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="glass-card rounded-2xl p-6 prose prose-sm prose-invert max-w-none
        prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground
        prose-li:text-muted-foreground prose-a:text-primary">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default StaticPage;
