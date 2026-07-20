# Ganak — complete dedicated-page inventory

Owner decision, 2026-07-20: this is a **before-live completeness requirement**.
P1/P2/Tier labels do not reduce the scope. If an item can be opened in Ganak's
Fasts & Festivals experience, it must also have a stable page link. The existing
inline click/expand experience remains available in parallel.

## Completion rule

- Current source snapshot: **125 festival/calendar labels + 41 fasting/recurring
  labels = 166 openable labels**.
- Four dedicated pages currently exist: Hartalika Teej, Chaitra Navratri, Sharad
  Navratri and Chhath. Everything else below is pending.
- The implementation must derive coverage from the actual openable registries
  (`FEST_NAME` and the displayed `OBS_NAME` variants), not from a manually selected
  priority list.
- A permanent regression gate must fail when any current or future openable item has
  no stable page mapping.
- Every page must be bilingual, directly loadable/refesh-safe, preserve the existing
  inline card experience, and include the place-aware date/timing behaviour specified
  by backlog item `P0-FESTIVAL-PAGE-PLACE`.
- This snapshot records what the product currently exposes; it does not replace the
  separate religious-content/date-verification tracks.

## Festival and calendar labels — 125

1. Makar Sankranti
2. Pongal
3. Chaitra Navratri begins — **page complete**
4. Gudi Padwa
5. Ugadi
6. Vat Savitri Vrat
7. Vat Purnima
8. Anant Chaturdashi (Ganesh Visarjan)
9. Kartika Purnima (Dev Deepawali)
10. Tulasi Vivah
11. Varalakshmi Vratam
12. Mahalakshmi Vrat (culmination)
13. Pitru Paksha begins (Purnima Shraddha)
14. Sarva Pitru Amavasya (Mahalaya)
15. Kali Jayanti
16. Kalabhairav Jayanti
17. Vaikasi Visakam
18. Aadi Pooram
19. Arudra Darshan (Thiruvathirai)
20. Skanda Sashti begins (Day 1)
21. Skanda Sashti — Soorasamharam (Day 6)
22. Skanda Sashti — Thirukalyanam (Day 7)
23. Maha Shivaratri
24. Holika Dahan (Chhoti Holi)
25. Rangwali Holi
26. Ram Navami
27. Hanuman Jayanti
28. Akshaya Tritiya
29. Guru Purnima
30. Raksha Bandhan
31. Janmashtami
32. Ganesh Chaturthi
33. Sharad Navratri begins — **page complete**
34. Dussehra
35. Karva Chauth
36. Govatsa Dwadashi (Vasu Baras)
37. Dhanteras (Dhantrayodashi)
38. Kali Chaudas
39. Narak Chaturdashi (Chhoti Diwali)
40. Diwali
41. Govardhan Puja (Annakut)
42. Bhai Dooj
43. Chhath — Nahay Khay (Day 1) — **covered by complete Chhath page**
44. Chhath — Kharna (Day 2) — **covered by complete Chhath page**
45. Chhath Puja — Sandhya Arghya (Day 3) — **covered by complete Chhath page**
46. Chhath — Usha Arghya & Paran (Day 4) — **covered by complete Chhath page**
47. Lakshmi Panchami
48. Buddha Purnima
49. Ashadha Gupt Navratri
50. Rath Yatra
51. Hariyali Teej
52. Nag Panchami
53. Hartalika Teej — **page complete**
54. Radha Ashtami
55. Maha Ashtami
56. Maha Navami
57. Sharad Purnima
58. Ahoi Ashtami
59. Magha Gupt Navratri
60. Vasant Panchami
61. Sheetla Ashtami (Basoda)
62. Panguni Uthiram
63. Thaipusam
64. Onam (Thiruvonam)
65. Karthigai Deepam
66. Vishu
67. Ayyappa Mandala Vratham begins
68. Ayyappa Mandala Pooja
69. Lalita (Shodashi) Jayanti
70. Tara Jayanti
71. Matangi Jayanti
72. Bagalamukhi Jayanti
73. Chhinnamasta Jayanti
74. Dhumavati Jayanti
75. Bhuvaneshvari Jayanti
76. Kamala Jayanti
77. Bhairavi Jayanti
78. Annapurna Jayanti
79. Shakambhari Navratri begins (Banada Ashtami)
80. Shakambhari Purnima (Jayanti)
81. Lalita Panchami (Sharad Navratri day 5)
82. Kali Puja (Shyama Puja)
83. Sandhi Puja (Ashtami–Navami junction)
84. Ghatasthapana (Chaitra Navratri)
85. Ghatasthapana (Sharad Navratri)
86. Durga Puja — Mahalaya
87. Durga Puja — Shashthi
88. Durga Puja — Saptami
89. Durga Puja — Ashtami
90. Durga Puja — Navami (Bengal)
91. Durga Puja — Dashami (Visarjan)
92. Ratha Saptami
93. Ganga Dussehra
94. Surya Grahan (solar eclipse)
95. Chandra Grahan (lunar eclipse)
96. Mesha Sankranti
97. Vrishabha Sankranti
98. Mithuna Sankranti
99. Karka Sankranti
100. Simha Sankranti
101. Kanya Sankranti
102. Tula Sankranti
103. Vrishchika Sankranti
104. Dhanu Sankranti
105. Kumbha Sankranti
106. Meena Sankranti
107. Sakat Chauth
108. Mauni Amavasya
109. Gangaur (Gauri Tritiya)
110. Kajari Teej
111. Rishi Panchami
112. Vishwakarma Puja
113. Saraswati Avahan
114. Saraswati Puja (Ayudha Puja)
115. Kojagara Puja
116. Vivah Panchami
117. Gita Jayanti
118. Parashurama Jayanti
119. Sita Navami
120. Narasimha Jayanti
121. Narada Jayanti
122. Shani Jayanti
123. Balarama Jayanti
124. Dattatreya Jayanti
125. Swaminarayan Jayanti

## Fasting and recurring-observance labels — 41

### Recurring families — 10

1. Ekadashi
2. Pradosh Vrat
3. Sankashti Chaturthi
4. Vinayaka Chaturthi
5. Skanda Shashti
6. Masik Durgashtami
7. Kalashtami
8. Masik Shivaratri
9. Purnima
10. Amavasya

### Named Ekadashi labels — 24

1. Kamada Ekadashi
2. Mohini Ekadashi
3. Apara Ekadashi
4. Yogini Ekadashi
5. Varuthini Ekadashi
6. Padma Ekadashi
7. Indira Ekadashi
8. Dev Uthani Ekadashi
9. Mokshada Ekadashi
10. Putrada Ekadashi
11. Safala Ekadashi
12. Amalaki Ekadashi
13. Pap Mochini Ekadashi
14. Nrisimha Jayanti (the current displayed observance label)
15. Nirjala Ekadashi
16. Hari Bodhini Ekadashi
17. Putrada Ekadashi (second annual occurrence)
18. Aja Ekadashi
19. Vijaya Ekadashi
20. Prabodhini Ekadashi
21. Utpanna Ekadashi
22. Safala Ekadashi (second displayed mapping)
23. Shatila Ekadashi
24. Phalaharini Ekadashi

### Weekday Pradosh labels — 7

1. Ravi Pradosh
2. Som Pradosh
3. Bhaum Pradosh
4. Budh Pradosh
5. Guru Pradosh
6. Shukra Pradosh
7. Shani Pradosh

## Multi-day and family-page decisions

### Chhath — researched recommendation awaiting owner confirmation

Use **one complete Chhath page with four directly linkable day-sections**: Nahay Khay,
Kharna, Sandhya Arghya and Usha Arghya/paran. Each calendar row should open the same
page at its relevant section and clearly show the user's current stage. Government of
India and Bihar sources describe Chhath as one connected four-day spiritual observance,
not four unrelated festivals:

- https://www.incredibleindia.gov.in/en/festivals-and-events/chhath-puja
- https://tourism.bihar.gov.in/hi/experiences/festivals-and-fairs/festivals/chhath-puja

### Chaitra and Sharad Navratri — owner requirement

- Both Chaitra and Sharad Navratri must provide a dedicated page for each of the nine
  worship days/forms: Shailaputri, Brahmacharini, Chandraghanta, Kushmanda,
  Skandamata, Katyayani, Kalaratri, Mahagauri and Siddhidatri.
- Each day-page needs a respectfully sourced/owner-approved image of that Goddess,
  accessible alt text, her identity and significance, and separate household puja
  guidance. Verify iconography and image rights; do not use an unreviewed generic
  Goddess image.
- Suggest Durga Saptashati/Devi Mahatmya as an available Navratri worship text in
  appropriate plain language. Do not imply that every user must perform an advanced
  ritual recitation.
- Add a later child item on the Chaitra/Sharad parent pages for a sourced, owner-reviewed
  guide to arranging Durga Saptashati reading across the nine days.
- This Navadurga nine-day page structure applies **only to Chaitra and Sharad
  Navratri**. Do not copy it to Magha or Ashadha Gupt Navratri.

### Still to research

Research the correct structure before choosing page boundaries for the Bengal Durga
Puja sequence, annual Skanda Sashti milestones, named Ekadashis, weekday Pradosh
variants, Ayyappa Mandala and other multi-day/family observances. Shared pages are
allowed only when the religious observance is genuinely one connected sequence; each
calendar row must still have a stable deep link to its relevant section.
