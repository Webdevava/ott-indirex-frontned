'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/annotations/labeling');
  }, [router]);

  return (
    <div className='h-screen flex items-center justify-center'><p>
      redirecting...</p></div>
  );
};

export default Page;