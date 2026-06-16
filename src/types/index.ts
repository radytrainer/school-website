// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export type UserRole = "administrator" | "director" | "editor";
export type ContentStatus = "draft" | "published" | "archived";
export type AchievementType = "student" | "teacher" | "school";
export type AwardLevel = "national" | "provincial" | "district" | "school";
export type MessageStatus = "unread" | "read" | "replied" | "archived";
export type MediaType = "image" | "video" | "document";
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "archive"
  | "login"
  | "logout";

// ─────────────────────────────────────────────────────────────
// Database Models
// ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Statistics {
  id: string;
  academic_year: string;
  total_students: number;
  total_teachers: number;
  total_classes: number;
  grade_a_students?: number;
  graduation_rate?: number;
  pass_rate?: number;
  male_students?: number;
  female_students?: number;
  new_students?: number;
  is_current: boolean;
  notes?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsCategory {
  id: string;
  name_km: string;
  name_en: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface News {
  id: string;
  title_km: string;
  title_en: string;
  slug: string;
  content_km?: string;
  content_en?: string;
  excerpt_km?: string;
  excerpt_en?: string;
  featured_image?: string;
  category_id?: string;
  is_featured: boolean;
  status: ContentStatus;
  publish_date?: string;
  view_count: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  category?: NewsCategory;
}

export interface ActivityCategory {
  id: string;
  name_km: string;
  name_en: string;
  slug: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Activity {
  id: string;
  title_km: string;
  title_en: string;
  slug?: string;
  description_km?: string;
  description_en?: string;
  content_km?: string;
  content_en?: string;
  category_id?: string;
  activity_date?: string;
  location?: string;
  location_km?: string;
  location_en?: string;
  featured_image?: string;
  images?: string[];
  video_url?: string;
  is_featured?: boolean;
  status: ContentStatus;
  view_count?: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Joined
  category?: ActivityCategory;
}

export interface Achievement {
  id: string;
  title_km: string;
  title_en: string;
  description_km?: string;
  description_en?: string;
  achievement_type?: string;
  award_level?: string;
  achievement_date?: string;
  participant_name?: string;
  image_url?: string;
  is_featured?: boolean;
  status: ContentStatus;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: string;
  title_km?: string;
  title_en?: string;
  caption_km?: string;
  caption_en?: string;
  image_url?: string;
  cover_image?: string;
  media_type?: string;
  category?: string;
  is_featured?: boolean;
  sort_order?: number;
  status: ContentStatus;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  media?: Media[];
  media_count?: number;
}

export interface Media {
  id: string;
  gallery_id?: string;
  title_km?: string;
  title_en?: string;
  url: string;
  thumbnail?: string;
  media_type: MediaType;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
  sort_order: number;
  is_featured: boolean;
  created_by?: string;
  created_at: string;
}

export interface DownloadCategory {
  id: string;
  name_km: string;
  name_en: string;
  slug: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface Download {
  id: string;
  title_km: string;
  title_en: string;
  description_km?: string;
  description_en?: string;
  file_url: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  category_id?: string;
  academic_year?: string;
  download_count?: number;
  is_active?: boolean;
  status: ContentStatus;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  category?: DownloadCategory;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: MessageStatus;
  ip_address?: string;
  user_agent?: string;
  replied_by?: string;
  replied_at?: string;
  reply_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  title_km: string;
  title_en: string;
  content_km?: string;
  content_en?: string;
  notice_type: string;
  start_date?: string;
  end_date?: string;
  is_pinned: boolean;
  status: ContentStatus;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  table_name: string;
  record_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Leadership {
  id: string;
  name_km: string;
  name_en: string;
  title_km?: string;
  title_en?: string;
  position_km?: string;
  position_en?: string;
  bio_km?: string;
  bio_en?: string;
  photo_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SchoolInfo {
  id: string;
  section: string;
  title_km?: string;
  title_en?: string;
  content_km?: string;
  content_en?: string;
  sort_order: number;
  updated_by?: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  name_km: string;
  name_en: string;
  subject_km?: string;
  subject_en?: string;
  department_km?: string;
  department_en?: string;
  qualification_km?: string;
  qualification_en?: string;
  photo_url?: string;
  years_experience?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HeroSlide {
  id: string;
  title_km: string;
  title_en: string;
  subtitle_km?: string;
  subtitle_en?: string;
  image_url?: string;
  gradient?: string;
  cta_primary_km?: string;
  cta_primary_en?: string;
  cta_secondary_km?: string;
  cta_secondary_en?: string;
  cta_primary_href?: string;
  cta_secondary_href?: string;
  sort_order: number;
  is_active: boolean;
}

// ─────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// Form Types
// ─────────────────────────────────────────────────────────────

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// Session / Auth Types
// ─────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
}

export interface RolePermissions {
  canManageUsers: boolean;
  canManageSettings: boolean;
  canManageStatistics: boolean;
  canPublish: boolean;
  canDelete: boolean;
  canViewAuditLogs: boolean;
  canManageAchievements: boolean;
  canManageNews: boolean;
  canManageActivities: boolean;
  canManageGallery: boolean;
  canManageDownloads: boolean;
  canManageMessages: boolean;
  canManageNotices: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  administrator: {
    canManageUsers: true,
    canManageSettings: true,
    canManageStatistics: true,
    canPublish: true,
    canDelete: true,
    canViewAuditLogs: true,
    canManageAchievements: true,
    canManageNews: true,
    canManageActivities: true,
    canManageGallery: true,
    canManageDownloads: true,
    canManageMessages: true,
    canManageNotices: true,
  },
  director: {
    canManageUsers: false,
    canManageSettings: false,
    canManageStatistics: true,
    canPublish: true,
    canDelete: false,
    canViewAuditLogs: false,
    canManageAchievements: true,
    canManageNews: true,
    canManageActivities: true,
    canManageGallery: true,
    canManageDownloads: true,
    canManageMessages: true,
    canManageNotices: true,
  },
  editor: {
    canManageUsers: false,
    canManageSettings: false,
    canManageStatistics: false,
    canPublish: false,
    canDelete: false,
    canViewAuditLogs: false,
    canManageAchievements: false,
    canManageNews: true,
    canManageActivities: true,
    canManageGallery: true,
    canManageDownloads: true,
    canManageMessages: false,
    canManageNotices: false,
  },
};
