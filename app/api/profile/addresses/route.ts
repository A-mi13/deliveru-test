import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma-client";

// GET: Получение списка адресов
export async function GET() {
  const userId = "1"; // Захардкоженный userId

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.deliveryAddress.findMany({
    where: { userId: parseInt(userId) },
  });

  return NextResponse.json(addresses);
}

// POST: Добавление нового адреса
export async function POST(request: Request) {
  const userId = "1"; // Захардкоженный userId

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { address } = await request.json();

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const newAddress = await prisma.deliveryAddress.create({
    data: {
      userId: parseInt(userId),
      address,
      isDefault: false,
    },
  });

  return NextResponse.json(newAddress, { status: 201 });
}

// DELETE: Удаление адреса
export async function DELETE(request: Request) {
  const userId = "1"; // Захардкоженный userId

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json(); // Получаем id адреса из тела запроса

  if (!id) {
    return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
  }

  // Удаляем адрес из базы данных
  await prisma.deliveryAddress.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Address deleted successfully" }, { status: 200 });
}