"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { string } from "zod";



export const userdata= async(email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw new Error("Failed to fetch user data");
  }
}


export const resetPassword= async(email:string,password:string)=>{
    const NewPassword = await bcrypt.hash(password, 10);
  try{
    const user = await prisma.user.update({
      where:{
        email:email
      },
      data:{
        password:NewPassword
      }
    })
  }
  catch(err){
    console.error(err)

  }
}