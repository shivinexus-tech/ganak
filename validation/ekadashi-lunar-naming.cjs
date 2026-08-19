#!/usr/bin/env node
// ============================================================================
// validation/ekadashi-lunar-naming.cjs
//
// Ekadashi names are LUNAR-month names. Until 2026-08-18 the calendar scan
// derived them from the GREGORIAN month (`monthNames[(m - 1 + 9) % 12]`), so
// from mid-2027 onward every Krishna-paksha fast carried the previous month's
// name: "Apara Ekadashi" printed twice, Yogini vanished from the whole year,
// Kamika and Aja ran a full lunar month late — in both languages.
//
// This sweep pins the naming against a published reference for twelve years,
// deliberately spanning the Adhika Masa years 2026, 2029, 2031 and 2034 and
// years carrying 24, 25 and 26 Ekadashis.
//
// SOURCE (fetched 2026-08-18, geoname-id=1261481 = New Delhi):
//   https://www.drikpanchang.com/vrats/ekadashidates.html?geoname-id=1261481&year=YYYY
// Each card there carries the date, the vrata name and the lunar month+paksha
// ("Magha, Krishna Ekadashi"). Those month labels are PURNIMANTA (North Indian):
// Drik's Yogini page states "Yogini Ekadashi falls during Krishna Paksha of
// Ashadha month according to North Indian calendar and during Krishna Paksha of
// Jyaishta month according to South Indian calendar."  Ganak follows the
// Purnimanta identity, which is what EKADASHI_NAMES is keyed on.
// Full sourcing note: plans/research/ekadashi-lunar-month-naming.md
// ============================================================================
'use strict';

const assert = require('assert');
const { loadApp } = require('./_load-app.cjs');

const engine = loadApp('src/engine/festivals.ts');
const meta = loadApp('src/data/festival-meta.ts');

// [ date, published name, published lunar month + paksha ]
const DRIK = {
  2024: [
    ['2024-01-07', 'Saphala Ekadashi', 'Pausha, Krishna'],
    ['2024-01-21', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2024-02-06', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2024-02-20', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2024-03-06', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2024-03-20', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2024-04-05', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2024-04-19', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2024-05-04', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2024-05-19', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2024-06-02', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2024-06-18', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2024-07-02', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2024-07-17', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2024-07-31', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2024-08-16', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2024-08-29', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2024-09-14', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2024-09-28', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2024-10-13', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2024-10-28', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2024-11-12', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2024-11-26', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2024-12-11', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2024-12-26', 'Saphala Ekadashi', 'Pausha, Krishna'],
  ],
  2025: [
    ['2025-01-10', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2025-01-25', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2025-02-08', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2025-02-24', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2025-03-10', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2025-03-25', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2025-04-08', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2025-04-24', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2025-05-08', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2025-05-23', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2025-06-06', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2025-06-21', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2025-07-06', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2025-07-21', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2025-08-05', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2025-08-19', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2025-09-03', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2025-09-17', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2025-10-03', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2025-10-17', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2025-11-01', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2025-11-15', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2025-12-01', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2025-12-15', 'Saphala Ekadashi', 'Pausha, Krishna'],
    ['2025-12-30', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
  ],
  2026: [
    ['2026-01-14', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2026-01-29', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2026-02-13', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2026-02-27', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2026-03-15', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2026-03-29', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2026-04-13', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2026-04-27', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2026-05-13', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2026-05-27', 'Padmini Ekadashi', 'Jyeshtha, Shukla'],
    ['2026-06-11', 'Parama Ekadashi', 'Jyeshtha, Krishna'],
    ['2026-06-25', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2026-07-10', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2026-07-25', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2026-08-09', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2026-08-23', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2026-09-07', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2026-09-22', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2026-10-06', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2026-10-22', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2026-11-05', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2026-11-20', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2026-12-04', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2026-12-20', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
  ],
  2027: [
    ['2027-01-03', 'Saphala Ekadashi', 'Pausha, Krishna'],
    ['2027-01-18', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2027-02-02', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2027-02-17', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2027-03-04', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2027-03-18', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2027-04-02', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2027-04-17', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2027-05-02', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2027-05-16', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2027-06-01', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2027-06-14', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2027-06-30', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2027-07-14', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2027-07-29', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2027-08-12', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2027-08-28', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2027-09-11', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2027-09-26', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2027-10-11', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2027-10-25', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2027-11-10', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2027-11-24', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2027-12-09', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2027-12-23', 'Saphala Ekadashi', 'Pausha, Krishna'],
  ],
  2028: [
    ['2028-01-08', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2028-01-22', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2028-02-06', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2028-02-20', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2028-03-07', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2028-03-21', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2028-04-05', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2028-04-20', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2028-05-05', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2028-05-20', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2028-06-03', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2028-06-18', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2028-07-02', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2028-07-18', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2028-08-01', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2028-08-16', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2028-08-30', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2028-09-15', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2028-09-29', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2028-10-14', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2028-10-28', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2028-11-12', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2028-11-27', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2028-12-12', 'Saphala Ekadashi', 'Pausha, Krishna'],
    ['2028-12-27', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
  ],
  2029: [
    ['2029-01-10', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2029-01-26', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2029-02-09', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2029-02-25', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2029-03-10', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2029-03-26', 'Padmini Ekadashi', 'Chaitra, Shukla'],
    ['2029-04-09', 'Parama Ekadashi', 'Chaitra, Krishna'],
    ['2029-04-24', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2029-05-09', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2029-05-24', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2029-06-07', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2029-06-22', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2029-07-07', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2029-07-21', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2029-08-06', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2029-08-20', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2029-09-04', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2029-09-18', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2029-10-04', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2029-10-18', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2029-11-02', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2029-11-16', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2029-12-01', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2029-12-16', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2029-12-31', 'Saphala Ekadashi', 'Pausha, Krishna'],
  ],
  2030: [
    ['2030-01-15', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2030-01-29', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2030-02-14', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2030-02-28', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2030-03-15', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2030-03-29', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2030-04-14', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2030-04-28', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2030-05-13', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2030-05-27', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2030-06-12', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2030-06-26', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2030-07-11', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2030-07-26', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2030-08-09', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2030-08-24', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2030-09-08', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2030-09-23', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2030-10-07', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2030-10-23', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2030-11-05', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2030-11-21', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2030-12-05', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2030-12-21', 'Saphala Ekadashi', 'Pausha, Krishna'],
  ],
  2031: [
    ['2031-01-04', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2031-01-19', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2031-02-03', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2031-02-17', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2031-03-04', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2031-03-19', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2031-04-03', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2031-04-17', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2031-05-03', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2031-05-17', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2031-06-01', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2031-06-15', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2031-07-01', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2031-07-15', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2031-07-30', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2031-08-13', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2031-08-28', 'Padmini Ekadashi', 'Bhadrapada, Shukla'],
    ['2031-09-12', 'Parama Ekadashi', 'Bhadrapada, Krishna'],
    ['2031-09-27', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2031-10-12', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2031-10-26', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2031-11-10', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2031-11-24', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2031-12-10', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2031-12-24', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
  ],
  2032: [
    ['2032-01-09', 'Saphala Ekadashi', 'Pausha, Krishna'],
    ['2032-01-23', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2032-02-07', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2032-02-21', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2032-03-08', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2032-03-22', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2032-04-06', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2032-04-21', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2032-05-05', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2032-05-21', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2032-06-04', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2032-06-19', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2032-07-03', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2032-07-19', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2032-08-01', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2032-08-17', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2032-08-31', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2032-09-15', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2032-09-30', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2032-10-15', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2032-10-29', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2032-11-13', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2032-11-28', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2032-12-12', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2032-12-28', 'Saphala Ekadashi', 'Pausha, Krishna'],
  ],
  2033: [
    ['2033-01-11', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2033-01-27', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2033-02-09', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2033-02-25', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2033-03-11', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2033-03-27', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2033-04-10', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2033-04-25', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2033-05-10', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2033-05-24', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2033-06-08', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2033-06-23', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2033-07-08', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2033-07-22', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2033-08-07', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2033-08-20', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2033-09-05', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2033-09-19', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2033-10-04', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2033-10-18', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2033-11-03', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2033-11-17', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2033-12-02', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2033-12-17', 'Saphala Ekadashi', 'Pausha, Krishna'],
  ],
  2034: [
    ['2034-01-01', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2034-01-16', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2034-01-30', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2034-02-15', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2034-02-28', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2034-03-16', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2034-03-30', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2034-04-15', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2034-04-29', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2034-05-14', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2034-05-28', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2034-06-12', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2034-06-27', 'Padmini Ekadashi', 'Ashadha, Shukla'],
    ['2034-07-12', 'Parama Ekadashi', 'Ashadha, Krishna'],
    ['2034-07-27', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2034-08-10', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2034-08-25', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2034-09-08', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2034-09-24', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2034-10-08', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2034-10-23', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2034-11-06', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2034-11-22', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2034-12-06', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2034-12-21', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
  ],
  2035: [
    ['2035-01-05', 'Saphala Ekadashi', 'Pausha, Krishna'],
    ['2035-01-20', 'Pausha Putrada Ekadashi', 'Pausha, Shukla'],
    ['2035-02-04', 'Shattila Ekadashi', 'Magha, Krishna'],
    ['2035-02-18', 'Jaya Ekadashi', 'Magha, Shukla'],
    ['2035-03-05', 'Vijaya Ekadashi', 'Phalguna, Krishna'],
    ['2035-03-19', 'Amalaki Ekadashi', 'Phalguna, Shukla'],
    ['2035-04-04', 'Papamochani Ekadashi', 'Chaitra, Krishna'],
    ['2035-04-18', 'Kamada Ekadashi', 'Chaitra, Shukla'],
    ['2035-05-04', 'Varuthini Ekadashi', 'Vaishakha, Krishna'],
    ['2035-05-17', 'Mohini Ekadashi', 'Vaishakha, Shukla'],
    ['2035-06-02', 'Apara Ekadashi', 'Jyeshtha, Krishna'],
    ['2035-06-16', 'Nirjala Ekadashi', 'Jyeshtha, Shukla'],
    ['2035-07-01', 'Yogini Ekadashi', 'Ashadha, Krishna'],
    ['2035-07-16', 'Devshayani Ekadashi', 'Ashadha, Shukla'],
    ['2035-07-31', 'Kamika Ekadashi', 'Shravana, Krishna'],
    ['2035-08-14', 'Shravana Putrada Ekadashi', 'Shravana, Shukla'],
    ['2035-08-29', 'Aja Ekadashi', 'Bhadrapada, Krishna'],
    ['2035-09-13', 'Parsva Ekadashi', 'Bhadrapada, Shukla'],
    ['2035-09-27', 'Indira Ekadashi', 'Ashwina, Krishna'],
    ['2035-10-13', 'Papankusha Ekadashi', 'Ashwina, Shukla'],
    ['2035-10-27', 'Rama Ekadashi', 'Kartika, Krishna'],
    ['2035-11-11', 'Devutthana Ekadashi', 'Kartika, Shukla'],
    ['2035-11-25', 'Utpanna Ekadashi', 'Margashirsha, Krishna'],
    ['2035-12-11', 'Mokshada Ekadashi', 'Margashirsha, Shukla'],
    ['2035-12-25', 'Saphala Ekadashi', 'Pausha, Krishna'],
  ],
};

// Ganak's label vs Drik's label for the same vrata. Spelling only — no identity
// differs. (Parivartini is also published as Parsva or Vamana Ekadashi.)
const ALIAS = {
  'Safala Ekadashi': 'Saphala Ekadashi',
  'Papmochani Ekadashi': 'Papamochani Ekadashi',
  'Parivartini Ekadashi': 'Parsva Ekadashi',
};

// Canonical Purnimanta cycle: Krishna paksha precedes Shukla paksha inside each
// lunar month. Written out here, NOT derived from the engine, because the engine
// is the thing under test.
const CYCLE = [
  'Chaitra_Krishna_11', 'Chaitra_Shukla_11',
  'Vaisakha_Krishna_11', 'Vaisakha_Shukla_11',
  'Jyeshtha_Krishna_11', 'Jyeshtha_Shukla_11',
  'Ashadha_Krishna_11', 'Ashadha_Shukla_11',
  'Shravan_Krishna_11', 'Shravan_Shukla_11',
  'Bhadrapad_Krishna_11', 'Bhadrapad_Shukla_11',
  'Ashwin_Krishna_11', 'Ashwin_Shukla_11',
  'Kartik_Krishna_11', 'Kartik_Shukla_11',
  'Margshirsh_Krishna_11', 'Margshirsh_Shukla_11',
  'Paush_Krishna_11', 'Paush_Shukla_11',
  'Magh_Krishna_11', 'Magh_Shukla_11',
  'Phalgun_Krishna_11', 'Phalgun_Shukla_11',
];

// Dates on which Ganak deliberately shows the plain "Ekadashi" label instead of
// a named vrata. Every one of these is checked below to be UNNAMED, never
// MIS-named — showing an ordinary month's name here is the defect this gate
// exists to stop.
//
// BOTH original causes are now resolved, so this list is EMPTY and must stay
// empty. Do not re-populate it to make a failure go away.
//
//  RESOLVED 2026-08-18 (a) — Adhika Masa. The intercalary month's two Ekadashis
//  are Padmini (Shukla) and Parama (Krishna). They used to show as a plain
//  "Ekadashi" because `festival-page-coverage` requires a route for every named
//  label and neither had one. Both are now named and both have guide pages at
//  /festival/padmini-ekadashi and /festival/parama-ekadashi. See
//  plans/research/festival-day-rules.md § 3 and validation/festival-day-rules.cjs.
//
//  RESOLVED 2026-08-18 (b) — `ensureLmWindow` in src/engine/panchang.ts used to
//  sample the sun one hour after the new moon, so Mesha Sankranti 2029
//  (31 minutes after the new moon of 14 Apr) was skipped and that lunation was
//  wrongly flagged Adhika — giving two Adhika months back to back. It now reads
//  the sun's sign at the month's true bounds. Kamada (2029-04-24) and Varuthini
//  (2029-05-09) are named again. See plans/research/adhik-masa-detection.md.
const EXPECTED_UNNAMED = {};
const ADHIKA_KEYS = ['Adhik_Shukla_11', 'Adhik_Krishna_11'];

// New Delhi — the place the published reference above was fetched for.
const TZ = 5.5;
const PLACE = { zone: 'Asia/Kolkata', lat: 28.61, lon: 77.21 };
const YEARS = Object.keys(DRIK).map(Number).sort();
const iso = (ms) => new Date(ms + TZ * 3600000).toISOString().slice(0, 10);
const dayDelta = (a, b) => Math.round((Date.parse(a + 'T00:00Z') - Date.parse(b + 'T00:00Z')) / 86400000);

// ---------------------------------------------------------------- 1. the source
// The published list must itself be well formed before anything is asserted
// against it: every ordinary year carries each of the 24 names exactly once per
// lunar year, and Padmini/Parama appear only in Adhika Masa years.
const flatDrik = [];
for (const y of YEARS) for (const row of DRIK[y]) flatDrik.push(row);
const adhikaDrik = flatDrik.filter(([, name]) => /^(Padmini|Parama) /.test(name));
assert.strictEqual(adhikaDrik.length, 8, 'the reference must carry four Adhika Masa pairs across 2024-2035');
assert.deepStrictEqual(
  adhikaDrik.map(([date]) => date.slice(0, 4)),
  ['2026', '2026', '2029', '2029', '2031', '2031', '2034', '2034'],
  'Adhika Masa years in the reference');
{
  const ordinary = flatDrik.filter(([, name]) => !/^(Padmini|Parama) /.test(name));
  const names = [...new Set(ordinary.map(([, name]) => name))];
  assert.strictEqual(names.length, 24, `the reference must use exactly 24 ordinary names, saw ${names.length}`);
  // Consecutive ordinary entries advance one step around the Purnimanta cycle.
  const nameToStep = new Map();
  for (const key of CYCLE) nameToStep.set(ALIAS[meta.OBS_NAME[key].en] || meta.OBS_NAME[key].en, CYCLE.indexOf(key));
  assert.strictEqual(nameToStep.size, 24, 'every cycle slot must map to a distinct published name');
  for (let i = 1; i < ordinary.length; i += 1) {
    const prev = nameToStep.get(ordinary[i - 1][1]), cur = nameToStep.get(ordinary[i][1]);
    assert.notStrictEqual(prev, undefined, `unmapped published name ${ordinary[i - 1][1]}`);
    assert.strictEqual(cur, (prev + 1) % 24,
      `reference is not a one-step cycle at ${ordinary[i][0]}: ${ordinary[i - 1][1]} -> ${ordinary[i][1]}`);
  }
}

// ------------------------------------------------------------- 2. the engine
const observed = [];
for (const y of YEARS) {
  const days = Math.round((Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1)) / 86400000);
  const scan = engine.scanPanchangCalendar(Date.UTC(y, 0, 1) - TZ * 3600000, TZ, days, days, PLACE, 'canonical');
  const rows = scan.fasts
    .filter((f) => engine.obsKind(f.key) === 'ekadashi')
    .map((f) => ({ year: y, date: iso(f.ms), key: f.key, name: engine.EKADASHI_NAMES[f.key] ? engine.EKADASHI_NAMES[f.key].en : null }));
  assert.strictEqual(rows.length, DRIK[y].length,
    `${y}: Ganak emitted ${rows.length} Ekadashi days, the reference lists ${DRIK[y].length}`);
  observed.push(...rows);
}

let exactDates = 0;
const problems = [];
for (let i = 0; i < observed.length; i += 1) {
  const got = observed[i];
  const [refDate, refName] = flatDrik[i];
  const delta = dayDelta(got.date, refDate);
  if (delta === 0) exactDates += 1;
  if (Math.abs(delta) > 1) problems.push(`${refDate} ${refName}: Ganak dates it ${got.date} (${delta} days out)`);
  const reason = EXPECTED_UNNAMED[refDate];
  if (got.name === null) {
    if (!reason) problems.push(`${refDate}: Ganak shows a plain "Ekadashi" where the reference names ${refName}`);
    continue;
  }
  if (reason) problems.push(`${refDate}: Ganak now names this (${got.name}) — ${reason} is stale, tighten this gate`);
  const published = ALIAS[got.name] || got.name;
  if (published !== refName) problems.push(`${refDate}: Ganak says "${got.name}", the reference says "${refName}" (${DRIK[got.year].find((r) => r[0] === refDate)?.[2] || ''})`);
}
assert.deepStrictEqual(problems, [], `Ekadashi naming problems:\n  ${problems.join('\n  ')}`);

// Every pinned exception must actually be exercised by the sweep.
for (const date of Object.keys(EXPECTED_UNNAMED)) {
  assert(flatDrik.some((row) => row[0] === date), `stale exception: ${date} is not in the reference`);
}

// ---------------------------------------------- 3. structural invariants
// No name may repeat, and none may go missing, inside a lunar year. Any window
// of 24 consecutive named Ekadashis that contains no Adhika gap must be exactly
// the 24 canonical identities — the assertion the Gregorian mapping could not
// survive.
let windows = 0;
for (let i = 0; i + 24 <= observed.length; i += 1) {
  const win = observed.slice(i, i + 24);
  if (win.some((r) => r.name === null || ADHIKA_KEYS.includes(r.key))) continue;
  const keys = new Set(win.map((r) => r.key));
  assert.strictEqual(keys.size, 24,
    `${win[0].date}..${win[23].date}: a lunar year repeats a name — ${win.map((r) => r.name).join(', ')}`);
  assert.deepStrictEqual([...keys].sort(), [...CYCLE].sort(),
    `${win[0].date}..${win[23].date}: a lunar year is missing an Ekadashi identity`);
  windows += 1;
}
assert(windows >= 170, `expected a wide sweep of clean lunar years, got ${windows}`);

// Consecutive named Ekadashis advance exactly one step around the cycle.
for (let i = 1; i < observed.length; i += 1) {
  if (observed[i].name === null || observed[i - 1].name === null) continue;
  if (ADHIKA_KEYS.includes(observed[i].key) || ADHIKA_KEYS.includes(observed[i - 1].key)) continue;
  const prev = CYCLE.indexOf(observed[i - 1].key), cur = CYCLE.indexOf(observed[i].key);
  assert.strictEqual(cur, (prev + 1) % 24,
    `${observed[i].date}: identity jumped ${observed[i - 1].key} -> ${observed[i].key}`);
}

// An Adhika Masa Ekadashi carries its OWN name and must never borrow an
// ordinary month's. Before 2026-08-18 it showed unnamed; now it must be exactly
// Padmini or Parama, and never Mohini, Kamada or any other lunar-month vrata.
for (const [date, name] of flatDrik) {
  if (!/^(Padmini|Parama) /.test(name)) continue;
  const got = observed[flatDrik.findIndex((row) => row[0] === date)];
  assert.strictEqual(got.name, name, `${date} is ${name}; Ganak calls it ${got.name}`);
  assert.ok(ADHIKA_KEYS.includes(got.key), `${date} must use an Adhika Masa key, not ${got.key}`);
}

// ------------------------------------------------------------------ 4. tables
// The two naming tables the app renders from must not drift apart.
for (const key of CYCLE) {
  assert(engine.EKADASHI_NAMES[key], `engine table missing ${key}`);
  assert.strictEqual(meta.OBS_NAME[key].en, engine.EKADASHI_NAMES[key].en, `${key} label drift`);
  assert.strictEqual(meta.OBS_NAME[key].hi, engine.EKADASHI_NAMES[key].hi, `${key} Hindi label drift`);
}
for (const key of ADHIKA_KEYS) {
  assert(engine.EKADASHI_NAMES[key], `engine table missing ${key}`);
  assert.strictEqual(meta.OBS_NAME[key].en, engine.EKADASHI_NAMES[key].en, `${key} label drift`);
  assert.strictEqual(meta.OBS_NAME[key].hi, engine.EKADASHI_NAMES[key].hi, `${key} Hindi label drift`);
}
assert.strictEqual(Object.keys(engine.EKADASHI_NAMES).length, 26,
  'exactly 24 ordinary named Ekadashi identities plus the Adhika Masa pair');

// Date precision is a SEPARATE, pre-existing item (sunrise/tithi boundary), not
// a naming defect. Pinned so it can shrink but never silently grow.
const drift = observed.length - exactDates;
assert(drift <= 19, `Ekadashi date drift grew to ${drift} of ${observed.length} (was 19)`);

console.log(`✓ ekadashi-lunar-naming: ${observed.length} Ekadashis over ${YEARS[0]}-${YEARS[YEARS.length - 1]} match the published reference`);
console.log(`  ${windows} clean 24-fast lunar-year windows · 4 Adhika Masa years · Padmini/Parama named · ${Object.keys(EXPECTED_UNNAMED).length} unnamed days remaining`);
console.log(`  dates: ${exactDates}/${observed.length} exact, ${drift} within one day (separate tithi-boundary item)`);
