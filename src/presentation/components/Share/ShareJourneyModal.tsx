"use client";

import { useState, useEffect } from "react";
import { FriendWithProfile, JourneyShare, SharePermission } from "@/domain/types/friend";

interface ShareJourneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    itineraryId: string;
    itineraryTitle?: string;
}

export const ShareJourneyModal = ({ isOpen, onClose, itineraryId, itineraryTitle }: ShareJourneyModalProps) => {
    const [friends, setFriends] = useState<FriendWithProfile[]>([]);
    const [shares, setShares] = useState<JourneyShare[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, itineraryId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [friendsRes, sharesRes] = await Promise.all([
                fetch('/api/friends'),
                fetch(`/api/itineraries/${itineraryId}/share`)
            ]);

            if (friendsRes.ok) setFriends(await friendsRes.json());
            if (sharesRes.ok) setShares(await sharesRes.json());
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const shareWithFriend = async (friendId: string, permission: SharePermission = 'VIEW') => {
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sharedWithId: friendId, permission })
            });
            const data = await res.json();
            if (res.ok) {
                showMessage('success', '공유되었습니다.');
                fetchData();
            } else {
                showMessage('error', data.error || '공유 실패');
            }
        } catch (error) {
            showMessage('error', '공유 실패');
        }
    };

    const updatePermission = async (shareId: string, permission: SharePermission) => {
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/share`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shareId, permission })
            });
            if (res.ok) {
                showMessage('success', '권한이 변경되었습니다.');
                fetchData();
            }
        } catch (error) {
            showMessage('error', '권한 변경 실패');
        }
    };

    const removeShare = async (shareId: string) => {
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/share?shareId=${shareId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showMessage('success', '공유가 해제되었습니다.');
                fetchData();
            }
        } catch (error) {
            showMessage('error', '공유 해제 실패');
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const sharedFriendIds = shares.map(s => s.sharedWithId);
    const availableFriends = friends.filter(f => 
        !sharedFriendIds.includes(f.id) &&
        (searchQuery === '' || 
         f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         f.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const Avatar = ({ user }: { user: { name?: string | null; email?: string | null; image?: string | null } }) => {
        const letter = (user.name?.[0] || user.email?.[0] || '?').toUpperCase();
        return user.image ? (
            <img src={user.image} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                {letter}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--surface)] w-full max-w-md max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold">여정 공유</h2>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--secondary)] rounded-lg">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    {itineraryTitle && (
                        <p className="text-sm text-[var(--muted-foreground)]">{itineraryTitle}</p>
                    )}
                </div>

                {message && (
                    <div className={`mx-4 mt-4 p-3 rounded-lg text-sm font-medium ${
                        message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="material-symbols-outlined animate-spin text-3xl text-[var(--muted-foreground)]">progress_activity</span>
                        </div>
                    ) : (
                        <>
                            {shares.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-[var(--muted-foreground)] mb-3">공유 중</h3>
                                    <div className="space-y-2">
                                        {shares.map((share) => (
                                            <div key={share.id} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Avatar user={share.sharedWith || {}} />
                                                    <div>
                                                        <div className="font-medium">{share.sharedWith?.name || '이름 없음'}</div>
                                                        <div className="text-xs text-[var(--muted-foreground)]">{share.sharedWith?.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={share.permission}
                                                        onChange={(e) => updatePermission(share.id, e.target.value as SharePermission)}
                                                        className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2 py-1"
                                                    >
                                                        <option value="VIEW">보기</option>
                                                        <option value="EDIT">편집</option>
                                                    </select>
                                                    <button
                                                        onClick={() => removeShare(share.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-bold text-[var(--muted-foreground)] mb-3">친구에게 공유</h3>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="친구 검색..."
                                    className="w-full h-10 px-4 mb-3 bg-[var(--secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                                />

                                {availableFriends.length === 0 ? (
                                    <div className="text-center py-8 text-[var(--muted-foreground)]">
                                        <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">group</span>
                                        <p className="text-sm">{friends.length === 0 ? '친구가 없습니다' : '공유할 친구가 없습니다'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {availableFriends.map((friend) => (
                                            <div key={friend.id} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Avatar user={friend} />
                                                    <div>
                                                        <div className="font-medium">{friend.name || '이름 없음'}</div>
                                                        <div className="text-xs text-[var(--muted-foreground)]">{friend.email}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => shareWithFriend(friend.id, 'VIEW')}
                                                        className="px-3 py-1.5 text-xs bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
                                                    >
                                                        공유
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
