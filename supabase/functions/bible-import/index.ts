import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, bibleId = 'de4e12af7f28f599-02', bookId, chapterId } = await req.json();
    const SCRIPTURE_API_BIBLE_KEY = Deno.env.get('SCRIPTURE_API_BIBLE_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SCRIPTURE_API_BIBLE_KEY) {
      throw new Error('SCRIPTURE_API_BIBLE_KEY não configurada');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    switch (action) {
      case 'getBibles':
        return await getBibles(SCRIPTURE_API_BIBLE_KEY, supabase);
      case 'getBooks':
        return await getBooks(SCRIPTURE_API_BIBLE_KEY, supabase, bibleId);
      case 'getChapters':
        return await getChapters(SCRIPTURE_API_BIBLE_KEY, bookId, bibleId);
      case 'getChapterContent':
        return await getChapterContent(SCRIPTURE_API_BIBLE_KEY, chapterId);
      default:
        throw new Error('Ação não reconhecida');
    }

  } catch (error) {
    console.error('Erro na edge function bible-import:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getBibles(apiKey: string, supabase: any) {
  const response = await fetch('https://api.scripture.api.bible/v1/bibles', {
    headers: { 'api-key': apiKey }
  });
  
  const data = await response.json();
  
  // Filtrar apenas bíblias em português
  const portugueseBibles = data.data.filter((bible: any) => 
    bible.language.id === 'por' || bible.language.id === 'pt'
  );
  
  // Sincronizar com nossa base
  for (const bible of portugueseBibles) {
    await supabase
      .from('biblia_versoes')
      .upsert({
        id: bible.id,
        nome: bible.name,
        abreviacao: bible.abbreviation,
        descricao: bible.description,
        idioma: 'pt'
      });
  }
  
  return new Response(JSON.stringify({ bibles: portugueseBibles }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getBooks(apiKey: string, supabase: any, bibleId: string) {
  const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books`, {
    headers: { 'api-key': apiKey }
  });
  
  const data = await response.json();
  
  // Sincronizar livros com nossa base
  for (let i = 0; i < data.data.length; i++) {
    const book = data.data[i];
    const testamento = i < 39 ? 'AT' : 'NT'; // Primeiros 39 são AT
    
    await supabase
      .from('biblia_livros')
      .upsert({
        id: book.id,
        versao_id: bibleId,
        nome: book.name,
        abreviacao: book.abbreviation,
        testamento,
        ordinal: i + 1
      });
  }
  
  return new Response(JSON.stringify({ books: data.data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getChapters(apiKey: string, bookId: string, bibleId: string) {
  const response = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${bookId}/chapters`, {
    headers: { 'api-key': apiKey }
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify({ chapters: data.data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getChapterContent(apiKey: string, chapterId: string) {
  const response = await fetch(`https://api.scripture.api.bible/v1/bibles/de4e12af7f28f599-02/chapters/${chapterId}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`, {
    headers: { 'api-key': apiKey }
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify({ content: data.data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
