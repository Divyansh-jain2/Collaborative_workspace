'use server';

// Purpose: Contains the actions that can be performed on a room.
//which in our case is a document



import {nanoid} from 'nanoid';
import { liveblocks } from '../liveblocks';
import { revalidatePath } from 'next/cache';
import { parseStringify } from '../utils';
import { redirect } from 'next/navigation';

export const createDocument=async ({userId,email}:CreateDocumentParams)=>{
        //generate a random room id

        const roomId=nanoid();
        try{
            const metadata={
                createId:userId,
                email,
                title:'Untitled',
            }
            
            //type is defined in the types folder
            const usersAccesses: RoomAccesses={
                [email]:['room:write'],
            }

            //copied from liveblocks documentation https://liveblocks.io/docs/authentication/id-token/nextjs
        
            //this is a server action so this will only be happening on the server
            //so we used 'use server'
            // also this can be verified by the fact that we imported the 
            // liveblocks from the liveblocks.ts file in which liveblocks is imported from liveblocks/node
            // which is a server side library

            //we will be using it in the front end 
            // when the user presses the button "start a blank document"
            const room = await liveblocks.createRoom(roomId, {
                metadata,
                usersAccesses,
                defaultAccesses: [],
            });
            
            //a new document is created when a room is created
            revalidatePath('/');
            
            //whenever we return someting using server action we need to stringify it
            //defined parseStringify in the utils folder
            return parseStringify(room);
        }
        
        catch(error){
            console.log(`Error creating document: ${error}`);
        }

}

export const getDocument=async({roomId,userId}:{roomId:string,userId:string})=>{
    try{
        const room=await liveblocks.getRoom(roomId);

        const hasAccess=Object.keys(room.usersAccesses).includes(userId);
        
        if(!hasAccess){
            throw new Error('You do not have access to this document');
        }
        return parseStringify(room);    
    }catch(error){
        console.log(`Error getting room: ${error}`);
    }
}

//getting all the documents of a user
export const getDocuments=async(email:string)=>{
    try{
        const rooms=await liveblocks.getRooms({userId:email});
        return parseStringify(rooms);    
    }catch(error){
        console.log(`Error getting rooms: ${error}`);
    }
}


export const updateDocumentTitle=async({roomId,title}:{roomId:string,title:string})=>{
    try{
        const updatedRoom=await liveblocks.updateRoom(roomId,{
            metadata:{
                title
            }
        })
        //meaing refetching the data for this path
        revalidatePath(`/documents/${roomId}`);
        return parseStringify(updatedRoom);

    }catch{
        console.log('error updating title');
    }
}

export const deleteDocument=async(roomId:string)=>{
    try{
        await liveblocks.deleteRoom(roomId);
        revalidatePath('/');
        redirect('/');
    }
    catch(erroor){
        console.log('error deleting document');
    }
}