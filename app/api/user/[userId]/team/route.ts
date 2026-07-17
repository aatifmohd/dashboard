import { Role } from "@/app/generated/prisma";
import { checkUserPermission, getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const user = await getCurrentUser();

    if (!user || !checkUserPermission(user, Role.ADMIN)) {
      return NextResponse.json(
        {
          error: "You are not authorized to assign team",
        },
        { status: 401 }
      );
    }

    const { teamId } = await request.json();

    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return NextResponse.json(
          {
            error: "Team not found",
          },
          { status: 404 }
        );
      }
    }

    // Update user's team assignment
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        teamId: teamId,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: teamId
        ? "User assigned to team Successfully"
        : "User removed from team Successfully",
    });
  } catch (error) {
    console.error("Team assignment error",error)
    if(error instanceof Error && error.message.includes("Record to update not found")){
     return NextResponse.json({
        error:"user not found"
     },{status:404})
    }

    return NextResponse.json({
        error:"Internal server error , something went wrong!",
    },{status:500})
  }
}
