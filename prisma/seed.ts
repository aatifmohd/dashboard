import "dotenv/config";
import { Role } from "@/app/generated/prisma";
import {prisma} from "../app/lib/db"
import { hashPassword } from "@/app/lib/auth";

async function main(){
console.log("Starting Database seed...");
//Create Teams
const teams = await Promise.all([
    prisma.team.create({
        data:{
            name : "Engineering",
            description : "Software Development team",
            code : "ENG-2024",
        },
    }),
     prisma.team.create({
        data:{
            name : "Marketing",
            description : "Marketing and sales team",
            code : "MKT-2024",
        },
    }),
     prisma.team.create({
        data:{
            name : "Operations",
            description : "Business Operations team",
            code : "OPS-2024",
        },
    }),
])

//Create Sample users

const sampleUsers = [
    {
        name : "John Developer",
        email : "john@company.com",
        team: teams[0],
        role : Role.MANAGER
    },

    {
        name : "Jane Designer",
        email : "jane@company.com",
        team: teams[0],
        role : Role.USER
    },

    {
        name : "Bob Marketer",
        email : "bob@company.com",
        team: teams[1],
        role : Role.MANAGER
    },

    {
        name : "Alice Sales",
        email : "alice@company.com",
        team: teams[1],
        role : Role.USER
    }

]

for(const userData of sampleUsers){
    await prisma.user.create({
        data:{
            email:userData.email,
            name:userData.name,
            password:await hashPassword("123457"),
            role:userData.role,
            teamId:userData.team.id
        }
    })
}

console.log("Database seeded Successfully");



}





main().catch((e)=>{
    console.error("Seeding failed :",e)
    process.exit(1)
}).finally(async()=>{
    await prisma.$disconnect()
})