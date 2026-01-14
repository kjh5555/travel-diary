-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('VIEW', 'EDIT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "AnimeSpot" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sceneName" TEXT NOT NULL,
    "originalImageUrl" TEXT NOT NULL,
    "realImageUrl" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "guideTip" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimeSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeSpotLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "animeSpotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnimeSpotLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSpot" (
    "id" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "tip" TEXT NOT NULL,
    "subCategory" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSpotLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "themeSpotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThemeSpotLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTheme" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "color" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomThemePlace" (
    "id" TEXT NOT NULL,
    "customThemeId" TEXT NOT NULL,
    "note" TEXT,
    "placeId" TEXT NOT NULL,
    "placeName" TEXT NOT NULL,
    "placeAddress" TEXT NOT NULL,
    "placeLat" DOUBLE PRECISION NOT NULL,
    "placeLng" DOUBLE PRECISION NOT NULL,
    "placeRating" DOUBLE PRECISION,
    "placePhotos" TEXT,
    "placeTypes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomThemePlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedItinerary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "travelType" TEXT NOT NULL DEFAULT 'international',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "arrivalAirport" TEXT,
    "departureAirport" TEXT,
    "coverImage" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedItinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedItineraryPlace" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "orderInDay" INTEGER NOT NULL DEFAULT 0,
    "isDayTransition" BOOLEAN NOT NULL DEFAULT false,
    "placeId" TEXT NOT NULL,
    "placeName" TEXT NOT NULL,
    "placeAddress" TEXT NOT NULL,
    "placeLat" DOUBLE PRECISION NOT NULL,
    "placeLng" DOUBLE PRECISION NOT NULL,
    "placeRating" DOUBLE PRECISION,
    "placePhotos" TEXT,
    "placeTypes" TEXT,
    "routeToNext" TEXT,
    "memoryText" TEXT,
    "memoryImages" TEXT,
    "memoryTimestamp" TIMESTAMP(3),
    "memoryIsLiked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedItineraryPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyShare" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "permission" "SharePermission" NOT NULL DEFAULT 'VIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripComment" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripPhoto" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeSpotLike_userId_animeSpotId_key" ON "AnimeSpotLike"("userId", "animeSpotId");

-- CreateIndex
CREATE UNIQUE INDEX "ThemeSpotLike_userId_themeSpotId_key" ON "ThemeSpotLike"("userId", "themeSpotId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomThemePlace_customThemeId_placeId_key" ON "CustomThemePlace"("customThemeId", "placeId");

-- CreateIndex
CREATE INDEX "SavedItineraryPlace_itineraryId_day_idx" ON "SavedItineraryPlace"("itineraryId", "day");

-- CreateIndex
CREATE INDEX "FriendRequest_receiverId_status_idx" ON "FriendRequest"("receiverId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_receiverId_key" ON "FriendRequest"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Friendship_userId_idx" ON "Friendship"("userId");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "Friendship"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "Friendship"("userId", "friendId");

-- CreateIndex
CREATE INDEX "JourneyShare_sharedWithId_idx" ON "JourneyShare"("sharedWithId");

-- CreateIndex
CREATE INDEX "JourneyShare_ownerId_idx" ON "JourneyShare"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyShare_itineraryId_sharedWithId_key" ON "JourneyShare"("itineraryId", "sharedWithId");

-- CreateIndex
CREATE INDEX "TripComment_placeId_idx" ON "TripComment"("placeId");

-- CreateIndex
CREATE INDEX "TripComment_userId_idx" ON "TripComment"("userId");

-- CreateIndex
CREATE INDEX "TripPhoto_placeId_idx" ON "TripPhoto"("placeId");

-- CreateIndex
CREATE INDEX "TripPhoto_userId_idx" ON "TripPhoto"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeSpotLike" ADD CONSTRAINT "AnimeSpotLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeSpotLike" ADD CONSTRAINT "AnimeSpotLike_animeSpotId_fkey" FOREIGN KEY ("animeSpotId") REFERENCES "AnimeSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSpotLike" ADD CONSTRAINT "ThemeSpotLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeSpotLike" ADD CONSTRAINT "ThemeSpotLike_themeSpotId_fkey" FOREIGN KEY ("themeSpotId") REFERENCES "ThemeSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTheme" ADD CONSTRAINT "CustomTheme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomThemePlace" ADD CONSTRAINT "CustomThemePlace_customThemeId_fkey" FOREIGN KEY ("customThemeId") REFERENCES "CustomTheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItinerary" ADD CONSTRAINT "SavedItinerary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItineraryPlace" ADD CONSTRAINT "SavedItineraryPlace_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "SavedItinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyShare" ADD CONSTRAINT "JourneyShare_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "SavedItinerary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyShare" ADD CONSTRAINT "JourneyShare_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyShare" ADD CONSTRAINT "JourneyShare_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripComment" ADD CONSTRAINT "TripComment_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "SavedItineraryPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripComment" ADD CONSTRAINT "TripComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPhoto" ADD CONSTRAINT "TripPhoto_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "SavedItineraryPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripPhoto" ADD CONSTRAINT "TripPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
