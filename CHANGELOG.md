# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und das Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] – 2026-06-04

### 🎉 Erste Veröffentlichung

Premium Energy-Management-Dashboard für Home Assistant — universell für alle
Batteriespeicher (Marstek, Victron, Sungrow, Fronius, Huawei, Fox ESS u. v. m.).

### Hinzugefügt
- 🏠 **Haus-Visualisierung** mit farbigen Energie-Strängen (Netz · Solar · Haus)
- 🔋 **Pulsierende Batterie** – leuchtet **grün beim Laden**, **rot beim Entladen**
  (animierte Füllbalken-Welle nach oben/unten)
- 🌊 **Animierter Energiefluss** – Partikel je Strang, Geschwindigkeit proportional zur Leistung
- 🚗 **E-Auto / Wallbox** – Ladekabel + Badge mit Leistung & Akku-SOC, animiert beim Laden
- ⚡ **Automatische Netzrichtung** – Bezug (lila) ↔ Einspeisung (grün)
- 📊 **Tagesstatistik** – kWh geladen / entladen / gespeichert / Zyklen
- 🌡️ **Detail-Werte** – Temperatur, Spannung/Strom, Effizienz, Zell-Delta
- 👆 **Klickbare Werte** – jeder Wert öffnet den HA-Verlauf (More-Info) der Entität
- 🔔 **Alarm-Anzeige** – blinkender Chip bei Fehlern
- 🏭 **Multi-Hersteller** – Icon-Farbe passt sich automatisch dem Gerät an
- ⚙️ **Visueller Editor** mit Kopiervorlage (Entity-IDs aus Geräteprefix generieren)

### Hinweise
- Reine Lese-/Monitoring-Ansicht (keine Steuerbuttons)
- Mindestens `battery_soc` + `battery_power` erforderlich
