import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Share, Copy } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChapterContent {
  id: string;
  number: string;
  content: string;
  reference: string;
  copyright: string;
}

const BibliaLeituraPage: React.FC = () => {
  const navigate = useNavigate();
  const { chapterId } = useParams<{ chapterId: string }>();
  const { toast } = useToast();
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chapterId) {
      loadChapterContent();
    }
  }, [chapterId]);

  const loadChapterContent = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('bible-import', {
        body: { 
          action: 'getChapterContent',
          chapterId
        }
      });

      if (error) throw error;

      if (data?.content) {
        setContent(data.content);
      }
      
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
      toast({
        title: 'Erro ao carregar capítulo',
        description: 'Não foi possível carregar o conteúdo do capítulo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = () => {
    if (content) {
      // Criar uma versão limpa do texto sem HTML
      const tempElement = document.createElement('div');
      tempElement.innerHTML = content.content;
      const cleanText = tempElement.textContent || tempElement.innerText || '';
      
      const textToCopy = `${content.reference}\n\n${cleanText}\n\n${content.copyright}`;
      navigator.clipboard.writeText(textToCopy);
      
      toast({
        title: 'Capítulo copiado!',
        description: 'O texto foi copiado para a área de transferência.'
      });
    }
  };

  const handleShare = async () => {
    if (content && navigator.share) {
      try {
        await navigator.share({
          title: content.reference,
          text: content.reference,
          url: window.location.href
        });
      } catch (error) {
        console.log('Compartilhamento cancelado');
      }
    } else {
      handleCopyContent();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {content ? content.reference : 'Carregando...'}
              </h1>
              <p className="text-muted-foreground">Leitura da Sagrada Escritura</p>
            </div>
          </div>
          
          {content && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {content ? content.reference : 'Carregando capítulo...'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : content ? (
              <div className="space-y-6">
                <div 
                  className="prose prose-slate max-w-none dark:prose-invert
                             prose-headings:text-primary prose-p:leading-relaxed 
                             prose-p:text-base prose-strong:text-primary
                             [&_.v]:inline [&_.v]:mr-2 [&_.v]:text-sm 
                             [&_.v]:font-bold [&_.v]:text-primary
                             [&_.v]:bg-primary/10 [&_.v]:px-1.5 [&_.v]:py-0.5 
                             [&_.v]:rounded [&_.v]:border [&_.v]:border-primary/20"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
                
                {content.copyright && (
                  <div className="mt-8 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {content.copyright}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Não foi possível carregar o capítulo</p>
                <Button onClick={loadChapterContent}>
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegação entre capítulos */}
        {content && (
          <div className="flex justify-between">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Capítulo Anterior
            </Button>
            <Button variant="outline">
              Próximo Capítulo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default BibliaLeituraPage;