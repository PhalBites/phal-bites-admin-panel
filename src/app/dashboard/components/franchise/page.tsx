import { FranchiseList } from "./FranchiseList";
import { requireAuth } from "../../../../../lib/auth/auth-utils";

export default async function FranchisePage() {
  await requireAuth();
  return <FranchiseList />;
}
