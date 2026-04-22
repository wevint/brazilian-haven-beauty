"use client";

import { useState } from "react";
import { StaffTable, type StaffRow } from "./staff-table";

interface StaffTableClientProps {
  staff: Array<{
    id: string;
    firstName: string;
    lastName: string;
    tier: string;
    specialties?: string[];
    isActive?: boolean;
    bio?: string | null;
    email?: string | null;
    phone?: string | null;
  }>;
}

export function StaffTableClient({ staff }: StaffTableClientProps) {
  const [rows] = useState<StaffRow[]>(
    staff.map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      tier: s.tier as StaffRow["tier"],
      specialties: s.specialties ?? [],
      isActive: s.isActive ?? true,
      bio: s.bio,
      email: s.email,
      phone: s.phone,
    }))
  );

  const handleEdit = (id: string) => {
    console.log("Edit staff:", id);
  };

  return <StaffTable staff={rows} onEdit={handleEdit} />;
}
