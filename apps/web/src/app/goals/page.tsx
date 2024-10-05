import Header from "@/components/Header";
import Goals from "@/components/goals/Goals";

export default function Home() {
  return (
    <main className="bg-[#EDEDED] h-screen">
      <Header />
      <Goals />
    </main>
  );
}