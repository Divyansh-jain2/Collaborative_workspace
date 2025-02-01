import { useOthers } from '@liveblocks/react/suspense'
import React from 'react'

const ActiveCollaborators = () => {
    //get the other users who are currentlly viewing this document
    const others=useOthers();

    //get the info of the other users
    const collaborators=others.map((other)=>other.info);

    return (
        <ul className='collaborators-list'>
            {collaborators.map(({id,avatar,name,color})=>(
                <li key={id} >
                    <img src={avatar} alt={name} width={100} height={100} className='inline-bloack
                     size-8 rounded-full ring-2 ring-dark-100'
                     style={{border:`3px solid ${color}`}}/>
                    
                </li>
            ))}
        </ul>
    )
}

export default ActiveCollaborators