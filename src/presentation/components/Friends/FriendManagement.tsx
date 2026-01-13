"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/domain/entities/User";
import { FriendRequest, FriendWithProfile } from "@/domain/types/friend";

interface FriendManagementProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'friends' | 'received' | 'sent';

export const FriendManagement = ({ isOpen, onClose }: FriendManagementProps) => {
    const [activeTab, setActiveTab] = useState<TabType>('friends');
    const [friends, setFriends] = useState<FriendWithProfile[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [inviteMessage, setInviteMessage] = useState("");
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchFriends();
            fetchRequests();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 3) {
                searchUsers(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            if (res.ok) {
                const data = await res.json();
                setFriends(data);
            }
        } catch (error) {
            console.error('Failed to fetch friends:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/friends/requests');
            if (res.ok) {
                const data = await res.json();
                setReceivedRequests(data.received);
                setSentRequests(data.sent);
            }
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        }
    };

    const searchUsers = async (query: string) => {
        setIsSearching(true);
        try {
            const res = await fetch(`/api/friends/search?email=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error('Failed to search users:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const sendFriendRequest = async (email: string) => {
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, message: inviteMessage || undefined })
            });
            const data = await res.json();
            if (res.ok) {
                showMessage('success', '친구 요청을 보냈습니다.');
                setSearchQuery("");
                setSearchResults([]);
                setInviteMessage("");
                fetchRequests();
            } else {
                showMessage('error', data.error || '친구 요청 실패');
            }
        } catch (error) {
            showMessage('error', '친구 요청 실패');
        }
    };

    const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            const res = await fetch(`/api/friends/requests/${requestId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                showMessage('success', action === 'accept' ? '친구가 되었습니다!' : '요청을 거절했습니다.');
                fetchFriends();
                fetchRequests();
            }
        } catch (error) {
            showMessage('error', '요청 처리 실패');
        }
    };

    const cancelRequest = async (requestId: string) => {
        try {
            const res = await fetch(`/api/friends/requests/${requestId}`, { method: 'DELETE' });
            if (res.ok) {
                showMessage('success', '요청을 취소했습니다.');
                fetchRequests();
            }
        } catch (error) {
            showMessage('error', '요청 취소 실패');
        }
    };

    const removeFriend = async (friendId: string) => {
        if (!confirm('정말 친구를 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/friends?friendId=${friendId}`, { method: 'DELETE' });
            if (res.ok) {
                showMessage('success', '친구를 삭제했습니다.');
                fetchFriends();
            }
        } catch (error) {
            showMessage('error', '친구 삭제 실패');
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const Avatar = ({ user, size = 'md' }: { user: { name?: string | null; email?: string | null; image?: string | null }; size?: 'sm' | 'md' | 'lg' }) => {
        const sizeClasses = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
        const letter = (user.name?.[0] || user.email?.[0] || '?').toUpperCase();
        
        return user.image ? (
            <img src={user.image} alt="" className={`${sizeClasses[size]} rounded-full object-cover`} />
        ) : (
            <div className={`${sizeClasses[size]} rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold`}>
                {letter}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-[var(--surface)] w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-xl font-bold">친구 관리</h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {message && (
                    <div className={`mx-4 mt-4 p-3 rounded-lg text-sm font-medium ${
                        message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="p-4" ref={searchRef}>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">search</span>
                        <input
                            type="email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="이메일로 친구 찾기..."
                            className="w-full h-11 pl-10 pr-4 bg-[var(--secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                        />
                        {isSearching && (
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--muted-foreground)]">progress_activity</span>
                        )}
                    </div>

                    {searchResults.length > 0 && (
                        <div className="absolute left-4 right-4 mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                            {searchResults.map((user) => (
                                <div key={user.id} className="p-3 hover:bg-[var(--secondary)] flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar user={user} />
                                        <div>
                                            <div className="font-medium">{user.name || '이름 없음'}</div>
                                            <div className="text-xs text-[var(--muted-foreground)]">{user.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => sendFriendRequest(user.email!)}
                                        className="px-3 py-1.5 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90"
                                    >
                                        요청
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex border-b border-[var(--border)]">
                    {[
                        { key: 'friends' as TabType, label: '친구', count: friends.length },
                        { key: 'received' as TabType, label: '받은 요청', count: receivedRequests.length },
                        { key: 'sent' as TabType, label: '보낸 요청', count: sentRequests.length }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'border-[var(--primary)] text-[var(--primary)]'
                                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            {tab.label} {tab.count > 0 && <span className="ml-1 px-1.5 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full text-xs">{tab.count}</span>}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <span className="material-symbols-outlined animate-spin text-3xl text-[var(--muted-foreground)]">progress_activity</span>
                        </div>
                    ) : activeTab === 'friends' ? (
                        friends.length === 0 ? (
                            <div className="text-center py-12 text-[var(--muted-foreground)]">
                                <span className="material-symbols-outlined text-5xl mb-2 block opacity-50">group</span>
                                <p>아직 친구가 없습니다</p>
                                <p className="text-sm">이메일로 친구를 찾아보세요</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {friends.map((friend) => (
                                    <div key={friend.id} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar user={friend} />
                                            <div>
                                                <div className="font-medium">{friend.name || '이름 없음'}</div>
                                                <div className="text-xs text-[var(--muted-foreground)]">{friend.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFriend(friend.id)}
                                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">person_remove</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : activeTab === 'received' ? (
                        receivedRequests.length === 0 ? (
                            <div className="text-center py-12 text-[var(--muted-foreground)]">
                                <span className="material-symbols-outlined text-5xl mb-2 block opacity-50">mail</span>
                                <p>받은 요청이 없습니다</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {receivedRequests.map((req) => (
                                    <div key={req.id} className="p-3 bg-[var(--secondary)] rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar user={req.sender || {}} />
                                            <div>
                                                <div className="font-medium">{req.sender?.name || '이름 없음'}</div>
                                                <div className="text-xs text-[var(--muted-foreground)]">{req.sender?.email}</div>
                                            </div>
                                        </div>
                                        {req.message && (
                                            <p className="text-sm text-[var(--muted-foreground)] mb-3 pl-2 border-l-2 border-[var(--border)]">{req.message}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRequest(req.id, 'accept')}
                                                className="flex-1 py-2 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90"
                                            >
                                                수락
                                            </button>
                                            <button
                                                onClick={() => handleRequest(req.id, 'reject')}
                                                className="flex-1 py-2 border border-[var(--border)] font-medium rounded-lg hover:bg-[var(--surface)]"
                                            >
                                                거절
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        sentRequests.length === 0 ? (
                            <div className="text-center py-12 text-[var(--muted-foreground)]">
                                <span className="material-symbols-outlined text-5xl mb-2 block opacity-50">send</span>
                                <p>보낸 요청이 없습니다</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sentRequests.map((req) => (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-[var(--secondary)] rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Avatar user={req.receiver || {}} />
                                            <div>
                                                <div className="font-medium">{req.receiver?.name || '이름 없음'}</div>
                                                <div className="text-xs text-[var(--muted-foreground)]">{req.receiver?.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => cancelRequest(req.id)}
                                            className="px-3 py-1.5 text-sm text-red-500 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            취소
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
