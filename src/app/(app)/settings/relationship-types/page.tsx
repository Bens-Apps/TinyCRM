import { requireAuth } from "@/lib/auth-helpers";
import { getRelationshipTypes } from "@/queries/settings";
import { RelationshipTypeList } from "@/components/settings/relationship-type-list";

export default async function RelationshipTypesPage() {
  const user = await requireAuth();
  const types = await getRelationshipTypes(user.id!);

  return <RelationshipTypeList types={types} />;
}
