import Header from '@/components/Header';
import VerifierTasks from '@/components/verifier/VerifierTasks';

export default function VerifierTasksPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <VerifierTasks />
      </main>
    </>
  );
}