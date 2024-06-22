'use client';

import { Association } from '@prisma/client';
import dynamic from 'next/dynamic';

const LazyMap = dynamic(() => import("@/components/public/associations/associationsMap"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function AssociationMapCaller({associations} : {associations : Association[]}) {
  return <LazyMap associations={associations} />;
}
