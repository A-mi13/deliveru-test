import { prisma } from "@/prisma/prisma-client";

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: {
      product: {
        include: {
          ingredients: true,
          items: true,
        }
      }
    }
  })
  console.log(categories)
  return (
    <div></div>
  );
}
