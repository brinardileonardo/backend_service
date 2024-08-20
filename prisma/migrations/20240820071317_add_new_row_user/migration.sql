-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "role" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" TEXT;
