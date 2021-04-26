import * as crypto from "crypto";

/* Convert the given unsigned 16-bit (short) integer from host byte order to network byte order (Little-Endian to Big-Endian)
 * @param {number} value - value to convert
 * @return {Buffer}
 */
const htonl = (value: number): Buffer => {
  const buffer = Buffer.alloc(4);

  buffer[0] = (0xFF & (value >> 24));
  buffer[1] = (0xff & (value >> 16));
  buffer[2] = (0xff & (value >> 8));
  buffer[3] = (0xff & (value));

  return buffer;
}

/* Calculate the validity window
 * @param {number} timeStep - time-step window as minutes
 * @return {number}
 */
const getCurrentTimeStepNumber = (timeStep: number): number => {
  const now = new Date();

  return now.getTime() / (timeStep * 60 * 1000);
}

/* Apply reason to validity window
 * @param {Buffer} input - time validity in network byte order
 * @param {string=} modifier
 */
const applyModifier = (input: Buffer, modifier?: string): Buffer => {
  if (!modifier) return input;
  return Buffer.concat([input, Buffer.from(modifier, "utf-8")]);
}

/* Compute one-time password
 * @param {crypto.Hmac} hashAlg - hashing algorithm
 * @param {number} timeStepNumber - validity window
 * @param {string=} modifier
 */
const computeOtp = (hashAlg: crypto.Hmac, timeStepNumber: number, modifier?: string): number => {
  const mod = 1000000;

  const hash = hashAlg.update(applyModifier(htonl(timeStepNumber), modifier)).digest()

  const offset = hash[hash.length - 1] & 0xF;

  const binaryCode = (hash[offset] & 0x7f) << 24
    | (hash[offset + 1] & 0xff) << 16
    | (hash[offset + 2] & 0xff) << 8
    | (hash[offset + 3] & 0xff);

  return binaryCode % mod;
}

/* Generate time-based one-time password.
 * Default time-step is 3 minutes.
 * @param {Buffer} token - a secure random token (e.g. a user's security stamp)
 * @param {string=} modifier - reason to create this one-time password
 */
const generateCode = (token: Buffer, modifier?: string): number => {
  const hashAlg = crypto.createHmac("sha1", token);

  return computeOtp(hashAlg, 3, modifier);
}

/* Validate the time-based one-time password.
 * Allows a variance of no greater than 9 minutes in either direction.
 * @param {number} code - code to be validated
 * @param {Buffer} token - token that is used to create one-time password
 * @param {string=} modifier - reason to create this one-time password
 */
const validateCode = (code: number, token: Buffer, modifier?: string): boolean => {
  const timeStepNumber = getCurrentTimeStepNumber(3);

  for (var i = -2; i <= 2; i++) {
    const hashAlg = crypto.createHmac("sha1", token);
    const computedTotp = computeOtp(hashAlg, timeStepNumber + i, modifier);
    if (computedTotp === code) {
      return true;
    }
  }

  return false;
}

export default { generateCode, validateCode };
