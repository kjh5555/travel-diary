"use client";

import { useState, useEffect } from "react";
import { TripComment } from "@/domain/types/friend";

interface TripCommentsSectionProps {
    placeId: string;
    itineraryId: string;
    currentUserId: string;
}

export const TripCommentsSection = ({ placeId, itineraryId, currentUserId }: TripCommentsSectionProps) => {
    const [comments, setComments] = useState<TripComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isExpanded) {
            fetchComments();
        }
    }, [isExpanded, placeId]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/comments?placeId=${placeId}`);
            if (res.ok) {
                setComments(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addComment = async () => {
        if (!newComment.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ placeId, content: newComment.trim() })
            });
            if (res.ok) {
                setNewComment("");
                fetchComments();
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateComment = async (commentId: string) => {
        if (!editContent.trim()) return;
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/comments`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId, content: editContent.trim() })
            });
            if (res.ok) {
                setEditingId(null);
                setEditContent("");
                fetchComments();
            }
        } catch (error) {
            console.error('Failed to update comment:', error);
        }
    };

    const deleteComment = async (commentId: string) => {
        if (!confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/itineraries/${itineraryId}/comments?commentId=${commentId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchComments();
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        return date.toLocaleDateString('ko-KR');
    };

    const Avatar = ({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) => {
        if (!user) return null;
        const letter = (user.name?.[0] || user.email?.[0] || '?').toUpperCase();
        return user.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold">
                {letter}
            </div>
        );
    };

    return (
        <div className="mt-3 border-t border-[var(--border)] pt-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                <span>댓글 {comments.length > 0 && `(${comments.length})`}</span>
                <span className={`material-symbols-outlined text-lg transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {isExpanded && (
                <div className="mt-3 space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <span className="material-symbols-outlined animate-spin text-[var(--muted-foreground)]">progress_activity</span>
                        </div>
                    ) : (
                        <>
                            {comments.length === 0 ? (
                                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">아직 댓글이 없습니다</p>
                            ) : (
                                <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <Avatar user={comment.user} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">{comment.user?.name || '익명'}</span>
                                                    <span className="text-xs text-[var(--muted-foreground)]">{formatRelativeTime(comment.createdAt)}</span>
                                                </div>
                                                {editingId === comment.id ? (
                                                    <div className="mt-1 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="flex-1 text-sm px-2 py-1 bg-[var(--secondary)] border border-[var(--border)] rounded"
                                                            autoFocus
                                                        />
                                                        <button onClick={() => updateComment(comment.id)} className="text-xs text-[var(--primary)]">저장</button>
                                                        <button onClick={() => setEditingId(null)} className="text-xs text-[var(--muted-foreground)]">취소</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-sm mt-1">{comment.content}</p>
                                                        {comment.userId === currentUserId && (
                                                            <div className="flex gap-2 mt-1">
                                                                <button
                                                                    onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                                                                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                                                >
                                                                    수정
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteComment(comment.id)}
                                                                    className="text-xs text-red-500 hover:text-red-600"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="댓글을 입력하세요..."
                                    className="flex-1 h-9 px-3 text-sm bg-[var(--secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)]"
                                    onKeyDown={(e) => e.key === 'Enter' && addComment()}
                                />
                                <button
                                    onClick={addComment}
                                    disabled={!newComment.trim() || isSubmitting}
                                    className="px-3 h-9 bg-[var(--primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                    ) : (
                                        '작성'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
