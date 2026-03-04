import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card } from '../components/ui';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { getAuthHeaders } from '../utils/auth';

const TIER_CONFIG = {
    Bronze:   { color: 'text-amber-700',   bg: 'bg-amber-100 dark:bg-amber-900/30',   border: 'border-amber-300 dark:border-amber-700',   minAt: 0,     next: 'Silver',   nextAt: 1000 },
    Silver:   { color: 'text-gray-600',    bg: 'bg-gray-100 dark:bg-gray-800',         border: 'border-gray-300 dark:border-gray-600',       minAt: 1000,  next: 'Gold',     nextAt: 5000 },
    Gold:     { color: 'text-yellow-600',  bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700',   minAt: 5000,  next: 'Platinum', nextAt: 10000 },
    Platinum: { color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-900/30',     border: 'border-blue-300 dark:border-blue-700',       minAt: 10000, next: null,       nextAt: null },
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ProgressBar = ({ points, tier }) => {
    const config = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;
    if (!config.next) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You've reached the highest tier — Platinum!
            </p>
        );
    }
    const prevAt = config.minAt;
    const range = config.nextAt - prevAt;
    const progress = Math.min(((points - prevAt) / range) * 100, 100);
    const remaining = Math.max(config.nextAt - points, 0);
    return (
        <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{points.toLocaleString()} pts</span>
                <span>{config.next} at {config.nextAt.toLocaleString()} pts</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {remaining.toLocaleString()} more points to {config.next}
            </p>
        </div>
    );
};

const LoyaltyPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchLoyalty = async () => {
            try {
                const res = await fetch(getApiUrl(ENDPOINTS.LOYALTY), { 
                    headers: getAuthHeaders(),
                    signal: controller.signal 
                });
                if (!res.ok) throw new Error('Failed to load loyalty data');
                const json = await res.json();
                if (!controller.signal.aborted) {
                    setData(json);
                }
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('[LOYALTY] Fetch aborted');
                    return;
                }
                setError(err.message);
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        fetchLoyalty();

        return () => controller.abort();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            );
        }
        if (error) {
            return (
                <div className="text-center py-20 text-red-500">{error}</div>
            );
        }

        const { points = 0, tier = 'Bronze', transactions = [] } = data || {};
        const config = TIER_CONFIG[tier] || TIER_CONFIG.Bronze;

        if (points === 0 && transactions.length === 0) {
            return (
                <Card className="text-center py-16 px-8">
                    <Award className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No loyalty points yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Book your first flight to start earning points!
                    </p>
                </Card>
            );
        }

        return (
            <div className="space-y-6">
                {/* Tier & Points Summary */}
                <Card className="p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Points</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">
                                {points.toLocaleString()}
                            </p>
                            <ProgressBar points={points} tier={tier} />
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm ${config.bg} ${config.color} ${config.border}`}>
                            <Award className="w-5 h-5" />
                            {tier}
                        </div>
                    </div>
                </Card>

                {/* Transactions Table */}
                <Card className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h2>
                    </div>
                    {transactions.length === 0 ? (
                        <p className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                            No transactions yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-left">
                                        <th className="px-6 py-3 font-medium">Date</th>
                                        <th className="px-6 py-3 font-medium">Type</th>
                                        <th className="px-6 py-3 font-medium">Ticket ID</th>
                                        <th className="px-6 py-3 font-medium text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {transactions.map((tx) => {
                                        const pointsEarned = tx.points_earned ?? 0;
                                        const pointsRedeemed = tx.points_redeemed ?? 0;
                                        const isEarned = pointsEarned > 0;
                                        return (
                                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(tx.date)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        isEarned
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {isEarned ? 'Earned' : 'Redeemed'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                    {tx.ticket_id ? `#${tx.ticket_id}` : '—'}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-semibold ${isEarned ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                    {isEarned ? `+${pointsEarned}` : `-${pointsRedeemed}`}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        );
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Award className="w-7 h-7 text-primary" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loyalty Program</h1>
                </div>
                {renderContent()}
            </div>
        </Layout>
    );
};

export default LoyaltyPage;
