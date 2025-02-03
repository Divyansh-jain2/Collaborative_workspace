import CollaborativeRoom from "@/components/CollaborativeRoom"
import { getDocument } from "@/lib/actions/room.actions";
import { getClearkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const page = async({params:{id}}:SearchParamProps) => {
  const cleakUser = await currentUser();
  if(!cleakUser) redirect('/sign-in');

  const room =await getDocument({
    roomId:id,
    userId:cleakUser.emailAddresses[0].emailAddress,
  });

  if(!room) redirect('/');

  //getting the user ids of the users who have access to the room
  const userIds=Object.keys(room.usersAccesses);
  const users=await getClearkUsers({userIds});

  const usersData=users.map((user:User)=>({
    //spreading the user object
    //means copying all the properties of the user object
    ...user,
    //setting the userType of the user
    userType:room.usersAccesses[user.email]?.includes('room:write')?
    'editor':'viewer',
  }));
  const currentUserType=room.usersAccesses[cleakUser.emailAddresses[0].emailAddress]?.includes('room:write')?
  'editor':'viewer';
  // console.log(room.metadata.createId);
  return (
    <main className="flex flex-col items-center w-full">
        <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType} 
        />
    </main>
  )
}

export default page