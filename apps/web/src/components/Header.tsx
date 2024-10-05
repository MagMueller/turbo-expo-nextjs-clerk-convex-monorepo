"use client";

import { useUser } from "@clerk/clerk-react";
import Link from 'next/link';
import { useState } from 'react';
import { UserNav } from "./common/UserNav";

const Header = () => {
  const [activeTab, setActiveTab] = useState('goals');
  const { isSignedIn, user } = useUser();

  const tabs = [
    { name: 'Goals', href: '/goals', id: 'goals' },
    { name: 'Friends', href: '/friends', id: 'friends' },
    { name: 'Verifier Tasks', href: '/verifier', id: 'verifier' },
  ];

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white text-xl font-bold">King of Life</Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {tabs.map((tab) => (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } px-10 py-3 rounded-md text-base font-bold`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {isSignedIn ? (
              <UserNav
                image={user?.imageUrl}
                name={user?.fullName ?? ''}
                email={user?.primaryEmailAddress?.emailAddress ?? ''}
              />
            ) : (
              <Link href="/sign-in" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
