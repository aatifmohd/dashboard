import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentUser } from "@/app/lib/auth";
import { Role } from "@/app/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";

export async function GET(request:NextRequest){
    try {
        const user =  await getCurrentUser();

        if(!user){
            return NextResponse.json({
                error: "You are not authorized to access user information"
            },{status:401})
        }

        const searchParams = request.nextUrl.searchParams
        const teamId = searchParams.get("teamId");
        const role = searchParams.get("role")

        //Build where clause based on user role
        const where : Prisma.UserWhereInput = {}
        if (user.role === Role.ADMIN){
            //Admin can see all users
        }else if (user.role === Role.MANAGER){
            //Manager can see users in their team or cross team users but not team managers
            where.OR=[{teamId:user.teamId},{role:Role.USER}];
        }else{
            //Regular users can only see in their team
            where.teamId = user.teamId;
            where.role = {not : Role.ADMIN}
        }
  
         //Additional Filters
         if(teamId){
            where.teamId = teamId
         }
         if (role && Object.values(Role).includes(role as Role)) {
         where.role = role as Role;
         }

         const users = await prisma.user.findMany({
            where,
            select:{
                id:true,
                email:true,
                name:true,
                role:true,
                team:{
                    select:{
                        id:true,
                        name:true,
                    }
                },
                createdAt:true
            },
            orderBy:{createdAt:"desc"}
         })
         return NextResponse.json({users})

    } catch (error) {
        console.error("Get users errors :" , error)
        return NextResponse.json({
            error:"Internal server error , something went wrong"
        },{status:500})
    }
}