export const RandomUtil = {
  getRandomString(length: number, isUpperCaseOnly: boolean): string {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    if (isUpperCaseOnly) {
      return result.toUpperCase();
    }
    return result;
  },

  getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  getRandomNumber(min: number, maxExclusive: number): number {
    return Math.random() * (maxExclusive - min) + min;
  },
};
