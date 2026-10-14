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
  if (period === 'day') return 'Fechamento Diário (Hoje)';
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
// ---------------------------------------------------------------------------
// Catálogo e inventário do acervo: abre uma janela de impressão com o relatório,
// onde o admin escolhe "Salvar como PDF".
// ---------------------------------------------------------------------------

type CollectionGame = {
  title: string;
  tier?: string | null;
  mechanics?: string[] | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  price?: number | null;
  rating?: number | null;
  available?: boolean;
  isActive?: boolean;
  isAvailableNow?: boolean;
  copiesCount?: number;
  availableCopiesCount?: number;
  rentalsCount?: number;
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const TIER_CLASSES = ['latao', 'bronze', 'prata', 'ouro', 'diamante'];

function getStatusLabel(game: CollectionGame) {
  if (game.isActive === false) return { text: 'Manutenção', bg: '#FEE2E2', color: '#B91C1C' };
  if (game.isAvailableNow ?? game.available) return { text: 'Disponível', bg: '#DCFCE7', color: '#15803D' };
  return { text: 'Alugado', bg: '#FEF3C7', color: '#B45309' };
}

function formatPlayers(game: CollectionGame) {
  const min = game.minPlayers ?? 1;
  if (!game.maxPlayers) return `${min}+`;
  return game.maxPlayers === min ? `${min}` : `${min}-${game.maxPlayers}`;
}

// Abre a janela de impressão. Chame direto no clique: navegadores bloqueiam
// pop-ups abertos depois de um await.
export function openReportWindow() {
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (printWindow) {
    printWindow.document.write(
      '<p style="font-family: system-ui, sans-serif; padding: 32px; color: #04096D;">Gerando relatório do acervo…</p>',
    );
  }
  return printWindow;
}

// Retorna false quando o navegador bloqueou a janela.
export function generateCollectionPDF(games: CollectionGame[], targetWindow?: Window | null) {
  const printWindow = targetWindow ?? openReportWindow();
  if (!printWindow) return false;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const statuses = games.map(getStatusLabel);
  const totalGames = games.length;
  const totalCopies = games.reduce((acc, g) => acc + (g.copiesCount ?? 0), 0);
  const availableCopies = games.reduce((acc, g) => acc + (g.availableCopiesCount ?? 0), 0);
  const availableGames = statuses.filter((s) => s.text === 'Disponível').length;
  const rentedGames = statuses.filter((s) => s.text === 'Alugado').length;
  const maintenanceGames = statuses.filter((s) => s.text === 'Manutenção').length;

  const rowsHtml = games
    .map((game, index) => {
      const status = statuses[index];
      const copiesCount = game.copiesCount ?? 0;
      const availCopies = game.availableCopiesCount ?? (game.available ? copiesCount : 0);
      const rentalsCount = game.rentalsCount ?? 0;
      const rating = Number(game.rating || 0) > 0 ? Number(game.rating).toFixed(1) : '-';
      const tier = String(game.tier || 'BRONZE').toUpperCase();
      const tierClass = TIER_CLASSES.includes(tier.toLowerCase()) ? tier.toLowerCase() : 'bronze';
      const mechanics = (game.mechanics ?? []).slice(0, 3);

      return `
        <tr>
          <td style="text-align: center; color: #6B7280; font-weight: 600;">${index + 1}</td>
          <td>
            <div style="font-weight: 700; color: #04096D; font-size: 12px;">${escapeHtml(game.title)}</div>
            ${
              mechanics.length > 0
                ? `<div style="font-size: 10px; color: #6B7280; margin-top: 2px;">${escapeHtml(mechanics.join(', '))}</div>`
                : ''
            }
          </td>
          <td style="text-align: center;">
            <span class="tier-badge tier-${tierClass}">${escapeHtml(tier)}</span>
          </td>
          <td style="text-align: center; font-weight: 600;">${escapeHtml(formatPlayers(game))} jog.</td>
          <td style="text-align: center; font-weight: 700; color: #04096D;">${availCopies}/${copiesCount} un.</td>
          <td style="text-align: center; font-weight: 700;">${rentalsCount}</td>
          <td style="text-align: center; font-weight: 600;">★ ${rating}</td>
          <td style="text-align: right; font-weight: 700; color: #04096D;">R$ ${Number(game.price || 0).toFixed(2)}</td>
          <td style="text-align: center;">
            <span style="background: ${status.bg}; color: ${status.color}; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700;">
              ${status.text}
            </span>
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Relatório de Acervo - Ludus (${dateStr})</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #1F2937;
          background: #FFFFFF;
          padding: 28px;
        }
        .header {
          background: linear-gradient(135deg, #04096D 0%, #18208C 100%);
          color: #FFFFFF;
          padding: 24px 28px;
          border-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header h1 { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
        .header p { font-size: 12px; color: #D6DCFF; margin-top: 4px; }
        .header-meta { text-align: right; font-size: 11px; color: #E5E7EB; }
        .header-meta strong { color: #FBBC04; font-size: 13px; display: block; margin-bottom: 2px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 22px; }
        .kpi-card { border: 1px solid #E5E7EB; border-radius: 12px; padding: 12px 14px; background: #F9FAFB; }
        .kpi-card.highlight { background: #04096D; color: #FFFFFF; border-color: #04096D; }
        .kpi-card.yellow { background: #FFFBEB; border-color: #FDE68A; }
        .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B7280; margin-bottom: 4px; }
        .kpi-card.highlight .kpi-label { color: #FBBC04; }
        .kpi-value { font-size: 22px; font-weight: 900; color: #04096D; }
        .kpi-card.highlight .kpi-value { color: #FFFFFF; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        thead { display: table-header-group; }
        thead tr { background: #F0F2FF; border-bottom: 2px solid #04096D; }
        th {
          padding: 10px 8px;
          text-align: left;
          font-size: 10px;
          font-weight: 800;
          color: #04096D;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        td { padding: 9px 8px; border-bottom: 1px solid #E5E7EB; vertical-align: middle; }
        tr { page-break-inside: avoid; }
        tbody tr:nth-child(even) { background-color: #FAFAFA; }
        .tier-badge { padding: 3px 8px; border-radius: 999px; font-size: 9px; font-weight: 800; text-transform: uppercase; }
        .tier-diamante { background: #E0F7FA; color: #006064; }
        .tier-ouro { background: #FEF3C7; color: #92400E; }
        .tier-prata { background: #E5E7EB; color: #374151; }
        .tier-bronze { background: #FFEDD5; color: #9A3412; }
        .tier-latao { background: #FEF9C3; color: #854D0E; }
        .empty { padding: 32px; text-align: center; color: #6B7280; }
        .footer {
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #9CA3AF;
        }
        @page { size: A4 landscape; margin: 12mm; }
        @media print {
          body { padding: 0; }
          .header, .kpi-card, thead tr, .tier-badge, td span {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>LUDUS — Catálogo e Inventário do Acervo</h1>
          <p>Biblioteca de Jogos de Tabuleiro • IFMA Campus Timon</p>
        </div>
        <div class="header-meta">
          <strong>Relatório Oficial do Acervo</strong>
          Emitido em ${dateStr} às ${timeStr}
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card highlight">
          <div class="kpi-label">Total de Títulos</div>
          <div class="kpi-value">${totalGames}</div>
        </div>
        <div class="kpi-card yellow">
          <div class="kpi-label">Exemplares Físicos</div>
          <div class="kpi-value">${totalCopies} un.</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Títulos Disponíveis</div>
          <div class="kpi-value" style="color: #16A34A;">${availableGames} (${availableCopies} un.)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Títulos Alugados</div>
          <div class="kpi-value" style="color: #D97706;">${rentedGames}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Em Manutenção</div>
          <div class="kpi-value" style="color: #DC2626;">${maintenanceGames}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 36px; text-align: center;">#</th>
            <th>Título / Mecânicas</th>
            <th style="text-align: center;">Tier</th>
            <th style="text-align: center;">Jogadores</th>
            <th style="text-align: center;">Exemplares (Livres/Total)</th>
            <th style="text-align: center;">Aluguéis</th>
            <th style="text-align: center;">Nota</th>
            <th style="text-align: right;">Preço</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="9" class="empty">Nenhum jogo para listar.</td></tr>'}
        </tbody>
      </table>

      <div class="footer">
        <span>Sistema Ludus • Gestão de Acervo</span>
        <span>Total listado: ${totalGames} jogo(s)</span>
      </div>

      <script>
        window.onload = function () {
          setTimeout(function () { window.print(); }, 250);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}
