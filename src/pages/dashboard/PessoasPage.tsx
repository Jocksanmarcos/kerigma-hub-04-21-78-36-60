import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PessoasList } from '@/components/pessoas/PessoasList';
import { FamilyTreeView } from '@/components/pessoas/FamilyTreeView';
import { FamilyStatsCard } from '@/components/pessoas/FamilyStatsCard';
import { AniversariantesCard } from '@/components/pessoas/AniversariantesCard';
import { IADashboard } from '@/components/pessoas/IADashboard';
import { PessoasReports } from '@/components/pessoas/PessoasReports';
import { GenealogyManagement } from '@/components/pessoas/GenealogyManagement';
import { ResetUserPassword } from '@/components/admin/ResetUserPassword';
import { ArrowLeft, TreePine, Users, BarChart3, Brain, Calendar, FileText, Settings } from 'lucide-react';

const PessoasPage = () => {
  const [showFamilyTree, setShowFamilyTree] = useState(false);
  const [showGenealogyManagement, setShowGenealogyManagement] = useState(false);
  const [activeTab, setActiveTab] = useState('pessoas');

  if (showFamilyTree) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Árvore Genealógica das Famílias
              </h1>
              <p className="text-muted-foreground">
                Visualize as relações familiares e vínculos da comunidade
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFamilyTree(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Pessoas</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FamilyStatsCard onViewFamilies={() => setShowFamilyTree(true)} />
            </div>
            <div className="lg:col-span-3">
              <FamilyTreeView />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showGenealogyManagement) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Gestão de Genealogia
              </h1>
              <p className="text-muted-foreground">
                Limpe e organize dados genealógicos incorretos da importação
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowGenealogyManagement(false)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Pessoas</span>
            </Button>
          </div>
          <GenealogyManagement />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Pessoas</h1>
            <p className="text-muted-foreground">
              Sistema completo com IA, relatórios e insights para gestão da congregação
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowFamilyTree(true)}
              className="flex items-center space-x-2"
            >
              <TreePine className="h-4 w-4" />
              <span className="hidden sm:inline">Árvore Genealógica</span>
              <span className="sm:hidden">Árvore</span>
            </Button>
            <Button 
              onClick={() => setShowGenealogyManagement(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Gestão Genealógia</span>
              <span className="sm:hidden">Gestão</span>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pessoas" className="flex items-center gap-1 px-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Pessoas</span>
              <span className="sm:hidden text-xs">Pessoas</span>
            </TabsTrigger>
            <TabsTrigger value="aniversarios" className="flex items-center gap-1 px-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Aniversários</span>
              <span className="sm:hidden text-xs">Aniver.</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-1 px-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden text-xs">Relat.</span>
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="flex items-center gap-1 px-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estatísticas & IA</span>
              <span className="sm:hidden text-xs">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pessoas" className="space-y-6">
            <PessoasList />
          </TabsContent>

          <TabsContent value="aniversarios">
            <AniversariantesCard />
          </TabsContent>

          <TabsContent value="relatorios">
            <div className="space-y-6">
              <div className="mb-6">
                <ResetUserPassword />
              </div>
              <PessoasReports />
            </div>
          </TabsContent>

          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FamilyStatsCard onViewFamilies={() => setShowFamilyTree(true)} />
              </div>
              <div className="lg:col-span-2">
                <IADashboard />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PessoasPage;