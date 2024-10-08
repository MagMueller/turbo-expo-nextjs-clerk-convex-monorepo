"use client";

import { useUser } from "@clerk/clerk-react";
import { SignInButton } from "@clerk/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ScoreBudgetDisplay from "./common/ScoreBudgetDisplay";
import { UserNav } from "./common/UserNav";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');
  const { isSignedIn, user } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);

  const tabs = [
    { name: 'Goals', href: '/goals', id: 'goals' },
    { name: 'Friends', href: '/friends', id: 'friends' },
    { name: 'Verify', href: '/verifier', id: 'verifier' },
    { name: 'Increase Budget', href: '/increase-budget', id: 'increase-budget' },
  ];

  useEffect(() => {
    const currentTab = tabs.find(tab => tab.href === pathname);
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [pathname]);

  const handleTabClick = (tabId: string, href: string) => {
    setActiveTab(tabId);
    router.push(href);
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white text-xl font-bold">Time is Money</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } px-10 py-3 rounded-md text-base font-bold`}
                    onClick={() => handleTabClick(tab.id, tab.href)}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {isSignedIn ? (
              <>
                <ScoreBudgetDisplay 
                  score={currentUser?.score ?? 0} 
                  budget={currentUser?.budget ?? 0} 
                  darkMode={true} 
                />
                <UserNav
                  image={user?.imageUrl}
                  name={user?.fullName ?? ''}
                  email={user?.primaryEmailAddress?.emailAddress ?? ''}
                />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Login
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;