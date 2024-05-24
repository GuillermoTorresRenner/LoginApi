import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
class UsersDAO {
  static async getUserByEmail(email) {
    return prisma.users.findUnique({
      where: { email },
    });
  }

  static async getUserByCreds(email, password) {
    const user = await prisma.users.findUnique({ where: { email } });
    if (user) {
      let correctPwd = bcrypt.compareSync(password, user.password);

      if (correctPwd) {
        delete user.password;
        return user;
      }
    }

    return null;
  }

  static async register(name, surname, email, password) {
    password = await bcrypt.hash(password, 10);
    const user = prisma.users.create({
      data: { name, surname, email, password },
    });
    return user;
  }

  static async getUserByID(id) {
    return await prisma.users.findUnique({ where: { id } });
  }
  static async getUsers() {
    return await prisma.users.findMany();
  }
}

export default UsersDAO;
