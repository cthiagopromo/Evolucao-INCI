import { Dilemma } from '@/types/simulation';

export const dilemmas: Dilemma[] = [
  // FINANCIAL DILEMMAS
  {
    id: 'fin-001',
    category: 'financial',
    title: 'Crise de Fluxo de Caixa',
    description: 'Sua empresa enfrenta uma queda de 40% nas vendas nos últimos 3 meses.',
    scenario: 'O caixa está no vermelho e você precisa tomar uma decisão urgente para manter a operação funcionando.',
    timeLimit: 25,
    defaultOptionId: 'fin-001-c',
    options: [
      {
        id: 'fin-001-a',
        text: 'Demitir 30% da equipe imediatamente',
        impact: -20,
        riskLevel: 'high',
        consequences: 'Redução imediata de custos, mas perda de talentos e queda na moral da equipe. Risco de não conseguir atender demanda futura.'
      },
      {
        id: 'fin-001-b',
        text: 'Buscar investimento emergencial com juros altos',
        impact: 40,
        riskLevel: 'high',
        consequences: 'Capital para resistir à crise, mas compromete margem futura. Alto risco se a recuperação demorar.'
      },
      {
        id: 'fin-001-c',
        text: 'Renegociar prazos com fornecedores e reduzir salários temporariamente',
        impact: 10,
        riskLevel: 'medium',
        consequences: 'Estratégia equilibrada que preserva equipe e relacionamentos, com menor impacto financeiro.'
      }
    ]
  },
  // MARKETING DILEMMAS
  {
    id: 'mkt-001',
    category: 'marketing',
    title: 'Crise de Imagem nas Redes Sociais',
    description: 'Um vídeo viral critica negativamente seu produto principal.',
    scenario: 'Em 24h, sua marca já perdeu 10mil seguidores e o tema está trending topic. Como responder?',
    timeLimit: 25,
    defaultOptionId: 'mkt-001-b',
    options: [
      {
        id: 'mkt-001-a',
        text: 'Resposta agressiva desmentindo e processando o autor',
        impact: -30,
        riskLevel: 'high',
        consequences: 'Pode amplificar ainda mais a crise e gerar efeito Streisand. Risco de prolongar o problema.'
      },
      {
        id: 'mkt-001-b',
        text: 'Não se manifestar e esperar o buzz passar',
        impact: -10,
        riskLevel: 'low',
        consequences: 'Abordagem segura, mas pode passar impressão de descaso ou culpa.'
      },
      {
        id: 'mkt-001-c',
        text: 'Resposta transparente assumindo falhas e mostrando melhorias',
        impact: 50,
        riskLevel: 'medium',
        consequences: 'Chance de transformar crise em oportunidade, demonstrando maturidade e compromisso.'
      }
    ]
  },
  // HR DILEMMAS
  {
    id: 'hr-001',
    category: 'hr',
    title: 'Conflito Entre Líderes',
    description: 'Seus dois melhores gerentes estão em conflito aberto há 2 semanas.',
    scenario: 'A produtividade de ambas as equipes caiu 25%. Outros colaboradores estão tomando lados. Você precisa agir.',
    timeLimit: 25,
    defaultOptionId: 'hr-001-c',
    options: [
      {
        id: 'hr-001-a',
        text: 'Demitir um dos gerentes imediatamente',
        impact: -25,
        riskLevel: 'high',
        consequences: 'Resolve o conflito, mas perde talento valioso e pode criar clima de medo na empresa.'
      },
      {
        id: 'hr-001-b',
        text: 'Transferir um deles para outra filial',
        impact: 15,
        riskLevel: 'medium',
        consequences: 'Minimiza o conflito sem demissões, mas pode ser visto como fuga do problema.'
      },
      {
        id: 'hr-001-c',
        text: 'Mediação profissional com coaching executivo',
        impact: 35,
        riskLevel: 'low',
        consequences: 'Investe no desenvolvimento e pode fortalecer a equipe, mas demora e custa mais.'
      }
    ]
  },
  // STRATEGY DILEMMAS
  {
    id: 'str-001',
    category: 'strategy',
    title: 'Pivô Estratégico',
    description: 'IA está revolucionando seu setor. Seu modelo atual pode ficar obsoleto.',
    scenario: 'Você tem 6 meses de runway. Pode continuar no modelo atual ou pivotar completamente para IA.',
    timeLimit: 25,
    defaultOptionId: 'str-001-b',
    options: [
      {
        id: 'str-001-a',
        text: 'Pivô completo para IA, demitindo equipe não-técnica',
        impact: 50,
        riskLevel: 'high',
        consequences: 'Posicionamento de vanguarda, mas alto risco de fracasso e perda de competências atuais.'
      },
      {
        id: 'str-001-b',
        text: 'Manter estratégia atual e ignorar IA',
        impact: -30,
        riskLevel: 'high',
        consequences: 'Preserva operação atual, mas risco alto de obsolescência rápida.'
      },
      {
        id: 'str-001-c',
        text: 'Integração gradual de IA mantendo core business',
        impact: 30,
        riskLevel: 'medium',
        consequences: 'Evolução controlada que preserva receita atual enquanto explora novas possibilidades.'
      }
    ]
  },
  {
    id: 'str-002',
    category: 'strategy',
    title: 'Parceria Estratégica',
    description: 'Uma multinacional quer fazer parceria exclusiva com sua startup.',
    scenario: 'A proposta garantiria 5 anos de receita estável, mas limitaria sua expansão para outros mercados.',
    timeLimit: 25,
    defaultOptionId: 'str-002-b',
    options: [
      {
        id: 'str-002-a',
        text: 'Aceitar parceria exclusiva imediatamente',
        impact: 20,
        riskLevel: 'low',
        consequences: 'Segurança financeira e aprendizado, mas limita crescimento e independência.'
      },
      {
        id: 'str-002-b',
        text: 'Rejeitar e manter independência total',
        impact: 10,
        riskLevel: 'medium',
        consequences: 'Preserva liberdade estratégica, mas perde oportunidade de aceleração e estabilidade.'
      },
      {
        id: 'str-002-c',
        text: 'Negociar parceria não-exclusiva com escopo limitado',
        impact: 35,
        riskLevel: 'medium',
        consequences: 'Equilibra benefícios da parceria com flexibilidade, mas requer negociação complexa.'
      }
    ]
  },
  // OPERATIONS DILEMMAS
  {
    id: 'ops-001',
    category: 'operations',
    title: 'Falha na Entrega de Produtos',
    description: 'Seu principal fornecedor teve uma pane logística e 70% dos pedidos não serão entregues esta semana.',
    scenario: 'Clientes importantes estão pressionando. Atrasos podem resultar em cancelamentos massivos.',
    timeLimit: 25,
    defaultOptionId: 'ops-001-c',
    options: [
      {
        id: 'ops-001-a',
        text: 'Contratar transporte emergencial custando 3x mais',
        impact: -15,
        riskLevel: 'medium',
        consequences: 'Mantém clientes satisfeitos, mas compromete margem de lucro significativamente.'
      },
      {
        id: 'ops-001-b',
        text: 'Comunicar atrasos e oferecer descontos de 20%',
        impact: -10,
        riskLevel: 'low',
        consequences: 'Preserva relacionamento com clientes, mas reduz receita e pode abrir precedente.'
      },
      {
        id: 'ops-001-c',
        text: 'Buscar fornecedores alternativos com qualidade inferior',
        impact: 25,
        riskLevel: 'high',
        consequences: 'Resolve imediatamente, mas risco de reclamações por qualidade e perda de reputação.'
      }
    ]
  },
  // CUSTOMER SERVICE DILEMMAS
  {
    id: 'cs-001',
    category: 'customer',
    title: 'Reclamação Viral de Cliente',
    description: 'Um cliente influente postou vídeo detalhando má experiência com seu serviço.',
    scenario: 'O vídeo já tem 500mil visualizações e hashtags negativas estão trending. Como lidar?',
    timeLimit: 25,
    defaultOptionId: 'cs-001-c',
    options: [
      {
        id: 'cs-001-a',
        text: 'Ignorar completamente e esperar passar',
        impact: -40,
        riskLevel: 'high',
        consequences: 'Evita alimentar crise, mas pode ser visto como descaso e amplificar negatividade.'
      },
      {
        id: 'cs-001-b',
        text: 'Responder publicamente defendendo a empresa',
        impact: -20,
        riskLevel: 'medium',
        consequences: 'Mostra posição, mas pode gerar backlash e guerra de narrativas nas redes.'
      },
      {
        id: 'cs-001-c',
        text: 'Contatar cliente diretamente e resolver publicamente',
        impact: 45,
        riskLevel: 'medium',
        consequences: 'Transforma crise em oportunidade, demonstrando compromisso com satisfação.'
      }
    ]
  },
  // TECHNOLOGY DILEMMAS
  {
    id: 'tech-001',
    category: 'technology',
    title: 'Atualização Tecnológica Crítica',
    description: 'Seu sistema legado está travando vendas e concorrentes já usam IA avançada.',
    scenario: 'Investimento necessário: R$ 200mil. ROI estimado em 18 meses, mas risco de falha na migração.',
    timeLimit: 25,
    defaultOptionId: 'tech-001-c',
    options: [
      {
        id: 'tech-001-a',
        text: 'Migrar completamente em 30 dias com parada total',
        impact: 30,
        riskLevel: 'high',
        consequences: 'Resultados rápidos se bem-sucedido, mas alto risco de downtime e perda de vendas.'
      },
      {
        id: 'tech-001-b',
        text: 'Manter sistema atual e ignorar tecnologia',
        impact: -35,
        riskLevel: 'high',
        consequences: 'Evita riscos de migração, mas garante obsolescência competitiva gradual.'
      },
      {
        id: 'tech-001-c',
        text: 'Migração gradual em fases com sistema paralelo',
        impact: 20,
        riskLevel: 'medium',
        consequences: 'Minimiza riscos com transição controlada, mas demora mais e custa adicional.'
      }
    ]
  }
];