import { getDb } from "../client";
import { enquiries } from "../schema";
import { eq, desc } from "drizzle-orm";
import { generateEnquiryNumber, generateId } from "../utils";
import type { Enquiry, EnquiryStatus } from "../schema";

export interface CreateEnquiryData {
  name: string;
  phone: string;
  email: string;
  service?: string;
  eventDate?: Date;
  eventDateRaw?: string;
  preferredTime?: string;
  location?: string;
  people?: number;
  peopleRaw?: string;
  message: string;
  status?: EnquiryStatus;
}

export async function createEnquiry(data: CreateEnquiryData): Promise<Enquiry> {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  const enquiryNumber = await generateEnquiryNumber();
  const id = generateId();

  await db.insert(enquiries).values({
    id,
    enquiryNumber,
    name: data.name,
    phone: data.phone,
    email: data.email,
    service: data.service,
    eventDate: data.eventDate,
    eventDateRaw: data.eventDateRaw,
    preferredTime: data.preferredTime,
    location: data.location,
    people: data.people,
    peopleRaw: data.peopleRaw,
    message: data.message,
    status: data.status || "NEW",
  });

  const result = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);

  if (!result[0]) {
    throw new Error("Failed to create enquiry");
  }

  return result[0];
}

export async function getAllEnquiries(): Promise<Enquiry[]> {
  const db = getDb();
  if (!db) return [];

  try {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  } catch (error) {
    console.error("Failed to get enquiries:", error);
    return [];
  }
}

export async function getEnquiryByNumber(enquiryNumber: string): Promise<Enquiry | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(enquiries)
      .where(eq(enquiries.enquiryNumber, enquiryNumber))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Failed to get enquiry by number:", error);
    return null;
  }
}

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Failed to get enquiry by id:", error);
    return null;
  }
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<Enquiry> {
  const db = getDb();
  if (!db) throw new Error("Database not available");

  await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));

  const updated = await getEnquiryById(id);
  if (!updated) throw new Error("Failed to update enquiry");
  return updated;
}

export async function getEnquiriesByStatus(status: EnquiryStatus): Promise<Enquiry[]> {
  const db = getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(enquiries)
      .where(eq(enquiries.status, status))
      .orderBy(desc(enquiries.createdAt));
  } catch (error) {
    console.error("Failed to get enquiries by status:", error);
    return [];
  }
}
