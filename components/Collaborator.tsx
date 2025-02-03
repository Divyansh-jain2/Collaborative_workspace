import Image from 'next/image';
import React, { useState } from 'react'
import UserTypeSelector from './UserTypeSelector';
import { Button } from './ui/button';
import { removeCollaborator, updateDocumentAccess } from '@/lib/actions/user.actions';

const Collaborator = ({roomId,creatorId,email,collaborator,user}:CollaboratorProps) => {
    //we also want to be able to change the permissions of already added collaborators
    //viewer or editor

    const [userType,setUserType]=useState(collaborator.userType || 'viewer');    
    const [loading,setLoading]=useState(false);

    const shareDocumentHandler=async(type:string)=>{
        setLoading(true);
        await updateDocumentAccess({
            roomId,
            email,
            userType:type as UserType,
            updatedBy :user
        });
        setLoading(false);
    }
    const removeCollaborateHandler=async(email:string)=>{
        setLoading(true);
        
        await removeCollaborator({
            roomId,
            email
        });
        setLoading(false);
    }
    // console.log(typeof(creatorId),typeof(collaborator.id));
    return (
        <li className="flex items-center justify-between gap-2 py-3">
            <div className="flex gap-2">
                <Image src={collaborator.avatar} 
                alt={collaborator.name} width={36} height={36}
                className='size-9 rounded-full'/>
                <div>
                    <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
                        {collaborator.name}
                        <span className="text-10-regular pl-2 text-blue-100">
                            {loading && 'updating...'}
                        </span>
                    </p>
                    <p className='text-sm font-light text-blue-100'>
                        {collaborator.email}
                    </p>
                </div> 
            </div>
            {/* if the user is the owner display owner */}
            
            {creatorId===collaborator.id ?(
                <p className='text-sm text-blue-100'>Owner</p>
            ):(
                 
                <div className='flex flex-center'>
                    <UserTypeSelector 
                        userType={userType as UserType}
                        setUserType={setUserType ||'viewer'}
                        onClickHandler={shareDocumentHandler}
                    />
                    <Button type='button' onClick={()=>
                        removeCollaborateHandler(collaborator.email)}>
                            Remove
                    </Button>
                </div>
            )
                
            }
        </li>
    )
}

export default Collaborator