import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials, logout as logoutAction } from './authSlice';
import authApi from '../../services/authApi';

export function useAuth() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await authApi.login({ email, password });
            dispatch(setCredentials(data));
            navigate('/inbox');
            return { success: true };
        } catch (e: any) {
            setError(e.message);
            return { success: false, message: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, navigate]);

    const register = useCallback(async (
        name: string,
        email: string,
        password: string,
        passwordConfirmation: string,
        companyName: string,
        companyIndustry?: string,
        companyPhone?: string
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await authApi.register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                company_name: companyName,
                company_industry: companyIndustry,
                company_phone: companyPhone
            });
            dispatch(setCredentials(data));
            navigate('/inbox');
            return { success: true };
        } catch (e: any) {
            setError(e.message);
            return { success: false, message: e.message };
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, navigate]);

    const forgotPassword = useCallback(async (email: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await authApi.forgotPassword({ email });
            return { success: true, message: data.message };
        } catch (e: any) {
            setError(e.message);
            return { success: false, message: e.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        } finally {
            dispatch(logoutAction());
            navigate('/login');
            setIsLoading(false);
        }
    }, [dispatch, navigate]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        login,
        register,
        forgotPassword,
        logout,
        isLoading,
        error,
        clearError
    };
}
