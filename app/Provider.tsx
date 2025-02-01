'use client';

import Loader from '@/components/Loader';
import { getClearkUsers, getDocumentUsers } from '@/lib/actions/user.actions';
import { useUser } from '@clerk/nextjs';
import { LiveblocksProvider, ClientSideSuspense } from '@liveblocks/react';
import { ReactNode } from 'react';

const Provider = ({ children }: { children: ReactNode }) => {
    const {user:clerkUser}=useUser();
    return (
        <LiveblocksProvider 
        authEndpoint="/api/liveblocks-auth"
        resolveUsers={
            async ({userIds}) => {
                // function to get users currently viewing the page from clerk
                const users=await getClearkUsers({userIds});
                return users;
             }}
             resolveMentionSuggestions={async({text,roomId}) =>{
                const roomUsers=await getDocumentUsers({
                    roomId,
                    currentUser:clerkUser?.emailAddresses[0].emailAddress!,
                    text,
                });
                return roomUsers;
             }}
            >
            <ClientSideSuspense fallback={<Loader />}>
                {children}
            </ClientSideSuspense>
        </LiveblocksProvider>
    )
}

export default Provider