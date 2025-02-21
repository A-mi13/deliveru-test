import { prisma } from "@/prisma/prisma-client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

// Получение всех пользователей
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID пользователя не указан" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        fullName: true,
        email: true,
        phone: true,
        birthDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка получения данных пользователя" }, { status: 500 });
  }
}

// Создание нового пользователя (оставляем как есть)
export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.password) {
    return NextResponse.json({ error: "Пароль обязателен" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10); // Хешируем пароль

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      birthDate: new Date(data.birthDate),
      password: hashedPassword, // Теперь передаем пароль
      verified: new Date(0), // Новый пользователь не верифицирован по умолчанию
    },
  });

  return NextResponse.json(user);
}

// Обновление профиля пользователя
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    const { id, fullName, email, phone, birthDate } = data;

    if (!id || !fullName || !email || !phone) {
      return NextResponse.json({ error: "Необходимы все обязательные поля" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) }, // Преобразуем id в число
      data: {
        fullName,
        email,
        phone,
        birthDate: new Date(birthDate),
        updatedAt: new Date(), // Автоматически обновляем поле updatedAt
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Ошибка обновления профиля" }, { status: 500 });
  }
}