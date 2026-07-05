-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_customerId_fkey";

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
