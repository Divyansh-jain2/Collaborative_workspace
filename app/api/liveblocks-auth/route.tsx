// In a Next.js application, an API
// route allows you to create server-side endpoints that
// can handle HTTP requests. These routes are typically 
// used to handle data fetching, form submissions,
// authentication, and other server-side logic.
// API routes are defined in the pages/api directory or in 
// the api directory when using the App Router.


// Explanation of the Provided Code

// The provided code defines an API route in a Next.js
// application that handles a POST request to 
// authenticate a user with Liveblocks using Clerk for
// user management.


import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  //geting the users from clerk
  const clerkUser = await currentUser();

  if(!clerkUser) redirect('/sign-in');

  const {id,firstName,lastName,emailAddresses,imageUrl}=clerkUser;
  const user={
    id,
    info:{
        id,
        name:`${firstName} ${lastName}`,
        email:emailAddresses[0].emailAddress,
        avatar:imageUrl,
        //special color for each user
        color:getUserColor(id),
    },
  }
  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds:[],
    },
    { userInfo: user.info },
  );

  return new Response(body, { status });
}