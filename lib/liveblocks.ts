//instance of liveblocks where we already added the key

import {Liveblocks} from "@liveblocks/node";

export const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});
  