import Header from "@/components/Header";
import GoalDetails from "@/components/goals/GoalDetails";
import { Id } from "@packages/backend/convex/_generated/dataModel";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main className="bg-[#F5F7FE] h-screen">
      <Header />
      <GoalDetails goalId={params.slug as Id<"goals">} />
    </main>
  );
}
