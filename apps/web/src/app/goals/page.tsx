import Header from "@/components/Header";
import Goals from "@/components/goals/Goals";

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-[#EDEDED]">
      <Header />
      <div className="flex-grow overflow-auto">
        <Goals />
      </div>
    </main>
  );
}