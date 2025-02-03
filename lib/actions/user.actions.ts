'use server'

import { clerkClient } from "@clerk/nextjs/server"
import { getAccessType, parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";


export const getClearkUsers=async({userIds}:{userIds: string[]})=>{
    try{
        //changed these lines 
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

export const updateDocumentAccess=async({roomId,email,userType,updatedBy}:ShareDocumentParams)=>{
    try{
        const usersAccesses:RoomAccesses={
            [email]:getAccessType(userType) as AccessType,
        }
        const room=await liveblocks.updateRoom(roomId,{
            usersAccesses
        })
        if(room){
            const notificationId=nanoid();

            await liveblocks.triggerInboxNotification({
                userId: email,
                kind:'$documentAccess',
                subjectId:notificationId,
                activityData:{
                    userType,
                    title:'You are invited to collaborate on a document',
                    updatedBy:updatedBy.name,
                    avatar:updatedBy.avatar,
                    email:updatedBy.email,
                },
                roomId,
            })
        }
        revalidatePath(`/documents/${roomId}`);
        return parseStringify(room);
    }
    catch(error){
        console.log(`Error sharing document: ${error}`);
    }
}
export const removeCollaborator=async({roomId,email}:{roomId:string,email:string})=>{
    try{
        const room=await liveblocks.getRoom(roomId);
        
        if(room.metadata.email===email){
            throw new Error('You cannot remove the owner of the document');
        }
        const updatedRoom=await liveblocks.updateRoom(roomId,{
            usersAccesses:{
                //putting this user to null to remove the user from the room

                [email]:null,
            }
        })
    }

    catch(error){
        console.log(`Error removing collaborator: ${error}`);
    }
}