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
  if (status === 'Pendente') return LUDUS_YELLOW;
  return LUDUS_BLUE; 
}

function getTierColor(tier: string) {
  switch (tier?.toUpperCase()) {
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

  
  const topGamesBody = [
    [
      { text: 'JOGO', style: 'tableHeaderSmall', alignment: 'left' },
      { text: 'ALUGUÉIS', style: 'tableHeaderSmall', alignment: 'center' }
    ],
    ...(reportData.topGames || []).map((game: any) => [
      { text: game.name || 'N/A', style: 'tableCell', bold: true },
      { text: String(game.count || 0), style: 'tableCell', alignment: 'center', color: LUDUS_BLUE, bold: true }
    ])
  ];

 
  const historyBody = [
    [
      { text: 'USUÁRIO', style: 'tableHeader' },
      { text: 'JOGO', style: 'tableHeader' },
      { text: 'TIER', style: 'tableHeader' },
      { text: 'RETIRADA', style: 'tableHeader' },
      { text: 'DEVOLUÇÃO', style: 'tableHeader' },
      { text: 'STATUS', style: 'tableHeader' }
    ],
    ...(reportData.history || []).map((rental: any) => [
      { text: rental.user?.name || 'N/A', style: 'tableCell', bold: true },
      { text: rental.game || 'N/A', style: 'tableCell' },
      { text: rental.category || 'BRONZE', style: 'tableCell', color: getTierColor(rental.category), bold: true },
      { text: rental.startDate || 'N/A', style: 'tableCell' },
      { text: rental.endDate || 'N/A', style: 'tableCell' },
      { text: rental.status || 'N/A', style: 'tableCell', color: getStatusColor(rental.status), bold: true }
    ])
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 40],
    
    background: [
      {
        canvas: [
          { type: 'rect', x: 0, y: 0, w: 595.28, h: 8, color: LUDUS_BLUE },
          { type: 'rect', x: 0, y: 8, w: 180, h: 3, color: LUDUS_YELLOW }
        ]
      }
    ],

    footer: (currentPage, pageCount) => ({
      columns: [
        { text: `Gerado em ${emissionDate}`, alignment: 'left', color: GRAY_LIGHT },
        { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', color: GRAY_LIGHT }
      ],
      fontSize: 9,
      margin: [40, 10, 40, 0]
    }),

    content: [
      {
        columns: [
          {
            text: 'LUDUS',
            fontSize: 28,
            bold: true,
            color: LUDUS_BLUE,
            width: 'auto'
          },
          {
            text: 'RELATÓRIO GERENCIAL DE ACERVO E ENGAJAMENTO\nInstituto Federal do Maranhão - Campus Timon',
            alignment: 'right',
            fontSize: 10,
            color: GRAY_DARK,
            margin: [0, 5, 0, 0]
          }
        ],
        margin: [0, 0, 0, 25]
      },
      {
        text: 'Resumo Executivo',
        style: 'sectionTitle'
      },
      {
        text: `Período do relatório: ${periodLabel}`,
        fontSize: 10,
        color: GRAY_LIGHT,
        margin: [0, 0, 0, 15]
      },
      {
        columns: [
          {
            stack: [
              { text: 'Total de Empréstimos', style: 'kpiLabel' },
              { text: String(reportData.kpis?.totalRentals?.value || '0'), style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Jogos Únicos Alugados', style: 'kpiLabel' },
              { text: String(reportData.kpis?.uniqueGames?.value || '0'), style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Tempo Médio', style: 'kpiLabel' },
              { text: String(reportData.kpis?.avgRentalDays?.value || '0'), style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Engajamento Ativo', style: 'kpiLabel' },
              { text: String(reportData.kpis?.engagementRate?.value || '0%'), style: 'kpiValue', color: GREEN }
            ],
            style: 'kpiBox'
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 25]
      },
      {
        columns: [
          {
            width: '48%',
            stack: [
              { text: 'Jogos Mais Alugados (Top 6)', style: 'sectionTitle', margin: [0, 0, 0, 10] },
              reportData.topGames?.length ? {
                table: {
                  headerRows: 1,
                  widths: ['*', 60],
                  body: topGamesBody
                },
                layout: 'lightHorizontalLines'
              } : { text: 'Nenhum jogo alugado no período.', fontSize: 10, color: GRAY_LIGHT, italics: true }
            ]
          },
          { width: '4%', text: '' },
          {
            width: '48%',
            stack: [
              { text: 'Status do Acervo', style: 'sectionTitle', margin: [0, 0, 0, 10] },
              {
                margin: [0, 0, 0, 15],
                table: {
                  widths: ['*', '*'],
                  body: [
                    [
                      { text: 'Total de Cópias:', fontSize: 10, color: GRAY_LIGHT },
                      { text: String(reportData.collection?.total || 0), fontSize: 10, bold: true, alignment: 'right' }
                    ],
                    [
                      { text: 'Disponíveis:', fontSize: 10, color: GRAY_LIGHT },
                      { text: String(reportData.collection?.available || 0), fontSize: 10, bold: true, color: GREEN, alignment: 'right' }
                    ],
                    [
                      { text: 'Em Manutenção:', fontSize: 10, color: GRAY_LIGHT },
                      { text: String(reportData.collection?.maintenance || 0), fontSize: 10, bold: true, color: RED, alignment: 'right' }
                    ],
                    [
                      { text: 'Taxa de Ocupação:', fontSize: 10, color: GRAY_LIGHT },
                      { text: `${reportData.collection?.occupancyRate || 0}%`, fontSize: 10, bold: true, color: LUDUS_BLUE, alignment: 'right' }
                    ]
                  ]
                },
                layout: 'noBorders'
              },
              
              { text: 'Top 3 Usuários', style: 'sectionTitle', margin: [0, 0, 0, 10] },
              ...(reportData.engagement?.topUsers || []).slice(0, 3).map((user: any, index: number) => ({
                text: `${index + 1}. ${user.name} (${user.rentals} aluguéis)`,
                fontSize: 10,
                bold: true,
                color: LUDUS_BLUE,
                margin: [0, 0, 0, 4]
              }))
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },
      {
        text: 'Histórico de Empréstimos (Recentes)',
        style: 'sectionTitle',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: historyBody
        },
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return LUDUS_BLUE;
            return rowIndex % 2 === 0 ? BG_LIGHT : null;
          },
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 1,
          vLineWidth: () => 0,
          hLineColor: () => '#E5E7EB',
          paddingTop: () => 8,
          paddingBottom: () => 8,
          paddingLeft: () => 8,
          paddingRight: () => 8,
        }
      }
    ],

    styles: {
      sectionTitle: {
        fontSize: 14,
        bold: true,
        color: LUDUS_BLUE
      },
      kpiBox: {
        fillColor: BG_LIGHT,
        margin: [0, 0, 0, 0],
        padding: 10,
        border: [false, true, false, false],
        borderColor: ['#fff', LUDUS_YELLOW, '#fff', '#fff']
      },
      kpiLabel: {
        fontSize: 9,
        color: GRAY_LIGHT,
        bold: true,
        margin: [0, 0, 0, 4]
      },
      kpiValue: {
        fontSize: 20,
        bold: true,
        color: LUDUS_BLUE
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: 'white'
      },
      tableHeaderSmall: {
        bold: true,
        fontSize: 9,
        color: GRAY_LIGHT
      },
      tableCell: {
        fontSize: 9,
        color: GRAY_DARK
      }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  
  pdfMakeObj.createPdf(docDefinition).download(`Ludus_Relatorio_${periodCode}_${Date.now()}.pdf`);
};