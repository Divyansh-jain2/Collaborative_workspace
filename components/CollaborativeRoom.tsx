'use client';

import React, { useRef, useState,useEffect } from 'react'
import { RoomProvider, ClientSideSuspense } from '@liveblocks/react'
import { Editor } from '@/components/editor/Editor'
import Header from '@/components/Header'
import { SignedIn, SignedOut ,SignInButton,UserButton} from '@clerk/nextjs'
import ActiveCollaborators from './ActiveCollaborators';
import { Input } from './ui/input';
import Image from 'next/image';
import { updateDocumentTitle } from '@/lib/actions/room.actions';
import Loader from './Loader';
import ShareModal from './ShareModal';

const CollaborativeRoom = ({roomId,roomMetadata,users,currentUserType}:CollaborativeRoomProps)=> {

    const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
    const [editing, setEditing] = useState(false);
    const [loading,setLoading] = useState(false);


    //states trigger a component to re-render but refs no not
    //refs are used to store the reference of a dom element

    const containerRef=useRef<HTMLDivElement>(null);
    const inputRef=useRef<HTMLDivElement>(null);
    
    const updateTitleHandler=async (e:React.KeyboardEvent<HTMLInputElement>)=>{
        if(e.key==='Enter'){
            setLoading(true);
            try{
                if(documentTitle!==roomMetadata.title){
                    //update the title by calling a function
                    const updatedTitle = await updateDocumentTitle({ roomId, title: documentTitle });
                    if(updatedTitle){
                        setEditing(false);
                    }
                }
            }catch{
                console.log('error updating title');
            }
            setLoading(false);
        }
    }


    //initially when the document loads up as useEffect runs atleast once
    //it means it would already have assigned the eventListner to the document
    //and will be able to detect the click outside the container 
    useEffect(() => {

        const handleClickOutside = (e:MouseEvent)=>{
            if(containerRef.current && !containerRef.current.contains(e.target as Node)){
                setEditing(false);
                updateDocumentTitle({ roomId, title: documentTitle });
            }
        }
        document.addEventListener('mousedown',handleClickOutside);
        return ()=>{
            document.removeEventListener('mousedown',handleClickOutside);
        }
    },[documentTitle,roomId]);
    
    useEffect(()=>{
        if(editing){
            inputRef.current?.focus();
        }
    },[editing]);
    return (
        <RoomProvider id={roomId}>
            <ClientSideSuspense fallback={<Loader/>}>
                <div className='collaborative-room'>
                    <Header>
                        <div ref={containerRef} className='flex w-fit items-center justify-center gap-2'>
                            {/* checks if we are currently editing and not loading */}
                            {editing && !loading ?(
                                <Input 
                                type='text'
                                value={documentTitle}
                                ref={inputRef}
                                placeholder='Enter Title'
                                onChange={(e)=>setDocumentTitle(e.target.value)}
                                onKeyDown={(updateTitleHandler)}
                                disabled={!editing}
                                className='document-title-input'
                                />
                            ):(<>
                                <p className='document-title'>{documentTitle}</p>
                            </>
                            )}

                            {currentUserType==='editor' && !editing && (
                                <Image src="/assets/icons/edit.svg" 
                                    alt="edit"
                                    width={24}
                                    height={24}
                                    onClick={()=>setEditing(true)}
                                    className="pointer"
                                />
                            )}
                            {currentUserType!=='editor' && !editing && (
                                <p className='view-only-tag'>View Only</p>
                            )}
                            {loading && <p className='text-sm text-gray-400'>saving...</p>}
                        </div>
                        <div className='flex w-full 
                        flex-1 justify-end gap-2 sm:gap-3'>
                            <ActiveCollaborators/>
                            <ShareModal roomId={roomId} 
                                collaborators={users}
                                creatorId={roomMetadata.creatorId}/>
                            <SignedOut>
                                <SignInButton />
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </Header>
                <Editor roomId={roomId} currentUserType={currentUserType}/>
                </div>
            </ClientSideSuspense>
        </RoomProvider>
    )
}

export default CollaborativeRoom