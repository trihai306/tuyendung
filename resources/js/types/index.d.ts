// User & Profiles
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    roles: string[];
    email_verified_at?: string;
    candidate_profile?: CandidateProfile;
    employer_profile?: EmployerProfile;
}

export interface CandidateProfile {
    id: number;
    user_id: number;
    bio?: string;
    skills?: string[];
    experience_years?: number;
    education?: string;
    resume_url?: string;
    desired_salary?: number;
    job_type_preference?: string;
    current_address?: string;
    district?: string;
    city?: string;
    date_of_birth?: string;
    gender?: string;
}

export interface EmployerProfile {
    id: number;
    user_id: number;
    company_name?: string;
    company_logo?: string;
    industry?: string;
    company_size?: string;
    address?: string;
    district?: string;
    city?: string;
    description?: string;
    tax_code?: string;
    website?: string;
    contact_phone?: string;
    contact_email?: string;
}

// Job Module
export interface JobCategory {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    parent_id?: number;
    sort_order: number;
    children?: JobCategory[];
    job_posts_count?: number;
}

export interface JobPost {
    id: number;
    employer_id: number;
    title: string;
    slug: string;
    description: string;
    job_type: 'seasonal' | 'office';
    category_id?: number;
    salary_min?: number;
    salary_max?: number;
    salary_type?: string;
    location?: string;
    district?: string;
    city?: string;
    requirements?: string;
    benefits?: string;
    slots?: number;
    deadline?: string;
    status: 'draft' | 'active' | 'closed' | 'expired';
    work_schedule?: string;
    experience_level?: string;
    views_count: number;
    created_at: string;
    updated_at: string;
    employer?: User;
    category?: JobCategory;
    applications_count?: number;
    is_saved?: boolean;
}

export interface Application {
    id: number;
    job_post_id: number;
    candidate_id: number;
    cover_letter?: string;
    resume_url?: string;
    status: 'pending' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';
    employer_notes?: string;
    applied_at: string;
    reviewed_at?: string;
    job_post?: JobPost;
    candidate?: User;
    interviews?: Interview[];
}

export interface Interview {
    id: number;
    application_id: number;
    scheduled_at: string;
    type: 'online' | 'offline';
    location?: string;
    meeting_url?: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    result?: string;
    application?: Application;
}

export interface SavedJob {
    id: number;
    user_id: number;
    job_post_id: number;
    job_post?: JobPost;
}

// Room Module
export interface Room {
    id: number;
    landlord_id: number;
    title: string;
    slug: string;
    description?: string;
    room_type: 'single' | 'shared' | 'apartment' | 'mini_apartment';
    price: number;
    area_sqm?: number;
    address?: string;
    district?: string;
    city?: string;
    amenities?: string[];
    images?: string[];
    status: 'available' | 'rented' | 'maintenance';
    max_tenants?: number;
    electricity_price?: number;
    water_price?: number;
    views_count: number;
    created_at: string;
    updated_at: string;
    landlord?: User;
    average_rating?: number;
    reviews_count?: number;
}

export interface TenantContract {
    id: number;
    room_id: number;
    tenant_id: number;
    start_date: string;
    end_date?: string;
    monthly_rent: number;
    deposit: number;
    status: 'active' | 'expired' | 'terminated';
    notes?: string;
    room?: Room;
    tenant?: User;
}

export interface RoomReview {
    id: number;
    room_id: number;
    user_id: number;
    rating: number;
    comment?: string;
    created_at: string;
    user?: User;
}

// Shared / Pagination
export interface PaginatedData<T> {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev?: string;
    next?: string;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: { user: User };
    flash: FlashMessages;
    ziggy: { url: string; port: number | null; defaults: Record<string, unknown>; location: string };
};
