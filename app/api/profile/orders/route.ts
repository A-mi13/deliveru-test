import { NextResponse } from "next/server";
//import { auth } from "@clerk/nextjs";
import { prisma } from "@/prisma/prisma-client";

export async function GET() {
  //const { userId } = auth();

  const userId = "1";

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}