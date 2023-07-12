import { Logger } from "../Utils/Logger";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require("bcrypt");

const tag = "PasswordUtil";
const saltRounds = 10;

export const PasswordUtil = {
  async checkHash(data: { password: string; hashBase64: string }): Promise<boolean> {
    try {
      const { password, hashBase64 } = data;

      return bcrypt.compare(password, hashBase64);
    } catch (error) {
      Logger.warn({ message: "checkHash Failed", error, tag });
      throw error;
    }
  },
  getHash(password: string | undefined) {
    return bcrypt.hashSync(password, saltRounds);
  },
};
