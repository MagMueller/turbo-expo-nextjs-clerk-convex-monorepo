import Header from '@/components/Header';
import FriendsList from '@/components/friends/FriendsList';

export default function FriendsPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <FriendsList />
      </main>
    </>
  );
}