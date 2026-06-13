import React from 'react';
import { Layout, MessageSquare } from 'lucide-react';
import { ChatWidget } from '../../components/shared/ChatWidget';
import { SidebarUserActions } from '../../components/shared/SidebarUserActions';

export const OrganizerDashboard: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 relative">
            <div className="absolute top-6 right-6">
                <SidebarUserActions onNavigate={onNavigate} />
            </div>
            <div className="max-w-2xl w-full text-center space-y-8">
                <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                    <Layout className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-serif text-slate-900">Organizer Portal</h1>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Selamat datang di portal Organizer. Gunakan widget chat di pojok kanan bawah untuk berkoordinasi dengan Admin.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
                     <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-left space-y-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold">Koordinasi Admin</h3>
                        <p className="text-xs text-slate-400">Hubungi tim admin untuk sinkronisasi jadwal dan operasional.</p>
                     </div>
                </div>
            </div>
            <ChatWidget />
        </div>
    );
};
