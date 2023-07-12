export const StringUtils = {
  toBase64String(input: string): string {
    return Buffer.from(input).toString("base64");
  },

  fromBase64(base64Input: string): string {
    return Buffer.from(base64Input, "base64").toString();
  },
};
