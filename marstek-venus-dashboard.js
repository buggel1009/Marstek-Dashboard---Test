/**
 * Marstek Venus Dashboard Card
 * Premium Lovelace Dashboard für Marstek Venus Batteriespeicher
 * HACS Frontend Plugin
 * Version: 1.2.0
 *
 * Unterstützt: Venus E v2/v3, Venus A, Venus D
 * Quelle: https://github.com/ffunes/marstek-venus-energy-manager
 */
(function () {
  'use strict';

  const VERSION = '1.2.0';
  const CARD_TAG = 'marstek-venus-dashboard';
  const EDITOR_TAG = 'marstek-venus-dashboard-editor';

  // ─── Entitäts-Definitionen ────────────────────────────────────────────────
  const ENTITY_DEFS = [
    // Pflichtfelder
    { key: 'battery_soc',                   domain: 'sensor',        label: 'Batterieladezustand (SOC)',       required: true  },
    { key: 'battery_power',                  domain: 'sensor',        label: 'Batterieleistung (W)',            required: true  },
    // Kern-Sensoren
    { key: 'ac_power',                       domain: 'sensor',        label: 'AC-Leistung',                    required: false },
    { key: 'internal_temperature',           domain: 'sensor',        label: 'Innentemperatur',                required: false },
    { key: 'battery_voltage',                domain: 'sensor',        label: 'Batteriespannung',               required: false },
    { key: 'max_cell_voltage',               domain: 'sensor',        label: 'Zelle max. Spannung',            required: false },
    { key: 'min_cell_voltage',               domain: 'sensor',        label: 'Zelle min. Spannung',            required: false },
    { key: 'inverter_state',                 domain: 'sensor',        label: 'Wechselrichterstatus',           required: false },
    // Energie
    { key: 'total_daily_charging_energy',    domain: 'sensor',        label: 'Tagesladung (kWh)',              required: false },
    { key: 'total_daily_discharging_energy', domain: 'sensor',        label: 'Tagesentladung (kWh)',           required: false },
    { key: 'total_charging_energy',          domain: 'sensor',        label: 'Gesamtladung (kWh)',             required: false },
    { key: 'total_discharging_energy',       domain: 'sensor',        label: 'Gesamtentladung (kWh)',          required: false },
    { key: 'stored_energy',                  domain: 'sensor',        label: 'Gespeicherte Energie (kWh)',     required: false },
    { key: 'battery_cycle_count_calc',       domain: 'sensor',        label: 'Zyklenanzahl (berechnet)',       required: false },
    { key: 'round_trip_efficiency_total',    domain: 'sensor',        label: 'Wirkungsgrad gesamt (%)',        required: false },
    // Alarm
    { key: 'fault_status',                   domain: 'sensor',        label: 'Fehlerstatus',                   required: false },
    { key: 'alarm_status',                   domain: 'sensor',        label: 'Alarmstatus',                    required: false },
    // Steuerung
    { key: 'force_mode',                     domain: 'select',        label: 'Betriebsmodus (Force Mode)',     required: false },
    { key: 'user_work_mode',                 domain: 'select',        label: 'Arbeitsmodus',                   required: false },
    { key: 'set_charge_power',               domain: 'number',        label: 'Ladeleistung einstellen (W)',    required: false },
    { key: 'set_discharge_power',            domain: 'number',        label: 'Entladeleistung einstellen (W)',  required: false },
    // Konnektivität
    { key: 'wifi_status',                    domain: 'binary_sensor', label: 'WLAN-Status',                    required: false },
    { key: 'cloud_status',                   domain: 'binary_sensor', label: 'Cloud-Status',                   required: false },
    // Multi-Batterie (Aggregat)
    { key: 'system_soc',                     domain: 'sensor',        label: 'System SOC (Multi-Batterie)',    required: false },
    { key: 'system_charge_power',            domain: 'sensor',        label: 'System Ladeleistung (Multi)',    required: false },
    { key: 'system_discharge_power',         domain: 'sensor',        label: 'System Entladeleistung (Multi)', required: false },
    { key: 'system_daily_charging_energy',   domain: 'sensor',        label: 'System Tagesladung (Multi)',     required: false },
    { key: 'system_daily_discharging_energy',domain: 'sensor',        label: 'System Tagesentladung (Multi)',  required: false },
  ];

  // ─── Force-Mode Optionen & Mapping ───────────────────────────────────────
  const FORCE_MODE_CHARGE = ['Force Charge','force_charge','ForceCharge','Laden erzwingen'];
  const FORCE_MODE_DISCHARGE = ['Force Discharge','force_discharge','ForceDischarge','Entladen erzwingen'];
  const FORCE_MODE_AUTO = ['Auto','auto','Self Consumption','self_consumption','Eigenverbrauch'];

  function getForceModeClass(mode) {
    if (!mode) return 'auto';
    if (FORCE_MODE_CHARGE.includes(mode)) return 'charge';
    if (FORCE_MODE_DISCHARGE.includes(mode)) return 'discharge';
    return 'auto';
  }

  // ─── Hilfsfunktionen ─────────────────────────────────────────────────────
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function formatPower(watts) {
    if (watts === null || watts === undefined || isNaN(Number(watts))) return '—';
    const w = Math.abs(Number(watts));
    if (w >= 1000) return (w / 1000).toFixed(2) + ' kW';
    return Math.round(w) + ' W';
  }

  function formatEnergy(kwh) {
    if (kwh === null || kwh === undefined || isNaN(Number(kwh))) return '—';
    const k = Number(kwh);
    if (k >= 1000) return (k / 1000).toFixed(2) + ' MWh';
    if (k >= 100) return k.toFixed(1) + ' kWh';
    return k.toFixed(2) + ' kWh';
  }

  function socColor(soc) {
    if (soc === null || isNaN(soc)) return '#4b5563';
    if (soc <= 10) return '#ef4444';
    if (soc <= 20) return '#f97316';
    if (soc <= 40) return '#f59e0b';
    if (soc <= 65) return '#84cc16';
    if (soc <= 85) return '#22c55e';
    return '#00e5b3';
  }

  function tempColor(t) {
    if (t === null) return '#94a3b8';
    if (t > 50) return '#ef4444';
    if (t > 40) return '#f59e0b';
    return '#22c55e';
  }

  // ─── SVG Gauge ───────────────────────────────────────────────────────────
  // Kreis: cx=80, cy=76, r=60, viewBox="0 0 160 115"
  // 270°-Bogen: start lower-left → clockwise → lower-right
  // Kreis-Umfang = 2π×60 = 376.99
  // Arc-Länge (270°) = 376.99 × 0.75 = 282.74
  const CX = 80, CY = 76, R = 60;
  const CIRC = 2 * Math.PI * R;
  const ARC_LEN = CIRC * (270 / 360);
  const GAUGE_ROTATE = `rotate(135, ${CX}, ${CY})`;

  function buildGauge(soc, color) {
    const s = soc !== null ? clamp(soc, 0, 100) : 0;
    const fill = ARC_LEN * (s / 100);
    const displaySoc = soc !== null ? Math.round(soc) : '—';

    return `
      <svg class="mv-gauge-svg" viewBox="0 0 160 115" xmlns="http://www.w3.org/2000/svg" aria-label="SOC ${displaySoc}%">
        <defs>
          <radialGradient id="mvGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </radialGradient>
          <filter id="mvGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <!-- Hintergrund-Bogen -->
        <circle cx="${CX}" cy="${CY}" r="${R}"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="${ARC_LEN} ${CIRC}"
          transform="${GAUGE_ROTATE}"
        />

        <!-- Glow-Schicht -->
        <circle cx="${CX}" cy="${CY}" r="${R}"
          fill="none"
          stroke="${color}"
          stroke-width="20"
          stroke-linecap="round"
          stroke-dasharray="${fill} ${CIRC}"
          transform="${GAUGE_ROTATE}"
          opacity="0.12"
          style="filter: blur(5px);"
        />

        <!-- Haupt-Bogen -->
        <circle cx="${CX}" cy="${CY}" r="${R}"
          fill="none"
          stroke="${color}"
          stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="${fill} ${CIRC}"
          transform="${GAUGE_ROTATE}"
          class="mv-gauge-fill"
        />

        <!-- Endpunkt-Punkt -->
        ${soc !== null && soc > 2 ? (() => {
          const endAngle = (135 + (s / 100) * 270 - 90) * Math.PI / 180;
          const ex = CX + R * Math.cos(endAngle);
          const ey = CY + R * Math.sin(endAngle);
          return `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="5" fill="${color}" opacity="0.9"/>`;
        })() : ''}

        <!-- SOC Wert -->
        <text x="${CX}" y="${CY - 10}"
          text-anchor="middle"
          fill="#f1f5f9"
          font-size="30"
          font-weight="300"
          font-family="Roboto, -apple-system, sans-serif"
          letter-spacing="-1"
        >${displaySoc}</text>

        <text x="${CX + (soc !== null ? 16 : 0)}" y="${CY - 10}"
          text-anchor="start"
          fill="#64748b"
          font-size="12"
          font-family="Roboto, -apple-system, sans-serif"
        >${soc !== null ? '%' : ''}</text>

        <text x="${CX}" y="${CY + 10}"
          text-anchor="middle"
          fill="#475569"
          font-size="8"
          font-family="Roboto, -apple-system, sans-serif"
          letter-spacing="2"
        >LADEZUSTAND</text>
      </svg>`;
  }

  // ─── Card CSS ─────────────────────────────────────────────────────────────
  const CARD_CSS = `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Haupt-Karte ── */
    .mv-card {
      background: linear-gradient(160deg, #0b1629 0%, #111d38 45%, #0b1629 100%);
      border-radius: 22px;
      color: #e2e8f0;
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', -apple-system, sans-serif);
      overflow: hidden;
      position: relative;
      box-shadow:
        0 2px 4px rgba(0,0,0,0.3),
        0 8px 24px rgba(0,0,0,0.5),
        0 24px 48px rgba(0,0,0,0.4),
        inset 0 1px 0 rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.07);
      min-width: 280px;
    }

    /* Hintergrund-Glow oben */
    .mv-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 200px;
      background: radial-gradient(ellipse at 50% -20%, rgba(0,229,179,0.07) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    .mv-card > * { position: relative; z-index: 1; }

    /* ── Header ── */
    .mv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .mv-title-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mv-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #00e5b3 0%, #0096c7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,229,179,0.3);
    }

    .mv-title { font-size: 15px; font-weight: 600; color: #f1f5f9; letter-spacing: 0.2px; }
    .mv-subtitle { font-size: 10px; color: #475569; text-transform: uppercase; letter-spacing: 1px; margin-top: 1px; }

    .mv-status-bar { display: flex; align-items: center; gap: 6px; }

    .mv-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 500;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.07);
      color: #64748b;
      transition: all 0.3s;
    }
    .mv-pill.on { color: #00e5b3; border-color: rgba(0,229,179,0.2); background: rgba(0,229,179,0.07); }
    .mv-pill.off { color: #ef4444; border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.07); }

    .mv-alarm-dot {
      width: 9px; height: 9px;
      border-radius: 50%;
      background: #4b5563;
      transition: all 0.3s;
    }
    .mv-alarm-dot.ok {
      background: #22c55e;
      box-shadow: 0 0 8px rgba(34,197,94,0.6);
    }
    .mv-alarm-dot.warning {
      background: #f59e0b;
      box-shadow: 0 0 8px rgba(245,158,11,0.6);
      animation: mv-pulse 2s ease-in-out infinite;
    }
    .mv-alarm-dot.fault {
      background: #ef4444;
      box-shadow: 0 0 10px rgba(239,68,68,0.8);
      animation: mv-pulse 1s ease-in-out infinite;
    }

    @keyframes mv-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.75); }
    }

    /* ── SOC + Power Sektion ── */
    .mv-soc-section {
      display: flex;
      align-items: center;
      padding: 16px 20px 10px;
      gap: 16px;
    }

    .mv-gauge-wrap { position: relative; flex-shrink: 0; }

    .mv-gauge-svg {
      width: 160px;
      height: 115px;
      display: block;
    }

    .mv-gauge-fill {
      transition: stroke-dasharray 1.4s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease;
    }

    .mv-power-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
    }

    .mv-power-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.8px;
      color: #475569;
      font-weight: 600;
    }

    .mv-power-big {
      font-size: 30px;
      font-weight: 200;
      color: #f1f5f9;
      letter-spacing: -1px;
      line-height: 1;
      white-space: nowrap;
    }
    .mv-power-big .mv-unit {
      font-size: 13px;
      color: #64748b;
      font-weight: 400;
      letter-spacing: 0;
    }

    .mv-direction-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 11px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      width: fit-content;
      letter-spacing: 0.3px;
      transition: all 0.4s;
    }
    .mv-direction-badge.charging {
      background: rgba(0,229,179,0.13);
      color: #00e5b3;
      border: 1px solid rgba(0,229,179,0.25);
    }
    .mv-direction-badge.discharging {
      background: rgba(255,112,67,0.13);
      color: #ff7043;
      border: 1px solid rgba(255,112,67,0.25);
    }
    .mv-direction-badge.standby {
      background: rgba(100,116,139,0.1);
      color: #64748b;
      border: 1px solid rgba(100,116,139,0.15);
    }

    /* Animierter Fluss-Balken */
    .mv-flow-track {
      height: 3px;
      background: rgba(255,255,255,0.05);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 2px;
    }
    .mv-flow-runner {
      height: 100%;
      width: 40%;
      border-radius: 2px;
    }
    .mv-flow-runner.charging {
      background: linear-gradient(90deg, transparent 0%, #00e5b3 50%, transparent 100%);
      animation: mv-flow-right 1.8s linear infinite;
    }
    .mv-flow-runner.discharging {
      background: linear-gradient(90deg, transparent 0%, #ff7043 50%, transparent 100%);
      animation: mv-flow-left 1.8s linear infinite;
    }
    .mv-flow-runner.standby {
      background: rgba(100,116,139,0.2);
      width: 100%;
    }

    @keyframes mv-flow-right {
      0%   { transform: translateX(-150%); }
      100% { transform: translateX(350%); }
    }
    @keyframes mv-flow-left {
      0%   { transform: translateX(350%); }
      100% { transform: translateX(-150%); }
    }

    .mv-inverter-state {
      font-size: 10px;
      color: #475569;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mv-inverter-state span { color: #94a3b8; }

    /* ── Modus-Badges ── */
    .mv-mode-row {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      padding: 2px 20px 14px;
    }

    .mv-mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 11px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border: 1px solid;
      transition: all 0.3s;
    }
    .mv-mode-badge.charge {
      background: rgba(0,229,179,0.09);
      color: #00e5b3;
      border-color: rgba(0,229,179,0.22);
    }
    .mv-mode-badge.discharge {
      background: rgba(255,112,67,0.09);
      color: #ff7043;
      border-color: rgba(255,112,67,0.22);
    }
    .mv-mode-badge.auto {
      background: rgba(129,140,248,0.09);
      color: #818cf8;
      border-color: rgba(129,140,248,0.22);
    }
    .mv-mode-badge.neutral {
      background: rgba(100,116,139,0.09);
      color: #64748b;
      border-color: rgba(100,116,139,0.15);
    }

    /* ── Divider ── */
    .mv-sep {
      height: 1px;
      background: rgba(255,255,255,0.05);
      margin: 0 16px;
    }

    /* ── Stats-Raster ── */
    .mv-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 14px 14px;
    }
    @media (max-width: 380px) {
      .mv-stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .mv-stat {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 13px;
      padding: 12px 8px;
      text-align: center;
      transition: background 0.2s, transform 0.2s;
      cursor: default;
    }
    .mv-stat:hover {
      background: rgba(255,255,255,0.07);
      transform: translateY(-2px);
    }

    .mv-stat-ico { font-size: 16px; display: block; margin-bottom: 6px; }
    .mv-stat-val {
      font-size: 16px;
      font-weight: 500;
      line-height: 1;
      margin-bottom: 4px;
      color: #f1f5f9;
    }
    .mv-stat-lbl {
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #475569;
      font-weight: 600;
    }

    .mv-stat.s-charge .mv-stat-val { color: #00e5b3; }
    .mv-stat.s-discharge .mv-stat-val { color: #ff7043; }
    .mv-stat.s-stored .mv-stat-val { color: #818cf8; }
    .mv-stat.s-cycle .mv-stat-val { color: #f59e0b; }

    /* ── AC-Leistungs-Balken ── */
    .mv-ac-section { padding: 0 16px 14px; }

    .mv-ac-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }
    .mv-ac-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #475569; font-weight: 600; }
    .mv-ac-val { font-size: 14px; font-weight: 500; color: #818cf8; }

    .mv-ac-track {
      height: 5px;
      background: rgba(255,255,255,0.05);
      border-radius: 3px;
      overflow: hidden;
    }
    .mv-ac-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #818cf8, #a78bfa);
      border-radius: 3px;
      transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Detail-Karten ── */
    .mv-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 0 14px 14px;
    }
    @media (max-width: 360px) {
      .mv-details-grid { grid-template-columns: 1fr; }
    }

    .mv-detail-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 13px;
      padding: 13px 12px;
      transition: background 0.2s;
    }
    .mv-detail-card:hover { background: rgba(255,255,255,0.065); }

    .mv-dc-title {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #475569;
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .mv-dr {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .mv-dr:last-child { border-bottom: none; }
    .mv-dr-name { font-size: 10px; color: #64748b; }
    .mv-dr-val  { font-size: 11px; font-weight: 500; color: #cbd5e1; }

    /* Zell-Balance-Indikator */
    .mv-cell-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
    }
    .mv-cell-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
    }
    .mv-cell-txt { font-size: 10px; color: #64748b; }

    /* ── Steuerbuttons ── */
    .mv-controls {
      display: flex;
      gap: 8px;
      padding: 0 14px 14px;
    }

    .mv-ctrl-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 11px 6px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      cursor: pointer;
      transition: all 0.22s ease;
      font-family: inherit;
    }
    .mv-ctrl-btn:hover {
      background: rgba(255,255,255,0.09);
      color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .mv-ctrl-btn:active { transform: translateY(0); }

    .mv-ctrl-btn .mv-btn-ico { font-size: 18px; }

    .mv-ctrl-btn.active-charge {
      background: rgba(0,229,179,0.13);
      color: #00e5b3;
      border-color: rgba(0,229,179,0.3);
      box-shadow: 0 0 16px rgba(0,229,179,0.15), inset 0 1px 0 rgba(0,229,179,0.1);
    }
    .mv-ctrl-btn.active-discharge {
      background: rgba(255,112,67,0.13);
      color: #ff7043;
      border-color: rgba(255,112,67,0.3);
      box-shadow: 0 0 16px rgba(255,112,67,0.15), inset 0 1px 0 rgba(255,112,67,0.1);
    }
    .mv-ctrl-btn.active-auto {
      background: rgba(129,140,248,0.13);
      color: #818cf8;
      border-color: rgba(129,140,248,0.3);
      box-shadow: 0 0 16px rgba(129,140,248,0.15), inset 0 1px 0 rgba(129,140,248,0.1);
    }

    /* ── Footer ── */
    .mv-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .mv-footer-time { font-size: 10px; color: #334155; }
    .mv-footer-ver  { font-size: 9px; color: rgba(255,255,255,0.1); }

    /* ── Nicht konfiguriert / Unavailable ── */
    .mv-setup-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 40px 24px;
      text-align: center;
      color: #64748b;
    }
    .mv-setup-ico { font-size: 48px; opacity: 0.5; }
    .mv-setup-title { font-size: 15px; font-weight: 500; color: #94a3b8; }
    .mv-setup-desc  { font-size: 12px; line-height: 1.6; }
    .mv-setup-tag {
      padding: 4px 12px;
      border-radius: 20px;
      background: rgba(0,229,179,0.1);
      border: 1px solid rgba(0,229,179,0.2);
      color: #00e5b3;
      font-size: 11px;
      font-weight: 600;
    }
  `;

  // ─── Editor CSS ────────────────────────────────────────────────────────────
  const EDITOR_CSS = `
    .ed-wrap {
      padding: 12px 0;
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
    }

    .ed-section { margin-bottom: 20px; }

    .ed-section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--secondary-text-color, #64748b);
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ed-section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--divider-color, rgba(0,0,0,0.1));
    }

    .ed-row { margin-bottom: 10px; }

    .ed-label {
      font-size: 11px;
      color: var(--secondary-text-color, #64748b);
      font-weight: 500;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .ed-req {
      font-size: 9px;
      background: var(--error-color, #ef4444);
      color: white;
      padding: 1px 5px;
      border-radius: 4px;
      font-weight: 700;
    }

    .ed-discover-btn {
      width: 100%;
      padding: 11px 16px;
      border-radius: 10px;
      border: 1px solid var(--primary-color, #00e5b3);
      background: transparent;
      color: var(--primary-color, #00e5b3);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .ed-discover-btn:hover {
      background: var(--primary-color, #00e5b3);
      color: white;
    }

    .ed-result {
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .ed-result.ok  { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
    .ed-result.partial { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
    .ed-result.none { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }

    ha-textfield, ha-entity-picker { display: block; width: 100%; margin-bottom: 8px; }

    .ed-toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
    }
    .ed-toggle-row:last-child { border-bottom: none; }
    .ed-toggle-info { flex: 1; }
    .ed-toggle-name { font-size: 13px; color: var(--primary-text-color); }
    .ed-toggle-desc { font-size: 11px; color: var(--secondary-text-color); margin-top: 2px; }

    .ed-hint {
      font-size: 11px;
      color: var(--secondary-text-color);
      padding: 8px 10px;
      background: rgba(0,0,0,0.04);
      border-radius: 6px;
      line-height: 1.5;
      margin-top: 4px;
    }
  `;

  // ─── Haupt-Card Element ───────────────────────────────────────────────────
  class MarstekVenusDashboard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._hass = null;
      this._config = null;
      this._pending = false;
    }

    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }

    static getStubConfig() {
      return {
        title: 'Marstek Venus',
        entity_prefix: '',
        entities: {},
        show_controls: true,
        show_health: true,
        show_energy_stats: true,
        show_ac: true,
      };
    }

    setConfig(config) {
      if (!config) throw new Error('Keine Konfiguration angegeben');
      this._config = {
        title: 'Marstek Venus',
        entity_prefix: '',
        show_controls: true,
        show_health: true,
        show_energy_stats: true,
        show_ac: true,
        ...config,
        entities: { ...(config.entities || {}) },
      };
      this._schedule();
    }

    set hass(hass) {
      this._hass = hass;
      this._schedule();
    }

    get hass() { return this._hass; }

    getCardSize() { return 9; }

    _schedule() {
      if (this._pending) return;
      this._pending = true;
      requestAnimationFrame(() => { this._pending = false; this._render(); });
    }

    // ── Entitäts-Helfer ──────────────────────────────────────────────────
    _state(key, fallback = null) {
      if (!this._hass || !this._config) return fallback;
      const id = this._config.entities[key];
      if (!id) return fallback;
      const obj = this._hass.states[id];
      return obj ? obj.state : fallback;
    }

    _stateObj(key) {
      if (!this._hass || !this._config) return null;
      const id = this._config.entities[key];
      return id ? (this._hass.states[id] || null) : null;
    }

    _num(key, fallback = null) {
      const s = this._state(key);
      if (s === null || s === 'unavailable' || s === 'unknown') return fallback;
      const n = parseFloat(s);
      return isNaN(n) ? fallback : n;
    }

    _callSvc(domain, service, data) {
      if (this._hass) this._hass.callService(domain, service, data);
    }

    // ── Alarm-Status ─────────────────────────────────────────────────────
    _alarmStatus() {
      const fault = this._state('fault_status', '');
      const alarm = this._state('alarm_status', '');
      const clean = ['OK','ok','None','none','0','Normal','normal','','Kein Fehler'];
      if (!fault && !alarm) return 'unknown';
      if (clean.includes(String(fault).trim()) && clean.includes(String(alarm).trim())) return 'ok';
      if (['Fault','fault','Error','error','Fehler'].includes(String(fault).trim())) return 'fault';
      return 'warning';
    }

    // ── Richtung ─────────────────────────────────────────────────────────
    _direction(power) {
      if (power === null) return 'standby';
      if (power > 30) return 'charging';
      if (power < -30) return 'discharging';
      return 'standby';
    }

    // ── Render ───────────────────────────────────────────────────────────
    _render() {
      if (!this._config) return;

      const cfg = this._config;

      // Prüfen ob Pflicht-Entitäten vorhanden
      const hasSoc = !!cfg.entities.battery_soc || !!cfg.entities.system_soc;
      if (!hasSoc) {
        this.shadowRoot.innerHTML = `
          <style>${CARD_CSS}</style>
          <div class="mv-card">
            <div class="mv-setup-hint">
              <div class="mv-setup-ico">🔋</div>
              <div class="mv-setup-title">Marstek Venus Dashboard</div>
              <div class="mv-setup-desc">
                Bitte konfiguriere die Karte über den Lovelace-Editor.<br>
                Klicke auf ✏ (Bearbeiten) und weise deine Entitäten zu.
              </div>
              <div class="mv-setup-tag">⚙ Karte konfigurieren</div>
            </div>
          </div>`;
        return;
      }

      // ── Datenwerte abrufen ─────────────────────────────────────
      const soc = this._num('battery_soc') ?? this._num('system_soc');
      const rawPower = this._num('battery_power');
      // Bei Multi-Batterie: Differenz aus Lade-/Entladeleistung
      const power = rawPower !== null
        ? rawPower
        : (() => {
            const cp = this._num('system_charge_power', 0);
            const dp = this._num('system_discharge_power', 0);
            return cp > dp ? cp : -dp;
          })();

      const acPower       = this._num('ac_power');
      const temp          = this._num('internal_temperature');
      const voltage       = this._num('battery_voltage');
      const maxCell       = this._num('max_cell_voltage');
      const minCell       = this._num('min_cell_voltage');
      const dailyCharge   = this._num('total_daily_charging_energy') ?? this._num('system_daily_charging_energy');
      const dailyDisc     = this._num('total_daily_discharging_energy') ?? this._num('system_daily_discharging_energy');
      const totalCharge   = this._num('total_charging_energy');
      const totalDisc     = this._num('total_discharging_energy');
      const stored        = this._num('stored_energy');
      const cycles        = this._num('battery_cycle_count_calc');
      const efficiency    = this._num('round_trip_efficiency_total');
      const forceMode     = this._state('force_mode');
      const workMode      = this._state('user_work_mode');
      const invState      = this._state('inverter_state');
      const wifiState     = this._state('wifi_status');
      const cloudState    = this._state('cloud_status');

      // ── Berechnete Werte ───────────────────────────────────────
      const dir = this._direction(power);
      const alarm = this._alarmStatus();
      const col = socColor(soc);
      const forceClass = getForceModeClass(forceMode);
      const isCharge = FORCE_MODE_CHARGE.includes(forceMode);
      const isDischarge = FORCE_MODE_DISCHARGE.includes(forceMode);
      const isAuto = !isCharge && !isDischarge;

      const cellDelta = (maxCell !== null && minCell !== null) ? Math.round((maxCell - minCell) * 1000) : null;
      const cellColor = cellDelta === null ? '#4b5563'
        : cellDelta < 50 ? '#22c55e'
        : cellDelta < 100 ? '#f59e0b'
        : '#ef4444';

      const acPct = acPower !== null ? Math.min(100, (Math.abs(acPower) / 3000) * 100) : 0;

      const hasForce = !!cfg.entities.force_mode;
      const showCtrl = cfg.show_controls && hasForce;

      // Letztes Update
      const lastUpd = (() => {
        const o = this._stateObj('battery_soc') || this._stateObj('system_soc');
        if (!o) return null;
        return new Date(o.last_updated).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      })();

      // WiFi / Cloud
      const wifiOn  = wifiState  === 'on' || wifiState  === 'true';
      const cloudOn = cloudState === 'on' || cloudState === 'true';

      // Force-Mode Beschriftung
      const modeLabelMap = {
        'Force Charge': 'Laden erzwungen', 'force_charge': 'Laden erzwungen',
        'Force Discharge': 'Entladen erzwungen', 'force_discharge': 'Entladen erzwungen',
        'Auto': 'Automatik', 'auto': 'Automatik',
        'Self Consumption': 'Eigenverbrauch', 'self_consumption': 'Eigenverbrauch',
        'Backup': 'Backup-Modus',
      };
      const modeLabel = forceMode ? (modeLabelMap[forceMode] || forceMode.replace(/_/g, ' ')) : null;
      const workLabel = workMode ? (modeLabelMap[workMode] || workMode.replace(/_/g, ' ')) : null;

      const dirLabel = { charging: 'Laden', discharging: 'Entladen', standby: 'Bereitschaft' };
      const dirIcon  = { charging: '↑', discharging: '↓', standby: '◎' };

      // ── HTML zusammenbauen ────────────────────────────────────
      const html = `
        <style>${CARD_CSS}</style>
        <div class="mv-card" role="region" aria-label="${cfg.title} Batterie Dashboard">

          <!-- HEADER -->
          <div class="mv-header">
            <div class="mv-title-area">
              <div class="mv-icon-box" aria-hidden="true">🔋</div>
              <div>
                <div class="mv-title">${cfg.title}</div>
                <div class="mv-subtitle">Energy Storage System</div>
              </div>
            </div>
            <div class="mv-status-bar">
              ${cfg.entities.wifi_status ? `
                <div class="mv-pill ${wifiOn ? 'on' : 'off'}" title="WLAN: ${wifiOn ? 'Verbunden' : 'Getrennt'}">
                  📶 ${wifiOn ? 'WLAN' : 'Offline'}
                </div>` : ''}
              ${cfg.entities.cloud_status ? `
                <div class="mv-pill ${cloudOn ? 'on' : 'off'}" title="Cloud: ${cloudOn ? 'Online' : 'Offline'}">
                  ☁
                </div>` : ''}
              <div class="mv-alarm-dot ${alarm === 'ok' ? 'ok' : alarm === 'warning' ? 'warning' : alarm === 'fault' ? 'fault' : ''}"
                   title="${alarm === 'ok' ? 'Kein Alarm' : alarm === 'fault' ? 'Fehler!' : alarm === 'warning' ? 'Warnung' : 'Unbekannt'}">
              </div>
            </div>
          </div>

          <!-- SOC GAUGE + LEISTUNG -->
          <div class="mv-soc-section">
            <div class="mv-gauge-wrap">
              ${buildGauge(soc, col)}
            </div>
            <div class="mv-power-panel">
              <div class="mv-power-label">Batterieleistung</div>
              <div class="mv-power-big">
                ${power !== null
                  ? `${Math.abs(power) >= 1000
                      ? (Math.abs(power) / 1000).toFixed(2)
                      : Math.round(Math.abs(power))}`
                  : '—'}
                <span class="mv-unit">${power !== null ? (Math.abs(power) >= 1000 ? ' kW' : ' W') : ''}</span>
              </div>
              <div class="mv-direction-badge ${dir}">
                <span>${dirIcon[dir]}</span>
                <span>${dirLabel[dir]}</span>
              </div>
              <div class="mv-flow-track">
                <div class="mv-flow-runner ${dir}"></div>
              </div>
              ${invState ? `
                <div class="mv-inverter-state">Status: <span>${invState}</span></div>
              ` : ''}
            </div>
          </div>

          <!-- MODUS-BADGES -->
          ${(modeLabel || workLabel) ? `
          <div class="mv-mode-row">
            ${modeLabel ? `<div class="mv-mode-badge ${forceClass}">⚙ ${modeLabel}</div>` : ''}
            ${workLabel && workLabel !== modeLabel ? `<div class="mv-mode-badge neutral">◎ ${workLabel}</div>` : ''}
          </div>` : '<div style="padding-bottom:6px"></div>'}

          <div class="mv-sep"></div>

          <!-- ENERGIE-STATISTIKEN -->
          ${cfg.show_energy_stats ? `
          <div class="mv-stats-grid">
            <div class="mv-stat s-charge" title="Heute geladen">
              <span class="mv-stat-ico">↑</span>
              <div class="mv-stat-val">${dailyCharge !== null ? dailyCharge.toFixed(1) : '—'}</div>
              <div class="mv-stat-lbl">kWh Laden</div>
            </div>
            <div class="mv-stat s-discharge" title="Heute entladen">
              <span class="mv-stat-ico">↓</span>
              <div class="mv-stat-val">${dailyDisc !== null ? dailyDisc.toFixed(1) : '—'}</div>
              <div class="mv-stat-lbl">kWh Entladen</div>
            </div>
            <div class="mv-stat s-stored" title="Aktuell gespeicherte Energie">
              <span class="mv-stat-ico">🔋</span>
              <div class="mv-stat-val">${stored !== null ? stored.toFixed(1) : (soc !== null ? '—' : '—')}</div>
              <div class="mv-stat-lbl">kWh Gespeich.</div>
            </div>
            <div class="mv-stat s-cycle" title="Gesamte Ladezyklen">
              <span class="mv-stat-ico">↺</span>
              <div class="mv-stat-val">${cycles !== null ? Math.round(cycles) : '—'}</div>
              <div class="mv-stat-lbl">Zyklen</div>
            </div>
          </div>
          <div class="mv-sep"></div>` : ''}

          <!-- AC-LEISTUNG -->
          ${cfg.show_ac && acPower !== null ? `
          <div class="mv-ac-section" style="padding-top:13px;">
            <div class="mv-ac-head">
              <span class="mv-ac-label">⚡ AC-Leistung</span>
              <span class="mv-ac-val">${formatPower(acPower)}</span>
            </div>
            <div class="mv-ac-track">
              <div class="mv-ac-bar" style="width:${acPct.toFixed(1)}%"></div>
            </div>
          </div>
          <div class="mv-sep"></div>` : ''}

          <!-- DETAIL-KARTEN: Batterie + Energie -->
          ${cfg.show_health ? `
          <div class="mv-details-grid">

            <!-- Batterie-Gesundheit -->
            <div class="mv-detail-card">
              <div class="mv-dc-title">🔧 Batterie</div>
              ${temp !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">🌡 Temperatur</span>
                  <span class="mv-dr-val" style="color:${tempColor(temp)}">${temp.toFixed(1)} °C</span>
                </div>` : ''}
              ${voltage !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">⚡ Spannung</span>
                  <span class="mv-dr-val">${voltage.toFixed(1)} V</span>
                </div>` : ''}
              ${maxCell !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">▲ Zelle max</span>
                  <span class="mv-dr-val">${maxCell.toFixed(3)} V</span>
                </div>` : ''}
              ${minCell !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">▼ Zelle min</span>
                  <span class="mv-dr-val">${minCell.toFixed(3)} V</span>
                </div>` : ''}
              ${cellDelta !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">△ Balance</span>
                  <span class="mv-dr-val" style="color:${cellColor}">${cellDelta} mV</span>
                </div>
                <div class="mv-cell-indicator">
                  <div class="mv-cell-dot" style="background:${cellColor};box-shadow:0 0 5px ${cellColor}80;"></div>
                  <span class="mv-cell-txt">${cellDelta < 50 ? 'Gut balanciert' : cellDelta < 100 ? 'Leichte Unbalance' : 'Hohe Unbalance'}</span>
                </div>` : ''}
              ${efficiency !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">📈 Effizienz</span>
                  <span class="mv-dr-val" style="color:#00e5b3">${efficiency.toFixed(1)} %</span>
                </div>` : ''}
            </div>

            <!-- Energie-Gesamtwerte -->
            <div class="mv-detail-card">
              <div class="mv-dc-title">📊 Energie</div>
              ${totalCharge !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">↑ Gesamt geladen</span>
                  <span class="mv-dr-val" style="color:#00e5b3">${formatEnergy(totalCharge)}</span>
                </div>` : ''}
              ${totalDisc !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">↓ Gesamt entladen</span>
                  <span class="mv-dr-val" style="color:#ff7043">${formatEnergy(totalDisc)}</span>
                </div>` : ''}
              ${dailyCharge !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">↑ Heute geladen</span>
                  <span class="mv-dr-val">${dailyCharge.toFixed(2)} kWh</span>
                </div>` : ''}
              ${dailyDisc !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">↓ Heute entladen</span>
                  <span class="mv-dr-val">${dailyDisc.toFixed(2)} kWh</span>
                </div>` : ''}
              ${cycles !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">↺ Zyklen gesamt</span>
                  <span class="mv-dr-val" style="color:#f59e0b">${Math.round(cycles)}</span>
                </div>` : ''}
              ${efficiency !== null ? `
                <div class="mv-dr">
                  <span class="mv-dr-name">📈 Wirkungsgrad</span>
                  <span class="mv-dr-val">${efficiency.toFixed(1)} %</span>
                </div>` : ''}
            </div>
          </div>
          <div class="mv-sep"></div>` : ''}

          <!-- STEUERBUTTONS -->
          ${showCtrl ? `
          <div class="mv-controls">
            <button class="mv-ctrl-btn ${isCharge ? 'active-charge' : ''}"
                    data-mv-action="charge"
                    title="Laden erzwingen">
              <span class="mv-btn-ico">⚡</span>
              <span>Laden</span>
            </button>
            <button class="mv-ctrl-btn ${isDischarge ? 'active-discharge' : ''}"
                    data-mv-action="discharge"
                    title="Entladen erzwingen">
              <span class="mv-btn-ico">⬇</span>
              <span>Entladen</span>
            </button>
            <button class="mv-ctrl-btn ${isAuto ? 'active-auto' : ''}"
                    data-mv-action="auto"
                    title="Automatik-Modus">
              <span class="mv-btn-ico">◎</span>
              <span>Automatik</span>
            </button>
          </div>` : ''}

          <!-- FOOTER -->
          <div class="mv-footer">
            <span class="mv-footer-time">${lastUpd ? `Aktualisiert: ${lastUpd}` : 'Warte auf Daten…'}</span>
            <span class="mv-footer-ver">Marstek Venus Dashboard v${VERSION}</span>
          </div>

        </div>
      `;

      this.shadowRoot.innerHTML = html;

      // Event-Listener für Steuerbuttons
      if (showCtrl) {
        this.shadowRoot.querySelectorAll('[data-mv-action]').forEach(btn => {
          btn.addEventListener('click', () => {
            const action = btn.dataset.mvAction;
            const entityId = cfg.entities.force_mode;
            if (!entityId) return;
            const opts = {
              charge:    'Force Charge',
              discharge: 'Force Discharge',
              auto:      'Auto',
            };
            this._callSvc('select', 'select_option', {
              entity_id: entityId,
              option: opts[action] || 'Auto',
            });
          });
        });
      }
    }
  }

  // ─── Konfigurations-Editor ─────────────────────────────────────────────────
  class MarstekVenusDashboardEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = {};
      this._hass = null;
      this._discoverMsg = null;
      this._discoverType = null;
    }

    set hass(hass) {
      this._hass = hass;
    }

    setConfig(config) {
      this._config = JSON.parse(JSON.stringify(config || {}));
      if (!this._config.entities) this._config.entities = {};
      this._render();
    }

    _fire() {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: JSON.parse(JSON.stringify(this._config)) },
        bubbles: true,
        composed: true,
      }));
    }

    _autoDiscover() {
      if (!this._hass) return;
      const states = this._hass.states;
      const prefix = (this._config.entity_prefix || '').toLowerCase().replace(/[^a-z0-9_]/g, '_');
      let found = 0;
      let total = 0;

      ENTITY_DEFS.forEach(def => {
        total++;
        if (this._config.entities[def.key]) return; // schon gesetzt

        // Suchstrategie: nach Entitäts-ID mit passendem Key suchen
        for (const id of Object.keys(states)) {
          const [dom, ...rest] = id.split('.');
          if (dom !== def.domain) continue;
          const lower = rest.join('.').toLowerCase();

          const keyVariants = [def.key, def.key.replace(/_/g, '')];
          const matchesKey = keyVariants.some(k => lower.endsWith('_' + k) || lower === k || lower.includes('_' + k + '_'));

          const matchesMarstek = lower.includes('marstek') || (prefix && lower.startsWith(prefix));

          if (matchesKey && matchesMarstek) {
            this._config.entities[def.key] = id;
            found++;
            break;
          }
        }
      });

      // Fallback: Exakte Muster probieren
      ENTITY_DEFS.forEach(def => {
        if (this._config.entities[def.key]) return;
        const candidates = [
          `${def.domain}.marstek_venus_energy_manager_${def.key}`,
          `${def.domain}.marstek_venus_${def.key}`,
          `${def.domain}.marstek_${def.key}`,
        ];
        if (prefix) {
          candidates.unshift(`${def.domain}.${prefix}_${def.key}`);
        }
        for (const c of candidates) {
          if (states[c]) {
            this._config.entities[def.key] = c;
            found++;
            break;
          }
        }
      });

      if (found === 0) {
        this._discoverType = 'none';
        this._discoverMsg = '⚠ Keine Marstek-Entitäten gefunden. Bitte prüfe den Geräte-Prefix und die Integration.';
      } else if (found < 5) {
        this._discoverType = 'partial';
        this._discoverMsg = `✓ ${found} Entität${found === 1 ? '' : 'en'} gefunden (von ${total} möglichen). Restliche bitte manuell zuweisen.`;
      } else {
        this._discoverType = 'ok';
        this._discoverMsg = `✓ ${found} Entität${found === 1 ? '' : 'en'} automatisch gefunden und zugewiesen!`;
      }

      this._fire();
      this._render();
    }

    _render() {
      const cfg = this._config;
      const ents = cfg.entities || {};

      const entityRows = ENTITY_DEFS.map(def => `
        <div class="ed-row">
          <div class="ed-label">
            ${def.label}
            ${def.required ? '<span class="ed-req">PFLICHT</span>' : ''}
          </div>
          <ha-entity-picker
            allow-custom-entity
            .hass="${this._hass}"
            .value="${ents[def.key] || ''}"
            .includeDomains="${[def.domain]}"
            data-key="${def.key}"
          ></ha-entity-picker>
        </div>
      `).join('');

      const toggles = [
        { key: 'show_controls',    label: 'Steuerbuttons anzeigen',  desc: 'Lade/Entlade/Automatik-Buttons' },
        { key: 'show_energy_stats',label: 'Energie-Statistiken',      desc: 'Tages- und Gesamtenergiewerte' },
        { key: 'show_health',      label: 'Batterie-Gesundheit',      desc: 'Temperatur, Zellspannung, Effizienz' },
        { key: 'show_ac',          label: 'AC-Leistung anzeigen',     desc: 'Balkendiagramm der AC-Leistung' },
      ];

      this.shadowRoot.innerHTML = `
        <style>${EDITOR_CSS}</style>
        <div class="ed-wrap">

          <div class="ed-section">
            <div class="ed-section-title">🔧 Allgemein</div>
            <div class="ed-row">
              <div class="ed-label">Kartenname</div>
              <ha-textfield
                label="Titel"
                .value="${cfg.title || 'Marstek Venus'}"
                data-field="title"
              ></ha-textfield>
            </div>
            <div class="ed-row">
              <div class="ed-label">Geräte-Prefix (für Auto-Erkennung)</div>
              <ha-textfield
                label="z.B. marstek_venus oder meine_batterie"
                .value="${cfg.entity_prefix || ''}"
                data-field="entity_prefix"
              ></ha-textfield>
              <div class="ed-hint">
                Prefix aus deinen Entitäts-IDs — z.B. bei <code>sensor.marstek_venus_battery_soc</code>
                wäre es <strong>marstek_venus</strong>
              </div>
            </div>
          </div>

          <div class="ed-section">
            <div class="ed-section-title">🔍 Auto-Erkennung</div>
            <button class="ed-discover-btn" id="discoverBtn">
              🔍 Entitäten automatisch erkennen
            </button>
            ${this._discoverMsg ? `
              <div class="ed-result ${this._discoverType}">${this._discoverMsg}</div>
            ` : ''}
          </div>

          <div class="ed-section">
            <div class="ed-section-title">📡 Entitäten</div>
            ${entityRows}
          </div>

          <div class="ed-section">
            <div class="ed-section-title">👁 Anzeige</div>
            ${toggles.map(t => `
              <div class="ed-toggle-row">
                <div class="ed-toggle-info">
                  <div class="ed-toggle-name">${t.label}</div>
                  <div class="ed-toggle-desc">${t.desc}</div>
                </div>
                <ha-switch
                  .checked="${cfg[t.key] !== false}"
                  data-toggle="${t.key}"
                ></ha-switch>
              </div>
            `).join('')}
          </div>

        </div>
      `;

      // Auto-Discover Button
      this.shadowRoot.getElementById('discoverBtn')?.addEventListener('click', () => {
        this._autoDiscover();
      });

      // Textfelder
      this.shadowRoot.querySelectorAll('ha-textfield[data-field]').forEach(el => {
        el.addEventListener('change', (e) => {
          this._config[el.dataset.field] = e.target.value;
          this._fire();
        });
        el.addEventListener('input', (e) => {
          this._config[el.dataset.field] = e.target.value;
        });
      });

      // Entitäts-Picker
      this.shadowRoot.querySelectorAll('ha-entity-picker[data-key]').forEach(el => {
        el.hass = this._hass;
        el.addEventListener('value-changed', (e) => {
          const key = el.dataset.key;
          if (e.detail.value) {
            this._config.entities[key] = e.detail.value;
          } else {
            delete this._config.entities[key];
          }
          this._fire();
        });
      });

      // Toggles
      this.shadowRoot.querySelectorAll('ha-switch[data-toggle]').forEach(el => {
        el.addEventListener('change', (e) => {
          this._config[el.dataset.toggle] = e.target.checked;
          this._fire();
        });
      });
    }
  }

  // ─── Registrierung ────────────────────────────────────────────────────────
  if (!customElements.get(EDITOR_TAG)) {
    customElements.define(EDITOR_TAG, MarstekVenusDashboardEditor);
  }

  if (!customElements.get(CARD_TAG)) {
    customElements.define(CARD_TAG, MarstekVenusDashboard);
  }

  // HACS / Lovelace Card-Registrierung
  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === CARD_TAG)) {
    window.customCards.push({
      type: CARD_TAG,
      name: 'Marstek Venus Dashboard',
      description: 'Premium Dashboard-Karte für Marstek Venus Batteriespeicher (E v2/v3, A, D)',
      preview: true,
      documentationURL: 'https://github.com/ffunes/marstek-venus-energy-manager',
    });
  }

  console.info(
    `%c MARSTEK VENUS DASHBOARD %c v${VERSION} `,
    'background:#00e5b3;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px;',
    'background:#1e293b;color:#00e5b3;font-weight:600;padding:2px 4px;border-radius:0 3px 3px 0;',
  );

})();
