import { IFriendRepository } from "@/domain/repositories/IFriendRepository";
import { User } from "@/domain/entities/User";
import { FriendRequest, Friendship, FriendWithProfile } from "@/domain/types/friend";
import prisma from "@/lib/prisma";

export class PrismaFriendRepository implements IFriendRepository {
    async sendFriendRequest(senderId: string, receiverEmail: string, message?: string): Promise<FriendRequest> {
        const receiver = await prisma.user.findUnique({
            where: { email: receiverEmail }
        });

        if (!receiver) {
            throw new Error("해당 이메일의 사용자를 찾을 수 없습니다.");
        }

        if (receiver.id === senderId) {
            throw new Error("자기 자신에게 친구 요청을 보낼 수 없습니다.");
        }

        const existingRequest = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { senderId, receiverId: receiver.id },
                    { senderId: receiver.id, receiverId: senderId }
                ]
            }
        });

        if (existingRequest) {
            if (existingRequest.status === 'PENDING') {
                throw new Error("이미 친구 요청이 진행 중입니다.");
            }
            if (existingRequest.status === 'ACCEPTED') {
                throw new Error("이미 친구인 사용자입니다.");
            }
        }

        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId: senderId, friendId: receiver.id },
                    { userId: receiver.id, friendId: senderId }
                ]
            }
        });

        if (existingFriendship) {
            throw new Error("이미 친구인 사용자입니다.");
        }

        const request = await prisma.friendRequest.create({
            data: {
                senderId,
                receiverId: receiver.id,
                message
            },
            include: {
                sender: true,
                receiver: true
            }
        });

        return this.mapToFriendRequest(request);
    }

    async acceptFriendRequest(requestId: string, userId: string): Promise<Friendship> {
        const request = await prisma.friendRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new Error("친구 요청을 찾을 수 없습니다.");
        }

        if (request.receiverId !== userId) {
            throw new Error("이 요청을 수락할 권한이 없습니다.");
        }

        if (request.status !== 'PENDING') {
            throw new Error("이미 처리된 요청입니다.");
        }

        const [updatedRequest, friendship1, friendship2] = await prisma.$transaction([
            prisma.friendRequest.update({
                where: { id: requestId },
                data: { status: 'ACCEPTED' }
            }),
            prisma.friendship.create({
                data: {
                    userId: request.senderId,
                    friendId: request.receiverId
                },
                include: { friend: true }
            }),
            prisma.friendship.create({
                data: {
                    userId: request.receiverId,
                    friendId: request.senderId
                },
                include: { friend: true }
            })
        ]);

        return {
            id: friendship1.id,
            userId: friendship1.userId,
            friendId: friendship1.friendId,
            friend: {
                id: friendship1.friend.id,
                name: friendship1.friend.name,
                email: friendship1.friend.email,
                image: friendship1.friend.image
            },
            createdAt: friendship1.createdAt.toISOString()
        };
    }

    async rejectFriendRequest(requestId: string, userId: string): Promise<void> {
        const request = await prisma.friendRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new Error("친구 요청을 찾을 수 없습니다.");
        }

        if (request.receiverId !== userId) {
            throw new Error("이 요청을 거절할 권한이 없습니다.");
        }

        await prisma.friendRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' }
        });
    }

    async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
        const request = await prisma.friendRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new Error("친구 요청을 찾을 수 없습니다.");
        }

        if (request.senderId !== userId) {
            throw new Error("이 요청을 취소할 권한이 없습니다.");
        }

        await prisma.friendRequest.delete({
            where: { id: requestId }
        });
    }

    async getSentRequests(userId: string): Promise<FriendRequest[]> {
        const requests = await prisma.friendRequest.findMany({
            where: { senderId: userId, status: 'PENDING' },
            include: { sender: true, receiver: true },
            orderBy: { createdAt: 'desc' }
        });

        return requests.map(r => this.mapToFriendRequest(r));
    }

    async getReceivedRequests(userId: string): Promise<FriendRequest[]> {
        const requests = await prisma.friendRequest.findMany({
            where: { receiverId: userId, status: 'PENDING' },
            include: { sender: true, receiver: true },
            orderBy: { createdAt: 'desc' }
        });

        return requests.map(r => this.mapToFriendRequest(r));
    }

    async getPendingRequestsCount(userId: string): Promise<number> {
        return await prisma.friendRequest.count({
            where: { receiverId: userId, status: 'PENDING' }
        });
    }

    async getFriends(userId: string): Promise<FriendWithProfile[]> {
        const friendships = await prisma.friendship.findMany({
            where: { userId },
            include: { friend: true },
            orderBy: { createdAt: 'desc' }
        });

        return friendships.map(f => ({
            id: f.friend.id,
            name: f.friend.name,
            email: f.friend.email,
            image: f.friend.image,
            friendshipId: f.id,
            friendsSince: f.createdAt.toISOString()
        }));
    }

    async removeFriend(userId: string, friendId: string): Promise<void> {
        await prisma.$transaction([
            prisma.friendship.deleteMany({
                where: { userId, friendId }
            }),
            prisma.friendship.deleteMany({
                where: { userId: friendId, friendId: userId }
            })
        ]);
    }

    async isFriend(userId: string, friendIdOrEmail: string): Promise<boolean> {
        let friendId = friendIdOrEmail;

        if (friendIdOrEmail.includes('@')) {
            const user = await prisma.user.findUnique({
                where: { email: friendIdOrEmail }
            });
            if (!user) return false;
            friendId = user.id;
        }

        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            }
        });

        return !!friendship;
    }

    async searchUsersByEmail(email: string, excludeUserId: string): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: {
                email: { contains: email, mode: 'insensitive' },
                id: { not: excludeUserId }
            },
            take: 10
        });

        return users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            image: u.image
        }));
    }

    private mapToFriendRequest(db: {
        id: string;
        senderId: string;
        receiverId: string;
        status: string;
        message: string | null;
        createdAt: Date;
        sender?: { id: string; name: string | null; email: string | null; image: string | null };
        receiver?: { id: string; name: string | null; email: string | null; image: string | null };
    }): FriendRequest {
        return {
            id: db.id,
            senderId: db.senderId,
            receiverId: db.receiverId,
            status: db.status as FriendRequest['status'],
            message: db.message || undefined,
            sender: db.sender ? {
                id: db.sender.id,
                name: db.sender.name,
                email: db.sender.email,
                image: db.sender.image
            } : undefined,
            receiver: db.receiver ? {
                id: db.receiver.id,
                name: db.receiver.name,
                email: db.receiver.email,
                image: db.receiver.image
            } : undefined,
            createdAt: db.createdAt.toISOString()
        };
    }
}
