import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

interface CompanyRoleData {
    isOwner: boolean;
    isAdmin: boolean;
    isMember: boolean;
    role: 'owner' | 'admin' | 'member' | null;
    companyId: number | null;
    companyName: string | null;
    isLoading: boolean;
    hasCompany: boolean;
}

export function useCompanyRole(): CompanyRoleData {
    const [data, setData] = useState<CompanyRoleData>({
        isOwner: false,
        isAdmin: false,
        isMember: false,
        role: null,
        companyId: null,
        companyName: null,
        isLoading: true,
        hasCompany: false,
    });

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await apiClient.get('/company');
                const companyData = res.data.data;

                if (companyData?.company) {
                    setData({
                        isOwner: companyData.is_owner || false,
                        isAdmin: companyData.is_admin || false,
                        isMember: !companyData.is_owner && !companyData.is_admin,
                        role: companyData.is_owner ? 'owner' : companyData.is_admin ? 'admin' : 'member',
                        companyId: companyData.company.id,
                        companyName: companyData.company.name,
                        isLoading: false,
                        hasCompany: true,
                    });
                } else {
                    setData(prev => ({ ...prev, isLoading: false, hasCompany: false }));
                }
            } catch (err) {
                console.error('Failed to fetch company role:', err);
                setData(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchRole();
    }, []);

    return data;
}
