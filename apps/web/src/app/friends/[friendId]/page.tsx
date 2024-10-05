import Header from '@/components/Header';
import FriendProfile from '@/components/friends/FriendProfile';

export default function FriendProfilePage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <FriendProfile />
      </main>
    </>
  );
}