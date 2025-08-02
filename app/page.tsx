'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/annotations/labeling');
  }, [router]);

  return (
    <div>page</div>
  );
};

export default Page;