import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Chapter {
  id: string;
  number: string;
  bibleId: string;
  bookId: string;
}

interface Book {
  nome: string;
  abreviacao: string;
  testamento: string;
}

const BibliaCapitulosPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookId) {
      loadBookAndChapters();
    }
  }, [bookId]);

  const loadBookAndChapters = async () => {
    try {
      setLoading(true);
      
      // Buscar informações do livro
      const { data: bookData } = await supabase
        .from('biblia_livros')
        .select('nome, abreviacao, testamento')
        .eq('id', bookId)
        .single();
      
      if (bookData) {
        setBook(bookData);
      }

      // Buscar capítulos da API
      const { data, error } = await supabase.functions.invoke('bible-import', {
        body: { 
          action: 'getChapters',
          bookId,
          bibleId: 'de4e12af7f28f599-02'
        }
      });

      if (error) throw error;

      if (data?.chapters) {
        // Filtrar apenas capítulos numerados (excluir introduções)
        const numberedChapters = data.chapters.filter((chapter: Chapter) => 
          chapter.number && !isNaN(parseInt(chapter.number))
        );
        setChapters(numberedChapters);
      }
      
    } catch (error) {
      console.error('Erro ao carregar capítulos:', error);
      toast({
        title: 'Erro ao carregar capítulos',
        description: 'Não foi possível carregar a lista de capítulos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = (chapterId: string) => {
    navigate(`/ensino/biblia/leitura/${chapterId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/ensino/biblia/livros')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Livros
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {book ? book.nome : 'Carregando...'}
            </h1>
            <p className="text-muted-foreground">
              Selecione um capítulo para leitura
              {book && <Badge variant="outline" className="ml-2">{book.testamento}</Badge>}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Capítulos
              {chapters.length > 0 && (
                <Badge variant="secondary">{chapters.length} capítulos</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
                {Array.from({ length: 24 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : chapters.length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-3">
                {chapters.map((chapter) => (
                  <Button
                    key={chapter.id}
                    variant="outline"
                    className="aspect-square p-0 text-lg font-semibold hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handleChapterSelect(chapter.id)}
                  >
                    {chapter.number}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Nenhum capítulo encontrado</p>
                <Button onClick={loadBookAndChapters}>
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default BibliaCapitulosPage;