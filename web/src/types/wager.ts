import { Idl } from '@coral-xyz/anchor';

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/wager.json`.
 */
export const IDL: Idl = {
  version: "0.1.0",
  name: "wager",
  instructions: [
    {
      name: "confirmMatch",
      accounts: [
        {
          name: "playerOne",
          isMut: true,
          isSigner: true
        },
        {
          name: "playerTwo",
          isMut: true,
          isSigner: true
        },
        {
          name: "matchAccount",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                value: "chessbets"
              },
              {
                kind: "account",
                path: "playerOne"
              },
              {
                kind: "account",
                path: "playerTwo"
              }
            ]
          }
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "createMatch",
      accounts: [
        {
          name: "playerOne",
          isMut: true,
          isSigner: true
        },
        {
          name: "playerTwo",
          isMut: true,
          isSigner: true
        },
        {
          name: "matchAccount",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                value: "chessbets"
              },
              {
                kind: "account",
                path: "playerOne"
              },
              {
                kind: "account",
                path: "playerTwo"
              }
            ]
          }
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "stakeLamports",
          type: "u64"
        }
      ]
    },
    {
      name: "initialize",
      accounts: [],
      args: []
    },
    {
      name: "settleMatch",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true
        },
        {
          name: "matchAccount",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                value: "chessbets"
              },
              {
                kind: "account",
                path: "matchAccount.playerOne"
              },
              {
                kind: "account",
                path: "matchAccount.playerTwo"
              }
            ]
          }
        },
        {
          name: "winner",
          isMut: false,
          isSigner: false
        },
        {
          name: "platform",
          isMut: false,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: []
    },
    {
      name: "submitResult",
      accounts: [
        {
          name: "signer",
          isMut: false,
          isSigner: true
        },
        {
          name: "matchAccount",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                value: "chessbets"
              },
              {
                kind: "account",
                path: "matchAccount.playerOne"
              },
              {
                kind: "account",
                path: "matchAccount.playerTwo"
              }
            ]
          }
        }
      ],
      args: [
        {
          name: "resultType",
          type: {
            defined: "ResultType"
          }
        }
      ]
    }
  ],
  accounts: [
    {
      name: "match",
      type: {
        kind: "struct",
        fields: [
          {
            name: "playerOne",
            type: "publicKey"
          },
          {
            name: "playerTwo",
            type: "publicKey"
          },
          {
            name: "stakeLamports",
            type: "u64"
          },
          {
            name: "winner",
            type: "publicKey"
          },
          {
            name: "isSettled",
            type: "bool"
          },
          {
            name: "startSlot",
            type: "u64"
          }
        ]
      }
    }
  ],
  types: [
    {
      name: "ResultType",
      type: {
        kind: "enum",
        variants: [
          {
            name: "mate"
          },
          {
            name: "resign"
          },
          {
            name: "timeout"
          },
          {
            name: "disconnect"
          }
        ]
      }
    }
  ],
  errors: [
    {
      code: 6000,
      name: "stakeExceedsPlayerCap",
      msg: "Stake amount exceeds player cap"
    },
    {
      code: 6001,
      name: "insufficientPlayerOneFunds",
      msg: "Player one has insufficient funds for stake"
    },
    {
      code: 6002,
      name: "insufficientPlayerTwoFunds",
      msg: "Player two has insufficient funds for stake"
    },
    {
      code: 6003,
      name: "confirmationWindowExpired",
      msg: "Confirmation window has expired"
    },
    {
      code: 6004,
      name: "matchAlreadyConfirmed",
      msg: "Match has already been confirmed"
    },
    {
      code: 6005,
      name: "matchAlreadySettled",
      msg: "Match has already been settled"
    },
    {
      code: 6006,
      name: "invalidSigner",
      msg: "Invalid signer - must be one of the players"
    },
    {
      code: 6007,
      name: "noWinnerYet",
      msg: "No winner has been declared yet"
    }
  ]
};

export type Wager = typeof IDL;

export const PROGRAM_IDL = IDL;

/**
 * Type representing a result variant in the wager program.
 * Each variant is an object with a single key representing the result type.
 * 
 * @example
 * ```typescript
 * const mateResult: ResultVariant = { mate: {} };
 * const resignResult: ResultVariant = { resign: {} };
 * ```
 */
export type ResultVariant = {
  mate?: object;
  resign?: object;
  timeout?: object;
  disconnect?: object;
};

/**
 * Valid result variant names as a tuple type
 */
export const RESULT_VARIANTS = ['mate', 'resign', 'timeout', 'disconnect'] as const;

/**
 * Type guard to check if a value is a valid ResultVariant
 * @param value The value to check
 * @returns True if the value is a valid ResultVariant
 */
export function isValidResultVariant(value: unknown): value is ResultVariant {
  if (typeof value !== 'object' || value === null) return false;
  const keys = Object.keys(value);
  return keys.length === 1 && RESULT_VARIANTS.includes(keys[0] as typeof RESULT_VARIANTS[number]);
}

/**
 * Creates a ResultVariant from a variant name
 * @param variant The variant name to create
 * @returns A ResultVariant object
 * 
 * @example
 * ```typescript
 * const result = createResultVariant('mate');
 * // { mate: {} }
 * ```
 */
export function createResultVariant(variant: typeof RESULT_VARIANTS[number]): ResultVariant {
  return { [variant]: {} };
} 