"use client";

import { useState } from "react";
import type { StaffRow } from "./staff-table";

export interface StaffFormData {
  name: string;
  tier: "junior" | "senior" | "master";
  bio: string;
  specialties: string[];
  isActive: boolean;
}

interface StaffFormProps {
  staff?: StaffRow;
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
}

export function StaffForm({ staff, onSubmit, onCancel }: StaffFormProps) {
  const [name, setName] = useState(staff?.name ?? "");
  const [tier, setTier] = useState<"junior" | "senior" | "master">(
    staff?.tier ?? "junior"
  );
  const [bio, setBio] = useState(staff?.bio ?? "");
  const [specialtiesInput, setSpecialtiesInput] = useState(
    (staff?.specialties ?? []).join(", ")
  );
  const [isActive, setIsActive] = useState(staff?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const specialties = specialtiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({ name, tier, bio, specialties, isActive });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tier</label>
        <select
          value={tier}
          onChange={(e) =>
            setTier(e.target.value as "junior" | "senior" | "master")
          }
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        >
          <option value="junior">Junior</option>
          <option value="senior">Senior</option>
          <option value="master">Master</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Specialties (comma-separated)
        </label>
        <input
          type="text"
          value={specialtiesInput}
          onChange={(e) => setSpecialtiesInput(e.target.value)}
          placeholder="e.g. Brazilian Wax, Eyebrow Shaping"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="staffIsActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="staffIsActive" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
