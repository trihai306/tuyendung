import type { DesignTemplate, CanvasElement } from '../types';

// ===== Premium Templates — Pre-arranged element sets =====

export const designTemplates: DesignTemplate[] = [
    {
        id: 'tech-dark',
        name: 'Tech Dark',
        description: 'Công nghệ tối, gradient indigo-cyan',
        bgColor: '#0F172A',
        bgGradient: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
        elements: [
            // Header gradient band
            { id: 'td_bg1', type: 'shape', shape: 'rect', x: 0, y: 0, width: 440, height: 200, rotation: 0, zIndex: 0, opacity: 1, locked: false, fill: 'linear-gradient(135deg, #6366F1 0%, #818CF8 60%, #22D3EE 100%)', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            // Decorative circle
            { id: 'td_deco1', type: 'shape', shape: 'circle', x: 340, y: -30, width: 100, height: 100, rotation: 0, zIndex: 1, opacity: 0.15, locked: false, fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            // Company name
            { id: 'td_company', type: 'text', x: 24, y: 24, width: 200, height: 30, rotation: 0, zIndex: 2, opacity: 1, locked: false, text: 'Tên Công Ty', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.9)', align: 'left', lineHeight: 1.3, bgColor: 'rgba(255,255,255,0.12)', padding: 8, borderRadius: 20, letterSpacing: 0.5 } as CanvasElement,
            // Badge
            { id: 'td_badge', type: 'text', x: 24, y: 110, width: 130, height: 24, rotation: 0, zIndex: 3, opacity: 1, locked: false, text: 'ĐANG TUYỂN', fontSize: 10, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center', lineHeight: 1.3, bgColor: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 20, letterSpacing: 3 } as CanvasElement,
            // Job title
            { id: 'td_title', type: 'text', x: 24, y: 142, width: 392, height: 50, rotation: 0, zIndex: 4, opacity: 1, locked: false, text: 'Senior Backend Developer', fontSize: 26, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: -0.5 } as CanvasElement,
            // Salary card
            { id: 'td_salary_bg', type: 'shape', shape: 'rect', x: 20, y: 210, width: 130, height: 55, rotation: 0, zIndex: 5, opacity: 1, locked: false, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 12 } as CanvasElement,
            { id: 'td_salary_label', type: 'text', x: 28, y: 216, width: 110, height: 14, rotation: 0, zIndex: 6, opacity: 0.6, locked: false, text: '💰 Mức lương', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_salary_val', type: 'text', x: 28, y: 234, width: 110, height: 20, rotation: 0, zIndex: 7, opacity: 1, locked: false, text: '25 - 40 triệu', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#F8FAFC', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Location card
            { id: 'td_loc_bg', type: 'shape', shape: 'rect', x: 158, y: 210, width: 130, height: 55, rotation: 0, zIndex: 5, opacity: 1, locked: false, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 12 } as CanvasElement,
            { id: 'td_loc_label', type: 'text', x: 166, y: 216, width: 110, height: 14, rotation: 0, zIndex: 6, opacity: 0.6, locked: false, text: '📍 Địa điểm', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_loc_val', type: 'text', x: 166, y: 234, width: 110, height: 20, rotation: 0, zIndex: 7, opacity: 1, locked: false, text: 'TP. Hồ Chí Minh', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#F8FAFC', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Type card
            { id: 'td_type_bg', type: 'shape', shape: 'rect', x: 296, y: 210, width: 124, height: 55, rotation: 0, zIndex: 5, opacity: 1, locked: false, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 12 } as CanvasElement,
            { id: 'td_type_label', type: 'text', x: 304, y: 216, width: 110, height: 14, rotation: 0, zIndex: 6, opacity: 0.6, locked: false, text: '⏰ Hình thức', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_type_val', type: 'text', x: 304, y: 234, width: 110, height: 20, rotation: 0, zIndex: 7, opacity: 1, locked: false, text: 'Full-time', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#F8FAFC', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Requirements header
            { id: 'td_req_h', type: 'text', x: 24, y: 285, width: 392, height: 20, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '✦  YÊU CẦU', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#F8FAFC', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            // Requirement items
            { id: 'td_req1', type: 'text', x: 36, y: 312, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  3+ năm kinh nghiệm PHP/Laravel', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_req2', type: 'text', x: 36, y: 334, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Hiểu biết về MySQL, Redis', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_req3', type: 'text', x: 36, y: 356, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Kinh nghiệm Docker, CI/CD', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_req4', type: 'text', x: 36, y: 378, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Tiếng Anh giao tiếp tốt', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Benefits header
            { id: 'td_ben_h', type: 'text', x: 24, y: 415, width: 392, height: 20, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '★  QUYỀN LỢI', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#F8FAFC', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            { id: 'td_ben1', type: 'text', x: 36, y: 442, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Lương tháng 13, thưởng KPI', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_ben2', type: 'text', x: 36, y: 464, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Bảo hiểm sức khoẻ cao cấp', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'td_ben3', type: 'text', x: 36, y: 486, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Làm việc linh hoạt Remote', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Footer line
            { id: 'td_footer_line', type: 'shape', shape: 'rect', x: 24, y: 560, width: 392, height: 1, rotation: 0, zIndex: 9, opacity: 0.1, locked: false, fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            // Contact
            { id: 'td_contact', type: 'text', x: 24, y: 572, width: 250, height: 16, rotation: 0, zIndex: 10, opacity: 0.6, locked: false, text: 'hr@company.vn  •  0901 234 567', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Deadline badge
            { id: 'td_deadline', type: 'text', x: 320, y: 568, width: 100, height: 24, rotation: 0, zIndex: 10, opacity: 1, locked: false, text: 'Hạn: 28/02', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center', lineHeight: 1.3, bgColor: '#6366F1', padding: 6, borderRadius: 20, letterSpacing: 0 } as CanvasElement,
        ],
    },
    {
        id: 'emerald-pro',
        name: 'Emerald Pro',
        description: 'Xanh ngọc chuyên nghiệp, sang trọng',
        bgColor: '#022C22',
        bgGradient: 'linear-gradient(180deg, #022C22 0%, #064E3B 100%)',
        elements: [
            { id: 'ep_bg1', type: 'shape', shape: 'rect', x: 0, y: 0, width: 440, height: 200, rotation: 0, zIndex: 0, opacity: 1, locked: false, fill: 'linear-gradient(135deg, #059669 0%, #10B981 60%, #34D399 100%)', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            { id: 'ep_deco1', type: 'shape', shape: 'rect', x: 360, y: 20, width: 60, height: 60, rotation: 45, zIndex: 1, opacity: 0.15, locked: false, fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            { id: 'ep_company', type: 'text', x: 24, y: 24, width: 200, height: 30, rotation: 0, zIndex: 2, opacity: 1, locked: false, text: 'Tên Công Ty', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.9)', align: 'left', lineHeight: 1.3, bgColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 20, letterSpacing: 0.5 } as CanvasElement,
            { id: 'ep_badge', type: 'text', x: 24, y: 110, width: 130, height: 24, rotation: 0, zIndex: 3, opacity: 1, locked: false, text: 'ĐANG TUYỂN', fontSize: 10, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center', lineHeight: 1.3, bgColor: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 20, letterSpacing: 3 } as CanvasElement,
            { id: 'ep_title', type: 'text', x: 24, y: 142, width: 392, height: 50, rotation: 0, zIndex: 4, opacity: 1, locked: false, text: 'Product Manager', fontSize: 26, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: -0.5 } as CanvasElement,
            { id: 'ep_salary_bg', type: 'shape', shape: 'rect', x: 20, y: 210, width: 195, height: 55, rotation: 0, zIndex: 5, opacity: 1, locked: false, fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 12 } as CanvasElement,
            { id: 'ep_salary_lbl', type: 'text', x: 28, y: 216, width: 180, height: 14, rotation: 0, zIndex: 6, opacity: 0.6, locked: false, text: '💰 Lương', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_salary_v', type: 'text', x: 28, y: 234, width: 180, height: 20, rotation: 0, zIndex: 7, opacity: 1, locked: false, text: '30 - 50 triệu', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#ECFDF5', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_loc_bg', type: 'shape', shape: 'rect', x: 225, y: 210, width: 195, height: 55, rotation: 0, zIndex: 5, opacity: 1, locked: false, fill: 'rgba(255,255,255,0.07)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 12 } as CanvasElement,
            { id: 'ep_loc_lbl', type: 'text', x: 233, y: 216, width: 180, height: 14, rotation: 0, zIndex: 6, opacity: 0.6, locked: false, text: '📍 Remote', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_loc_v', type: 'text', x: 233, y: 234, width: 180, height: 20, rotation: 0, zIndex: 7, opacity: 1, locked: false, text: 'Làm việc từ xa', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#ECFDF5', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_req_h', type: 'text', x: 24, y: 290, width: 392, height: 20, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '✦  YÊU CẦU', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#ECFDF5', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            { id: 'ep_req1', type: 'text', x: 36, y: 316, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  5+ năm kinh nghiệm Product', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_req2', type: 'text', x: 36, y: 338, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Hiểu biết về UX/UI Design', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_req3', type: 'text', x: 36, y: 360, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Kỹ năng phân tích dữ liệu', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_ben_h', type: 'text', x: 24, y: 400, width: 392, height: 20, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '★  QUYỀN LỢI', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#ECFDF5', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            { id: 'ep_ben1', type: 'text', x: 36, y: 426, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  ESOP cho nhân sự chủ chốt', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_ben2', type: 'text', x: 36, y: 448, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Bảo hiểm sức khoẻ toàn diện', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_footer_line', type: 'shape', shape: 'rect', x: 24, y: 560, width: 392, height: 1, rotation: 0, zIndex: 9, opacity: 0.1, locked: false, fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            { id: 'ep_contact', type: 'text', x: 24, y: 572, width: 250, height: 16, rotation: 0, zIndex: 10, opacity: 0.6, locked: false, text: 'hr@company.vn  •  0901 234 567', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#6EE7B7', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'ep_deadline', type: 'text', x: 320, y: 568, width: 100, height: 24, rotation: 0, zIndex: 10, opacity: 1, locked: false, text: 'Hạn: 28/02', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center', lineHeight: 1.3, bgColor: '#059669', padding: 6, borderRadius: 20, letterSpacing: 0 } as CanvasElement,
        ],
    },
    {
        id: 'sunset-warm',
        name: 'Sunset Warm',
        description: 'Gradient cam-hồng nóng bỏng',
        bgColor: '#1C1917',
        bgGradient: 'linear-gradient(180deg, #1C1917 0%, #292524 100%)',
        elements: [
            { id: 'sw_bg1', type: 'shape', shape: 'rect', x: 0, y: 0, width: 440, height: 200, rotation: 0, zIndex: 0, opacity: 1, locked: false, fill: 'linear-gradient(135deg, #F97316 0%, #EF4444 60%, #EC4899 100%)', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            { id: 'sw_company', type: 'text', x: 24, y: 24, width: 200, height: 30, rotation: 0, zIndex: 2, opacity: 1, locked: false, text: 'Tên Công Ty', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.9)', align: 'left', lineHeight: 1.3, bgColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 20, letterSpacing: 0.5 } as CanvasElement,
            { id: 'sw_badge', type: 'text', x: 24, y: 110, width: 130, height: 24, rotation: 0, zIndex: 3, opacity: 1, locked: false, text: 'TUYỂN GẤP', fontSize: 10, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center', lineHeight: 1.3, bgColor: 'rgba(255,255,255,0.25)', padding: 6, borderRadius: 20, letterSpacing: 3 } as CanvasElement,
            { id: 'sw_title', type: 'text', x: 24, y: 142, width: 392, height: 50, rotation: 0, zIndex: 4, opacity: 1, locked: false, text: 'UI/UX Designer', fontSize: 28, fontWeight: 900, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: -0.5 } as CanvasElement,
            { id: 'sw_salary_bg', type: 'shape', shape: 'rect', x: 20, y: 210, width: 195, height: 55, rotation: 0, zIndex: 5, opacity: 1, locked: false, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 12 } as CanvasElement,
            { id: 'sw_salary_lbl', type: 'text', x: 28, y: 216, width: 180, height: 14, rotation: 0, zIndex: 6, opacity: 0.6, locked: false, text: '💰 Lương', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_salary_v', type: 'text', x: 28, y: 234, width: 180, height: 20, rotation: 0, zIndex: 7, opacity: 1, locked: false, text: '20 - 35 triệu', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#FEFCE8', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_loc_bg', type: 'shape', shape: 'rect', x: 225, y: 210, width: 195, height: 55, rotation: 0, zIndex: 5, opacity: 1, locked: false, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, borderRadius: 12 } as CanvasElement,
            { id: 'sw_loc_lbl', type: 'text', x: 233, y: 216, width: 180, height: 14, rotation: 0, zIndex: 6, opacity: 0.6, locked: false, text: '📍 Địa điểm', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_loc_v', type: 'text', x: 233, y: 234, width: 180, height: 20, rotation: 0, zIndex: 7, opacity: 1, locked: false, text: 'Hà Nội', fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#FEFCE8', align: 'left', lineHeight: 1.2, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_req_h', type: 'text', x: 24, y: 290, width: 392, height: 20, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '✦  YÊU CẦU', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#FEFCE8', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            { id: 'sw_req1', type: 'text', x: 36, y: 316, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  2+ năm kinh nghiệm UI/UX', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_req2', type: 'text', x: 36, y: 338, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Thành thạo Figma, Adobe XD', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_req3', type: 'text', x: 36, y: 360, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Portfolio ấn tượng', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_ben_h', type: 'text', x: 24, y: 400, width: 392, height: 20, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '★  QUYỀN LỢI', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#FEFCE8', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            { id: 'sw_ben1', type: 'text', x: 36, y: 426, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  MacBook Pro cho thiết kế', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_ben2', type: 'text', x: 36, y: 448, width: 380, height: 18, rotation: 0, zIndex: 8, opacity: 1, locked: false, text: '•  Team building hàng tháng', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_footer_line', type: 'shape', shape: 'rect', x: 24, y: 560, width: 392, height: 1, rotation: 0, zIndex: 9, opacity: 0.1, locked: false, fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            { id: 'sw_contact', type: 'text', x: 24, y: 572, width: 250, height: 16, rotation: 0, zIndex: 10, opacity: 0.6, locked: false, text: 'hr@company.vn  •  0901 234 567', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#FED7AA', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'sw_deadline', type: 'text', x: 320, y: 568, width: 100, height: 24, rotation: 0, zIndex: 10, opacity: 1, locked: false, text: 'Hạn: 15/03', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center', lineHeight: 1.3, bgColor: '#EF4444', padding: 6, borderRadius: 20, letterSpacing: 0 } as CanvasElement,
        ],
    },
    {
        id: 'minimal-clean',
        name: 'Minimal Clean',
        description: 'Trắng sạch, tối giản chuyên nghiệp',
        bgColor: '#FFFFFF',
        bgGradient: '',
        elements: [
            // Left accent bar
            { id: 'mc_bar', type: 'shape', shape: 'rect', x: 0, y: 0, width: 6, height: 620, rotation: 0, zIndex: 0, opacity: 1, locked: false, fill: '#0F172A', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            // Company
            { id: 'mc_company', type: 'text', x: 30, y: 30, width: 200, height: 24, rotation: 0, zIndex: 1, opacity: 1, locked: false, text: 'TÊN CÔNG TY', fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#64748B', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 3 } as CanvasElement,
            // Title
            { id: 'mc_title', type: 'text', x: 30, y: 70, width: 380, height: 70, rotation: 0, zIndex: 2, opacity: 1, locked: false, text: 'Fullstack Developer', fontSize: 36, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#0F172A', align: 'left', lineHeight: 1.15, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: -1 } as CanvasElement,
            // Accent line
            { id: 'mc_line', type: 'shape', shape: 'rect', x: 30, y: 155, width: 60, height: 4, rotation: 0, zIndex: 2, opacity: 1, locked: false, fill: '#6366F1', stroke: 'transparent', strokeWidth: 0, borderRadius: 2 } as CanvasElement,
            // Info row
            { id: 'mc_salary', type: 'text', x: 30, y: 180, width: 180, height: 20, rotation: 0, zIndex: 3, opacity: 1, locked: false, text: '💰 25 - 40 triệu', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#334155', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'mc_location', type: 'text', x: 220, y: 180, width: 180, height: 20, rotation: 0, zIndex: 3, opacity: 1, locked: false, text: '📍 TP. Hồ Chí Minh', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#334155', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'mc_type', type: 'text', x: 30, y: 206, width: 180, height: 20, rotation: 0, zIndex: 3, opacity: 1, locked: false, text: '⏰ Full-time', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#334155', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Divider
            { id: 'mc_div1', type: 'shape', shape: 'rect', x: 30, y: 240, width: 380, height: 1, rotation: 0, zIndex: 3, opacity: 0.15, locked: false, fill: '#0F172A', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            // Requirements
            { id: 'mc_req_h', type: 'text', x: 30, y: 258, width: 380, height: 20, rotation: 0, zIndex: 4, opacity: 1, locked: false, text: 'YÊU CẦU', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#0F172A', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            { id: 'mc_req1', type: 'text', x: 30, y: 286, width: 380, height: 18, rotation: 0, zIndex: 4, opacity: 1, locked: false, text: '—  3+ năm kinh nghiệm Fullstack', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#64748B', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'mc_req2', type: 'text', x: 30, y: 308, width: 380, height: 18, rotation: 0, zIndex: 4, opacity: 1, locked: false, text: '—  React, Node.js, PostgreSQL', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#64748B', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'mc_req3', type: 'text', x: 30, y: 330, width: 380, height: 18, rotation: 0, zIndex: 4, opacity: 1, locked: false, text: '—  Hiểu biết về hệ thống phân tán', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#64748B', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Divider
            { id: 'mc_div2', type: 'shape', shape: 'rect', x: 30, y: 365, width: 380, height: 1, rotation: 0, zIndex: 4, opacity: 0.15, locked: false, fill: '#0F172A', stroke: 'transparent', strokeWidth: 0, borderRadius: 0 } as CanvasElement,
            // Benefits
            { id: 'mc_ben_h', type: 'text', x: 30, y: 383, width: 380, height: 20, rotation: 0, zIndex: 5, opacity: 1, locked: false, text: 'QUYỀN LỢI', fontSize: 11, fontWeight: 800, fontFamily: 'Inter, sans-serif', color: '#0F172A', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 2 } as CanvasElement,
            { id: 'mc_ben1', type: 'text', x: 30, y: 411, width: 380, height: 18, rotation: 0, zIndex: 5, opacity: 1, locked: false, text: '—  Mức lương cạnh tranh + thưởng', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#64748B', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'mc_ben2', type: 'text', x: 30, y: 433, width: 380, height: 18, rotation: 0, zIndex: 5, opacity: 1, locked: false, text: '—  Bảo hiểm sức khoẻ toàn diện', fontSize: 12, fontWeight: 400, fontFamily: 'Inter, sans-serif', color: '#64748B', align: 'left', lineHeight: 1.4, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            // Contact
            { id: 'mc_contact', type: 'text', x: 30, y: 576, width: 250, height: 16, rotation: 0, zIndex: 6, opacity: 1, locked: false, text: 'hr@company.vn  •  0901 234 567', fontSize: 10, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#94A3B8', align: 'left', lineHeight: 1.3, bgColor: 'transparent', padding: 0, borderRadius: 0, letterSpacing: 0 } as CanvasElement,
            { id: 'mc_deadline', type: 'text', x: 310, y: 572, width: 110, height: 24, rotation: 0, zIndex: 6, opacity: 1, locked: false, text: 'Hạn: 28/02', fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#ffffff', align: 'center', lineHeight: 1.3, bgColor: '#0F172A', padding: 6, borderRadius: 20, letterSpacing: 0 } as CanvasElement,
        ],
    },
];

// Blank canvas option
export const blankTemplate: DesignTemplate = {
    id: 'blank',
    name: 'Trang trắng',
    description: 'Bắt đầu từ đầu',
    bgColor: '#1a1a2e',
    bgGradient: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    elements: [],
};
