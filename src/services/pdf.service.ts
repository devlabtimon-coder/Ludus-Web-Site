import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';


(pdfMake as any).vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : pdfFonts.pdfMake.vfs;

const LUDUS_BLUE = '#04096E';
const LUDUS_YELLOW = '#FBBC04';
const GREEN = '#22C55E';
const RED = '#E62325';

function getStatusColor(status: string) {
  if (status === 'Concluído') return GREEN;
  if (status === 'Cancelado' || status === 'Atrasado') return RED;
  if (status === 'Pendente') return LUDUS_YELLOW;
  return LUDUS_BLUE; 
}

function getPeriodLabel(period: string) {
  if (period === 'week') return 'Últimos 7 dias';
  if (period === 'year') return 'Últimos 12 meses';
  return 'Últimos 30 dias';
}

export const generateAdminReportPDF = (reportData: any, periodCode: string) => {
  const periodLabel = getPeriodLabel(periodCode);
  const emissionDate = new Date().toLocaleString('pt-BR');

  
  const tableBody = [
   
    [
      { text: 'USUÁRIO', style: 'tableHeader' },
      { text: 'JOGO', style: 'tableHeader' },
      { text: 'TIER', style: 'tableHeader' },
      { text: 'RETIRADA', style: 'tableHeader' },
      { text: 'DEVOLUÇÃO', style: 'tableHeader' },
      { text: 'STATUS', style: 'tableHeader' }
    ],

    ...reportData.history.map((rental: any) => [
      { text: rental.user.name, style: 'tableCell', bold: true },
      { text: rental.game, style: 'tableCell' },
      { text: rental.category, style: 'tableCell' },
      { text: rental.startDate, style: 'tableCell' },
      { text: rental.endDate, style: 'tableCell' },
      { text: rental.status, style: 'tableCell', color: getStatusColor(rental.status), bold: true }
    ])
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 40, 40, 40],
    
   
    footer: (currentPage, pageCount) => {
      return {
        text: `Página ${currentPage} de ${pageCount} - Gerado pelo Sistema Ludus em ${emissionDate}`,
        alignment: 'center',
        fontSize: 9,
        color: '#8B8EA1',
        margin: [0, 10, 0, 0]
      };
    },

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
            text: 'RELATÓRIO GERENCIAL DE ACERVO\nInstituto Federal do Maranhão - Campus Timon',
            alignment: 'right',
            fontSize: 10,
            color: '#535353',
            margin: [0, 5, 0, 0]
          }
        ],
        margin: [0, 0, 0, 20]
      },

    
      {
        text: 'Resumo Executivo',
        style: 'sectionTitle'
      },
      {
        text: `Período analisado: ${periodLabel}`,
        fontSize: 10,
        color: '#666',
        margin: [0, 0, 0, 15]
      },

     
      {
        columns: [
          {
            stack: [
              { text: 'Total de Empréstimos', style: 'kpiLabel' },
              { text: reportData.kpis.totalRentals.value, style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Jogos Únicos Alugados', style: 'kpiLabel' },
              { text: reportData.kpis.uniqueGames.value, style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Média de Dias (Aluguel)', style: 'kpiLabel' },
              { text: reportData.kpis.avgRentalDays.value, style: 'kpiValue' }
            ],
            style: 'kpiBox'
          },
          {
            stack: [
              { text: 'Engajamento Ativo', style: 'kpiLabel' },
              { text: reportData.kpis.engagementRate.value, style: 'kpiValue', color: GREEN }
            ],
            style: 'kpiBox'
          }
        ],
        columnGap: 10,
        margin: [0, 0, 0, 30]
      },

      // Tabela de Histórico
      {
        text: 'Histórico de Empréstimos (Recentes)',
        style: 'sectionTitle',
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: tableBody
        },
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0) return LUDUS_BLUE; 
            return rowIndex % 2 === 0 ? '#F7F8FF' : null;
          },
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 1,
          vLineWidth: () => 0, 
          hLineColor: () => '#E5E7EB',
          paddingTop: () => 8,
          paddingBottom: () => 8,
          paddingLeft: () => 10,
          paddingRight: () => 10,
        }
      }
    ],

    styles: {
      sectionTitle: {
        fontSize: 16,
        bold: true,
        color: LUDUS_BLUE
      },
      kpiBox: {
        fillColor: '#F7F8FF',
        margin: [0, 0, 0, 0],
        padding: 10,
      },
      kpiLabel: {
        fontSize: 9,
        color: '#6B7280',
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
        fontSize: 10,
        color: 'white'
      },
      tableCell: {
        fontSize: 9,
        color: '#374151'
      }
    }
  };

  
  pdfMake.createPdf(docDefinition).download(`Ludus_Relatorio_${periodCode}.pdf`);
};