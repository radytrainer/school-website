import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─── Contact Form ─────────────────────────────────────────────

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[\d\s+\-()]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "Subject is required").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

// ─── News ─────────────────────────────────────────────────────

export const newsSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(500),
  title_en: z.string().min(1, "English title is required").max(500),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  content_km: z.string().optional(),
  content_en: z.string().optional(),
  excerpt_km: z.string().max(500).optional(),
  excerpt_en: z.string().max(500).optional(),
  featured_image: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string()).default([]),
  category_id: z.string().uuid().optional().or(z.literal("")),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publish_date: z.string().optional(),
});
export type NewsInput = z.infer<typeof newsSchema>;

// ─── Achievement ──────────────────────────────────────────────

export const achievementSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(500),
  title_en: z.string().min(1, "English title is required").max(500),
  description_km: z.string().optional(),
  description_en: z.string().optional(),
  achievement_type: z.enum(["student", "teacher", "school"]).optional(),
  award_level: z.enum(["national", "provincial", "district", "school"]).optional(),
  achievement_date: z.string().optional(),
  participant_name: z.string().max(300).optional(),
  image_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});
export type AchievementInput = z.infer<typeof achievementSchema>;

// ─── Statistics ───────────────────────────────────────────────

export const statisticsSchema = z.object({
  academic_year: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Format must be YYYY-YYYY (e.g. 2023-2024)"),
  total_students: z.coerce.number().int().min(0).optional(),
  total_teachers: z.coerce.number().int().min(0).optional(),
  total_classes: z.coerce.number().int().min(0).optional(),
  grade_a_students: z.coerce.number().int().min(0).optional(),
  graduation_rate: z.coerce.number().min(0).max(100).optional(),
  pass_rate: z.coerce.number().min(0).max(100).optional(),
  male_students: z.coerce.number().int().min(0).optional(),
  female_students: z.coerce.number().int().min(0).optional(),
  new_students: z.coerce.number().int().min(0).optional(),
  is_current: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});
export type StatisticsInput = z.infer<typeof statisticsSchema>;

// ─── Teacher ──────────────────────────────────────────────────

export const teacherSchema = z.object({
  name_km: z.string().min(1, "Khmer name is required").max(200),
  name_en: z.string().min(1, "English name is required").max(200),
  gender: z.enum(["male", "female"]).optional(),
  phone: z.string().max(30).optional(),
  date_of_birth: z.string().optional(),
  position_km: z.string().max(200).optional(),
  position_en: z.string().max(200).optional(),
  subject_km: z.string().max(200).optional(),
  subject_en: z.string().max(200).optional(),
  specialization_km: z.string().max(200).optional(),
  specialization_en: z.string().max(200).optional(),
  department_km: z.string().max(200).optional(),
  department_en: z.string().max(200).optional(),
  qualification_km: z.string().max(300).optional(),
  qualification_en: z.string().max(300).optional(),
  photo_url: z.string().optional(),
  years_experience: z.coerce.number().int().min(0).optional(),
  grade_levels: z.array(z.coerce.number().int().min(7).max(12)).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});
export type TeacherInput = z.infer<typeof teacherSchema>;

// ─── Milestone ────────────────────────────────────────────────

export const milestoneSchema = z.object({
  year: z.string().min(1, "Year is required").max(20),
  title_km: z.string().min(1, "Khmer title is required").max(200),
  title_en: z.string().min(1, "English title is required").max(200),
  description_km: z.string().optional(),
  description_en: z.string().optional(),
  color: z.string().min(1).default("#00376f"),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type MilestoneInput = z.infer<typeof milestoneSchema>;

// ─── Leadership ───────────────────────────────────────────────

export const leadershipSchema = z.object({
  name_km: z.string().min(1, "Khmer name is required").max(200),
  name_en: z.string().min(1, "English name is required").max(200),
  position_km: z.string().max(200).optional(),
  position_en: z.string().max(200).optional(),
  bio_km: z.string().max(1000).optional(),
  bio_en: z.string().max(1000).optional(),
  photo_url: z.string().optional(),
  gender: z.enum(["male", "female"]).optional(),
  phone: z.string().max(30).optional(),
  date_of_birth: z.string().optional(),
  qualification_km: z.string().max(300).optional(),
  qualification_en: z.string().max(300).optional(),
  specialization_km: z.string().max(200).optional(),
  specialization_en: z.string().max(200).optional(),
  subject_km: z.string().max(200).optional(),
  subject_en: z.string().max(200).optional(),
  grade_levels: z.array(z.coerce.number().int().min(7).max(12)).default([]),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type LeadershipInput = z.infer<typeof leadershipSchema>;

// ─── Bank Account (Donate page) ────────────────────────────────

export const bankAccountSchema = z.object({
  bank_name_km: z.string().min(1, "Khmer bank name is required").max(200),
  bank_name_en: z.string().min(1, "English bank name is required").max(200),
  account_name_km: z.string().min(1, "Khmer account name is required").max(200),
  account_name_en: z.string().min(1, "English account name is required").max(200),
  account_number: z.string().min(1, "Account number is required").max(100),
  currency: z.string().min(1).max(50).default("USD / KHR"),
  logo_color: z.string().min(1).default("#00376f"),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type BankAccountInput = z.infer<typeof bankAccountSchema>;

// ─── Donation Use (Donate page "why donate" cards) ─────────────

export const donationUseSchema = z.object({
  icon: z.string().min(1, "Icon is required").max(10),
  title_km: z.string().min(1, "Khmer title is required").max(200),
  title_en: z.string().min(1, "English title is required").max(200),
  description_km: z.string().max(500).optional(),
  description_en: z.string().max(500).optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type DonationUseInput = z.infer<typeof donationUseSchema>;

// ─── Governance ───────────────────────────────────────────────

export const governanceItemSchema = z.object({
  section: z.enum(["structure", "culture"]),
  title_km: z.string().min(1, "Khmer title is required").max(500),
  title_en: z.string().min(1, "English title is required").max(500),
  icon: z.string().min(1, "Icon is required"),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});
export type GovernanceItemInput = z.infer<typeof governanceItemSchema>;

// ─── Hero Slide (Homepage carousel) ────────────────────────────

export const heroSlideSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(200),
  title_en: z.string().min(1, "English title is required").max(200),
  subtitle_km: z.string().max(500).optional(),
  subtitle_en: z.string().max(500).optional(),
  image_url: z.string().optional(),
  cta_primary_km: z.string().max(100).optional(),
  cta_primary_en: z.string().max(100).optional(),
  cta_secondary_km: z.string().max(100).optional(),
  cta_secondary_en: z.string().max(100).optional(),
  cta_primary_href: z.string().min(1).max(200).default("/contact"),
  cta_secondary_href: z.string().min(1).max(200).default("/about"),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type HeroSlideInput = z.infer<typeof heroSlideSchema>;

// ─── Document ─────────────────────────────────────────────────

export const documentSchema = z.object({
  title_km: z.string().min(1, "Khmer title is required").max(300),
  title_en: z.string().min(1, "English title is required").max(300),
  description_km: z.string().max(1000).optional(),
  description_en: z.string().max(1000).optional(),
  category: z.enum(["report", "result", "form", "policy", "other"]).default("other"),
  file_url: z.string().min(1, "File URL is required"),
  file_name: z.string().min(1, "File name is required").max(200),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type DocumentInput = z.infer<typeof documentSchema>;

// ─── School Operations Report ───────────────────────────────────

export const reportBlockSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("keyvalue"),
    items: z
      .array(
        z.object({
          label_km: z.string().min(1, "Khmer label is required"),
          label_en: z.string().min(1, "English label is required"),
          value: z.string(),
        })
      )
      .min(1, "At least one row is required"),
  }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string().min(1, "Header text is required")).min(1, "At least one column is required"),
    rows: z.array(z.array(z.union([z.string(), z.coerce.number()]))),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().min(1, "Item text is required")).min(1, "At least one item is required"),
  }),
  z.object({
    type: z.literal("text"),
    paragraphs: z.array(z.string().min(1, "Paragraph text is required")).min(1, "At least one paragraph is required"),
  }),
]);

export const reportSubsectionSchema = z.object({
  key: z.string().min(1, "Key is required").max(10),
  title_km: z.string().min(1, "Khmer title is required"),
  title_en: z.string().min(1, "English title is required"),
  blocks: z.array(reportBlockSchema).min(1, "At least one content block is required"),
});

export const reportSectionSchema = z.object({
  number: z.coerce.number().int().min(1, "Section number is required"),
  title_km: z.string().min(1, "Khmer title is required").max(300),
  title_en: z.string().min(1, "English title is required").max(300),
  subsections: z.array(reportSubsectionSchema).min(1, "At least one subsection is required"),
  is_active: z.boolean().default(true),
});
export type ReportSectionInput = z.infer<typeof reportSectionSchema>;

export const reportMetaSchema = z.object({
  academicYear: z.string().min(1, "Academic year is required"),
  reportDate_km: z.string().min(1, "Khmer date is required"),
  reportDate_en: z.string().min(1, "English date is required"),
});
export type ReportMetaInput = z.infer<typeof reportMetaSchema>;

// ─── User (Admin create/edit) ─────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["administrator", "director", "editor"]),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  role: z.enum(["administrator", "director", "editor"]).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
