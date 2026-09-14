import * as pdfMakeModule from 'pdfmake/build/pdfmake';
import * as pdfFontsModule from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const pdfMakeObj: any = (pdfMakeModule as any).default || pdfMakeModule;
const pdfFontsObj: any = (pdfFontsModule as any).default || pdfFontsModule;

pdfMakeObj.vfs = pdfFontsObj?.pdfMake?.vfs || pdfFontsObj?.vfs;

const LUDUS_BLUE = '#04096E';
const LUDUS_YELLOW = '#FBBC04';
const GREEN = '#22C55E';
const RED = '#E62325';
const GRAY_DARK = '#374151';
const GRAY_LIGHT = '#6B7280';
const BG_LIGHT = '#F7F8FF';

function getStatusColor(status: string) {
  if (status === 'Concluído') return GREEN;
  if (status === 'Cancelado' || status === 'Atrasado') return RED;
  if (status === 'Pendente') return '#D97706';
  return LUDUS_BLUE; 
}

function getTierColor(tier: string) {
  switch (String(tier || '').toUpperCase()) {
    case 'DIAMANTE': return '#06B6D4';
    case 'OURO': return '#D97706';
    case 'PRATA': return '#6B7280';
    case 'BRONZE': return '#B45309';
    default: return '#92400E'; 
  }
}

function getPeriodLabel(period: string) {
  if (period === 'week') return 'Últimos 7 dias';
  if (period === 'year') return 'Últimos 12 meses';
  return 'Últimos 30 dias';
}

export const generateAdminReportPDF = (reportData: any, periodCode: string) => {
  if (!reportData) return;

  const periodLabel = getPeriodLabel(periodCode);
  const emissionDate = new Date().toLocaleString('pt-BR');

 
  const topGames = Array.isArray(reportData.topGames) ? reportData.topGames : [];
  const topGamesBody = [
    [
      { text: 'JOGO', style: 'tableHeaderSmall', alignment: 'left' },
      { text: 'ALUGUÉIS', style: 'tableHeaderSmall', alignment: 'center' }
    ],
    ...(topGames.length > 0
      ? topGames.map((game: any) => [
          { text: String(game.name || game.title || 'N/A'), style: 'tableCell', bold: true },
          { text: String(game.count || game.rentalsCount || 0), style: 'tableCell', alignment: 'center', color: LUDUS_BLUE, bold: true }
        ])
      : [
          [
            { text: 'Nenhum jogo alugado no período.', colSpan: 2, style: 'tableCell', italics: true, color: GRAY_LIGHT },
            {}
          ]
        ])
  ];

  
  const history = Array.isArray(reportData.history) ? reportData.history : [];
  const historyBody = [
    [
      { text: 'USUÁRIO', style: 'tableHeader' },
      { text: 'JOGO', style: 'tableHeader' },
      { text: 'TIER', style: 'tableHeader' },
      { text: 'RETIRADA', style: 'tableHeader' },
      { text: 'DEVOLUÇÃO', style: 'tableHeader' },
      { text: 'STATUS', style: 'tableHeader' }
    ],
    ...(history.length > 0
      ? history.slice(0, 35).map((rental: any) => [
          { text: String(rental.user?.name || 'Aluno Desconhecido'), style: 'tableCell', bold: true },
          { text: String(rental.game || 'N/A'), style: 'tableCell' },
          { text: String(rental.category || 'BRONZE'), style: 'tableCell', color: getTierColor(rental.category), bold: true },
          { text: String(rental.startDate || '—'), style: 'tableCell' },
          { text: String(rental.endDate || '—'), style: 'tableCell' },
          { text: String(rental.status || 'Em Andamento'), style: 'tableCell', color: getStatusColor(rental.status), bold: true }
        ])
      : [
          [
            { text: 'Nenhum histórico de empréstimo registrado para o período selecionado.', colSpan: 6, style: 'tableCell', italics: true, color: GRAY_LIGHT, alignment: 'center' },
            {}, {}, {}, {}, {}
          ]
        ])
  ];

  
  const gamesAnalytics = Array.isArray(reportData.gamesAnalytics) ? reportData.gamesAnalytics : [];
  const gamesAnalyticsBody = [
    [
      { text: 'TÍTULO DO JOGO', style: 'tableHeader' },
      { text: 'TIER', style: 'tableHeader' },
      { text: 'ESTOQUE', style: 'tableHeader', alignment: 'center' },
      { text: 'GIRO (%)', style: 'tableHeader', alignment: 'center' },
      { text: 'AVALIAÇÃO', style: 'tableHeader', alignment: 'center' },
      { text: 'AVARIAS', style: 'tableHeader', alignment: 'center' }
    ],
    ...(gamesAnalytics.length > 0
      ? gamesAnalytics.slice(0, 25).map((g: any) => [
          { text: String(g.title || 'N/A'), style: 'tableCell', bold: true },
          { text: String(g.tier || 'BRONZE'), style: 'tableCell', color: getTierColor(g.tier), bold: true },
          { text: `${g.totalCopies || 1} un.`, style: 'tableCell', alignment: 'center' },
          { text: `${g.turnoverRate || 0}%`, style: 'tableCell', alignment: 'center', bold: true, color: g.turnoverRate >= 50 ? GREEN : LUDUS_BLUE },
          { text: g.avgRating > 0 ? `${g.avgRating.toFixed(1)} ★` : '—', style: 'tableCell', alignment: 'center' },
          { text: String(g.maintenanceCount || 0), style: 'tableCell', alignment: 'center', color: g.maintenanceCount > 0 ? RED : GRAY_LIGHT, bold: g.maintenanceCount > 0 }
        ])
      : [
          [
            { text: 'Dados de auditoria do acervo consolidados na visão geral.', colSpan: 6, style: 'tableCell', italics: true, color: GRAY_LIGHT, alignment: 'center' },
            {}, {}, {}, {}, {}
          ]
        ])
  ];

  const docDefinition: any = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 50, 40, 40],
    
    background: [
      {
        canvas: [
          { type: 'rect', x: 0, y: 0, w: 595.28, h: 8, color: LUDUS_BLUE },
          { type: 'rect', x: 0, y: 8, w: 180, h: 3, color: LUDUS_YELLOW }
        ]
      }
    ],

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `Gerado em ${emissionDate}`, alignment: 'left', color: GRAY_LIGHT },
        { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', color: GRAY_LIGHT }
      ],
      fontSize: 8,
      margin: [40, 10, 40, 0]
    }),

    content: [
      {
        columns: [
          {
            text: 'LUDUS',
            fontSize: 26,
            bold: true,
            color: LUDUS_BLUE,
            width: 'auto'
          },
          {
            text: 'RELATÓRIO GERENCIAL DE ACERVO E ENGAJAMENTO\nInstituto Federal do Maranhão - Campus Timon',
            alignment: 'right',
            fontSize: 9,
            color: GRAY_DARK,
            margin: [0, 4, 0, 0]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Resumo Executivo',
        style: 'sectionTitle'
      },
      {
        text: `Período do relatório: ${periodLabel}`,
        fontSize: 9,
        color: GRAY_LIGHT,
        margin: [0, 0, 0, 12]
      },
      {
        columns: [
          {
            stack: [
              { text: 'Total de Empréstimos', style: 'kpiLabel' },
              { text: String(reportData.kpis?.totalRentals?.value ?? '0'), style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Jogos Únicos', style: 'kpiLabel' },
              { text: String(reportData.kpis?.uniqueGames?.value ?? '0'), style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Tempo Médio', style: 'kpiLabel' },
              { text: String(reportData.kpis?.avgRentalDays?.value ?? '0 dias'), style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Engajamento Ativo', style: 'kpiLabel' },
              { text: String(reportData.kpis?.engagementRate?.value ?? '0%'), style: 'kpiValue', color: GREEN }
            ],
            style: 'kpiBox'
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 20]
      },
      {
        columns: [
          {
            width: '48%',
            stack: [
              { text: 'Jogos Mais Alugados (Top 6)', style: 'sectionTitle', margin: [0, 0, 0, 8] },
              {
                table: {
                  headerRows: 1,
                  widths: ['*', 60],
                  body: topGamesBody
                },
                layout: 'lightHorizontalLines'
              }
            ]
          },
          { width: '4%', text: '' },
          {
            width: '48%',
            stack: [
              { text: 'Status Físico do Acervo', style: 'sectionTitle', margin: [0, 0, 0, 8] },
              {
                margin: [0, 0, 0, 12],
                table: {
                  widths: ['*', '*'],
                  body: [
                    [
                      { text: 'Total de Cópias:', fontSize: 9, color: GRAY_LIGHT },
                      { text: String(reportData.collection?.total ?? 0), fontSize: 9, bold: true, alignment: 'right' }
                    ],
                    [
                      { text: 'Disponíveis:', fontSize: 9, color: GRAY_LIGHT },
                      { text: String(reportData.collection?.available ?? 0), fontSize: 9, bold: true, color: GREEN, alignment: 'right' }
                    ],
                    [
                      { text: 'Em Manutenção:', fontSize: 9, color: GRAY_LIGHT },
                      { text: String(reportData.collection?.maintenance ?? 0), fontSize: 9, bold: true, color: RED, alignment: 'right' }
                    ],
                    [
                      { text: 'Taxa de Ocupação:', fontSize: 9, color: GRAY_LIGHT },
                      { text: `${reportData.collection?.occupancyRate ?? 0}%`, fontSize: 9, bold: true, color: LUDUS_BLUE, alignment: 'right' }
                    ]
                  ]
                },
                layout: 'noBorders'
              },
              { text: 'Top Alunos no Período', style: 'sectionTitle', margin: [0, 0, 0, 6] },
              ...(reportData.engagement?.topUsers && reportData.engagement.topUsers.length > 0
                ? reportData.engagement.topUsers.slice(0, 3).map((user: any, index: number) => ({
                    text: `${index + 1}. ${user.name || 'Aluno'} (${user.rentals || 0} aluguéis)`,
                    fontSize: 9,
                    bold: true,
                    color: LUDUS_BLUE,
                    margin: [0, 0, 0, 3]
                  }))
                : [{ text: 'Nenhum empréstimo no período.', fontSize: 9, color: GRAY_LIGHT, italics: true, margin: [0, 0, 0, 0] }])
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      ...(gamesAnalytics.length > 0 ? [
        {
          text: 'Auditoria de Desempenho e Avarias do Acervo',
          style: 'sectionTitle',
          margin: [0, 0, 0, 8]
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: gamesAnalyticsBody
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? LUDUS_BLUE : rowIndex % 2 === 0 ? BG_LIGHT : null),
            hLineWidth: () => 0.5,
            vLineWidth: () => 0,
            hLineColor: () => '#E5E7EB',
            paddingTop: () => 5,
            paddingBottom: () => 5,
            paddingLeft: () => 6,
            paddingRight: () => 6,
          },
          margin: [0, 0, 0, 20]
        }
      ] : []),
      {
        text: 'Histórico de Empréstimos Recentes',
        style: 'sectionTitle',
        margin: [0, 0, 0, 8]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: historyBody
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? LUDUS_BLUE : rowIndex % 2 === 0 ? BG_LIGHT : null),
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => '#E5E7EB',
          paddingTop: () => 6,
          paddingBottom: () => 6,
          paddingLeft: () => 6,
          paddingRight: () => 6,
        }
      }
    ],

    styles: {
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: LUDUS_BLUE
      },
      kpiBox: {
        fillColor: BG_LIGHT,
        margin: [0, 0, 0, 0],
        padding: 8,
        border: [false, true, false, false],
        borderColor: ['#fff', LUDUS_YELLOW, '#fff', '#fff']
      },
      kpiLabel: {
        fontSize: 8,
        color: GRAY_LIGHT,
        bold: true,
        margin: [0, 0, 0, 3]
      },
      kpiValue: {
        fontSize: 16,
        bold: true,
        color: LUDUS_BLUE
      },
      tableHeader: {
        bold: true,
        fontSize: 8,
        color: 'white'
      },
      tableHeaderSmall: {
        bold: true,
        fontSize: 8,
        color: GRAY_LIGHT
      },
      tableCell: {
        fontSize: 8,
        color: GRAY_DARK
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  pdfMakeObj.createPdf(docDefinition as TDocumentDefinitions).download(`Ludus_Relatorio_${periodCode}_${Date.now()}.pdf`);
};