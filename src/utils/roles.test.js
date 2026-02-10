import { describe, it, expect } from "vitest";
import {
  collectUserRoleNames,
  hasAnyRole,
  hasAnyStaffRole,
  hasAnyRedactionRole,
  hasPersonnelRole,
} from "./roles";

describe("roles utils", () => {
  it("collects role names from multiple sources and normalizes", () => {
    const user = {
      groups: [{ name: "Commercial" }],
      group_names: ["Personnel"],
      roles: [{ name: "Redacteur" }],
      role: "CustomRole",
      profile: { group: { name: "ProfileRole" } },
      is_commercial: true,
      is_redacteur: false,
    };

    const names = collectUserRoleNames(user);
    expect(names.has("commercial")).toBe(true);
    expect(names.has("personnel")).toBe(true);
    expect(names.has("redacteur")).toBe(true);
    expect(names.has("customrole")).toBe(true);
    expect(names.has("profilerole")).toBe(true);
  });

  it("grants access to staff and superuser", () => {
    expect(hasAnyRole({ is_staff: true }, ["Personnel"]) ).toBe(true);
    expect(hasAnyRole({ is_superuser: true }, ["Personnel"]) ).toBe(true);
  });

  it("uses explicit permissions when provided", () => {
    const user = { perms: ["api.add_userformation"] };
    expect(hasAnyRole(user, [], ["api.add_userformation"]) ).toBe(true);
  });

  it("checks specialized helpers", () => {
    const staffUser = { roles: ["Personnel"] };
    const redactionUser = { roles: ["Redacteur"] };
    const personnelUser = { perms: ["api.view_userformation"] };

    expect(hasAnyStaffRole(staffUser)).toBe(true);
    expect(hasAnyRedactionRole(redactionUser)).toBe(true);
    expect(hasPersonnelRole(personnelUser)).toBe(true);
  });
});
