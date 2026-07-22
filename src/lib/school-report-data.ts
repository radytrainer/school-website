// ============================================================
// School Operations Report — real data transcribed from the
// Ministry of Education's official "School Profile" compilation
// (កម្រងព័ត៌មានគ្រឹះស្ថានមធ្យមសិក្សាសាធារណៈ), academic year 2024-2025.
//
// A handful of cells in the source scan were not cleanly legible
// (noted inline with "unclear"); everything else is transcribed
// as printed. Percentages for exam-result tables are computed
// here from the (reliable) count columns rather than the source's
// visibly garbled percentage rows.
// ============================================================

export type ReportBlock =
  | { type: "keyvalue"; items: { label_km: string; label_en: string; value: string }[] }
  | { type: "table"; headers: string[]; rows: (string | number)[][]; note?: string }
  | { type: "list"; items: string[] }
  | { type: "text"; paragraphs: string[] };

export interface ReportSubsection {
  key: string;
  title_km: string;
  title_en: string;
  blocks: ReportBlock[];
}

export interface ReportSection {
  number: number;
  title_km: string;
  title_en: string;
  subsections: ReportSubsection[];
}

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

export const SCHOOL_REPORT_META = {
  academicYear: "2024-2025",
  reportDate_km: "ថ្ងៃទី១៦ ខែកុម្ភៈ ឆ្នាំ២០២៦",
  reportDate_en: "16 February 2026",
};

export const SCHOOL_REPORT: ReportSection[] = [
  {
    number: 1,
    title_km: "ព័ត៌មានទូទៅសាលារៀន",
    title_en: "General School Information",
    subsections: [
      {
        key: "a",
        title_km: "ឈ្មោះនាយក",
        title_en: "Principal",
        blocks: [
          {
            type: "keyvalue",
            items: [
              { label_km: "ឈ្មោះនាយក", label_en: "Principal", value: "អ៊ុង កនពុទ្ធារ៉ា / Ung Kanputheara" },
              { label_km: "លេខទូរស័ព្ទ", label_en: "Phone", value: "095 85 85 45" },
            ],
          },
        ],
      },
      {
        key: "b",
        title_km: "ទីតាំងភូមិសាស្ត្រ",
        title_en: "Geographic Location",
        blocks: [
          {
            type: "keyvalue",
            items: [
              { label_km: "ភូមិ", label_en: "Village", value: "អូរដា / Ou Da" },
              { label_km: "ឃុំ", label_en: "Commune", value: "អូរដា / Ou Da" },
              { label_km: "ស្រុក", label_en: "District", value: "កំរៀង / Kamrieng" },
              { label_km: "រាជធានី/ខេត្ត", label_en: "Province", value: "បាត់ដំបង / Battambang" },
              { label_km: "ផែនទីភូមិសាស្ត្រ", label_en: "Map", value: "https://maps.app.goo.gl/KSnQRknWkx9rAn7X8?g_st=it" },
            ],
          },
        ],
      },
      {
        key: "c",
        title_km: "លេខកូដ EMIS",
        title_en: "EMIS Code",
        blocks: [{ type: "keyvalue", items: [{ label_km: "លេខកូដ EMIS", label_en: "EMIS Code", value: "02090304901" }] }],
      },
      {
        key: "d",
        title_km: "ស្ថានភាពបុគ្គលិក",
        title_en: "Staff Status",
        blocks: [
          {
            type: "table",
            headers: ["ស្ថានភាព / Status", "សរុប / Total", "ស្រី / Female", "ផ្សេងៗ / Other"],
            rows: [
              ["បុគ្គលិកមិនបង្រៀន / Non-teaching staff", 16, 3, ""],
              ["បុគ្គលិកបង្រៀន / Teaching staff", 51, 22, ""],
              ["បុគ្គលិករួមការងារ / Contract staff", 0, 0, ""],
              ["បុគ្គលិកលំហែមាតុភាព / Maternity leave", 1, 1, ""],
              ["សរុប / Total", 68, 26, ""],
            ],
          },
        ],
      },
      {
        key: "e",
        title_km: "មធ្យមភាគសិស្សក្នុងថ្នាក់",
        title_en: "Student-to-Class Ratio",
        blocks: [
          {
            type: "table",
            headers: ["បរិយាយ / Metric", "ថ្នាក់ទី៧ / G7", "ថ្នាក់ទី៨ / G8", "ថ្នាក់ទី៩ / G9", "ថ្នាក់ទី១០ / G10", "ថ្នាក់ទី១១ / G11", "ថ្នាក់ទី១២ / G12", "សរុប / Total"],
            rows: [
              ["ចំនួនសិស្ស / Students", 440, 375, 276, 424, 332, 279, 2126],
              ["ចំនួនថ្នាក់ / Classes", 8, 7, 5, 9, 7, 6, 42],
              ["មធ្យមភាគក្នុងថ្នាក់ / Avg per class", 55, 54, 55, 47, 47, 47, 51],
            ],
          },
        ],
      },
      {
        key: "f",
        title_km: "ស្ថានភាពបន្ទប់សម្រាប់ដំណើរការសិក្សា",
        title_en: "Facility & Room Conditions",
        blocks: [
          {
            type: "table",
            headers: ["ស្ថានភាព / Facility", "ល្អ / Good", "ស្នើសុំជួសជុល / Needs repair", "ផ្សេងៗ / Notes"],
            rows: [
              ["ទីចាត់ការ / Admin office", 3, "", ""],
              ["បន្ទប់រៀន / Classrooms", 33, 5, "តម្រូវការចាំបាច់ 2025-2026 / Priority need for 2025-2026"],
              ["បណ្ណាល័យ / Library", 3, "", ""],
              ["បន្ទប់កុំព្យូទ័រ / Computer room", 2, "", ""],
              ["បន្ទប់ពិសោធន៍/មុខវិជ្ជា / Lab/Subject Room", 3, "", ""],
              ["ផ្សេងទៀត (មិនច្បាស់ក្នុងឯកសារដើម) / Other (unclear in source)", 1, "", ""],
              ["បន្ទប់ប្រជុំ / Meeting room", 2, "", ""],
              ["បន្ទប់សុខភាព / Health room", 1, "", ""],
              ["រោងជាង / Workshop", 0, "", ""],
              ["ផ្ទះស្នាក់គ្រូ / Teacher housing", 14, "", ""],
              ["អន្តេវាសិកដ្ឋានសិស្ស / Student dormitory", 28, "", ""],
              ["សរុប / Total", 95, 5, ""],
            ],
            note: "ជួរមួយ (\"ផ្សេងទៀត\") មិនអាចអានច្បាស់ពីឯកសារដើមបានទេ។ / One row label wasn't legible in the source scan; the count is shown as printed.",
          },
        ],
      },
    ],
  },
  {
    number: 2,
    title_km: "ការអនុវត្តម៉ោងបង្រៀន",
    title_en: "Teaching Hours",
    subsections: [
      {
        key: "a",
        title_km: "ចំនួនម៉ោងអនុវត្តក្នុង១សប្តាហ៍",
        title_en: "Hours Taught per Week",
        blocks: [
          {
            type: "keyvalue",
            items: [
              { label_km: "បឋមភូមិ", label_en: "Lower Secondary", value: "18 ម៉ោង / 18 hrs" },
              { label_km: "ទុតិយភូមិ", label_en: "Upper Secondary", value: "16 ម៉ោង / 16 hrs" },
            ],
          },
        ],
      },
      {
        key: "b",
        title_km: "ម៉ោងសិក្សាបន្ថែមក្រៅម៉ោង",
        title_en: "Extra Study Hours per Week",
        blocks: [
          {
            type: "keyvalue",
            items: [
              { label_km: "បឋមភូមិ", label_en: "Lower Secondary", value: "12 ម៉ោង / 12 hrs" },
              { label_km: "ទុតិយភូមិ", label_en: "Upper Secondary", value: "12 ម៉ោង / 12 hrs" },
            ],
          },
        ],
      },
      {
        key: "c",
        title_km: "ចំនួនវេន",
        title_en: "Shifts",
        blocks: [{ type: "keyvalue", items: [{ label_km: "ចំនួនវេន", label_en: "Shifts", value: "មួយវេន / One shift" }] }],
      },
    ],
  },
  {
    number: 3,
    title_km: "ការអនុវត្តវិញ្ញាសាតេស្តជាប្រចាំ",
    title_en: "Regular Testing",
    subsections: [
      {
        key: "a",
        title_km: "ប្រភេទវិញ្ញាសាតេស្ត",
        title_en: "Test Types Administered",
        blocks: [
          {
            type: "table",
            headers: ["ប្រភេទ / Type", "ដើមឆ្នាំ / Start of year", "ប្រចាំខែ / Monthly", "ឆមាសទី១ / Semester 1", "ឆមាសទី២ / Semester 2"],
            rows: [
              ["តាមក្រុមមុខវិជ្ជា / By subject group", "", "", "", ""],
              ["ស្តង់ដារកម្រិតសាលារៀន / School-level standard", "✓", "✓", "✓", "✓"],
              ["ស្តង់ដារកម្រិតក្រុង/ស្រុក/ខណ្ឌ / District-level standard", "", "", "", ""],
              ["ស្តង់ដារកម្រិតរាជធានី/ខេត្ត / Provincial-level standard", "", "", "", ""],
              ["ស្តង់ដារកម្រិតតំបន់ (បណ្តុំខេត្ត) / Zone-level standard", "", "", "", ""],
            ],
          },
        ],
      },
    ],
  },
  {
    number: 4,
    title_km: "ការរៀបចំផែនការសាលារៀន គ្រូបង្រៀន និងសិស្ស",
    title_en: "School, Teacher & Student Planning",
    subsections: [
      {
        key: "a",
        title_km: "ប្រភេទផែនការ",
        title_en: "Plan Types",
        blocks: [
          {
            type: "table",
            headers: ["ប្រភេទផែនការ / Plan Type", "មាន / In place", "ចំនួន / Count", "ភាគរយ / %"],
            rows: [
              ["ផែនការយុទ្ធសាស្ត្រ / Strategic plan", "✓", "", ""],
              ["ផែនការ៣ឆ្នាំរំកិល / 3-year rolling plan", "✓", "", ""],
              ["ផែនការប្រតិបត្តិប្រចាំឆ្នាំ / Annual action plan", "✓", "", ""],
              ["ផែនការថវិកាប្រចាំឆ្នាំ / Annual budget plan", "✓", "", ""],
              ["ផែនការកែលម្អសាលារៀន / School improvement plan", "✓", "", ""],
              ["ផែនការបង្រៀន១ឆ្នាំ / 1-year teaching plan", "✓", 52, 100],
              ["ផែនការបង្រៀន៣ខែ / 3-month teaching plan", "✓", 52, 100],
              ["ផែនការថ្នាក់រៀន / Class plan", "✓", 42, 100],
              ["ផែនការរៀនសូត្រសិស្សម្នាក់ៗ / Individual student learning plan", "✓", 2126, 100],
            ],
          },
        ],
      },
    ],
  },
  {
    number: 5,
    title_km: "ការអនុវត្តកិច្ចព្រមព្រៀងប្រចាំឆ្នាំ",
    title_en: "Annual Work Agreements",
    subsections: [
      {
        key: "a",
        title_km: "អត្រាអនុវត្តតាមតួនាទី",
        title_en: "Implementation by Role",
        blocks: [
          {
            type: "table",
            headers: ["តួនាទី / Role", "ចំនួនសរុប / Total", "បានអនុវត្ត / Implemented", "ភាគរយ / %"],
            rows: [
              ["នាយក/នាយិកា / Principal", 1, "✓", 100],
              ["នាយករង/នាយិការង / Vice Principal", 3, "✓", 100],
              ["គ្រូបង្រៀន / Teachers", 52, "✓", 90],
              ["បុគ្គលិកទីចាត់ការ / Admin staff", 16, "✓", 100],
            ],
          },
        ],
      },
    ],
  },
  {
    number: 6,
    title_km: "ស្វ័យវាយតម្លៃសាលារៀន (ស្តង់ដារសាលាមធ្យមសិក្សាគំរូ)",
    title_en: "Self-Assessment — Model School Standards",
    subsections: [
      {
        key: "a",
        title_km: "ពិន្ទុតាមស្តង់ដារទាំង៥",
        title_en: "Scores Across the 5 Standards",
        blocks: [
          {
            type: "table",
            headers: ["ឆ្នាំសិក្សា / Year", "ស្តង់ដារទី១ / Std.1", "ស្តង់ដារទី២ / Std.2", "ស្តង់ដារទី៣ / Std.3", "ស្តង់ដារទី៤ / Std.4", "ស្តង់ដារទី៥ / Std.5", "សរុប / Total"],
            rows: [
              ["ដើមឆ្នាំ (ឆ្នាំមុន) / Start of prior year", 18, 13, 13, 14, 10, 63],
              ["ដំណាច់ឆ្នាំ (ឆ្នាំមុន) / End of prior year", 23, 25, 34, 36, 18, 136],
            ],
            note: "គោលដៅឆ្នាំសិក្សា ២០២៤-២៥ មិនទាន់បំពេញក្នុងឯកសារដើម។ / The 2024-25 target row was left blank in the source document.",
          },
        ],
      },
    ],
  },
  {
    number: 7,
    title_km: "កម្រងពានរង្វាន់ សាកលវិទ្យា និងការប្រឡងប្រជែង",
    title_en: "Awards & Recognitions",
    subsections: [
      {
        key: "a",
        title_km: "បញ្ជីពានរង្វាន់",
        title_en: "Award List",
        blocks: [
          {
            type: "table",
            headers: ["#", "ឈ្មោះពានរង្វាន់ / Award", "អ្នកទទួលបាន / Recipient", "ឆ្នាំទទួលបាន / Year"],
            rows: [
              [1, "សាលាល្អ / Best School", "វិទ្យាល័យកំរៀង / Kamrieng High School", 2022],
              [2, "នាយកល្អ / Best Principal", "—", "—"],
              [3, "គ្រូល្អ / Best Teacher", "—", "—"],
              [4, "សាលាគំរូ / Model School", "—", "—"],
              [5, "សេវាសាធារណៈគំរូ / Model Public Service", "—", "—"],
              [6, "សាលាស្អាត / Clean School", "—", "—"],
            ],
          },
        ],
      },
    ],
  },
  {
    number: 8,
    title_km: "ការបែងចែកម៉ោងបង្រៀន (កាលវិភាគតាមកម្រិតថ្នាក់)",
    title_en: "Teaching-Hour Timetables by Grade",
    subsections: [
      {
        key: "a",
        title_km: "មធ្យមសិក្សាបឋមភូមិ",
        title_en: "Lower Secondary (Grades 7–9)",
        blocks: [
          {
            type: "table",
            headers: ["ថ្នាក់ / Grade", "ខ្មែរ / Khmer", "គណិត / Math", "រូប / Physics", "គីមី / Chem.", "ជីវៈ / Bio.", "ផែនដី / Earth", "ភូមិ / Geo.", "ប្រវត្តិ / History", "សីលធម៌ / Morals", "ភាសាបរទេស / Foreign Lang.", "អប់រំកាយ / PE", "ព័ត៌/អបជម៍ / ICT-Life Skills", "សរុប / Total"],
            rows: [
              ["ថ្នាក់ទី៧ / G7", 6, 4, 2, 1, 2, 1, 1, 2, 2, 0, 4, 2, 29],
              ["ថ្នាក់ទី៨ / G8", 6, 4, 2, 1, 2, 1, 1, 2, 2, 0, 4, 2, 29],
              ["ថ្នាក់ទី៩ / G9", 6, 6, 2, 1, 2, 1, 1, 2, 2, 0, 4, 2, 31],
            ],
            note: "អបជម៍ = អប់រំបំណិនជីវិតមូលដ្ឋាន / ICT-Life Skills = Basic Life Skills Education",
          },
        ],
      },
      {
        key: "b",
        title_km: "មធ្យមសិក្សាទុតិយភូមិ",
        title_en: "Upper Secondary (Grades 10–12)",
        blocks: [
          {
            type: "table",
            headers: ["ថ្នាក់ / Grade", "ខ្មែរ / Khmer", "គណិត / Math", "រូប / Physics", "គីមី / Chem.", "ជីវៈ / Bio.", "ផែនដី / Earth", "ភូមិ / Geo.", "ប្រវត្តិ / History", "សីលធម៌ / Morals", "ភាសាបរទេស / Foreign Lang.", "អប់រំកាយ / PE", "ព័ត៌/អវជ / ICT-Elective", "សរុប / Total"],
            rows: [
              ["ថ្នាក់ទី១០ / G10", 4, 4, 2, 1, 2, 1, 1, 2, 2, 0, 4, 2, 29],
              ["ថ្នាក់ទី១១ វិទ្យា. / G11 Science", 3, 5, 3, 3, 3, 2, 2, 2, 2, 0, 2, 2, 31],
              ["ថ្នាក់ទី១២ វិទ្យា. / G12 Science", 3, 5, 3, 3, 3, 2, 2, 2, 2, 0, 2, 2, 31],
              ["ថ្នាក់ទី១១ សង្គម. / G11 Social", 5, 3, 2, 2, 2, 2, 3, 3, 3, 0, 2, 2, 31],
              ["ថ្នាក់ទី១២ សង្គម. / G12 Social", 5, 3, 2, 2, 2, 2, 3, 3, 3, 0, 2, 2, 31],
            ],
            note: "អវជ = អប់រំវិជ្ជាជីវៈជម្រើស / Elective Vocational Education",
          },
        ],
      },
      {
        key: "c",
        title_km: "ចំនួនវេន",
        title_en: "Shifts",
        blocks: [{ type: "keyvalue", items: [{ label_km: "ចំនួនវេន", label_en: "Shifts", value: "មួយវេន / One shift" }] }],
      },
    ],
  },
  {
    number: 9,
    title_km: "ស្ថិតិសិស្ស",
    title_en: "Student Statistics",
    subsections: [
      {
        key: "a",
        title_km: "ស្ថិតិសិស្សឆ្នាំសិក្សានេះ",
        title_en: "This Year's Student Statistics",
        blocks: [
          {
            type: "table",
            headers: ["ថ្នាក់ / Grade", "ចំនួនថ្នាក់ / Classes", "សិស្សដើមឆ្នាំ / Students", "ស្រី / Female"],
            rows: [
              ["7", 8, 440, 201],
              ["8", 7, 375, 187],
              ["9", 5, 276, 154],
              ["សរុប បឋមភូមិ / Lower Sec. Total", 20, 1091, 542],
              ["10", 9, 424, 224],
              ["11 (វិទ្យា.) / 11 Science", 7, 332, 186],
              ["11 (សង្គម.) / 11 Social", 0, 0, 0],
              ["12 (វិទ្យា.) / 12 Science", 2, 61, 32],
              ["12 (សង្គម.) / 12 Social", 4, 217, 132],
              ["សរុប ទុតិយភូមិ / Upper Sec. Total", 22, 1034, 574],
              ["សរុបរួម / Grand Total", 42, 2126, 1116],
            ],
          },
        ],
      },
      {
        key: "b",
        title_km: "ក្រមងស្ថិតិសិស្សឆ្នាំៗ",
        title_en: "Multi-Year Student Trend",
        blocks: [
          {
            type: "table",
            headers: ["ឆ្នាំសិក្សា / Year", "ដើមឆ្នាំ / Start (T/F)", "ឡើងថ្នាក់ / Promoted (T/F, %)", "ត្រួតថ្នាក់ / Repeated (T/F, %)", "បោះបង់ / Dropped Out (T/F, %)"],
            rows: [
              ["19-20", "1116 / 598", "994/555 (89.1% / 92.8%)", "38/19 (3.4% / 3.2%)", "84/24 (7.5% / 4%)"],
              ["20-21", "1228 / 646", "1044/560 (85% / 86.7%)", "54/26 (4.4% / 4%)", "130/60 (10.6% / 9.3%)"],
              ["21-22", "1361 / 741", "1144/662 (84% / 89.3%)", "75/21 (5.5% / 2.8%)", "142/58 (10.4% / 7.8%)"],
              ["22-23", "1424 / 787", "1238/701 (86.9% / 89%)", "70/24 (4.9% / 3%)", "116/62 (8.1% / 7.9%)"],
              ["23-24", "833 / 439", "705/404 (84.6% / 92%)", "40/17 (4.8% / 3.9%)", "88/18 (10.6% / 4.1%)"],
              ["24-25", "1465 / 798", "1219/695 (83.2% / 87.1%)", "158/59 (10.7% / 7.4%)", "88/44 (6% / 5.5%)"],
            ],
            note: "តួលេខ 23-24 (833) ស្របតាមឯកសារដើម ទោះបីខុសពីនិន្នាការឆ្នាំផ្សេងទៀត។ / The 23-24 figure is transcribed as printed even though it's an outlier vs. neighboring years.",
          },
        ],
      },
      {
        key: "c",
        title_km: "ប័ណ្ណសមធម៌ / ប័ណ្ណក្រីក្រ ឆ្នាំសិក្សានេះ",
        title_en: "Equity / Poverty Cards This Year",
        blocks: [
          {
            type: "table",
            headers: ["ថ្នាក់ទី / Grade", "សរុបរួម (សរុប / ស្រី) / Total (Total/Female)"],
            rows: [
              ["7", "27 / 14"],
              ["8", "33 / 21"],
              ["9", "25 / 16"],
              ["10", "35 / 23"],
              ["11", "20 / 9"],
              ["12", "19 / 8"],
              ["សរុប / Total", "159 / 91"],
            ],
          },
        ],
      },
      {
        key: "d",
        title_km: "កម្មវិធីអាហារូបករណ៍",
        title_en: "Scholarship / Food Programs",
        blocks: [
          {
            type: "table",
            headers: ["កម្មវិធី / Program", "ថ្នាក់ទី៧", "ថ្នាក់ទី៨", "ថ្នាក់ទី៩", "ថ្នាក់ទី១០", "ថ្នាក់ទី១១", "ថ្នាក់ទី១២", "សរុប / Total"],
            rows: [
              ["សុបិនកុមារ / Sopheak Kmar", "0/0", "0/0", "0/0", "16/12", "23/17", "18/9", "57/38"],
              ["ការីតាស / Caritas", "0/0", "1/0", "0/0", "1/1", "1/0", "2/2", "5/3"],
              ["សរុប / Total", "0/0", "1/0", "0/0", "17/13", "24/17", "20/11", "62/41"],
            ],
          },
        ],
      },
      {
        key: "e",
        title_km: "ខ្សោយភ្នែក/ត្រចៀក និងការស្តាប់",
        title_en: "Vision / Hearing Impairment",
        blocks: [
          {
            type: "table",
            headers: ["ថ្នាក់ទី / Grade", "ខ្សោយភ្នែក ជាក់ស្តែង / Vision (T/F)", "បានអន្តរាគមន៍ / Assisted (T/F)"],
            rows: [
              ["8", "1/1", "1/1"],
              ["សរុប / Total", "1/1", "1/1"],
            ],
            note: "គ្មានករណីនៅថ្នាក់ផ្សេងទៀត។ / No cases reported for other grades.",
          },
        ],
      },
      {
        key: "f",
        title_km: "ជនជាតិដើមភាគតិច",
        title_en: "Indigenous Minority Students",
        blocks: [{ type: "text", paragraphs: ["គ្មាន / None reported."] }],
      },
    ],
  },
  {
    number: 10,
    title_km: "សាលារៀនចំណុះ",
    title_en: "Feeder Schools",
    subsections: [
      {
        key: "a",
        title_km: "បឋមសិក្សាចំណុះ",
        title_en: "Primary Feeder Schools",
        blocks: [
          {
            type: "table",
            headers: ["#", "ឈ្មោះសាលា / School", "ចម្ងាយ គ.ម / Distance (km)", "ចំនួនសិស្ស (ដកស្រង់) / Enrollment (partial)", "សរុប / Total"],
            rows: [
              [1, "បឋម.ព្រះពុទ្ធ / Preah Puth Primary", 4.7, "30, 24, 23, 29, 27", 148],
              [2, "បឋម.សិលាមានជ័យ / Sela Mean Chey Primary", 2.8, "66, 78, 66, 75, 62", 415],
              [3, "បឋម.លំផាត់ / Lumphat Primary", 7.4, "75, 60, 67, 68, 67", 381],
              [4, "បឋម.សំរោង / Samrong Primary", 7.6, "28, 27, 25, 28, 30", 163],
              [5, "បឋម.កំពង់ឡី / Kampong Ly Primary", 12, "24, 23, 22, 23, 23", 137],
            ],
            note: "ជួរឈរតាមថ្នាក់ទី១ មិនអាចដកស្រង់បានពេញលេញពីឯកសារស្កេនដើមទេ (សរុបនៅតែជាតួលេខផ្លូវការ)។ / One grade-level column wasn't fully legible in the scanned source; per-grade figures shown are partial, but the printed Total is exact.",
          },
        ],
      },
      {
        key: "b",
        title_km: "មធ្យមសិក្សាបឋមភូមិចំណុះ",
        title_en: "Lower-Secondary Feeder Schools",
        blocks: [
          {
            type: "table",
            headers: ["#", "ឈ្មោះសាលា / School", "ចម្ងាយ គ.ម / Distance (km)", "ថ្នាក់ទី៧ / G7", "ថ្នាក់ទី៨ / G8", "សរុប / Total"],
            rows: [
              [1, "អនុ.ភ្នំជ្រុំង / Phnom Chrum Lower Sec.", 5.9, 94, 79, 231],
              [2, "អនុ.ត្រង / Trong Lower Sec.", 13, 163, 108, 386],
              [3, "អនុ.សាមសិប / Samsib Lower Sec.", 16, 112, 52, 200],
              [4, "អនុ.តគ្រី / Tokrei Lower Sec.", 25, 136, 101, 289],
            ],
            note: "ជួរឈរថ្នាក់ទី៩ មិនអាចដកស្រង់បានពីឯកសារស្កេនដើមទេ (សរុបនៅតែជាតួលេខផ្លូវការ)។ / The Grade 9 column wasn't legible in the scanned source; the printed Total is exact.",
          },
        ],
      },
    ],
  },
  {
    number: 11,
    title_km: "ក្រមងលទ្ធផលសិក្សាសិស្ស",
    title_en: "Academic Results",
    subsections: [
      {
        key: "a",
        title_km: "លទ្ធផលសិក្សាប្រចាំឆ្នាំ (ឆ្នាំសិក្សាមុន)",
        title_en: "Annual Results by Subject (Prior Year)",
        blocks: [
          {
            type: "table",
            headers: ["មុខវិជ្ជា / Subject", "ដើមឆ្នាំ (T/F)", "ដំណាច់ឆ្នាំ (T/F)", "A (T/F)", "B (T/F)", "C (T/F)", "D (T/F)", "E (T/F)", "F (T/F)"],
            rows: [
              ["ភាសាខ្មែរ / Khmer", "1465/798", "1307/739", "9/7", "55/37", "209/146", "385/256", "315/161", "334/132"],
              ["គណិតវិទ្យា / Mathematics", "1465/798", "1307/739", "10/8", "16/8", "30/13", "60/34", "113/61", "1078/615"],
              ["រូបវិទ្យា / Physics", "1465/798", "1307/739", "20/14", "25/13", "35/17", "63/40", "82/58", "1082/597"],
            ],
          },
        ],
      },
      {
        key: "b",
        title_km: "ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ",
        title_en: "Grade 9 Exam Results (Lower Secondary Certificate)",
        blocks: [
          {
            type: "table",
            headers: ["ឆ្នាំ / Year", "មករប្រឡង / Sat exam (T/F)", "ជាប់ / Passed (T/F, %)", "A", "B", "C", "D", "E", "F"],
            rows: [
              ["21-22", "122/61", `106/56 (${pct(106,122)}% / ${pct(56,61)}%)`, "4/3", "0/0", "19/17", "0/0", "83/36", "16/5"],
              ["22-23", "85/49", `82/49 (${pct(82,85)}% / ${pct(49,49)}%)`, "0/0", "2/2", "5/5", "20/16", "55/26", "3/0"],
              ["23-24", "101/56", `88/53 (${pct(88,101)}% / ${pct(53,56)}%)`, "1/0", "4/1", "2/1", "29/25", "52/26", "13/3"],
              ["24-25", "115/58", `105/55 (${pct(105,115)}% / ${pct(55,58)}%)`, "0/0", "4/3", "2/2", "20/8", "79/42", "10/3"],
            ],
            note: "ភាគរយត្រូវបានគណនាឡើងវិញពីចំនួនរាប់ (ជាប់/មករប្រឡង) ដោយសារជួរឈរភាគរយក្នុងឯកសារដើមមិនច្បាស់។ / Percentages were recomputed from the (reliable) count columns since the source's printed percentage row was visibly garbled.",
          },
        ],
      },
      {
        key: "c",
        title_km: "ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាទុតិយភូមិ (បាក់ឌុប)",
        title_en: "Grade 12 Exam Results (Baccalaureate)",
        blocks: [
          {
            type: "table",
            headers: ["ឆ្នាំ / Year", "មករប្រឡង / Sat exam (T/F)", "ជាប់ / Passed (T/F, %)", "A", "B", "C", "D", "E", "F"],
            rows: [
              ["21-22", "199/123", `170/109 (${pct(170,199)}% / ${pct(109,123)}%)`, "17/14", "52/34", "57/38", "44/23", "29/15", "—"],
              ["22-23", "254/131", `194/113 (${pct(194,254)}% / ${pct(113,131)}%)`, "12/10", "32/23", "73/45", "77/35", "60/18", "—"],
              ["23-24", "245/138", `227/128 (${pct(227,245)}% / ${pct(128,138)}%)`, "1/0", "28/17", "46/32", "96/55", "56/24", "18/10"],
              ["24-25", "282/171", `252/152 (${pct(252,282)}% / ${pct(152,171)}%)`, "1/0", "19/9", "66/42", "114/72", "52/29", "30/19"],
            ],
            note: "ភាគរយត្រូវបានគណនាឡើងវិញពីចំនួនរាប់ ដូចខាងលើ។ / Percentages recomputed from counts, as above.",
          },
        ],
      },
    ],
  },
  {
    number: 12,
    title_km: "ស្ថានភាពបុគ្គលិកសិក្សា",
    title_en: "Teaching Staff Status",
    subsections: [
      {
        key: "a",
        title_km: "ស្ថិតិបុគ្គលិកតាមមុខវិជ្ជានិងគុណវុឌ្ឍិ",
        title_en: "Staff by Subject & Qualification",
        blocks: [
          {
            type: "table",
            headers: ["មុខវិជ្ជា / Subject", "កម្រិតមូលដ្ឋាន / Basic (T/F)", "កម្រិតឧត្តម / Higher (T/F)", "បង្រៀន / Teaching (T/F)", "មិនបង្រៀន / Non-teaching (T/F)", "សរុប / Total (T/F)"],
            rows: [
              ["ភាសាខ្មែរ / Khmer", "7/4", "4/2", "8/6", "4/0", "12/6"],
              ["គណិតវិទ្យា / Mathematics", "4/2", "5/0", "7/2", "2/0", "9/2"],
              ["រូបវិទ្យា / Physics", "3/2", "3/1", "4/2", "2/1", "6/3"],
              ["គីមីវិទ្យា / Chemistry", "0/0", "2/0", "2/0", "0/0", "2/0"],
              ["ជីវវិទ្យា / Biology", "1/1", "2/0", "3/1", "0/0", "3/1"],
              ["ផែនដី-បរិស្ថានវិទ្យា / Earth Science", "1/1", "2/1", "2/2", "1/0", "3/2"],
              ["ភូមិវិទ្យា / Geography", "1/1", "2/0", "3/1", "0/0", "3/1"],
              ["ប្រវត្តិវិទ្យា / History", "3/2", "5/1", "5/2", "3/1", "8/3"],
              ["សីលធម៌-ពលរដ្ឋ / Morals-Civics", "0/0", "4/2", "4/2", "0/0", "4/2"],
              ["ឈ្នះវិជ្ជា/សេដ្ឋកិច្ច / Career-Economics", "2/2", "1/0", "2/1", "1/1", "3/2"],
              ["ភាសាអង់គ្លេស / English", "4/2", "2/0", "6/2", "0/0", "6/2"],
              ["ភាសាបារាំង / French", "0/0", "1/0", "1/0", "0/0", "1/0"],
              ["អប់រំកាយ និងកីឡា / Physical Education", "5/0", "0/0", "3/0", "2/0", "5/0"],
              ["ព័ត៌មានវិទ្យា / ICT", "1/1", "1/1", "2/2", "1/0", "3/2"],
              ["សរុប / Total", "32/18", "34/8", "52/23", "16/3", "68/26"],
            ],
            note: "ជួរនីមួយៗនៃឯកសារដើមមានភាពមិនស៊ីគ្នាបន្តិចរវាងផលបូកកម្រិតគុណវុឌ្ឍិ និងផលបូកតួនាទី — ដកស្រង់ដូចដើម។ / Some rows show a minor internal inconsistency between the qualification-level sum and the role-based sum in the original document; transcribed as printed.",
          },
        ],
      },
      {
        key: "b",
        title_km: "ការប្រើប្រាស់គ្រូបង្រៀន — ទុតិយភូមិ",
        title_en: "Teacher Workload — Upper Secondary",
        blocks: [
          {
            type: "table",
            headers: ["មុខវិជ្ជា / Subject", "គ្រូមានជាប់ / Assigned", "លើសម៉ោង / Over hours", "គ្រប់ម៉ោង / Full hours", "តិចជាង / Under hours", "ដំណោះស្រាយ / Notes"],
            rows: [
              ["ភាសាខ្មែរ / Khmer", 3, 3, "", 5, "គ្រូឯកទេសសីលធម៌ជួយបង្រៀន / Morals specialist assists"],
              ["គណិតវិទ្យា / Mathematics", 4, 4, "", 4, "បំបែក និងកាត់ម៉ោង/សប្តាហ៍ / Splitting & trimming weekly hours"],
              ["រូបវិទ្យា / Physics", 2, 2, "", 2, ""],
              ["គីមីវិទ្យា / Chemistry", 2, 2, "", 2, "បន្ថែមម៉ោងបង្រៀន / Added teaching hours"],
              ["ជីវវិទ្យា / Biology", 2, 2, "", 1, ""],
              ["ផែនដី-បរិស្ថានវិទ្យា / Earth Science", 1, 1, "", 2, ""],
              ["ភូមិវិទ្យា / Geography", 2, 2, "", 2, ""],
              ["ប្រវត្តិវិទ្យា / History", 3, 3, "", 1, ""],
              ["សីលធម៌-ពលរដ្ឋ / Morals-Civics", 4, 4, "", "", "ជួយបង្រៀនថ្នាក់ក្រោម និងភាសាខ្មែរ / Assists lower grades & Khmer"],
              ["ឈ្នះវិជ្ជា/សេដ្ឋកិច្ច / Career-Economics", 1, 1, "", 1, ""],
              ["ភាសាអង់គ្លេស / English", 2, 2, "", 3, "គ្រូនិងបុគ្គលិកទីចាត់ការជួយបង្រៀន / Admin staff assist"],
              ["ភាសាបារាំង / French", 1, 1, "", "", ""],
              ["អប់រំកាយ និងកីឡា / Physical Education", "", 2, "", "", ""],
              ["ព័ត៌មានវិទ្យា / ICT", 1, 1, "", 1, ""],
              ["សរុប / Total", 28, 28, "", 26, ""],
            ],
          },
        ],
      },
      {
        key: "c",
        title_km: "ការប្រើប្រាស់គ្រូបង្រៀន — បឋមភូមិ",
        title_en: "Teacher Workload — Lower Secondary",
        blocks: [
          {
            type: "table",
            headers: ["មុខវិជ្ជា / Subject", "គ្រូមានជាប់ / Assigned", "លើសម៉ោង / Over hours", "តិចជាង / Under hours", "ដំណោះស្រាយ / Notes"],
            rows: [
              ["ភាសាខ្មែរ / Khmer", 5, 5, 3, ""],
              ["គណិតវិទ្យា / Mathematics", 3, 0, 7, "គ្រូឧត្តមបង្រៀនបំពេញ / Upper-sec. teachers help fill in"],
              ["រូបវិទ្យា / Physics", 2, 1, 1, ""],
              ["គីមីវិទ្យា / Chemistry", 0, 0, 2, "គ្រូឧត្តមបង្រៀនបំពេញ / Upper-sec. teachers help fill in"],
              ["ជីវវិទ្យា / Biology", 1, 1, 2, ""],
              ["ផែនដី-បរិស្ថានវិទ្យា / Earth Science", 1, 1, 0, ""],
              ["ភូមិវិទ្យា / Geography", 1, 1, 2, ""],
              ["ប្រវត្តិវិទ្យា / History", 2, 1, 0, ""],
              ["សីលធម៌-ពលរដ្ឋ / Morals-Civics", 1, 0, 3, ""],
              ["ឈ្នះវិជ្ជា/សេដ្ឋកិច្ច / Career-Economics", 0, 0, 0, ""],
              ["ភាសាអង់គ្លេស / English", 4, 1, 2, "គ្រូបង្រៀនមុខវិជ្ជាដទៃជួយបង្រៀន / Cross-subject teachers assist"],
              ["ភាសាបារាំង / French", 0, 0, 0, ""],
              ["អប់រំកាយ និងកីឡា / Physical Education", 3, 2, 0, ""],
              ["ព័ត៌មានវិទ្យា / ICT", 1, 1, 0, ""],
              ["សរុប / Total", 24, 14, 22, ""],
            ],
          },
        ],
      },
      {
        key: "d",
        title_km: "ការពង្រឹងគុណវុឌ្ឍិគណៈគ្រប់គ្រង និងគ្រូបង្រៀន",
        title_en: "Capacity Building for Management & Teachers",
        blocks: [
          {
            type: "table",
            headers: ["ឆ្នាំសិក្សា / Year", "កម្មវិធីបណ្តុះបណ្តាល / Program", "គាំទ្រដោយ / Supported By", "គណៈគ្រប់គ្រង / Managers", "គ្រូបង្រៀន / Teachers", "សរុប / Total"],
            rows: [
              ["2023-2024", "LUP, TUP", "ក្រសួងអប់រំ / Ministry of Education", 9, 11, 20],
              ["2024-2025", "LUP", "ក្រសួងអប់រំ / Ministry of Education", 0, 2, 2],
            ],
          },
        ],
      },
    ],
  },
  {
    number: 13,
    title_km: "ស្ថានភាពសៀវភៅសិក្សា",
    title_en: "Textbook Status",
    subsections: [
      {
        key: "a",
        title_km: "បឋមភូមិ (១ក្បាល/សិស្សម្នាក់)",
        title_en: "Lower Secondary (1 copy per student)",
        blocks: [
          {
            type: "table",
            headers: ["មុខវិជ្ជា / Subject", "ថ្នាក់ទី៧ / G7", "ថ្នាក់ទី៨ / G8", "ថ្នាក់ទី៩ / G9", "សរុប / Total"],
            rows: [
              ["ភាសាខ្មែរ / Khmer", 136, 252, 226, ""],
              ["គណិតវិទ្យា / Mathematics", 154, 254, 231, ""],
              ["វិទ្យាសាស្ត្រ / Science", 165, 254, 227, ""],
              ["សិក្សាសង្គម / Social Studies", 133, 258, 230, ""],
              ["អបជម៍ / Life Skills", 0, 0, 0, ""],
              ["ភាសាបរទេស / Foreign Language", 210, 259, 237, ""],
              ["សរុបរួម / Grand Total", 798, 1277, 1151, ""],
            ],
            note: "ជួរឈរ \"ស្តុកប្រើបាន\" និង \"ខ្វះ\" នៅទទេក្នុងឯកសារដើម — មានតែជួរឈរដំបូងប៉ុណ្ណោះដែលមានតួលេខ។ / Only the first data column had figures in the source; the \"available\"/\"shortage\" sub-columns were left blank there.",
          },
        ],
      },
      {
        key: "b",
        title_km: "ទុតិយភូមិ (១ក្បាល/សិស្ស២នាក់)",
        title_en: "Upper Secondary (1 copy per 2 students)",
        blocks: [
          {
            type: "table",
            headers: ["មុខវិជ្ជា / Subject", "ថ្នាក់ទី១០ / G10", "ថ្នាក់ទី១១ / G11", "ថ្នាក់ទី១២ / G12"],
            rows: [
              ["ភាសាខ្មែរ / Khmer", 218, 309, 255],
              ["គណិតវិទ្យា I / Mathematics I", 202, 309, 258],
              ["គណិតវិទ្យា II / Mathematics II", 202, 311, 258],
              ["រូបវិទ្យា / Physics", 223, 307, 258],
              ["គីមីវិទ្យា / Chemistry", 213, 310, 259],
              ["ជីវវិទ្យា / Biology", 226, 309, 253],
              ["ផែនដី-បរិស្ថាន / Earth Science", 234, 309, 261],
              ["ភូមិវិទ្យា / Geography", 196, 310, 258],
              ["ប្រវត្តិវិទ្យា / History", 196, 309, 255],
              ["សីលធម៌-ពលរដ្ឋ / Morals-Civics", 196, 310, 257],
              ["ចេះវិជ្ជា/សេដ្ឋកិច្ច / Career-Economics", 196, 139, 0],
              ["ភាសាអង់គ្លេស / English", 229, 252, 222],
              ["ភាសាបារាំង / French", 0, 0, 0],
              ["អប់រំកាយ និងកីឡា / Physical Education", 0, 0, 0],
              ["សរុប / Total", 2531, 3484, 2794],
            ],
          },
        ],
      },
    ],
  },
  {
    number: 14,
    title_km: "ថវិកាដំណើរការសាលារៀន និងការគាំទ្ររបស់សហគមន៍",
    title_en: "Operating Budget & Community Support",
    subsections: [
      {
        key: "a",
        title_km: "ថវិកាតាមឆ្នាំ",
        title_en: "Budget by Year",
        blocks: [
          {
            type: "table",
            headers: ["ឆ្នាំសិក្សា / Year", "ថវិការដ្ឋ / State (KHR)", "ថវិកាដៃគូអភិវឌ្ឍន៍ / Partner Funding (KHR)", "ថវិកាសហគមន៍ / Community (KHR)", "ចំណូលផ្សេងៗ / Other (KHR)", "សរុប / Total (KHR)"],
            rows: [
              ["2022-2023", "50,452,000", "106,140,000", "—", "—", "165,592,000"],
              ["2023-2024", "55,700,000", "325,052,000", "120,175,800", "16,472,000", "517,399,800"],
              ["2024-2025", "57,616,000", "132,656,000", "51,738,400", "8,767,500", "250,777,900"],
            ],
            note: "ឈ្មោះជួរឈរទី២ (\"ថវិកាដៃគូអភិវឌ្ឍន៍\") ជាការបកស្រាយល្អបំផុតចំពោះពាក្យមិនច្បាស់ក្នុងឯកសារដើម។ សម្រាប់ 2022-2023 ចំនួនទឹកប្រាក់មួយចំនួនមិនអាចដកស្រង់បានពេញលេញ (សរុបនៅតែជាតួលេខផ្លូវការ)។ / Column 2's label is my best reading of an unclear term in the source — please verify. For 2022-2023 some individual figures weren't fully legible; the printed Total is exact.",
          },
        ],
      },
    ],
  },
  {
    number: 15,
    title_km: "ការចំណាយសម្រាប់ដំណើរការសាលារៀន (ឆ្នាំសិក្សា ២០២៣-២០២៤)",
    title_en: "Expenditure Breakdown (FY 2023-2024)",
    subsections: [
      {
        key: "a",
        title_km: "តាមប្រភេទចំណាយ",
        title_en: "By Expense Category",
        blocks: [
          {
            type: "table",
            headers: ["មុខចំណាយ / Category", "ថវិការដ្ឋ / State", "ថវិកាដៃគូ / Partner", "ថវិកាសហគមន៍ / Community", "សរុប / Total (KHR)"],
            rows: [
              ["ដំណើរការអង្គភាព / Institutional Operations", "17,549,000", "100,400,000", "11,939,800", "129,888,800"],
              ["ដំណើរការបង្រៀនរៀន / Teaching & Learning", "40,067,000", "8,000,000", "7,555,000", "55,622,000"],
              ["ហេដ្ឋារចនាសម្ព័ន្ធ / Infrastructure", "—", "28,199,600", "2,140,000", "30,339,600"],
              ["ទស្សនកិច្ចសិក្សា / Study Visits", "8,280,000", "1,000,000", "—", "9,280,000"],
              ["ពង្រឹងសមត្ថភាពបុគ្គលិក / Staff Capacity Building", "10,376,000", "3,380,000", "—", "13,756,000"],
              ["កម្មវិធីផ្សេងៗ / Other Programs", "—", "56,000,000", "4,044,000", "—"],
            ],
            note: "ជួរចុងក្រោយ (\"កម្មវិធីផ្សេងៗ\") មិនស៊ីគ្នាច្បាស់ជាមួយបញ្ជីជួរឈរផ្សេងទៀតក្នុងឯកសារដើម ដូច្នេះជួរឈរសរុបមិនបានបំពេញ។ / The last row's figures didn't align cleanly with the column structure in the source; the Total cell is left blank rather than guessed.",
          },
        ],
      },
    ],
  },
  {
    number: 16,
    title_km: "សមតុល្យថវិកាសាលារៀនគិតមកដល់ឆ្នាំសិក្សានេះ",
    title_en: "Remaining Budget Balance",
    subsections: [
      {
        key: "a",
        title_km: "សមតុល្យ",
        title_en: "Balance",
        blocks: [{ type: "text", paragraphs: ["មិនមានទិន្នន័យក្នុងឯកសារដើម។ / No figure was provided in the source document."] }],
      },
    ],
  },
  {
    number: 17,
    title_km: "បញ្ហាប្រឈម",
    title_en: "Current Challenges",
    subsections: [
      {
        key: "a",
        title_km: "បញ្ជីបញ្ហា",
        title_en: "Challenges",
        blocks: [
          {
            type: "list",
            items: [
              "ស្ថានភាពជីវភាពរស់នៅរបស់គ្រួសារសិស្សខ្វះខាត នៅតែជាប្រភពបញ្ហាដែលបណ្តាលឲ្យសិស្សរៀនយឺត មករៀនមិនទៀងទាត់ បណ្តាលឲ្យគុណភាពអប់រំមូលដ្ឋានមិនទាន់បានប្រសើរ។ / Poverty among student households remains a root cause of slow progress and irregular attendance, holding back basic education quality.",
              "ខ្វះគ្រូឯកទេសមុខវិជ្ជាមួយចំនួន បណ្តាលឲ្យម៉ោងសិក្សាមុខវិជ្ជាទាំងនោះមិនគ្រប់។ / A shortage of specialist teachers in certain subjects means teaching hours for those subjects fall short.",
              "សិស្សបោះបង់ និងធ្លាក់មធ្យមភាគនៅមុខវិជ្ជាមួយចំនួន។ / Some students drop out or underperform in certain subjects.",
              "អាណាព្យាបាលសិស្សមួយចំនួន មិនទាន់ចំណាយពេលយកចិត្តទុកដាក់ចំពោះការអប់រំ និងការសិក្សារបស់កូនៗ។ / Some parents/guardians don't yet invest enough attention in their children's education.",
              "ឥទ្ធិពលសង្គម និងបច្ចេកវិទ្យា បានជះឥទ្ធិពលដល់របៀបរស់នៅ និងទម្លាប់សិក្សារបស់សិស្ស។ / Social and technology influences are affecting students' lifestyles and study habits.",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 18,
    title_km: "ទិសដៅបន្ត",
    title_en: "Future Direction",
    subsections: [
      {
        key: "a",
        title_km: "ផែនការសកម្មភាព",
        title_en: "Action Plan",
        blocks: [
          {
            type: "list",
            items: [
              "បន្តជំរុញការអនុវត្តគោលនយោបាយអប់រំ និងយុទ្ធសាស្ត្រសហគមន៍សាលារៀន ដើម្បីសម្រេចបានស្តង់ដារសាលារៀនគំរូ។ / Continue implementing education policy and school-community strategy to reach model-school standards.",
              "ពង្រឹងនិងបង្កើនទំនាក់ទំនងជាមួយគ្រប់ភាគីពាក់ព័ន្ធ ដើម្បីគាំទ្រការអនុវត្តផែនការសាលារៀនឲ្យបានប្រសើរ។ / Strengthen relationships with all stakeholders to better support execution of the school plan.",
              "ពង្រឹងការរៀន និងបង្រៀនឲ្យមានគុណភាព នវានុវត្តន៍ តាមរយៈការសហការ តាមដាន និងវាយតម្លៃកែលម្អ។ / Strengthen quality, innovative teaching and learning through collaboration, monitoring, and evaluation.",
              "ជំរុញក្រុមប្រឹក្សាកុមារ យុវជន និងសកម្មភាពក្រៅម៉ោងសិក្សា ព្រមទាំងពង្រឹងវិន័យ សីលធម៌សិស្ស ដើម្បីក្លាយជាពលរដ្ឋល្អ។ / Promote children/youth councils and extracurricular activities, and strengthen student discipline and ethics to build good citizens.",
              "កែលម្អហេដ្ឋារចនាសម្ព័ន្ធ អប់រំបរិស្ថានសាលា និងលើកកម្ពស់អនាម័យ សុខភាព កីឡា និងអប់រំកាយ។ / Improve infrastructure, environmental education, hygiene, health, sports, and physical education.",
            ],
          },
        ],
      },
    ],
  },
];
