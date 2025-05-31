import {
    AcceptInvitationRequest,
    GenericDataResponse,
    LoginData,
    LoginResponse, RegisterAccountRequest,
    ResetPasswordRequest,
    User
} from "../types.ts";
import {api} from './client.ts';

export const authClient = {
    refreshAccessTokenFn: async () => {
        const response = await api.get<LoginResponse>('auth/refresh');
        return response.data;
    },

    register: async (registerData: RegisterAccountRequest) => {
        const response = await api.post<GenericDataResponse<User>>('auth/register', registerData);
        return response.data;
    },

    login: async (fullName: string, password: string) => {
   
const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important pour les cookies
        body: JSON.stringify({ fullName, password }),
    });

    if (!response.ok) throw new Error('Login failed');
    return response.json();
},

    forgotPassword: async (email: { email: string }) => {
        const response = await api.post('auth/forgot-password', email);
        return response.data;
    },

    verifyPasswordResetToken: async (token: string) => {
        const response = await api.get(`auth/reset-password/${token}`);
        return response.data;
    },

    resetPassword: async (token: string, resetData: ResetPasswordRequest) => {
        const response = await api.post(`auth/reset-password/${token}`, resetData);
        return response.data;
    },

    getInvitation: async (token: string) => {
        const response = await api.get<GenericDataResponse<User>>(`auth/invitation/${token}`);
        return response.data;
    },

    acceptInvitation: async (token: string, acceptData: AcceptInvitationRequest) => {
        const response = await api.post(`auth/invitation/${token}`, acceptData);
        return response.data;
    }
}