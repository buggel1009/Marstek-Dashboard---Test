/**
 * Energy Management Dashboard Card
 * Premium Lovelace Dashboard für Batteriespeicher
 * HACS Frontend Plugin
 * Version: 1.0.0
 *
 * https://github.com/buggel1009/Energy-Managament-Dashboard
 * Universell: Marstek, Victron, Sungrow, Fronius, Huawei, Fox ESS und mehr
 */
(function () {
  'use strict';

  const VERSION = '1.0.0';
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
    // ── Hausverbrauch & Netz ──────────────────────────────────────────────
    { key: 'home_consumption',                 domain: 'sensor',        label: 'Hausverbrauch gesamt (W)',          required: false, group: 'ac'       },
    { key: 'grid_power',                       domain: 'sensor',        label: 'Netzleistung +Bezug/-Einspeisung', required: false, group: 'ac'       },
    { key: 'ac_power',                         domain: 'sensor',        label: 'AC-Leistung Batterie (W)',          required: false, group: 'ac'       },
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
    // ── E-Auto (Wallbox / EVCC / go-e / openWB) ──────────────────────────────
    { key: 'ev_charge_power',                  domain: 'sensor',        label: 'E-Auto Ladeleistung (W)',           required: false, group: 'ev'       },
    { key: 'ev_soc',                           domain: 'sensor',        label: 'E-Auto Akku-Stand (%)',             required: false, group: 'ev'       },
    { key: 'ev_connected',                     domain: 'binary_sensor', label: 'E-Auto verbunden',                  required: false, group: 'ev'       },
    { key: 'ev_daily_energy',                  domain: 'sensor',        label: 'E-Auto geladen heute (kWh)',        required: false, group: 'ev'       },
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

  // ─── Hilfsfunktion: kW-Wert mit Komma (DE-Stil) ─────────────────────────
  function fmtDE(watts) {
    if (watts === null || watts === undefined || isNaN(Number(watts))) return '—';
    const w = Math.abs(Number(watts));
    if (w >= 1000) return (w / 1000).toFixed(2).replace('.', ',') + ' kW';
    return Math.round(w) + ' W';
  }

  // ─── (buildGauge entfernt – nicht mehr benötigt) ──────────────────────────

  // ─── Card CSS ─────────────────────────────────────────────────────────────
  const CARD_CSS = `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── KARTE ── */
    .mv-card {
      background: #080c12;
      border-radius: 22px;
      color: #dde4f0;
      font-family: var(--paper-font-body1_-_font-family,'Inter',-apple-system,sans-serif);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.06);
      box-shadow: 0 24px 48px rgba(0,0,0,0.6);
    }

    /* ── HEADER ── */
    .mv-hdr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px 10px;
    }
    .mv-hdr-l { display: flex; align-items: center; gap: 10px; }
    .mv-hdr-icon {
      width: 32px; height: 32px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,207,255,0.1);
    }
    .mv-hdr-name  { font-size: 13px; font-weight: 600; color: #dde8f8; letter-spacing: -0.2px; }
    .mv-hdr-brand { font-size: 9px; color: #1e3a4a; margin-top: 1px; }
    .mv-hdr-r { display: flex; align-items: center; gap: 7px; }

    .mv-chip {
      display: flex; align-items: center; gap: 5px;
      font-size: 9px; font-weight: 600; padding: 3px 9px; border-radius: 20px;
      text-transform: uppercase; letter-spacing: 0.4px;
    }
    .mv-chip.on  { background: rgba(0,207,255,0.07); color: #00cfff; border: 1px solid rgba(0,207,255,0.15); }
    .mv-chip.off { background: rgba(100,116,139,0.07); color: #2a3f55; border: 1px solid rgba(100,116,139,0.1); }
    .mv-chip-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
    .mv-chip.on .mv-chip-dot { box-shadow: 0 0 5px #00cfff; animation: mv-blink 2s ease-in-out infinite; }

    @keyframes mv-blink { 0%,100%{opacity:1} 50%{opacity:.25} }

    /* ── HOUSE SVG ── */
    .mv-house-wrap { display: block; width: 100%; }
    .mv-house-wrap svg { width: 100%; display: block; }

    /* ── INFO STRIP ── */
    .mv-info-strip {
      display: grid; grid-template-columns: repeat(4,1fr);
      border-top: 1px solid rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .mv-info-item {
      padding: 9px 4px; text-align: center;
      border-right: 1px solid rgba(255,255,255,0.04);
    }
    .mv-info-item:last-child { border-right: none; }
    .mv-info-v { font-size: 14px; font-weight: 600; line-height: 1; margin-bottom: 3px; }
    .mv-info-l { font-size: 7px; text-transform: uppercase; letter-spacing: .5px; color: #1e3a4a; }
    .mv-info-item.sol .mv-info-v { color: #fcd34d; }
    .mv-info-item.chg .mv-info-v { color: #00cfff; }
    .mv-info-item.con .mv-info-v { color: #67e8f9; }
    .mv-info-item.cyc .mv-info-v { color: #a78bfa; }

    /* ── DETAIL ROW ── */
    .mv-detail-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }
    .mv-detail-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #1e3a4a; }
    .mv-detail-item b { font-weight: 600; color: #3a5a70; }

    /* Klickbare Elemente */
    [data-mv-entity] {
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    [data-mv-entity]:hover { opacity: 0.75; }
    .mv-house-wrap svg [data-mv-entity] { cursor: pointer; }
    .mv-info-item[data-mv-entity]:hover { background: rgba(255,255,255,0.06); border-radius: 6px; }
    .mv-detail-item[data-mv-entity]:hover { background: rgba(255,255,255,0.04); border-radius: 6px; padding: 2px 4px; }

    /* ── FOOTER ── */
    .mv-ftr {
      display: flex; justify-content: space-between;
      padding: 5px 16px; font-size: 8px; color: #0e1e2e;
      border-top: 1px solid rgba(255,255,255,0.025);
    }

    /* ── SETUP ── */
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
        show_health: true,
        show_energy_stats: true,
      };
    }

    setConfig(config) {
      if (!config) throw new Error('Keine Konfiguration angegeben');
      this._config = {
        title: 'Heimspeicher',
        entity_prefix: '',
        show_health: true,
        show_energy_stats: true,
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
      // ── E-Auto ─────────────────────────────────────────────────────
      const evPower     = this._num('ev_charge_power');
      const evSoc       = this._num('ev_soc');
      const evConnState = this._state('ev_connected');
      const evConnected = evConnState === 'on' || evConnState === 'true' || evConnState === '1' || evPower !== null;
      const evCharging  = evPower !== null && evPower > 10;
      const evDailyKwh  = this._num('ev_daily_energy');
      const hasEv       = !!cfg.entities.ev_charge_power || !!cfg.entities.ev_connected || !!cfg.entities.ev_soc;
      const balTrend   = this._state('balance_trend');
      const mppt        = [1,2,3,4].map(i => ({ power: this._num(`mppt${i}_power`), voltage: this._num(`mppt${i}_voltage`), current: this._num(`mppt${i}_current`) }));
      const totalSolar  = mppt.some(m => m.power !== null) ? mppt.reduce((s, m) => s + (m.power || 0), 0) : null;
      const solarActive = totalSolar !== null && totalSolar > 20;

      const acPower         = this._num('ac_power');
      const homeConsumption = this._num('home_consumption');
      const gridPower       = this._num('grid_power');
      // Hausverbrauch: direkte Entität > Schätzung aus bekannten Werten
      const homePower = homeConsumption !== null
        ? homeConsumption
        : (() => {
            const solar = totalSolar || 0;
            const bat   = power !== null ? Math.max(0, -power) : 0; // Entladung positiv
            const grid  = gridPower !== null ? Math.max(0, gridPower) : 0;
            const calc  = solar + bat + grid;
            return calc > 10 ? calc : (acPower !== null ? acPower : null);
          })();
      const gridImport = gridPower !== null ? Math.max(0,  gridPower) : null;
      const gridExport = gridPower !== null ? Math.max(0, -gridPower) : null;

      // ── Berechnungen ────────────────────────────────────────────────
      const alarm     = this._alarmStatus();
      const col       = socColor(soc);
      const cellDelta = maxCell !== null && minCell !== null ? Math.round((maxCell - minCell) * 1000) : null;
      const cellColor = cellDelta === null ? '#4b5563' : cellDelta < 50 ? '#22c55e' : cellDelta < 100 ? '#f59e0b' : '#ef4444';

      // (Steuerbuttons entfernt – nur Lesebetrieb)
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

      // ── Berechnungen für Haus-Design ────────────────────────────────
      const uid = 'mv' + Math.random().toString(36).slice(2, 7);

      // hasGrid + mpptActive werden im Render-Block gesetzt
      const hasGrid     = !!cfg.entities.grid_power;
      const mpptActive  = mppt.filter(m => m.power !== null);

      const flowDur = (p, maxP, minD, maxD) =>
        p && Math.abs(p) > 20
          ? Math.max(minD, maxD - (Math.abs(p) / maxP) * (maxD - minD)).toFixed(1) : null;

      const solarDur = flowDur(totalSolar, 8000, 0.7, 2.5);
      const homeDur  = flowDur(homePower != null ? homePower : Math.abs(power != null ? power : 0), 5000, 0.6, 2.2);
      const gridDur  = gridPower !== null ? (flowDur(Math.abs(gridPower), 3000, 0.8, 2.4) || '2.0') : null;

      const nPts = (p, max) => p ? Math.max(2, Math.min(4, Math.ceil(Math.abs(p) / max * 4))) : 2;

      const mkPts = (n, fill, href, dur) => {
        if (!dur || !n) return "";
        return Array.from({length: n}, (_, i) => {
          const d = -(i * parseFloat(dur) / n);
          return "<circle r=\"3.2\" fill=\"" + fill + "\" opacity=\"0\" filter=\"url(#fg" + uid + ")\">"
            + "<animate attributeName=\"opacity\" values=\"0;0;1;1;0\" keyTimes=\"0;0.08;0.18;0.9;1\" dur=\"" + dur + "s\" begin=\"" + d + "s\" repeatCount=\"indefinite\"/>"
            + "<animateMotion dur=\"" + dur + "s\" begin=\"" + d + "s\" repeatCount=\"indefinite\"><mpath href=\"" + href + "\"/></animateMotion></circle>";
        }).join("");
      };

      const gridImporting = gridPower !== null && gridPower > 20;
      const gridExporting = gridPower !== null && gridPower < -20;
      const gridCol  = gridExporting ? "#34d399" : gridImporting ? "#c084fc" : "#3b82f6";
      const showGrid = hasGrid || (!!cfg.entities.ac_power && solarActive);
      const gridTxt  = gridExporting ? "EINSPEISUNG" : "BEZUG";

      const socCol  = soc === null ? "#1e3a4a" : soc <= 10 ? "#ef4444" : soc <= 20 ? "#ff8c32" : soc <= 40 ? "#f59e0b" : "#00cfff";
      const batCol  = dir === "charging" ? "#00cfff" : dir === "discharging" ? "#ff8c32" : "#1e3a4a";
      const batLbl  = dir === "charging" ? "&#x2191; LADEN" : dir === "discharging" ? "&#x2193; ENTLADEN" : "BEREIT";

      const selfPct = (() => {
        if (totalSolar === null || totalSolar < 10) return null;
        const exp = gridPower !== null && gridPower < 0 ? -gridPower : 0;
        return Math.round(Math.max(0, Math.min(100, (totalSolar - exp) / totalSolar * 100))) + "%";
      })();

      const gpathGrid  = gridImporting ? "M 58,0 L 58,196"   : "M 58,196 L 58,0";
      const gpathSolar = "M 170,0 L 170,125";
      const gpathHouse = "M 282,0 L 282,196";

      // ── E-Auto HTML-Block (vor dem SVG berechnet, kein nested template) ──
      const evCol  = evCharging ? '#34d399' : evConnected ? '#1e6a50' : '#1a2535';
      const evGlow = evCharging ? 0.18 : 0.06;
      const evLine = evCharging ? 0.9  : evConnected ? 0.35 : 0.15;
      const evDash = evCharging ? 'none' : '4,3';
      const evTxtCol = evCharging ? '#34d399' : evConnected ? '#2a6a50' : '#1e3040';
      const evBadgeBorder = evCharging ? 0.85 : evConnected ? 0.4 : 0.18;
      const evLabel = evCharging
        ? (evSoc !== null ? fmtDE(evPower) + ' · ' + Math.round(evSoc) + '%' : fmtDE(evPower))
        : evConnected ? 'Verbunden' : 'Kein E-Auto';
      const evParticles = evCharging
        ? '<circle r="2.5" fill="#34d399" opacity="0" filter="url(#fg' + uid + ')">'
          + '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.08;0.2;0.9;1" dur="1.2s" repeatCount="indefinite"/>'
          + '<animateMotion dur="1.2s" begin="0s" repeatCount="indefinite"><mpath href="#ev' + uid + '"/></animateMotion></circle>'
          + '<circle r="2.5" fill="#34d399" opacity="0" filter="url(#fg' + uid + ')">'
          + '<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.08;0.2;0.9;1" dur="1.2s" begin="-0.6s" repeatCount="indefinite"/>'
          + '<animateMotion dur="1.2s" begin="-0.6s" repeatCount="indefinite"><mpath href="#ev' + uid + '"/></animateMotion></circle>'
        : '';
      const evSVGBlock = hasEv
        ? '<path id="ev' + uid + '" d="M 140,281 C 124,281 116,281 104,281"/>'
          + '<path d="M 140,281 C 124,281 116,281 104,281" fill="none" stroke="' + evCol + '" stroke-width="6" opacity="' + evGlow + '" stroke-linecap="round"/>'
          + '<path d="M 140,281 C 124,281 116,281 104,281" fill="none" stroke="' + evCol + '" stroke-width="2" opacity="' + evLine + '" stroke-linecap="round" stroke-dasharray="' + evDash + '"/>'
          + '<circle cx="106" cy="281" r="5" fill="#060e16" stroke="' + evCol + '" stroke-width="1.2" stroke-opacity="' + (evCharging?0.9:evConnected?0.5:0.2) + '"/>'
          + '<text x="106" y="284" text-anchor="middle" font-size="6" fill="' + evCol + '">&#x26A1;</text>'
          + evParticles
          + '<rect x="22" y="281" width="78" height="17" rx="5" fill="rgba(4,8,18,0.92)" stroke="' + evCol + '" stroke-width="0.8" stroke-opacity="' + evBadgeBorder + '"/>'
          + '<text x="61" y="292" text-anchor="middle" font-size="7.5" font-weight="700" fill="' + evTxtCol + '" font-family="Inter,sans-serif">' + evLabel + '</text>'
        : '';

      // ── Batterie-Speicher-Box (pulsiert grün=Laden / rot=Entladen) ──
      const batPulse = dir === 'charging' ? '#34d399' : dir === 'discharging' ? '#ef4444' : null;
      const batBoxStroke = batPulse || batCol;
      const batBar = (y, baseOp, delay) =>
        batPulse
          ? '<rect x="283" y="' + y + '" width="14" height="7" rx="1" fill="' + batPulse + '" opacity="' + baseOp + '"><animate attributeName="opacity" values="' + baseOp + ';0.75;' + baseOp + '" dur="1.5s" begin="' + delay + 's" repeatCount="indefinite"/></rect>'
          : '<rect x="283" y="' + y + '" width="14" height="7" rx="1" fill="' + batCol + '" opacity="' + baseOp + '"/>';
      const batGlow = batPulse
        ? '<rect x="275" y="195" width="30" height="46" rx="6" fill="' + batPulse + '" opacity="0.05"><animate attributeName="opacity" values="0.04;0.24;0.04" dur="1.6s" repeatCount="indefinite"/></rect>'
        : '';
      // Lade-Welle: von unten nach oben; Entlade-Welle: von oben nach unten
      const dTop = dir === 'discharging' ? 0    : 0.9;
      const dMid = 0.45;
      const dBot = dir === 'discharging' ? 0.9  : 0;
      const batBoxBlock = batGlow
        + '<rect x="280" y="200" width="20" height="36" rx="3" fill="#081420" stroke="' + batBoxStroke + '" stroke-width="0.9" stroke-opacity="' + (batPulse ? 0.7 : 0.4) + '"/>'
        + batBar(203, soc !== null && soc > 66 ? 0.22 : 0.06, dTop)
        + batBar(212, soc !== null && soc > 33 ? 0.16 : 0.06, dMid)
        + batBar(221, 0.1, dBot)
        + '<rect x="286" y="198" width="8" height="3" rx="1" fill="#081420" stroke="' + batBoxStroke + '" stroke-width="0.5" stroke-opacity="' + (batPulse ? 0.5 : 0.3) + '"/>';

      const houseSVG = `<svg viewBox="0 0 340 310" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
  <defs>
    <filter id="fg${uid}"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="soft${uid}"><feGaussianBlur stdDeviation="2"/></filter>
    <linearGradient id="lg${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${gridCol}" stop-opacity="1"/><stop offset="100%" stop-color="${gridCol}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="ls${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fcd34d" stop-opacity="1"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lh${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9" stop-opacity="1"/><stop offset="100%" stop-color="#0891b2" stop-opacity="0"/>
    </linearGradient>
    <path id="pg${uid}" d="${gpathGrid}"/>
    <path id="ps${uid}" d="${gpathSolar}"/>
    <path id="ph${uid}" d="${gpathHouse}"/>
  </defs>
  <ellipse cx="172" cy="289" rx="118" ry="11" fill="#000" opacity="0.4"/>
  <rect x="82" y="196" width="68" height="80" rx="2" fill="#0b1520"/>
  <rect x="87" y="220" width="58" height="51" rx="1" fill="#091018" stroke="rgba(255,255,255,0.04)" stroke-width="0.8"/>
  <line x1="87" y1="233" x2="145" y2="233" stroke="rgba(255,255,255,0.035)" stroke-width="0.6"/>
  <line x1="87" y1="246" x2="145" y2="246" stroke="rgba(255,255,255,0.035)" stroke-width="0.6"/>
  <line x1="87" y1="259" x2="145" y2="259" stroke="rgba(255,255,255,0.035)" stroke-width="0.6"/>
  <rect x="148" y="166" width="110" height="110" rx="2" fill="#0d1825"/>
  <rect x="148" y="166" width="110" height="110" rx="2" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
  <polygon points="74,198 116,160 158,198" fill="#0e1e2e"/>
  <polygon points="74,198 116,160 158,198" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.8"/>
  <polygon points="138,168 203,108 268,168" fill="#101f30"/>
  <polygon points="138,168 203,108 268,168" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="0.8"/>
  ${solarActive ? `<ellipse cx="200" cy="124" rx="35" ry="10" fill="#fbbf24" opacity="0.05" filter="url(#soft${uid})"/>` : ""}
  <rect x="153" y="130" width="19" height="12" rx="1" fill="${solarActive?"#0d2e48":"#0a1825"}" stroke="${solarActive?"#1e5070":"#1a2535"}" stroke-width="0.7" opacity="${solarActive?1:0.4}"/>
  <rect x="174" y="122" width="19" height="12" rx="1" fill="${solarActive?"#0d2e48":"#0a1825"}" stroke="${solarActive?"#1e5070":"#1a2535"}" stroke-width="0.7" opacity="${solarActive?1:0.4}"/>
  <rect x="195" y="115" width="19" height="12" rx="1" fill="${solarActive?"#0d2e48":"#0a1825"}" stroke="${solarActive?"#1e5070":"#1a2535"}" stroke-width="0.7" opacity="${solarActive?1:0.4}"/>
  <rect x="216" y="122" width="19" height="12" rx="1" fill="${solarActive?"#0d2e48":"#0a1825"}" stroke="${solarActive?"#1e5070":"#1a2535"}" stroke-width="0.7" opacity="${solarActive?1:0.4}"/>
  <line x1="162" y1="130" x2="162" y2="142" stroke="${solarActive?"#1e5070":"#1a2535"}" stroke-width="0.5" opacity="${solarActive?1:0.4}"/>
  <line x1="183" y1="122" x2="183" y2="134" stroke="${solarActive?"#1e5070":"#1a2535"}" stroke-width="0.5" opacity="${solarActive?1:0.4}"/>
  <line x1="204" y1="115" x2="204" y2="127" stroke="${solarActive?"#1e5070":"#1a2535"}" stroke-width="0.5" opacity="${solarActive?1:0.4}"/>
  <rect x="157" y="179" width="28" height="22" rx="2" fill="#091622" stroke="rgba(255,255,255,0.07)" stroke-width="0.7"/>
  <line x1="171" y1="179" x2="171" y2="201" stroke="rgba(255,255,255,0.04)" stroke-width="0.7"/>
  <line x1="157" y1="190" x2="185" y2="190" stroke="rgba(255,255,255,0.04)" stroke-width="0.7"/>
  <rect x="158" y="180" width="12" height="10" rx="1" fill="rgba(255,210,80,0.07)"/>
  <rect x="220" y="179" width="28" height="22" rx="2" fill="#091622" stroke="rgba(255,255,255,0.07)" stroke-width="0.7"/>
  <line x1="234" y1="179" x2="234" y2="201" stroke="rgba(255,255,255,0.04)" stroke-width="0.7"/>
  <line x1="220" y1="190" x2="248" y2="190" stroke="rgba(255,255,255,0.04)" stroke-width="0.7"/>
  <rect x="183" y="221" width="34" height="55" rx="2" fill="#091018" stroke="rgba(255,255,255,0.06)" stroke-width="0.7"/>
  <circle cx="213" cy="249" r="2" fill="rgba(255,190,80,0.2)"/>
  ${batBoxBlock}
  <ellipse cx="90" cy="285" rx="42" ry="8" fill="rgba(0,0,0,0.3)"/>
  <rect x="55" y="267" width="72" height="18" rx="7" fill="#0c1a26"/>
  <rect x="63" y="259" width="56" height="16" rx="5" fill="#0c1a26"/>
  <rect x="57" y="279" width="11" height="6" rx="3" fill="#060e16"/>
  <rect x="114" y="279" width="11" height="6" rx="3" fill="#060e16"/>
  <rect x="55" y="269" width="5" height="5" rx="1" fill="${evCharging ? 'rgba(52,211,153,0.6)' : 'rgba(255,210,80,0.18)'}"/>
  <rect x="122" y="269" width="5" height="5" rx="1" fill="rgba(255,80,80,0.12)"/>

  <!-- ── E-AUTO LADEKABEL & ANZEIGE ── -->
  ${evSVGBlock}

  ${showGrid ? `<line x1="58" y1="0" x2="58" y2="196" stroke="${gridCol}" stroke-width="10" opacity="0.06" stroke-linecap="round"/>
  <line x1="58" y1="0" x2="58" y2="196" stroke="${gridCol}" stroke-width="2.5" opacity="0.14" stroke-linecap="round"/>
  <line x1="58" y1="0" x2="58" y2="196" stroke="url(#lg${uid})" stroke-width="1.6" stroke-linecap="round" filter="url(#fg${uid})"/>
  <line x1="58" y1="193" x2="82" y2="180" stroke="${gridCol}" stroke-width="1" opacity="0.22" stroke-linecap="round"/>` : ""}
  ${solarActive ? `<line x1="170" y1="0" x2="170" y2="125" stroke="#fbbf24" stroke-width="10" opacity="0.06" stroke-linecap="round"/>
  <line x1="170" y1="0" x2="170" y2="125" stroke="#fbbf24" stroke-width="2.5" opacity="0.14" stroke-linecap="round"/>
  <line x1="170" y1="0" x2="170" y2="125" stroke="url(#ls${uid})" stroke-width="1.6" stroke-linecap="round" filter="url(#fg${uid})"/>
  <circle cx="170" cy="125" r="3.5" fill="#fbbf24" opacity="0.45" filter="url(#fg${uid})"/>` : ""}
  <line x1="282" y1="0" x2="282" y2="196" stroke="#22d3ee" stroke-width="10" opacity="0.06" stroke-linecap="round"/>
  <line x1="282" y1="0" x2="282" y2="196" stroke="#22d3ee" stroke-width="2.5" opacity="0.14" stroke-linecap="round"/>
  <line x1="282" y1="0" x2="282" y2="196" stroke="url(#lh${uid})" stroke-width="1.6" stroke-linecap="round" filter="url(#fg${uid})"/>
  <line x1="282" y1="193" x2="258" y2="180" stroke="#22d3ee" stroke-width="1" opacity="0.22" stroke-linecap="round"/>
  ${showGrid ? mkPts(nPts(Math.abs(gridPower||0),3000), gridCol, "#pg"+uid, gridDur) : ""}
  ${solarActive ? mkPts(nPts(totalSolar,8000), "#fcd34d", "#ps"+uid, solarDur) : ""}
  ${mkPts(nPts(homePower||Math.abs(power||0),5000), "#67e8f9", "#ph"+uid, homeDur)}
  ${showGrid ? `<text x="58" y="16" text-anchor="middle" font-size="14" font-weight="700" fill="${gridCol}" font-family="Inter,sans-serif" letter-spacing="-0.5">${gridPower !== null ? fmtDE(Math.abs(gridPower)) : "— W"}</text>
  <text x="58" y="28" text-anchor="middle" font-size="7" font-weight="600" fill="${gridCol}" font-family="Inter,sans-serif" letter-spacing="1.5" opacity="0.7">${gridTxt}</text>` : ""}
  <text x="170" y="16" text-anchor="middle" font-size="14" font-weight="700" fill="${solarActive?"#fcd34d":"#1a2535"}" font-family="Inter,sans-serif" letter-spacing="-0.5">${totalSolar !== null ? fmtDE(totalSolar) : "— W"}</text>
  <text x="170" y="28" text-anchor="middle" font-size="7" font-weight="600" fill="${solarActive?"#f59e0b":"#1a2535"}" font-family="Inter,sans-serif" letter-spacing="1.5" opacity="0.7">SOLAR</text>
  <text x="282" y="16" text-anchor="middle" font-size="14" font-weight="700" fill="#67e8f9" font-family="Inter,sans-serif" letter-spacing="-0.5">${homePower !== null ? fmtDE(homePower) : acPower !== null ? fmtDE(acPower) : "— W"}</text>
  <text x="282" y="28" text-anchor="middle" font-size="7" font-weight="600" fill="#0891b2" font-family="Inter,sans-serif" letter-spacing="1.5" opacity="0.7">HAUS</text>
  <rect x="258" y="248" width="58" height="22" rx="8" fill="rgba(4,8,18,0.88)" stroke="${batCol}" stroke-width="0.7" stroke-opacity="0.35"/>
  <text x="287" y="263" text-anchor="middle" font-size="13" font-weight="700" fill="${socCol}" font-family="Inter,sans-serif" letter-spacing="-0.3">${soc !== null ? Math.round(soc)+"%" : "—"}</text>
  <text x="287" y="277" text-anchor="middle" font-size="6.5" font-weight="600" fill="${batCol}" font-family="Inter,sans-serif" letter-spacing="0.8" opacity="0.8">${batLbl}${Math.abs(power||0) > 20 ? " · "+fmtDE(Math.abs(power)) : ""}</text>
  ${selfPct !== null ? `<text x="170" y="302" text-anchor="middle" font-size="9" font-weight="600" fill="#22c55e" font-family="Inter,sans-serif">${selfPct} Eigenverbrauch</text>` : modeLabel ? `<text x="170" y="302" text-anchor="middle" font-size="9" font-weight="500" fill="#1e3a4a" font-family="Inter,sans-serif">${modeLabel}</text>` : ""}

  <!-- Klickbare Bereiche (unsichtbar) -->
  ${showGrid && cfg.entities.grid_power ? `<rect x="20" y="0" width="80" height="230" rx="4" fill="transparent" data-mv-entity="grid_power" style="cursor:pointer"/>` : ''}
  ${cfg.entities.mppt1_power || cfg.entities.mppt2_power ? `<rect x="120" y="0" width="100" height="145" rx="4" fill="transparent" data-mv-entity="${cfg.entities.mppt1_power ? 'mppt1_power' : 'mppt2_power'}" style="cursor:pointer"/>` : ''}
  ${cfg.entities.home_consumption || cfg.entities.ac_power ? `<rect x="232" y="0" width="100" height="230" rx="4" fill="transparent" data-mv-entity="${cfg.entities.home_consumption ? 'home_consumption' : 'ac_power'}" style="cursor:pointer"/>` : ''}
  ${cfg.entities.battery_soc ? `<rect x="215" y="235" width="90" height="55" rx="4" fill="transparent" data-mv-entity="battery_soc" style="cursor:pointer"/>` : ''}
  ${hasEv && cfg.entities.ev_charge_power ? `<rect x="42" y="243" width="76" height="40" rx="4" fill="transparent" data-mv-entity="ev_charge_power" style="cursor:pointer"/>` : ''}
  ${hasEv && !cfg.entities.ev_charge_power && cfg.entities.ev_soc ? `<rect x="42" y="243" width="76" height="40" rx="4" fill="transparent" data-mv-entity="ev_soc" style="cursor:pointer"/>` : ''}
</svg>`;

      const html = `
<style>${CARD_CSS}</style>
<div class="mv-card">
  <div class="mv-hdr">
    <div class="mv-hdr-l">
      <div class="mv-hdr-icon" style="background:${iconGrad}">&#x1F50B;</div>
      <div>
        <div class="mv-hdr-name">${title}</div>
        ${invState ? `<div class="mv-hdr-brand">${invState}</div>` : cfg.entity_prefix ? `<div class="mv-hdr-brand">${cfg.entity_prefix}</div>` : ""}
      </div>
    </div>
    <div class="mv-hdr-r">
      ${alarm === "fault" ? `<div class="mv-chip off" style="color:#ef4444;border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.08);animation:mv-blink 1s infinite"><div class="mv-chip-dot"></div>Alarm</div>` : chipLabel ? `<div class="mv-chip ${chipOn?"on":"off"}"><div class="mv-chip-dot"></div>${chipOn?"Online":"Offline"}</div>` : ""}
    </div>
  </div>
  <div class="mv-house-wrap">${houseSVG}</div>
  ${cfg.show_energy_stats ? `<div class="mv-info-strip">
    <div class="mv-info-item sol" ${cfg.entities.total_daily_charging_energy ? `data-mv-entity="total_daily_charging_energy"` : ''}>
      <div class="mv-info-v">${dailyC !== null ? dailyC.toFixed(1) : "—"}</div>
      <div class="mv-info-l">kWh Geladen</div>
    </div>
    <div class="mv-info-item chg" ${cfg.entities.total_daily_discharging_energy ? `data-mv-entity="total_daily_discharging_energy"` : ''}>
      <div class="mv-info-v">${dailyD !== null ? dailyD.toFixed(1) : "—"}</div>
      <div class="mv-info-l">kWh Entladen</div>
    </div>
    <div class="mv-info-item con" ${cfg.entities.stored_energy ? `data-mv-entity="stored_energy"` : ''}>
      <div class="mv-info-v">${stored !== null ? stored.toFixed(1) : "—"}</div>
      <div class="mv-info-l">kWh Gespeich.</div>
    </div>
    <div class="mv-info-item cyc" ${cfg.entities.battery_cycle_count_calc ? `data-mv-entity="battery_cycle_count_calc"` : cfg.entities.battery_cycle_count ? `data-mv-entity="battery_cycle_count"` : ''}>
      <div class="mv-info-v">${cycles !== null ? Math.round(cycles) : "—"}</div>
      <div class="mv-info-l">Zyklen</div>
    </div>
  </div>` : ""}
  ${cfg.show_health ? `<div class="mv-detail-row">
    ${temp !== null ? `<div class="mv-detail-item" data-mv-entity="internal_temperature">&#x1F321; <b style="color:${temp>50?"#ef4444":temp>40?"#f59e0b":"#22c55e"}">${temp.toFixed(1)}&deg;C</b></div>` : ""}
    ${voltage !== null ? `<div class="mv-detail-item" data-mv-entity="battery_voltage">&#x26A1; <b>${[voltage?voltage.toFixed(1)+"V":null,current?current.toFixed(1)+"A":null].filter(Boolean).join(" · ")}</b></div>` : ""}
    ${eff !== null ? `<div class="mv-detail-item" data-mv-entity="round_trip_efficiency_total">&#x1F4C8; <b style="color:#00cfff">${eff.toFixed(1)}%</b></div>` : ""}
    ${cellDelta !== null ? `<div class="mv-detail-item" data-mv-entity="max_cell_voltage">&#x2696; <b style="color:${cellDelta<50?"#22c55e":cellDelta<100?"#f59e0b":"#ef4444"}">${cellDelta}mV</b></div>` : ""}
  </div>` : ""}
  <div class="mv-ftr">
    <span>${lastUpd ? lastUpd : "Warte auf Daten..."}</span>
    <span>Energy Management Dashboard v${VERSION}</span>
  </div>
</div>`;

      this.shadowRoot.innerHTML = html;

      // ── Klick-Handler: Entitäten öffnen ────────────────────────────
      const fireMoreInfo = (entityId) => {
        if (!entityId) return;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          detail: { entityId },
          bubbles: true,
          composed: true,
        }));
      };

      this.shadowRoot.querySelectorAll('[data-mv-entity]').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
          const key = el.dataset.mvEntity;
          const entityId = cfg.entities[key];
          fireMoreInfo(entityId);
        });
      });
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
      const structuralKeys = ['title', 'entity_prefix', 'show_health', 'show_energy_stats'];
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
        { key: 'home_consumption',               domain: 'sensor'        },
        { key: 'grid_power',                     domain: 'sensor'        },
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
        { key: 'ev_charge_power',                domain: 'sensor'        },
        { key: 'ev_soc',                         domain: 'sensor'        },
        { key: 'ev_connected',                   domain: 'binary_sensor' },
        { key: 'ev_daily_energy',                domain: 'sensor'        },
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
        { key: 'show_energy_stats', label: 'Energie-Statistiken',  desc: 'Tages- und Gesamtenergiewerte' },
        { key: 'show_health',       label: 'Batterie-Gesundheit',  desc: 'Temperatur, Zellspannung, Balance' },
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
      documentationURL: 'https://github.com/buggel1009/Energy-Managament-Dashboard',
    });
  }

  console.info(
    `%c ENERGY MANAGEMENT DASHBOARD %c v${VERSION} `,
    'background:#00e5b3;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px;',
    'background:#1e293b;color:#00e5b3;font-weight:600;padding:2px 4px;border-radius:0 3px 3px 0;',
  );

})();
