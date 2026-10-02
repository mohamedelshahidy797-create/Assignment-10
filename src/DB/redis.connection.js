import { createClient } from "redis"
import { REDIS_URI } from "./config.js";

export const client = createClient({
  url: REDIS_URI
});

export async function  connectRadis() {
try {
    
    await client.connect()
    console.log(`redis connected successfully`);
    

} catch (error) {
    console.log(`fail to connect to redis`);
    
}    
}