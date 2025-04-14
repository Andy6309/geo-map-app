-- AlterTable
ALTER TABLE "lines" ADD COLUMN     "geom" geometry;

-- AlterTable
ALTER TABLE "shapes" ADD COLUMN     "geom" geometry;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "waypoints" ADD COLUMN     "geom" geometry;
