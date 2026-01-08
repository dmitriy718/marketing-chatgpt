"use client";

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function crmGraphQL<T>(
  query: string,
  token: string | null,
  variables?: Record<string, unknown>
) {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? "CRM request failed.");
  }
  if (!payload.data) {
    throw new Error("Missing data from CRM.");
  }
  return payload.data;
}
