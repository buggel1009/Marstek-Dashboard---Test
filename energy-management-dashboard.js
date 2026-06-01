/**
 * Energy Management Dashboard Card
 * Premium Lovelace Dashboard für Batteriespeicher
 * HACS Frontend Plugin
 * Version: 1.3.0
 *
 * Universell: Marstek, Victron, Sungrow, Fronius, Huawei, Fox ESS und mehr
 */
(function () {
  'use strict';

  const VERSION = '3.0.0';
  const CARD_TAG = 'energy-management-dashboard';
  const EDITOR_TAG = 'energy-management-dashboard-editor';

  // ─── Entitäts-Definitionen (beide Integrationen) ─────────────────────────
  const ENTITY_DEFS = [
    // ── Pflichtfelder ──────────────────────────────────────────────────────
    { key: 'battery_soc',                     domain: 'sensor',        label: 'Batterieladezustand (SOC)',         required: true,  group: 'basis'    },
    { key: 'battery_power',                    domain: 'sensor',        label: 'Batterieleistung (W)',              required: true,  group: 'basis'    },
    // ── Batterie-Kern ──────────────────────────────────────────────────────
    { key: 'battery_voltage',                  domain: 'sensor',        label: 'Batteriespannung (V)',              required: false, group: 'batterie' },
    { key: 'battery_current',                  domain: 'sensor',        label: 'Batteriestrom (A)',                 required: false, group: 'batterie' },
    { key: 'battery_total_energy',             domain: 'sensor',        label: 'Batterie Kapazität (kWh)',          required: false, group: 'batterie' },
    { key: 'inverter_state',                   domain: 'sensor',        label: 'Wechselrichterstatus',              required: false, group: 'batterie' },
    // ── Temperaturen ──────────────────────────────────────────────────────
    { key: 'internal_temperature',             domain: 'sensor',        label: 'Innentemperatur (°C)',              required: false, group: 'temp'     },
    { key: 'internal_mos1_temperature',        domain: 'sensor',        label: 'MOS1 Temperatur (°C)',              required: false, group: 'temp'     },
    { key: 'internal_mos2_temperature',        domain: 'sensor',        label: 'MOS2 Temperatur (°C)',              required: false, group: 'temp'     },
    { key: 'max_cell_temperature',             domain: 'sensor',        label: 'Zelle max. Temperatur (°C)',        required: false, group: 'temp'     },
    { key: 'min_cell_temperature',             domain: 'sensor',        label: 'Zelle min. Temperatur (°C)',        required: false, group: 'temp'     },
    // ── Zellspannungen ────────────────────────────────────────────────────
    { key: 'max_cell_voltage',                 domain: 'sensor',        label: 'Zelle max. Spannung (V)',           required: false, group: 'zellen'   },
    { key: 'min_cell_voltage',                 domain: 'sensor',        label: 'Zelle min. Spannung (V)',           required: false, group: 'zellen'   },
    // ── AC-Netz ───────────────────────────────────────────────────────────
    { key: 'ac_power',                         domain: 'sensor',        label: 'AC-Leistung (W)',                   required: false, group: 'ac'       },
    { key: 'ac_voltage',                       domain: 'sensor',        label: 'AC-Spannung (V)',                   required: false, group: 'ac'       },
    { key: 'ac_current',                       domain: 'sensor',        label: 'AC-Strom (A)',                      required: false, group: 'ac'       },
    { key: 'ac_frequency',                     domain: 'sensor',        label: 'AC-Frequenz (Hz)',                  required: false, group: 'ac'       },
    // ── Off-Grid ──────────────────────────────────────────────────────────
    { key: 'ac_offgrid_power',                 domain: 'sensor',        label: 'Off-Grid AC-Leistung (W)',          required: false, group: 'offgrid'  },
    { key: 'ac_offgrid_voltage',               domain: 'sensor',        label: 'Off-Grid AC-Spannung (V)',          required: false, group: 'offgrid'  },
    { key: 'ac_offgrid_current',               domain: 'sensor',        label: 'Off-Grid AC-Strom (A)',             required: false, group: 'offgrid'  },
    // ── Solar / MPPT (Venus A, D) ─────────────────────────────────────────
    { key: 'mppt1_power',                      domain: 'sensor',        label: 'MPPT 1 Leistung (W)',               required: false, group: 'solar'    },
    { key: 'mppt1_voltage',                    domain: 'sensor',        label: 'MPPT 1 Spannung (V)',               required: false, group: 'solar'    },
    { key: 'mppt1_current',                    domain: 'sensor',        label: 'MPPT 1 Strom (A)',                  required: false, group: 'solar'    },
    { key: 'mppt2_power',                      domain: 'sensor',        label: 'MPPT 2 Leistung (W)',               required: false, group: 'solar'    },
    { key: 'mppt2_voltage',                    domain: 'sensor',        label: 'MPPT 2 Spannung (V)',               required: false, group: 'solar'    },
    { key: 'mppt2_current',                    domain: 'sensor',        label: 'MPPT 2 Strom (A)',                  required: false, group: 'solar'    },
    { key: 'mppt3_power',                      domain: 'sensor',        label: 'MPPT 3 Leistung (W)',               required: false, group: 'solar'    },
    { key: 'mppt3_voltage',                    domain: 'sensor',        label: 'MPPT 3 Spannung (V)',               required: false, group: 'solar'    },
    { key: 'mppt3_current',                    domain: 'sensor',        label: 'MPPT 3 Strom (A)',                  required: false, group: 'solar'    },
    { key: 'mppt4_power',                      domain: 'sensor',        label: 'MPPT 4 Leistung (W)',               required: false, group: 'solar'    },
    { key: 'mppt4_voltage',                    domain: 'sensor',        label: 'MPPT 4 Spannung (V)',               required: false, group: 'solar'    },
    { key: 'mppt4_current',                    domain: 'sensor',        label: 'MPPT 4 Strom (A)',                  required: false, group: 'solar'    },
    // ── Multi-Pack SOC (Venus A — bis 6 Einheiten) ───────────────────────
    { key: 'battery_soc_1',                    domain: 'sensor',        label: 'Pack 1 SOC (%)',                    required: false, group: 'packs'    },
    { key: 'battery_soc_2',                    domain: 'sensor',        label: 'Pack 2 SOC (%)',                    required: false, group: 'packs'    },
    { key: 'battery_soc_3',                    domain: 'sensor',        label: 'Pack 3 SOC (%)',                    required: false, group: 'packs'    },
    { key: 'battery_soc_4',                    domain: 'sensor',        label: 'Pack 4 SOC (%)',                    required: false, group: 'packs'    },
    { key: 'battery_soc_5',                    domain: 'sensor',        label: 'Pack 5 SOC (%)',                    required: false, group: 'packs'    },
    { key: 'battery_soc_6',                    domain: 'sensor',        label: 'Pack 6 SOC (%)',                    required: false, group: 'packs'    },
    // ── Energie (täglich) ─────────────────────────────────────────────────
    { key: 'total_daily_charging_energy',      domain: 'sensor',        label: 'Tagesladung (kWh)',                 required: false, group: 'energie'  },
    { key: 'total_daily_discharging_energy',   domain: 'sensor',        label: 'Tagesentladung (kWh)',              required: false, group: 'energie'  },
    // ── Energie (monatlich) — marstek_modbus ──────────────────────────────
    { key: 'total_monthly_charging_energy',    domain: 'sensor',        label: 'Monatsladung (kWh)',                required: false, group: 'energie'  },
    { key: 'total_monthly_discharging_energy', domain: 'sensor',        label: 'Monatsentladung (kWh)',             required: false, group: 'energie'  },
    // ── Energie (gesamt) ──────────────────────────────────────────────────
    { key: 'total_charging_energy',            domain: 'sensor',        label: 'Gesamtladung (kWh)',                required: false, group: 'energie'  },
    { key: 'total_discharging_energy',         domain: 'sensor',        label: 'Gesamtentladung (kWh)',             required: false, group: 'energie'  },
    { key: 'stored_energy',                    domain: 'sensor',        label: 'Gespeicherte Energie (kWh)',        required: false, group: 'energie'  },
    // ── Effizienz & Zyklen ────────────────────────────────────────────────
    { key: 'battery_cycle_count_calc',         domain: 'sensor',        label: 'Zyklenanzahl (berechnet)',          required: false, group: 'effizienz'},
    { key: 'battery_cycle_count',              domain: 'sensor',        label: 'Zyklenanzahl (Hardware-Zähler)',    required: false, group: 'effizienz'},
    { key: 'round_trip_efficiency_total',      domain: 'sensor',        label: 'Wirkungsgrad gesamt (%)',           required: false, group: 'effizienz'},
    { key: 'round_trip_efficiency_monthly',    domain: 'sensor',        label: 'Wirkungsgrad monatlich (%)',        required: false, group: 'effizienz'},
    { key: 'conversion_efficiency',            domain: 'sensor',        label: 'Umwandlungseffizienz (%)',          required: false, group: 'effizienz'},
    // ── Zell-Balance (ffunes: balance_sensors.py) ────────────────────────
    { key: 'balance_status',                   domain: 'sensor',        label: 'Balance - Status',                  required: false, group: 'balance'  },
    { key: 'balance_last_measurement',         domain: 'sensor',        label: 'Balance - Letzte Messung (mV)',     required: false, group: 'balance'  },
    { key: 'balance_delta_avg',                domain: 'sensor',        label: 'Balance - Delta-Durchschnitt (mV)',required: false, group: 'balance'  },
    { key: 'balance_cell_delta_100',           domain: 'sensor',        label: 'Balance - Zellendelta bei 100%',    required: false, group: 'balance'  },
    { key: 'balance_trend',                    domain: 'sensor',        label: 'Balance - Trend',                   required: false, group: 'balance'  },
    // ── Alarm ─────────────────────────────────────────────────────────────
    { key: 'fault_status',                     domain: 'sensor',        label: 'Fehlerstatus',                      required: false, group: 'alarm'    },
    { key: 'alarm_status',                     domain: 'sensor',        label: 'Alarmstatus',                       required: false, group: 'alarm'    },
    // ── Konnektivität ─────────────────────────────────────────────────────
    { key: 'wifi_status',                      domain: 'binary_sensor', label: 'WLAN-Status',                       required: false, group: 'netz'     },
    { key: 'cloud_status',                     domain: 'binary_sensor', label: 'Cloud-Status',                      required: false, group: 'netz'     },
    { key: 'wifi_signal_strength',             domain: 'sensor',        label: 'WLAN-Signalstärke (dBm)',           required: false, group: 'netz'     },
    // ── Steuerung ─────────────────────────────────────────────────────────
    { key: 'force_mode',                       domain: 'select',        label: 'Betriebsmodus erzwingen',           required: false, group: 'steuerung'},
    { key: 'user_work_mode',                   domain: 'select',        label: 'Arbeitsmodus',                      required: false, group: 'steuerung'},
    { key: 'set_charge_power',                 domain: 'number',        label: 'Ladeleistung einstellen (W)',       required: false, group: 'steuerung'},
    { key: 'set_discharge_power',              domain: 'number',        label: 'Entladeleistung einstellen (W)',    required: false, group: 'steuerung'},
    { key: 'charge_to_soc',                    domain: 'number',        label: 'Laden bis SOC (%)',                 required: false, group: 'steuerung'},
    { key: 'charging_cutoff_capacity',         domain: 'number',        label: 'Lade-SOC-Grenzwert (%)',            required: false, group: 'steuerung'},
    { key: 'discharging_cutoff_capacity',      domain: 'number',        label: 'Entlade-SOC-Grenzwert (%)',         required: false, group: 'steuerung'},
    { key: 'active_balance_mode',              domain: 'switch',        label: 'Aktiver Zellabgleich',              required: false, group: 'steuerung'},
    { key: 'battery_allow_charge',             domain: 'switch',        label: 'Laden Erlauben',                    required: false, group: 'steuerung'},
    { key: 'battery_allow_discharge',          domain: 'switch',        label: 'Entladen Erlauben',                 required: false, group: 'steuerung'},
    // ── Multi-Batterie Aggregat (ffunes-Integration) ───────────────────────
    { key: 'system_soc',                       domain: 'sensor',        label: 'System SOC (Multi-Batterie)',       required: false, group: 'multi'    },
    { key: 'system_charge_power',              domain: 'sensor',        label: 'System Ladeleistung (Multi)',       required: false, group: 'multi'    },
    { key: 'system_discharge_power',           domain: 'sensor',        label: 'System Entladeleistung (Multi)',    required: false, group: 'multi'    },
    { key: 'system_daily_charging_energy',     domain: 'sensor',        label: 'System Tagesladung (Multi)',        required: false, group: 'multi'    },
    { key: 'system_daily_discharging_energy',  domain: 'sensor',        label: 'System Tagesentladung (Multi)',     required: false, group: 'multi'    },
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

    .mv-card {
      background: #080f1c;
      border-radius: 24px;
      color: #dde4f0;
      font-family: var(--paper-font-body1_-_font-family, 'Inter', -apple-system, sans-serif);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      position: relative;
    }
    .mv-card::before {
      content: '';
      position: absolute;
      top: -60px; left: 50%;
      transform: translateX(-50%);
      width: 280px; height: 180px;
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(0,207,255,0.06) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    .mv-card > * { position: relative; z-index: 1; }

    /* ── Header ── */
    .mv-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 18px 12px;
    }
    .mv-hdr-l { display: flex; align-items: center; gap: 10px; }
    .mv-hdr-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,207,255,0.12);
    }
    .mv-hdr-name  { font-size: 14px; font-weight: 600; color: #e8eef8; letter-spacing: -0.2px; }
    .mv-hdr-brand { font-size: 10px; color: #2a3f55; margin-top: 1px; }
    .mv-hdr-r { display: flex; align-items: center; gap: 7px; }

    .mv-chip {
      display: flex; align-items: center; gap: 5px;
      font-size: 9px; font-weight: 600; padding: 4px 10px; border-radius: 20px;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .mv-chip.on  { background: rgba(0,207,255,0.08); color: #00cfff; border: 1px solid rgba(0,207,255,0.18); }
    .mv-chip.off { background: rgba(100,116,139,0.08); color: #374a65; border: 1px solid rgba(100,116,139,0.12); }
    .mv-chip-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .mv-chip.on .mv-chip-dot { box-shadow: 0 0 5px #00cfff; animation: mv-blink 2s ease-in-out infinite; }

    .mv-dot { width: 7px; height: 7px; border-radius: 50%; transition: all .3s; }
    .mv-dot.ok   { background: #22c55e; box-shadow: 0 0 7px rgba(34,197,94,.6); }
    .mv-dot.warn { background: #f59e0b; box-shadow: 0 0 7px rgba(245,158,11,.6); animation: mv-blink 2s infinite; }
    .mv-dot.err  { background: #ef4444; box-shadow: 0 0 8px rgba(239,68,68,.7); animation: mv-blink 1s infinite; }
    .mv-dot.off  { background: #1a2a3a; }

    @keyframes mv-blink {
      0%,100% { opacity:1; }
      50%     { opacity:.3; }
    }

    /* ── SOC Hero ── */
    .mv-soc-hero {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 4px 20px 0;
    }
    .mv-soc-big { display: flex; align-items: flex-start; gap: 3px; line-height: 1; }
    .mv-soc-num {
      font-size: 80px; font-weight: 200; letter-spacing: -5px; line-height: 1;
    }
    .mv-soc-pct { font-size: 22px; font-weight: 300; color: #1e3a4a; margin-top: 14px; }

    .mv-soc-right {
      display: flex; flex-direction: column; align-items: flex-end; gap: 6px; padding-top: 8px;
    }
    .mv-power-num {
      font-size: 30px; font-weight: 200; letter-spacing: -1px; line-height: 1; text-align: right;
    }
    .mv-power-unit { font-size: 13px; font-weight: 400; color: #1e3a4a; margin-left: 1px; }

    .mv-dir-pill {
      padding: 4px 12px; border-radius: 20px;
      font-size: 10px; font-weight: 600; letter-spacing: 0.4px; text-transform: uppercase;
    }
    .mv-dir-pill.c { background: rgba(0,207,255,0.1); border: 1px solid rgba(0,207,255,0.22); color: #00cfff; }
    .mv-dir-pill.d { background: rgba(255,140,50,0.1); border: 1px solid rgba(255,140,50,0.22); color: #ff8c32; }
    .mv-dir-pill.s { background: rgba(100,116,139,0.08); border: 1px solid rgba(100,116,139,0.15); color: #374a65; }
    .mv-mode-txt { font-size: 9px; color: #1e3a4a; }

    /* ── Flow wrap ── */
    .mv-flow-wrap { padding: 0 14px 6px; }

    /* ── Divider ── */
    .mv-div { height: 1px; background: rgba(255,255,255,0.04); margin: 0 18px; }

    /* ── Stats ── */
    .mv-stats { display: grid; grid-template-columns: repeat(4,1fr); padding: 14px 0; }
    .mv-st {
      text-align: center; padding: 0 4px;
      border-right: 1px solid rgba(255,255,255,0.04);
    }
    .mv-st:last-child { border-right: none; }
    .mv-st-v { font-size: 17px; font-weight: 500; line-height: 1; margin-bottom: 4px; }
    .mv-st-l { font-size: 7.5px; text-transform: uppercase; letter-spacing: .4px; color: #1e3a4a; }
    .mv-st.c .mv-st-v { color: #00cfff; }
    .mv-st.d .mv-st-v { color: #ff8c32; }
    .mv-st.s .mv-st-v { color: #a78bfa; }
    .mv-st.y .mv-st-v { color: #fbbf24; }

    /* ── Balance row ── */
    .mv-bal-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 18px;
      border-top: 1px solid rgba(255,255,255,0.04);
      border-bottom: 1px solid rgba(255,255,255,0.04);
      font-size: 10px;
    }
    .mv-bal-l { display: flex; align-items: center; gap: 7px; color: #2a3f55; }
    .mv-bal-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .mv-bal-r { color: #2a3f55; font-size: 10px; }

    /* ── Data block ── */
    .mv-data-block {
      padding: 10px 18px 12px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .mv-dr {
      display: flex; justify-content: space-between; align-items: baseline;
      padding: 3.5px 0; border-bottom: 1px solid rgba(255,255,255,0.025); font-size: 10.5px;
    }
    .mv-dr:last-child { border-bottom: none; }
    .mv-dn { color: #1e3a4a; }
    .mv-dv { color: #4a6a85; font-weight: 500; }

    /* ── Controls ── */
    .mv-ctrl { display: flex; gap: 6px; padding: 12px 14px; }
    .mv-btn {
      flex: 1; padding: 10px 4px; border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
      color: #1e3a4a; font-size: 9.5px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .5px; text-align: center;
      cursor: pointer; font-family: inherit; transition: all .2s;
    }
    .mv-btn:hover { background: rgba(255,255,255,0.06); color: #4a6a85; }
    .mv-btn.ac { background: rgba(0,207,255,0.09); color: #00cfff; border-color: rgba(0,207,255,0.22); }
    .mv-btn.ad { background: rgba(255,140,50,0.09); color: #ff8c32; border-color: rgba(255,140,50,0.22); }
    .mv-btn.aa { background: rgba(167,139,250,0.09); color: #a78bfa; border-color: rgba(167,139,250,0.22); }

    /* ── Footer ── */
    .mv-ftr {
      display: flex; justify-content: space-between;
      padding: 7px 18px; font-size: 9px; color: #111e2e;
      border-top: 1px solid rgba(255,255,255,0.025);
    }

    /* ── Setup hint ── */
    .mv-setup {
      display: flex; flex-direction: column; align-items: center;
      gap: 12px; padding: 40px 24px; text-align: center; color: #2a3f55;
    }
    .mv-setup-ico   { font-size: 44px; opacity: .5; }
    .mv-setup-title { font-size: 14px; font-weight: 500; color: #4a6a85; }
    .mv-setup-desc  { font-size: 12px; line-height: 1.6; }
    .mv-setup-tag {
      padding: 4px 14px; border-radius: 20px;
      background: rgba(0,207,255,.1); border: 1px solid rgba(0,207,255,.2);
      color: #00cfff; font-size: 11px; font-weight: 600;
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

    /* Kopiervorlage */
    .ed-suggest-box {
      background: rgba(0,0,0,0.06);
      border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .ed-suggest-head {
      padding: 8px 12px;
      background: rgba(0,229,179,0.07);
      border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.1));
      font-size: 11px;
      color: var(--secondary-text-color, #64748b);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .ed-suggest-prefix {
      font-family: monospace;
      font-weight: 700;
      color: var(--primary-color, #00e5b3);
    }

    .ed-copy-all-btn {
      font-size: 10px;
      padding: 3px 10px;
      border-radius: 20px;
      border: 1px solid var(--primary-color, #00e5b3);
      background: transparent;
      color: var(--primary-color, #00e5b3);
      cursor: pointer;
      font-family: inherit;
      font-weight: 600;
      transition: all 0.2s;
    }
    .ed-copy-all-btn:hover {
      background: var(--primary-color, #00e5b3);
      color: white;
    }
    .ed-copy-all-btn.copied {
      background: #22c55e;
      border-color: #22c55e;
      color: white;
    }

    .ed-suggest-list {
      max-height: 240px;
      overflow-y: auto;
      padding: 4px 0;
    }

    .ed-suggest-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 4px 12px;
      font-size: 11px;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
    .ed-suggest-row:last-child { border-bottom: none; }
    .ed-suggest-row:hover { background: rgba(0,0,0,0.04); }

    .ed-suggest-lbl {
      color: var(--secondary-text-color, #64748b);
      flex-shrink: 0;
      width: 130px;
      font-size: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .ed-suggest-id {
      font-family: monospace;
      font-size: 10.5px;
      color: var(--primary-text-color);
      word-break: break-all;
    }

    .ed-no-prefix {
      padding: 14px 12px;
      font-size: 12px;
      color: var(--secondary-text-color, #64748b);
      text-align: center;
      line-height: 1.6;
    }

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
  class EnergyManagementDashboard extends HTMLElement {
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
        title: 'Heimspeicher',
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
        title: 'Heimspeicher',
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

      // Pflicht-Entitäten prüfen
      const hasSoc = !!cfg.entities.battery_soc || !!cfg.entities.system_soc;
      if (!hasSoc) {
        this.shadowRoot.innerHTML = `
          <style>${CARD_CSS}</style>
          <div class="mv-card">
            <div class="mv-setup">
              <div class="mv-setup-ico">🔋</div>
              <div class="mv-setup-title">PowerNest Dashboard</div>
              <div class="mv-setup-desc">
                Karte konfigurieren: Bearbeiten (✏) → Gerätename eingeben<br>→ Entity-IDs aus der Kopiervorlage zuweisen.
              </div>
              <div class="mv-setup-tag">⚙ Karte konfigurieren</div>
            </div>
          </div>`;
        return;
      }

      // ── Daten abrufen ───────────────────────────────────────────────
      const soc     = this._num('battery_soc') ?? this._num('system_soc');
      const rawPow  = this._num('battery_power');
      const sysCP   = this._num('system_charge_power', 0);
      const sysDC   = this._num('system_discharge_power', 0);
      const power   = rawPow !== null ? rawPow : (sysCP > sysDC ? sysCP : -sysDC);
      const dir     = this._direction(power);

      const acPower    = this._num('ac_power');
      const temp       = this._num('internal_temperature');
      const mos1       = this._num('internal_mos1_temperature');
      const mos2       = this._num('internal_mos2_temperature');
      const voltage    = this._num('battery_voltage');
      const current    = this._num('battery_current');
      const maxCell    = this._num('max_cell_voltage');
      const minCell    = this._num('min_cell_voltage');
      const maxCellT   = this._num('max_cell_temperature');
      const minCellT   = this._num('min_cell_temperature');
      const dailyC     = this._num('total_daily_charging_energy') ?? this._num('system_daily_charging_energy');
      const dailyD     = this._num('total_daily_discharging_energy') ?? this._num('system_daily_discharging_energy');
      const totalC     = this._num('total_charging_energy');
      const totalD     = this._num('total_discharging_energy');
      const monthlyC   = this._num('total_monthly_charging_energy');
      const monthlyD   = this._num('total_monthly_discharging_energy');
      const stored     = this._num('stored_energy');
      const cycles     = this._num('battery_cycle_count_calc') ?? this._num('battery_cycle_count');
      const eff        = this._num('round_trip_efficiency_total');
      const effMon     = this._num('round_trip_efficiency_monthly');
      const effConv    = this._num('conversion_efficiency');
      const forceMode  = this._state('force_mode');
      const workMode   = this._state('user_work_mode');
      const invState   = this._state('inverter_state');
      const wifiState  = this._state('wifi_status');
      const cloudState = this._state('cloud_status');
      const wifiDbm    = this._num('wifi_signal_strength');
      const balStatus  = this._state('balance_status');
      const balLast    = this._num('balance_last_measurement');
      const balAvg     = this._num('balance_delta_avg');
      const balTrend   = this._state('balance_trend');
      const mppt       = [1,2,3,4].map(i => ({ power: this._num(`mppt${i}_power`), voltage: this._num(`mppt${i}_voltage`), current: this._num(`mppt${i}_current`) }));
      const totalSolar = mppt.some(m => m.power !== null) ? mppt.reduce((s, m) => s + (m.power || 0), 0) : null;
      const solarActive = totalSolar !== null && totalSolar > 20;

      // ── Berechnungen ────────────────────────────────────────────────
      const alarm     = this._alarmStatus();
      const col       = socColor(soc);
      const cellDelta = maxCell !== null && minCell !== null ? Math.round((maxCell - minCell) * 1000) : null;
      const cellColor = cellDelta === null ? '#4b5563' : cellDelta < 50 ? '#22c55e' : cellDelta < 100 ? '#f59e0b' : '#ef4444';

      const FORCE_C = ['Force Charge','force_charge'];
      const FORCE_D = ['Force Discharge','force_discharge'];
      const isForceC = FORCE_C.includes(forceMode);
      const isForceD = FORCE_D.includes(forceMode);
      const isAuto   = !isForceC && !isForceD;
      const modeLabel = (() => {
        const m = { 'Force Charge':'Laden erzwungen','force_charge':'Laden erzwungen',
          'Force Discharge':'Entladen erzwungen','force_discharge':'Entladen erzwungen',
          'Auto':'Automatik','auto':'Automatik','Self Consumption':'Eigenverbrauch',
          'self_consumption':'Eigenverbrauch','Backup':'Backup' };
        return forceMode ? (m[forceMode] || forceMode.replace(/_/g,' '))
             : workMode  ? (m[workMode]  || workMode.replace(/_/g,' '))
             : null;
      })();

      const wifiOn  = wifiState  === 'on' || wifiState  === 'true';
      const cloudOn = cloudState === 'on' || cloudState === 'true';
      const hasWifi  = !!cfg.entities.wifi_status;
      const hasCloud = !!cfg.entities.cloud_status;
      const chipLabel = hasWifi ? (wifiOn ? '📶 Online' : '📵 Offline') : (hasCloud ? (cloudOn ? '☁ Online' : '☁ Offline') : null);
      const chipOn    = hasWifi ? wifiOn : cloudOn;

      const lastUpd = (() => {
        const o = this._stateObj('battery_soc') || this._stateObj('system_soc');
        return o ? new Date(o.last_updated).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}) : null;
      })();

      const hasForce   = !!cfg.entities.force_mode;
      const showCtrl   = cfg.show_controls && hasForce;
      const hasBalance = !!(balStatus || balLast !== null || balAvg !== null);

      // Hersteller-Icon-Farbe (basierend auf Titel oder Default)
      const title = cfg.title || 'Battery';
      const iconGrad = (() => {
        const t = title.toLowerCase();
        if (t.includes('victron'))  return 'linear-gradient(135deg,#3b82f6,#1d4ed8)';
        if (t.includes('sungrow'))  return 'linear-gradient(135deg,#f97316,#dc2626)';
        if (t.includes('fronius'))  return 'linear-gradient(135deg,#8b5cf6,#6d28d9)';
        if (t.includes('huawei'))   return 'linear-gradient(135deg,#ef4444,#b91c1c)';
        if (t.includes('fox'))      return 'linear-gradient(135deg,#f59e0b,#d97706)';
        return 'linear-gradient(135deg,#00d4aa,#0096c7)'; // default (Marstek etc.)
      })();

      // ── SVG Energiefluss (Vertical Prism Design) ──────────────────
      const uid = 'mv' + Math.random().toString(36).slice(2, 7);

      const hasAC      = !!cfg.entities.ac_power;
      const mpptActive = mppt.filter(m => m.power !== null);

      // SOC-Ring (270°, r=28)
      const SR = 28;
      const S_CIRC = 2 * Math.PI * SR;
      const S_ARC  = S_CIRC * 0.75;
      const S_FILL = soc !== null ? S_ARC * clamp(soc, 0, 100) / 100 : 0;

      // Animationsdauern
      const flowDur = (p, maxP = 5000, minD = 0.7, maxD = 3.0) =>
        p && Math.abs(p) > 20
          ? Math.max(minD, maxD - (Math.abs(p) / maxP) * (maxD - minD)).toFixed(1) : null;

      const solarDur = flowDur(totalSolar, 8000);
      const homeDur  = flowDur(acPower ?? Math.abs(power ?? 0), 3500, 0.8, 2.8);
      const gridDur  = '2.3';

      const nPts = (p, max = 4000) => p ? Math.max(2, Math.min(3, Math.ceil(Math.abs(p) / max * 3))) : 2;

      const pts = (n, fill, pathId, dur) => {
        if (!dur) return '';
        return Array.from({length: n}, (_, i) => {
          const delay = -(i * parseFloat(dur) / n);
          return `<circle r="3.5" fill="${fill}" opacity="0" filter="url(#gw${uid})">
            <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.06;0.14;0.9;1"
              dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
            <animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite">
              <mpath href="#${pathId}"/>
            </animateMotion>
          </circle>`;
        }).join('');
      };

      // Pfade: Solar(82,20)→Batterie(154,92)→Haus(226,20), Netz(154,92)→unten
      const solarPath = `M 82,36 L 82,72 C 82,92 154,92 154,92`;
      const homePath  = `M 154,92 C 154,92 226,72 226,52 L 226,36`;
      const gridPath  = `M 154,110 L 154,155`;
      const showGrid  = hasAC && acPower !== null;

      const homeColor  = dir === 'discharging' ? '#ff8c32' : '#a78bfa';
      const homeStroke = dir === 'discharging' ? `stroke="#ff8c32"` : `stroke="#a78bfa"`;

      const svgHeight = mpptActive.length > 1 ? 220 : 195;

      const svg = `
<svg viewBox="0 0 308 ${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
  <defs>
    <filter id="gw${uid}"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <path id="sp${uid}" d="${solarPath}"/>
    <path id="hp${uid}" d="${homePath}"/>
    <path id="gp${uid}" d="${gridPath}"/>
  </defs>

  <!-- Ambiente Glow Batterie -->
  <circle cx="154" cy="92" r="50" fill="${col}" opacity="0.04"/>
  <circle cx="154" cy="92" r="36" fill="${col}" opacity="0.06"/>

  <!-- Verbindungslinien -->
  ${solarActive ? `
    <use href="#sp${uid}" fill="none" stroke="#fbbf24" stroke-width="8" opacity="0.08" stroke-linecap="round"/>
    <use href="#sp${uid}" fill="none" stroke="#fbbf24" stroke-width="1.5" opacity="0.35" stroke-linecap="round"/>
  ` : ''}
  <use href="#hp${uid}" fill="none" ${homeStroke} stroke-width="${dir==='discharging'?8:5}" opacity="${dir==='discharging'?0.12:0.08}" stroke-linecap="round"/>
  <use href="#hp${uid}" fill="none" ${homeStroke} stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
  ${showGrid ? `
    <use href="#gp${uid}" fill="none" stroke="#3b82f6" stroke-width="4" opacity="0.1" stroke-linecap="round"/>
    <use href="#gp${uid}" fill="none" stroke="#3b82f6" stroke-width="1.2" opacity="0.28" stroke-linecap="round"/>
  ` : ''}

  <!-- Animierte Partikel -->
  ${solarActive ? pts(nPts(totalSolar,8000), '#fbbf24', `sp${uid}`, solarDur) : ''}
  ${pts(nPts(acPower||Math.abs(power||0),3500), homeColor, `hp${uid}`, homeDur)}
  ${showGrid ? pts(2, '#3b82f6', `gp${uid}`, gridDur) : ''}

  <!-- SOLAR NODE -->
  ${solarActive ? `
    <circle cx="82" cy="24" r="26" fill="#fbbf24" opacity="0.05"/>
    <circle cx="82" cy="24" r="18" fill="#fbbf24" opacity="0.09"/>
    <circle cx="82" cy="24" r="13" fill="#0a0e00" stroke="#fbbf24" stroke-width="1.5" stroke-opacity="0.6"/>
    <text x="82" y="28" text-anchor="middle" font-size="14" fill="#fbbf24">☀</text>
    <text x="82" y="55" text-anchor="middle" font-size="7.5" fill="#fbbf24" font-family="Inter,sans-serif" font-weight="600">${formatPower(totalSolar)}</text>
  ` : `
    <circle cx="82" cy="24" r="18" fill="#0a0e1a" opacity="0.6"/>
    <circle cx="82" cy="24" r="13" fill="#07090f" stroke="#1a2535" stroke-width="1.2"/>
    <text x="82" y="28" text-anchor="middle" font-size="14" fill="#1a2535">☀</text>
    <text x="82" y="55" text-anchor="middle" font-size="7.5" fill="#1a2535" font-family="Inter,sans-serif">— W</text>
  `}

  <!-- HAUS NODE -->
  <circle cx="226" cy="24" r="26" fill="${homeColor}" opacity="0.05"/>
  <circle cx="226" cy="24" r="18" fill="${homeColor}" opacity="0.09"/>
  <circle cx="226" cy="24" r="13" fill="#07040f" stroke="${homeColor}" stroke-width="1.5" stroke-opacity="0.6"/>
  <text x="226" y="28" text-anchor="middle" font-size="13" fill="${homeColor}">🏠</text>
  <text x="226" y="55" text-anchor="middle" font-size="7.5" fill="${homeColor}" font-family="Inter,sans-serif" font-weight="600">${acPower !== null ? formatPower(acPower) : '— W'}</text>

  <!-- BATTERIE NODE (SOC-Ring) -->
  <circle cx="154" cy="92" r="${SR}" fill="none"
    stroke="${col}" stroke-opacity="0.1" stroke-width="5.5"
    stroke-dasharray="${S_ARC.toFixed(1)} ${S_CIRC.toFixed(1)}"
    transform="rotate(135,154,92)" stroke-linecap="round"/>
  <circle cx="154" cy="92" r="${SR}" fill="none"
    stroke="${col}" stroke-width="5.5"
    stroke-dasharray="${S_FILL.toFixed(1)} ${S_CIRC.toFixed(1)}"
    transform="rotate(135,154,92)" stroke-linecap="round"
    filter="url(#gw${uid})"/>
  <circle cx="154" cy="92" r="22" fill="#040a14" stroke="${col}" stroke-width="0.8" stroke-opacity="0.2"/>
  <text x="154" y="88" text-anchor="middle" font-size="13" font-weight="300"
    fill="#dde8f8" font-family="Inter,sans-serif" letter-spacing="-0.3">
    ${soc !== null ? Math.round(soc) + '%' : '—'}
  </text>
  <text x="154" y="101" text-anchor="middle" font-size="6.5" fill="#1e3a4a"
    font-family="Inter,sans-serif" letter-spacing="1.2">SOC</text>
  <text x="154" y="140" text-anchor="middle" font-size="8" fill="${col}"
    font-weight="600" font-family="Inter,sans-serif">
    ${dir==='charging'?'↑':dir==='discharging'?'↓':'◎'} ${formatPower(Math.abs(power||0))}
  </text>

  <!-- Power-Badges -->
  ${solarActive && totalSolar ? `
    <rect x="46" y="62" width="34" height="12" rx="5" fill="rgba(4,8,16,0.92)" stroke="#fbbf24" stroke-width="0.7" stroke-opacity="0.45"/>
    <text x="63" y="71" text-anchor="middle" font-size="7" fill="#fbbf24" font-family="Inter,sans-serif" font-weight="600">${formatPower(totalSolar)}</text>
  ` : ''}
  ${acPower !== null ? `
    <rect x="228" y="62" width="34" height="12" rx="5" fill="rgba(4,8,16,0.92)" stroke="${homeColor}" stroke-width="0.7" stroke-opacity="0.45"/>
    <text x="245" y="71" text-anchor="middle" font-size="7" fill="${homeColor}" font-family="Inter,sans-serif" font-weight="600">${formatPower(acPower)}</text>
  ` : ''}

  <!-- NETZ NODE -->
  ${showGrid ? `
    <circle cx="154" cy="163" r="14" fill="#050d1a" stroke="#3b82f6" stroke-width="1.2" stroke-opacity="0.4"/>
    <text x="154" y="167" text-anchor="middle" font-size="11" fill="#3b82f6">🔌</text>
  ` : ''}

  <!-- MPPT-Chips -->
  ${mpptActive.length > 1 ? `
    <g transform="translate(10,${showGrid ? 182 : 165})">
      ${mpptActive.map((m,i) => {
        const cw = Math.min(70, (288) / mpptActive.length - 4);
        return `<rect x="${i*(cw+4)}" y="0" width="${cw}" height="14" rx="4"
          fill="rgba(251,191,36,0.07)" stroke="rgba(251,191,36,0.15)" stroke-width="0.8"/>
          <text x="${i*(cw+4)+cw/2}" y="9.5" text-anchor="middle" font-size="7.5"
            fill="#f59e0b" font-family="Inter,sans-serif" font-weight="600">PV${i+1} · ${formatPower(m.power)}</text>`;
      }).join('')}
    </g>
  ` : ''}
</svg>`;

      // ── Hilfs-Funktionen für Render ─────────────────────────────────
      const DR = (name, val, color) =>
        val !== null
          ? `<div class="mv-dr"><span class="mv-dn">${name}</span><span class="mv-dv"${color?` style="color:${color}"`:''}>${val}</span></div>`
          : '';

      const balanceStatusLabel = {
        'Balanciert':'Balanciert', 'green':'Balanciert',
        'Geringe Unbalance':'Gering', 'yellow':'Gering',
        'Moderate Unbalance':'Moderat', 'orange':'Moderat',
        'Hohe Unbalance':'Hoch!', 'red':'Hoch!',
      };
      const balColor = {
        'Balanciert':'#22c55e','green':'#22c55e',
        'Geringe Unbalance':'#f59e0b','yellow':'#f59e0b',
        'Moderate Unbalance':'#f97316','orange':'#f97316',
        'Hohe Unbalance':'#ef4444','red':'#ef4444',
      };
      const balTrendLabel = {
        'Improving':'↘ Verbessert sich','Worsening':'↗ Verschlechtert sich',
        'Stable':'→ Stabil','Verbessert':'↘ Verbessert sich',
        'Verschlechtert':'↗ Verschlechtert sich','Stabil':'→ Stabil',
      };
      const bColor = balColor[balStatus] || '#4b5563';
      const bLabel = balanceStatusLabel[balStatus] || balStatus || '';
      const bTrend = balTrendLabel[balTrend] || balTrend || '';
      const balText = [bLabel, bTrend].filter(Boolean).join(' · ');


      // ── SOC-Farbe (für Prism-Design angepasst) ─────────────────────
      const socAccent = (() => {
        if (soc === null) return '#1e3a4a';
        if (soc <= 10)   return '#ef4444';
        if (soc <= 20)   return '#ff8c32';
        if (soc <= 40)   return '#f59e0b';
        if (soc <= 65)   return '#22c55e';
        return '#00cfff';
      })();

      const powerAccent = dir === 'discharging' ? '#ff8c32' : (dir === 'charging' ? '#00cfff' : '#1e3a4a');

      // ── HTML zusammenstellen ────────────────────────────────────────
      const html = `
<style>${CARD_CSS}</style>
<div class="mv-card">

  <!-- Header -->
  <div class="mv-hdr">
    <div class="mv-hdr-l">
      <div class="mv-hdr-icon" style="background:${iconGrad}">🔋</div>
      <div>
        <div class="mv-hdr-name">${title}</div>
        ${invState ? `<div class="mv-hdr-brand">${invState}</div>` : cfg.entity_prefix ? `<div class="mv-hdr-brand">${cfg.entity_prefix}</div>` : ''}
      </div>
    </div>
    <div class="mv-hdr-r">
      ${alarm === 'fault' ? `<div class="mv-chip off" style="color:#ef4444;border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.08);animation:mv-blink 1s infinite"><div class="mv-chip-dot"></div>Alarm</div>` :
        chipLabel ? `<div class="mv-chip ${chipOn?'on':'off'}"><div class="mv-chip-dot"></div>${chipOn ? 'Online' : 'Offline'}</div>` : ''}
    </div>
  </div>

  <!-- SOC Hero -->
  <div class="mv-soc-hero">
    <div class="mv-soc-big">
      <span class="mv-soc-num" style="color:${socAccent}">${soc !== null ? Math.round(soc) : '—'}</span>
      <span class="mv-soc-pct">%</span>
    </div>
    <div class="mv-soc-right">
      <div class="mv-power-num" style="color:${powerAccent}">${formatPower(Math.abs(power||0)).replace(' ','')}</div>
      <div class="mv-dir-pill ${dir==='charging'?'c':dir==='discharging'?'d':'s'}">
        ${dir==='charging'?'↑ Laden':dir==='discharging'?'↓ Entladen':'◎ Standby'}
      </div>
      ${modeLabel ? `<div class="mv-mode-txt">${modeLabel}</div>` : ''}
    </div>
  </div>

  <!-- Energiefluss SVG -->
  <div class="mv-flow-wrap">${svg}</div>

  <!-- Stats -->
  ${cfg.show_energy_stats ? `
  <div class="mv-div"></div>
  <div class="mv-stats">
    <div class="mv-st c"><div class="mv-st-v">${dailyC !== null ? dailyC.toFixed(1) : '—'}</div><div class="mv-st-l">kWh ↑</div></div>
    <div class="mv-st d"><div class="mv-st-v">${dailyD !== null ? dailyD.toFixed(1) : '—'}</div><div class="mv-st-l">kWh ↓</div></div>
    <div class="mv-st s"><div class="mv-st-v">${stored !== null ? stored.toFixed(1) : '—'}</div><div class="mv-st-l">Gespeich.</div></div>
    <div class="mv-st y"><div class="mv-st-v">${cycles !== null ? Math.round(cycles) : '—'}</div><div class="mv-st-l">Zyklen</div></div>
  </div>
  ` : ''}

  <!-- Zell-Balance -->
  ${hasBalance ? `
  <div class="mv-bal-row">
    <div class="mv-bal-l">
      <div class="mv-bal-dot" style="background:${bColor};box-shadow:0 0 5px ${bColor}50"></div>
      <span>Balance${bLabel ? ' · ' + bLabel : ''}${balTrend ? ' · ' + (balTrendLabel[balTrend]||balTrend) : ''}</span>
    </div>
    <div class="mv-bal-r">
      ${balLast !== null ? `Δ <b style="color:${bColor}">${Math.round(balLast)} mV</b>` : ''}
      ${balAvg !== null ? ` &nbsp; Ø ${Math.round(balAvg)} mV` : ''}
    </div>
  </div>
  ` : ''}

  <!-- Daten-Block -->
  ${cfg.show_health ? `
  <div class="mv-data-block">
    <div>
      ${DR('🌡 Temp', temp !== null ? temp.toFixed(1)+' °C' : null, temp ? (temp>50?'#ef4444':temp>40?'#f59e0b':'#22c55e') : null)}
      ${mos1 !== null || mos2 !== null ? DR('🌡 MOS', [mos1,mos2].filter(v=>v!==null).map(v=>v.toFixed(0)).join(' / ')+' °C', null) : ''}
      ${DR('⚡ U / I', [voltage ? voltage.toFixed(1)+'V' : null, current ? current.toFixed(1)+'A' : null].filter(Boolean).join(' · ') || null, null)}
      ${maxCell !== null && minCell !== null ? DR('▲▼ Zelle', maxCell.toFixed(3)+'/'+minCell.toFixed(3)+' V', null) : ''}
      ${cellDelta !== null ? DR('△ Balance', cellDelta+' mV', cellColor) : ''}
    </div>
    <div>
      ${DR('↑ Gesamt', totalC !== null ? formatEnergy(totalC) : null, '#00cfff')}
      ${DR('↓ Gesamt', totalD !== null ? formatEnergy(totalD) : null, '#ff8c32')}
      ${monthlyC !== null ? DR('↑ Monat', monthlyC.toFixed(1)+' kWh', null) : ''}
      ${monthlyD !== null ? DR('↓ Monat', monthlyD.toFixed(1)+' kWh', null) : ''}
      ${DR('Effizienz', eff !== null ? eff.toFixed(1)+' %' : null, '#00cfff')}
    </div>
  </div>
  ` : ''}

  <!-- Steuerbuttons -->
  ${showCtrl ? `
  <div class="mv-ctrl">
    <div class="mv-btn ${isForceC?'ac':''}" data-mv-act="charge">⚡ Laden</div>
    <div class="mv-btn ${isForceD?'ad':''}" data-mv-act="discharge">↓ Entladen</div>
    <div class="mv-btn ${isAuto?'aa':''}"   data-mv-act="auto">◎ Auto</div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="mv-ftr">
    <span>${lastUpd ? lastUpd : 'Warte auf Daten…'}</span>
    <span>Energy Management Dashboard v${VERSION}${VERSION}</span>
  </div>

</div>`;

      this.shadowRoot.innerHTML = html;

      // Event-Listener für Steuerbuttons
      if (showCtrl) {
        const eid = cfg.entities.force_mode;
        this.shadowRoot.querySelectorAll('[data-mv-act]').forEach(el => {
          el.addEventListener('click', () => {
            const a = el.dataset.mvAct;
            const opts = { charge: 'Force Charge', discharge: 'Force Discharge', auto: 'Auto' };
            if (eid) this._callSvc('select', 'select_option', { entity_id: eid, option: opts[a] || 'Auto' });
          });
        });
      }
    }
  }

  // ─── Konfigurations-Editor ─────────────────────────────────────────────────
  class EnergyManagementDashboardEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = {};
      this._hass = null;
    }

    set hass(hass) {
      this._hass = hass;
      // Bereits gerenderte Picker live aktualisieren (ohne komplettes Re-Render)
      if (this.shadowRoot) {
        this.shadowRoot.querySelectorAll('ha-entity-picker[data-key]').forEach(el => {
          el.hass = hass;
        });
      }
    }

    setConfig(config) {
      const newCfg = JSON.parse(JSON.stringify(config || {}));
      if (!newCfg.entities) newCfg.entities = {};

      // Nur komplett neu rendern wenn sich strukturell etwas geändert hat
      // (nicht bei jeder Entitäts-Auswahl — das würde den Fokus zerstören)
      const structuralKeys = ['title', 'entity_prefix', 'show_controls', 'show_health', 'show_energy_stats', 'show_ac'];
      const needsFullRender = !this._config
        || structuralKeys.some(k => this._config[k] !== newCfg[k])
        || Object.keys(newCfg.entities).length !== Object.keys(this._config.entities || {}).length;

      this._config = newCfg;

      if (needsFullRender) {
        this._render();
      } else {
        // Nur Picker-Werte aktualisieren ohne komplettes Re-Render
        if (this.shadowRoot) {
          this.shadowRoot.querySelectorAll('ha-entity-picker[data-key]').forEach(el => {
            const key = el.dataset.key;
            const newVal = (this._config.entities || {})[key] || '';
            if (el.value !== newVal) el.value = newVal;
          });
        }
      }
    }

    _fire() {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: JSON.parse(JSON.stringify(this._config)) },
        bubbles: true,
        composed: true,
      }));
    }

    _render() {
      const cfg  = this._config;
      const ents = cfg.entities || {};
      const prefix = (cfg.entity_prefix || '').trim();

      // ── Kopiervorlage: Entity-IDs aus Prefix generieren ──────────────────
      // Welche Entity-IDs erscheinen in der Vorschau (nur die wichtigsten)
      const SUGGEST_DEFS = [
        { key: 'battery_soc',                   domain: 'sensor'        },
        { key: 'battery_power',                  domain: 'sensor'        },
        { key: 'battery_voltage',                domain: 'sensor'        },
        { key: 'battery_total_energy',           domain: 'sensor'        },
        { key: 'internal_temperature',           domain: 'sensor'        },
        { key: 'ac_power',                       domain: 'sensor'        },
        { key: 'ac_offgrid_power',               domain: 'sensor'        },
        { key: 'total_daily_charging_energy',    domain: 'sensor'        },
        { key: 'total_daily_discharging_energy', domain: 'sensor'        },
        { key: 'total_charging_energy',          domain: 'sensor'        },
        { key: 'total_discharging_energy',       domain: 'sensor'        },
        { key: 'stored_energy',                  domain: 'sensor'        },
        { key: 'battery_cycle_count_calc',       domain: 'sensor'        },
        { key: 'round_trip_efficiency_total',    domain: 'sensor'        },
        { key: 'max_cell_voltage',               domain: 'sensor'        },
        { key: 'min_cell_voltage',               domain: 'sensor'        },
        { key: 'balance_status',                 domain: 'sensor'        },
        { key: 'balance_last_measurement',       domain: 'sensor'        },
        { key: 'balance_delta_avg',              domain: 'sensor'        },
        { key: 'balance_cell_delta_100',         domain: 'sensor'        },
        { key: 'balance_trend',                  domain: 'sensor'        },
        { key: 'fault_status',                   domain: 'sensor'        },
        { key: 'alarm_status',                   domain: 'sensor'        },
        { key: 'inverter_state',                 domain: 'sensor'        },
        { key: 'wifi_status',                    domain: 'binary_sensor' },
        { key: 'cloud_status',                   domain: 'binary_sensor' },
        { key: 'force_mode',                     domain: 'select'        },
        { key: 'user_work_mode',                 domain: 'select'        },
        { key: 'set_charge_power',               domain: 'number'        },
        { key: 'set_discharge_power',            domain: 'number'        },
      ];

      const suggestBox = prefix
        ? `
          <div class="ed-suggest-box">
            <div class="ed-suggest-head">
              <span>Prefix: <span class="ed-suggest-prefix">${prefix}</span></span>
              <button class="ed-copy-all-btn" id="copyAllBtn">📋 Alle kopieren</button>
            </div>
            <div class="ed-suggest-list" id="suggestList">
              ${SUGGEST_DEFS.map(d => {
                const id = `${d.domain}.${prefix}_${d.key}`;
                return `<div class="ed-suggest-row" data-id="${id}">
                  <span class="ed-suggest-lbl">${d.key}</span>
                  <span class="ed-suggest-id">${id}</span>
                </div>`;
              }).join('')}
            </div>
          </div>`
        : `<div class="ed-no-prefix">
            Gib deinen <strong>Gerätenamen</strong> ein —<br>
            z.B. <code>marstek_venus_1</code><br>
            dann erscheinen hier alle Entity-IDs zum Kopieren.
          </div>`;

      // ── Entity-Picker Rows ────────────────────────────────────────────────
      // Nur .hass / .value / .includeDomains werden NACH dem Rendern per JS
      // gesetzt — innerHTML unterstützt keine Lit-Property-Bindings.
      const entityRows = ENTITY_DEFS.map(def => `
        <div class="ed-row">
          <div class="ed-label">
            ${def.label}
            ${def.required ? '<span class="ed-req">PFLICHT</span>' : ''}
          </div>
          <ha-entity-picker
            allow-custom-entity
            data-key="${def.key}"
            data-domain="${def.domain}"
          ></ha-entity-picker>
        </div>
      `).join('');

      const toggles = [
        { key: 'show_controls',     label: 'Steuerbuttons',        desc: 'Laden / Entladen / Automatik' },
        { key: 'show_energy_stats', label: 'Energie-Statistiken',  desc: 'Tages- und Gesamtenergiewerte' },
        { key: 'show_health',       label: 'Batterie-Gesundheit',  desc: 'Temperatur, Zellspannung, Balance' },
        { key: 'show_ac',           label: 'AC-Leistung',          desc: 'Balkendiagramm der Netzleistung' },
      ];

      // ── Template ──────────────────────────────────────────────────────────
      this.shadowRoot.innerHTML = `
        <style>${EDITOR_CSS}</style>
        <div class="ed-wrap">

          <div class="ed-section">
            <div class="ed-section-title">🔧 Allgemein</div>
            <div class="ed-row">
              <div class="ed-label">Kartenname</div>
              <ha-textfield label="Titel" .value="${cfg.title || 'Marstek Venus'}" data-field="title"></ha-textfield>
            </div>
          </div>

          <div class="ed-section">
            <div class="ed-section-title">📋 Entity-ID Kopiervorlage</div>
            <div class="ed-row">
              <div class="ed-label">Gerätename (Prefix)</div>
              <ha-textfield
                label="z.B. marstek_venus_1"
                .value="${prefix}"
                data-field="entity_prefix"
                id="prefixField"
              ></ha-textfield>
              <div class="ed-hint">
                <strong>Wo finde ich meinen Prefix?</strong><br>
                Einstellungen → Geräte &amp; Dienste → deine Integration → Gerät anklicken.<br>
                Dann eine beliebige Entität öffnen und die ID ablesen.<br><br>
                ⚠ <strong>marstek_venus_modbus</strong> verwendet <em>deutsche</em> Entity-Namen
                (z.&nbsp;B. <code>…_batterie_ladezustand</code> statt <code>…_battery_soc</code>).
                Die Vorschau unten zeigt englische Schlüssel als Orientierung — die genauen IDs
                bitte aus HA kopieren.
              </div>
            </div>
            ${suggestBox}
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
                <ha-switch .checked="${cfg[t.key] !== false}" data-toggle="${t.key}"></ha-switch>
              </div>
            `).join('')}
          </div>

        </div>
      `;

      // ── Prefix-Feld: sofort neu rendern beim Tippen ───────────────────────
      const prefixField = this.shadowRoot.getElementById('prefixField');
      if (prefixField) {
        prefixField.addEventListener('input', (e) => {
          this._config.entity_prefix = e.target.value;
          // Nur die Kopiervorlage aktualisieren, nicht den ganzen Editor
          this._updateSuggestBox(e.target.value);
        });
        prefixField.addEventListener('change', () => this._fire());
      }

      // ── Titel-Feld ────────────────────────────────────────────────────────
      this.shadowRoot.querySelectorAll('ha-textfield[data-field]').forEach(el => {
        if (el.dataset.field === 'entity_prefix') return; // oben behandelt
        el.addEventListener('change', (e) => {
          this._config[el.dataset.field] = e.target.value;
          this._fire();
        });
        el.addEventListener('input', (e) => {
          this._config[el.dataset.field] = e.target.value;
        });
      });

      // ── Alle-kopieren Button ──────────────────────────────────────────────
      this._attachCopyAll();

      // ── Entitäts-Picker ───────────────────────────────────────────────────
      this.shadowRoot.querySelectorAll('ha-entity-picker[data-key]').forEach(el => {
        const key    = el.dataset.key;
        const domain = el.dataset.domain;
        el.hass = this._hass;
        if (domain) el.includeDomains = [domain];
        el.value = (this._config.entities || {})[key] || '';

        el.addEventListener('value-changed', (e) => {
          if (!e.detail || e.detail.value === undefined) return;
          if (!this._config.entities) this._config.entities = {};
          if (e.detail.value) {
            this._config.entities[key] = e.detail.value;
          } else {
            delete this._config.entities[key];
          }
          this._fire();
        });
      });

      // ── Toggles ───────────────────────────────────────────────────────────
      this.shadowRoot.querySelectorAll('ha-switch[data-toggle]').forEach(el => {
        el.addEventListener('change', (e) => {
          this._config[el.dataset.toggle] = e.target.checked;
          this._fire();
        });
      });
    }

    // ── Kopiervorlage live aktualisieren (ohne komplettes Re-Render) ─────────
    _updateSuggestBox(prefix) {
      const listEl = this.shadowRoot.getElementById('suggestList');
      const boxEl  = this.shadowRoot.querySelector('.ed-suggest-box');
      const noEl   = this.shadowRoot.querySelector('.ed-no-prefix');
      const headEl = this.shadowRoot.querySelector('.ed-suggest-head .ed-suggest-prefix');

      if (!prefix.trim()) {
        if (boxEl)  boxEl.style.display  = 'none';
        if (noEl)   noEl.style.display   = 'block';
        return;
      }

      if (noEl)  noEl.style.display  = 'none';
      if (boxEl) boxEl.style.display  = '';
      if (headEl) headEl.textContent  = prefix;

      if (listEl) {
        const SUGGEST_KEYS = [
          ['sensor','battery_soc'], ['sensor','battery_power'], ['sensor','battery_voltage'],
          ['sensor','battery_total_energy'], ['sensor','internal_temperature'],
          ['sensor','ac_power'], ['sensor','ac_offgrid_power'],
          ['sensor','total_daily_charging_energy'], ['sensor','total_daily_discharging_energy'],
          ['sensor','total_charging_energy'], ['sensor','total_discharging_energy'],
          ['sensor','stored_energy'], ['sensor','battery_cycle_count_calc'],
          ['sensor','round_trip_efficiency_total'],
          ['sensor','max_cell_voltage'], ['sensor','min_cell_voltage'],
          ['sensor','balance_status'], ['sensor','balance_last_measurement'],
          ['sensor','balance_delta_avg'], ['sensor','balance_cell_delta_100'],
          ['sensor','balance_trend'],
          ['sensor','fault_status'], ['sensor','alarm_status'], ['sensor','inverter_state'],
          ['binary_sensor','wifi_status'], ['binary_sensor','cloud_status'],
          ['select','force_mode'], ['select','user_work_mode'],
          ['number','set_charge_power'], ['number','set_discharge_power'],
        ];
        listEl.innerHTML = SUGGEST_KEYS.map(([domain, key]) => {
          const id = `${domain}.${prefix.trim()}_${key}`;
          return `<div class="ed-suggest-row" data-id="${id}">
            <span class="ed-suggest-lbl">${key}</span>
            <span class="ed-suggest-id">${id}</span>
          </div>`;
        }).join('');
        this._attachCopyAll();
      }
    }

    // ── "Alle kopieren"-Button verdrahten ─────────────────────────────────────
    _attachCopyAll() {
      const btn = this.shadowRoot.getElementById('copyAllBtn');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const rows = this.shadowRoot.querySelectorAll('.ed-suggest-row[data-id]');
        const text = Array.from(rows).map(r => {
          const key = r.querySelector('.ed-suggest-lbl')?.textContent || '';
          const id  = r.dataset.id || '';
          return `  ${key}: ${id}`;
        }).join('\n');
        const yaml = `type: custom:energy-management-dashboard\ntitle: ${this._config.title || 'Marstek Venus'}\nentities:\n${text}`;
        navigator.clipboard.writeText(yaml).then(() => {
          btn.textContent = '✓ Kopiert!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = '📋 Alle kopieren';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(() => {
          btn.textContent = '✗ Fehler';
          setTimeout(() => { btn.textContent = '📋 Alle kopieren'; }, 2000);
        });
      });
    }
  }

  // ─── Registrierung ────────────────────────────────────────────────────────
  if (!customElements.get(EDITOR_TAG)) {
    customElements.define(EDITOR_TAG, EnergyManagementDashboardEditor);
  }

  if (!customElements.get(CARD_TAG)) {
    customElements.define(CARD_TAG, EnergyManagementDashboard);
  }

  // HACS / Lovelace Card-Registrierung
  window.customCards = window.customCards || [];
  if (!window.customCards.find(c => c.type === CARD_TAG)) {
    window.customCards.push({
      type: CARD_TAG,
      name: 'Energy Management Dashboard',
      description: 'Premium Energy Management Dashboard für Batteriespeicher',
      preview: true,
      documentationURL: 'https://github.com/pauer/powernest-dashboard',
    });
  }

  console.info(
    `%c ENERGY MANAGEMENT DASHBOARD %c v${VERSION} `,
    'background:#00e5b3;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px;',
    'background:#1e293b;color:#00e5b3;font-weight:600;padding:2px 4px;border-radius:0 3px 3px 0;',
  );

})();
