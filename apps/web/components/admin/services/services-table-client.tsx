"use client";

import { useState } from "react";
import { ServicesTable, type ServiceRow } from "./services-table";

interface ServicesTableClientProps {
  services: Array<{
    id: string;
    name: string;
    description?: string | null;
    isActive?: boolean;
    pricing?: unknown[];
  }>;
}

export function ServicesTableClient({ services }: ServicesTableClientProps) {
  const [rows] = useState<ServiceRow[]>(
    services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description ?? "",
      isActive: s.isActive ?? true,
      pricingCount: Array.isArray(s.pricing) ? s.pricing.length : 0,
    }))
  );

  const handleEdit = (id: string) => {
    console.log("Edit service:", id);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    console.log("Toggle service active:", id, isActive);
  };

  return (
    <ServicesTable
      services={rows}
      onEdit={handleEdit}
      onToggleActive={handleToggleActive}
    />
  );
}
