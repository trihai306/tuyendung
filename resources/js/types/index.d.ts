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

export interface SocialLink {
    platform: 'facebook' | 'zalo' | 'tiktok' | 'linkedin' | 'other';
    url: string;
}

export interface Application {
    id: number;
    job_post_id: number;
    candidate_id: number | null;
    candidate_name?: string;
    candidate_email?: string;
    candidate_phone?: string;
    candidate_photo?: string;
    candidate_id_card_front?: string;
    candidate_id_card_back?: string;
    source: 'system' | 'facebook' | 'zalo' | 'tiktok' | 'linkedin' | 'referral' | 'other';
    source_note?: string;
    social_links?: SocialLink[];
    added_by?: number;
    assigned_to?: number;
    cover_letter?: string;
    resume_url?: string;
    status: 'pending' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';
    employer_notes?: string;
    applied_at: string;
    reviewed_at?: string;
    job_post?: JobPost;
    candidate?: User;
    added_by_user?: User;
    assigned_to_user?: User;
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

export interface CompanyMember {
    id: number;
    employer_profile_id: number;
    user_id: number;
    role: 'owner' | 'manager' | 'member';
    status: 'pending' | 'active' | 'inactive';
    invited_at: string;
    joined_at?: string;
    created_at?: string;
    managed_by?: number | null;
    user?: User;
    invited_by_user?: User;
    manager?: User | null;
}

export interface RecruitmentTask {
    id: number;
    employer_profile_id: number;
    assigned_to: number[];
    assigned_by: number;
    assignees_data?: User[];
    title: string;
    type: 'chinh_thuc' | 'thoi_vu';
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    target_quantity: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    due_date?: string;
    completed_at?: string;
    notes?: string;
    completion_report?: string;
    work_dates?: string[];
    work_shifts?: string[];
    overtime_hours?: number;
    shift_rate?: number;
    overtime_rate?: number;
    created_at: string;
    updated_at: string;
    assignee?: User;
    assigner?: User;
    candidates?: TaskCandidate[];
}

export interface TaskCandidate {
    id: number;
    recruitment_task_id: number;
    application_id?: number;
    candidate_name: string;
    candidate_phone?: string;
    candidate_email?: string;
    status: 'hired' | 'trial' | 'rejected';
    notes?: string;
    hired_date?: string;
    created_at: string;
    updated_at: string;
}

export interface Payroll {
    id: number;
    task_candidate_id: number;
    recruitment_task_id: number;
    period_start: string;
    period_end: string;
    total_shifts: number;
    overtime_hours: number;
    shift_amount: number;
    overtime_amount: number;
    bonus: number;
    deduction: number;
    total_amount: number;
    status: 'draft' | 'confirmed' | 'paid';
    paid_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    task_candidate?: TaskCandidate;
    recruitment_task?: RecruitmentTask;
}

export interface Attendance {
    id: number;
    task_candidate_id: number;
    recruitment_task_id: number;
    work_date: string;
    status: 'present' | 'absent' | 'half_day' | 'late';
    shifts_worked: number;
    overtime_hours: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface AttendanceRecord {
    id?: number;
    status: 'present' | 'absent' | 'half_day' | 'late';
    shifts_worked: number;
    overtime_hours: number;
    notes?: string;
}

export interface AppNotification {
    id: string;
    type: string;
    data: {
        type: 'new_application' | 'task_assigned' | 'application_status' | 'interview_scheduled';
        message: string;
        application_id?: number;
        candidate_name?: string;
        job_title?: string;
        source?: string;
        task_id?: number;
        task_title?: string;
        assigner_name?: string;
        priority?: string;
        new_status?: string;
        interview_id?: number;
        scheduled_at?: string;
        interview_type?: string;
    };
    read_at: string | null;
    created_at: string;
    updated_at: string;
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
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
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

export type CompanyRole = 'owner' | 'manager' | 'member';

export type PermissionKey =
    | 'team.view' | 'team.invite' | 'team.change_role' | 'team.remove' | 'team.regenerate_code'
    | 'jobs.view' | 'jobs.create' | 'jobs.edit' | 'jobs.delete'
    | 'applications.view' | 'applications.view_all' | 'applications.update' | 'applications.add_external' | 'applications.transfer' | 'applications.delete'
    | 'interviews.create' | 'interviews.update'
    | 'tasks.view_all' | 'tasks.view_own' | 'tasks.create' | 'tasks.assign' | 'tasks.update_any'
    | 'company.view' | 'company.edit'
    | 'reports.view'
    | 'payroll.view' | 'payroll.manage'
    | 'ai_agents.view' | 'ai_agents.create' | 'ai_agents.manage';

export interface SidebarBadges {
    tasks?: number;
    notifications?: number;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
        companyRole: CompanyRole | null;
        permissions: Record<PermissionKey, boolean>;
    };
    flash: FlashMessages;
    sidebarBadges: SidebarBadges;
    ziggy: { url: string; port: number | null; defaults: Record<string, unknown>; location: string };
};
