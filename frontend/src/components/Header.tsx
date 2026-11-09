'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export function Header() {
  return (
    <header className="flex w-full justify-center px-4 pt-5">
      <nav
        aria-label="Main"
        className="flex h-16 w-full max-w-4xl items-center justify-between rounded-full border border-gray-100 bg-white pl-4 pr-2 shadow-[0_4px_50px_rgba(0,0,0,0.05)] sm:h-20 sm:pl-6 sm:pr-3"
      >
        <Link href="/" className="flex items-center gap-3 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
          <Image src="/images/logo.png" alt="" width={40} height={42} priority />
          <span className="text-lg font-semibold tracking-tight text-gray-900">JobBoard</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/"
            className="hidden rounded-md px-2 py-1 text-[15px] font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:inline"
          >
            Find Jobs
          </Link>
          <Button
            component={Link}
            href="/?create=true"
            scroll={false}
            radius="xl"
            size="md"
            color="violet"
            leftSection={<IconPlus size={18} />}
            className="font-medium"
          >
            <span className="hidden sm:inline">Create Job</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
