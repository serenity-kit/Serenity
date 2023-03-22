export type Device = {
  signingPublicKey: string;
  encryptionPublicKey: string;
  encryptionPublicKeySignature: string;
};

export type LocalDevice = {
  signingPublicKey: string;
  signingPrivateKey: string;
  encryptionPublicKey: string;
  encryptionPrivateKey: string;
  encryptionPublicKeySignature: string;
  info?: string;
};

/*
 * join nested Object-keys with '-'
 *
 * input:
 *   collaboration: {
 *      terracotta: "#EF5245",
 *      coral: "#FD7064",
 *      ...
 *   }
 *
 * output:
 *   collaboration-terracotta, collaboration-coral, ...
 */
type SJoin<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "-"}${P}`
    : never
  : never;

/*
 * convert Object-keys to Type
 *
 * input:
 *   collaboration: {
 *      terracotta: "#EF5245",
 *      coral: "#FD7064",
 *      ...
 *   }
 *
 * output:
 *   "collaboration-terracotta" | "collaboration-coral" | ...
 */
export type SLeaves<T> = T extends object
  ? { [K in keyof T]-?: SJoin<K, SLeaves<T[K]>> }[keyof T]
  : "";
