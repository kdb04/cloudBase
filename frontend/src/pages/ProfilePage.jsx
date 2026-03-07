import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, CreditCard, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { getAuthHeaders } from '../utils/auth';

const ProfilePage = () => {
    const [form, setForm] = useState({
        fname: '', mname: '', lname: '', passport_no: '', age: '', phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(getApiUrl(ENDPOINTS.PROFILE), { headers: getAuthHeaders() });
                if (!res.ok) throw new Error('Failed to load profile');
                const data = await res.json();
                if (data.profile) {
                    setForm({
                        fname: data.profile.fname || '',
                        mname: data.profile.mname || '',
                        lname: data.profile.lname || '',
                        passport_no: data.profile.passport_no || '',
                        age: data.profile.age || '',
                        phone: data.phones?.[0] || ''
                    });
                }
            } catch (err) {
                setToast({ type: 'error', message: err.message });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(t);
        }
    }, [toast]);

    const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(getApiUrl(ENDPOINTS.PROFILE), {
                method: 'PUT',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to save profile');
            }
            setToast({ type: 'success', message: 'Profile saved successfully!' });
        } catch (err) {
            setToast({ type: 'error', message: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Passenger Profile</h1>

                {toast && (
                    <div className={`flex items-center gap-2 p-4 mb-6 rounded-lg text-sm font-medium ${
                        toast.type === 'success'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                        {toast.type === 'success'
                            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        {toast.message}
                    </div>
                )}

                {loading ? (
                    <Card className="p-8 text-center text-gray-500 dark:text-gray-400">Loading profile...</Card>
                ) : (
                    <Card className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    icon={User}
                                    value={form.fname}
                                    onChange={handleChange('fname')}
                                    required
                                />
                                <Input
                                    label="Middle Name (optional)"
                                    icon={User}
                                    value={form.mname}
                                    onChange={handleChange('mname')}
                                />
                            </div>
                            <Input
                                label="Last Name"
                                icon={User}
                                value={form.lname}
                                onChange={handleChange('lname')}
                                required
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Passport Number"
                                    icon={CreditCard}
                                    type="text"
                                    pattern="[A-Za-z0-9]+"
                                    value={form.passport_no}
                                    onChange={handleChange('passport_no')}
                                    required
                                />
                                <Input
                                    label="Age"
                                    icon={Calendar}
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={form.age}
                                    onChange={handleChange('age')}
                                    required
                                />
                            </div>
                            <Input
                                label="Phone Number"
                                icon={Phone}
                                type="tel"
                                value={form.phone}
                                onChange={handleChange('phone')}
                                placeholder="10-digit number"
                            />

                            <div className="flex items-center gap-4 pt-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Profile'}
                                </Button>
                                <Link
                                    to="/booking"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Ready to book? →
                                </Link>
                            </div>
                        </form>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default ProfilePage;
