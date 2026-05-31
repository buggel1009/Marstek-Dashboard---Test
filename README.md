# Marstek Venus Dashboard

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Version-1.2.0-00e5b3.svg)]()

**Premium Lovelace Dashboard-Karte** für [Marstek Venus Energy Manager](https://github.com/ffunes/marstek-venus-energy-manager)  
Unterstützt: Venus E v2/v3, Venus A, Venus D

---

## Vorschau

Ein modernes, dunkles Dashboard mit:
- **Animierter SOC-Anzeige** (Kreisbogen-Gauge mit Farbverlauf)
- **Echtzeit-Leistungsanzeige** mit animiertem Flussindikator
- **Energie-Statistiken** (Tages- und Gesamtwerte)
- **Batterie-Gesundheit** (Temperatur, Zellspannungen, Balance)
- **Direkte Steuerung** (Laden / Entladen / Automatik)
- **Status-Indikatoren** (WLAN, Cloud, Alarm)

---

## Installation via HACS

### Methode 1: HACS Custom Repository
1. **HACS** → **Frontend** → ⋮ → **Benutzerdefinierte Repositories**
2. Repository-URL eintragen: `https://github.com/DEIN-BENUTZERNAME/marstek-venus-dashboard`
3. Kategorie: **Lovelace** wählen
4. **Hinzufügen** klicken
5. Karte suchen und **Installieren**
6. Home Assistant neu laden (`Strg + F5` oder Seite neu laden)

### Methode 2: Manuelle Installation
1. Datei [`marstek-venus-dashboard.js`](marstek-venus-dashboard.js) herunterladen
2. In `config/www/` ablegen
3. **Einstellungen → Dashboards → Ressourcen** (oben rechts ⋮)
4. Ressource hinzufügen: `/local/marstek-venus-dashboard.js` → Typ: **JavaScript-Modul**
5. Home Assistant neu laden

---

## Konfiguration

### Grundkonfiguration (YAML)

```yaml
type: custom:marstek-venus-dashboard
title: Mein Batteriespeicher
entities:
  battery_soc: sensor.marstek_venus_battery_soc
  battery_power: sensor.marstek_venus_battery_power
  ac_power: sensor.marstek_venus_ac_power
  internal_temperature: sensor.marstek_venus_internal_temperature
  battery_voltage: sensor.marstek_venus_battery_voltage
  max_cell_voltage: sensor.marstek_venus_max_cell_voltage
  min_cell_voltage: sensor.marstek_venus_min_cell_voltage
  total_daily_charging_energy: sensor.marstek_venus_total_daily_charging_energy
  total_daily_discharging_energy: sensor.marstek_venus_total_daily_discharging_energy
  total_charging_energy: sensor.marstek_venus_total_charging_energy
  total_discharging_energy: sensor.marstek_venus_total_discharging_energy
  stored_energy: sensor.marstek_venus_stored_energy
  battery_cycle_count_calc: sensor.marstek_venus_battery_cycle_count_calc
  round_trip_efficiency_total: sensor.marstek_venus_round_trip_efficiency_total
  fault_status: sensor.marstek_venus_fault_status
  alarm_status: sensor.marstek_venus_alarm_status
  inverter_state: sensor.marstek_venus_inverter_state
  force_mode: select.marstek_venus_force_mode
  user_work_mode: select.marstek_venus_user_work_mode
  wifi_status: binary_sensor.marstek_venus_wifi_status
  cloud_status: binary_sensor.marstek_venus_cloud_status
```

### Für Multi-Batterie-Setups

```yaml
type: custom:marstek-venus-dashboard
title: Batterie-System
entities:
  system_soc: sensor.marstek_venus_system_soc
  system_charge_power: sensor.marstek_venus_system_charge_power
  system_discharge_power: sensor.marstek_venus_system_discharge_power
  system_daily_charging_energy: sensor.marstek_venus_system_daily_charging_energy
  system_daily_discharging_energy: sensor.marstek_venus_system_daily_discharging_energy
  # ...weitere Entitäten
```

### Alle Optionen

| Option | Standard | Beschreibung |
|--------|----------|--------------|
| `title` | `Marstek Venus` | Titel der Karte |
| `entity_prefix` | `''` | Prefix für Auto-Erkennung |
| `show_controls` | `true` | Steuerbuttons (Laden/Entladen/Auto) |
| `show_energy_stats` | `true` | Energie-Statistik-Raster |
| `show_health` | `true` | Batterie-Gesundheits-Details |
| `show_ac` | `true` | AC-Leistungsbalken |

---

## Über den Editor konfigurieren

1. Karte im Lovelace-Dashboard hinzufügen: **Karte hinzufügen → Benutzerdefiniert → Marstek Venus Dashboard**
2. **Geräte-Prefix** eingeben (z.B. `marstek_venus`)
3. Auf **🔍 Entitäten automatisch erkennen** klicken
4. Verbleibende Entitäten manuell über Dropdown-Menüs zuweisen

---

## Unterstützte Entitäten

| Schlüssel | Domäne | Beschreibung |
|-----------|--------|--------------|
| `battery_soc` | sensor | Batterieladezustand (%) |
| `battery_power` | sensor | Batterieleistung (W) |
| `ac_power` | sensor | AC-Leistung (W) |
| `internal_temperature` | sensor | Innentemperatur (°C) |
| `battery_voltage` | sensor | Batteriespannung (V) |
| `max_cell_voltage` | sensor | Maximale Zellspannung (V) |
| `min_cell_voltage` | sensor | Minimale Zellspannung (V) |
| `total_daily_charging_energy` | sensor | Tagesladung (kWh) |
| `total_daily_discharging_energy` | sensor | Tagesentladung (kWh) |
| `total_charging_energy` | sensor | Gesamtladung (kWh) |
| `total_discharging_energy` | sensor | Gesamtentladung (kWh) |
| `stored_energy` | sensor | Gespeicherte Energie (kWh) |
| `battery_cycle_count_calc` | sensor | Ladezyklen |
| `round_trip_efficiency_total` | sensor | Wirkungsgrad (%) |
| `fault_status` | sensor | Fehlerstatus |
| `alarm_status` | sensor | Alarmstatus |
| `inverter_state` | sensor | Wechselrichterstatus |
| `force_mode` | select | Betriebsmodus (Laden/Entladen/Auto) |
| `user_work_mode` | select | Arbeitsmodus |
| `wifi_status` | binary_sensor | WLAN-Status |
| `cloud_status` | binary_sensor | Cloud-Status |
| `system_soc` | sensor | System-SOC (Multi-Batterie) |
| `system_charge_power` | sensor | System-Ladeleistung (Multi) |
| `system_discharge_power` | sensor | System-Entladeleistung (Multi) |

---

## Voraussetzungen

- Home Assistant ≥ 2024.4.0
- [Marstek Venus Energy Manager](https://github.com/ffunes/marstek-venus-energy-manager) installiert und konfiguriert

---

## Lizenz

MIT License — Basierend auf der Integration von [@ffunes](https://github.com/ffunes)
