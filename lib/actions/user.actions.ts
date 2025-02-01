'use server'

import { clerkClient } from "@clerk/nextjs/server"
import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";


export const getClearkUsers=async({userIds}:{userIds: string[]})=>{
    try{
        //changed these lines from yt comment section
        const client = await clerkClient();
        const { data } = await client.users.getUserList({
            emailAddress: userIds,
        });
        //--------------------------------
        
        const users=data.map((user)=>({
            id:user.id,
            name:`${user.firstName}${user.lastName}`,
            email:user.emailAddresses[0].emailAddress,
            avatar:user.imageUrl,
        }))

        //sorting the users by the order of the userIds
        const sortedUsers=userIds.map((email)=>users.find((user)=>user.email===email));
        return parseStringify(sortedUsers);
    }
    
    catch(error){
        console.log(`Error getting users: ${error}`);
    }
}

export const getDocumentUsers=async({roomId,currentUser,text}:{roomId:string,currentUser:string,text:string})=>{
    try{
        const room=await liveblocks.getRoom(roomId);
        
        const users=Object.keys(room.usersAccesses).filter((email)=> email!==currentUser);
        if(text.length){
            const lowerCaseText=text.toLowerCase();

            const fileredUsers=users.filter((email)=>email.toLowerCase().includes(lowerCaseText));

            return parseStringify(fileredUsers);
        }
        return parseStringify(users);
    }
    catch(error){
        console.log(`Error getting users: ${error}`);
    }
}