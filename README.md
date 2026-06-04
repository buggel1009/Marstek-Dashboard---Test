# Energy Management Dashboard

**Premium Lovelace Dashboard-Karte für Batteriespeicher in Home Assistant**

[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Version](https://img.shields.io/badge/version-3.0.0-00cfff.svg)](#)
[![HA](https://img.shields.io/badge/Home%20Assistant-2024.4+-blue.svg)](https://www.home-assistant.io)

---

## Vorschau

<p align="center">
  <img src="screenshots/charging.jpg" width="320" alt="Solar aktiv · Einspeisung · 72% SOC"/>
</p>
<p align="center"><sub><b>☀ Solar aktiv · Einspeisung ins Netz · Marstek Venus E v3</b></sub></p>

<p align="center">
  <img src="screenshots/discharging.jpg" width="320" alt="Entladen · Netzbezug · 58% SOC"/>
  &nbsp;&nbsp;
  <img src="screenshots/alarm.jpg" width="320" alt="Niedrig · 18% SOC · Übertemperatur"/>
</p>
<p align="center">
  <sub><b>↓ Entladen · Victron MultiPlus</b></sub>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <sub><b>⚠ Niedrig · Sungrow SBR192</b></sub>
</p>

---

## Unterstützte Systeme

| Hersteller | Modelle |
|------------|---------|
| **Marstek** | Venus E v1/v2/v3, Venus A, Venus D |
| **Victron** | MultiPlus-II, EasySolar, MPII |
| **Sungrow** | SBR096 – SBR256, SBH |
| **Fronius** | Symo GEN24, BYD HVM/HVS |
| **Huawei** | LUNA2000 |
| **Fox ESS** | T-Series, ECS |
| **Andere** | Alle Speicher mit HA-Integration |

---

## Installation via HACS

1. **HACS** → *Frontend* → ⋮ → *Benutzerdefinierte Repositories*
2. URL eintragen: `https://github.com/pauer/energy-management-dashboard`
3. Kategorie: **Lovelace**
4. Installieren → Home Assistant neu laden

### Manuelle Installation

Datei `energy-management-dashboard.js` in den Ordner `/config/www/` kopieren und als Lovelace-Ressource einbinden:

```yaml
# configuration.yaml oder Lovelace-Ressourcen
resources:
  - url: /local/energy-management-dashboard.js
    type: module
```

---

## Karte einrichten

```yaml
type: custom:energy-management-dashboard
title: Heimspeicher
entity_prefix: marstek_venus_1   # → generiert Kopiervorlage im Editor
show_controls: true
show_health: true
show_energy_stats: true
entities:
  battery_soc: sensor.marstek_venus_1_battery_soc
  battery_power: sensor.marstek_venus_1_battery_power
  internal_temperature: sensor.marstek_venus_1_internal_temperature
  battery_voltage: sensor.marstek_venus_1_battery_voltage
  battery_current: sensor.marstek_venus_1_battery_current
  total_daily_charging_energy: sensor.marstek_venus_1_total_daily_charging_energy
  total_daily_discharging_energy: sensor.marstek_venus_1_total_daily_discharging_energy
  stored_energy: sensor.marstek_venus_1_stored_energy
  battery_cycle_count_calc: sensor.marstek_venus_1_battery_cycle_count_calc
  round_trip_efficiency_total: sensor.marstek_venus_1_round_trip_efficiency_total
  total_charging_energy: sensor.marstek_venus_1_total_charging_energy
  total_discharging_energy: sensor.marstek_venus_1_total_discharging_energy
  max_cell_voltage: sensor.marstek_venus_1_max_cell_voltage
  min_cell_voltage: sensor.marstek_venus_1_min_cell_voltage
  balance_status: sensor.marstek_venus_1_balance_status
  balance_last_measurement: sensor.marstek_venus_1_balance_last_measurement
  balance_trend: sensor.marstek_venus_1_balance_trend
  fault_status: sensor.marstek_venus_1_fault_status
  alarm_status: sensor.marstek_venus_1_alarm_status
  wifi_status: binary_sensor.marstek_venus_1_wifi_status
  force_mode: select.marstek_venus_1_force_mode
  ac_power: sensor.marstek_venus_1_ac_power
  mppt1_power: sensor.marstek_venus_1_mppt1_power
  mppt2_power: sensor.marstek_venus_1_mppt2_power
```

> **Tipp:** Im visuellen Editor einfach den `entity_prefix` (z.B. `marstek_venus_1`) eingeben — die Karte generiert dann automatisch eine vollständige Kopiervorlage mit allen Entity-IDs.

---

## Features

| Feature | Beschreibung |
|---------|-------------|
| 🔢 **Großer SOC** | Dominante Zahl mit dynamischer Farbe (blau → grün → gelb → rot) |
| ⚡ **Live Power** | Lade-/Entladeleistung mit Richtungsanzeige |
| 🌊 **Energiefluss** | Animiertes Solar → Batterie → Haus → Netz mit Partikel-Animation |
| 📊 **Tagesstatistik** | kWh geladen, entladen, gespeichert, Zyklen |
| ⚖️ **Zell-Balance** | Status, Delta mV, Trend |
| 🌡️ **Temperaturen** | Innen, MOS1/2, Zellen min/max |
| 🎮 **Steuerung** | Laden / Entladen / Auto (wenn `force_mode` konfiguriert) |
| 🔔 **Alarm** | Blinkender Alarm-Chip, rotierender Warnring bei Fehlern |
| 🏭 **Multi-Hersteller** | Icon-Farbe passt sich automatisch dem Gerät an |
| 🌑 **Dark Mode** | Natives Dark-Theme optimiert für HA-Dashboards |

---

## Konfigurationsoptionen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|--------------|
| `title` | string | `Heimspeicher` | Anzeigename der Karte |
| `entity_prefix` | string | — | Geräteprefix für Kopiervorlage im Editor |
| `show_controls` | bool | `true` | Steuerbuttons (Laden/Entladen/Auto) anzeigen |
| `show_health` | bool | `true` | Detaildaten (Temp, Spannung, Effizienz) anzeigen |
| `show_energy_stats` | bool | `true` | Tagesstatistik-Reihe anzeigen |

---

## Lizenz

MIT License — frei verwendbar, auch für kommerzielle Projekte.

---

*Energy Management Dashboard v3.0.0 · Premium Design für Home Assistant*
