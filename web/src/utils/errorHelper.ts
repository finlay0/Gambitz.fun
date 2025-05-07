import { toast } from 'react-hot-toast';
import { createLogger } from './logger';

const logger = createLogger('ErrorHelper');

export interface ErrorDetails {
  code?: string;
  message: string;
  details?: unknown;
}

// Anchor error codes mapping
const ANCHOR_ERROR_MAP: Record<string, string> = {
  'StakeExceedsPlayerCap': 'Stake amount exceeds the maximum allowed',
  'InsufficientPlayerOneFunds': 'Player one has insufficient funds',
  'InsufficientPlayerTwoFunds': 'Player two has insufficient funds',
  'ConfirmationWindowExpired': 'Game confirmation window has expired',
  'MatchAlreadyConfirmed': 'Game has already been confirmed',
  'MatchAlreadySettled': 'Game has already been settled',
  'InvalidSigner': 'Invalid signer - must be one of the players',
  'NoWinnerYet': 'No winner has been declared yet',
  'GameAlreadyOver': 'Game has already ended',
  'NotPlayersTurn': 'Not your turn to move',
  'TimeCalculationError': 'Error calculating time',
  'InvalidFen': 'Invalid board position',
  'AmbiguousMove': 'Ambiguous move - multiple pieces can make this move',
  'GameNotOver': 'Game is not over yet',
  'SameRoyaltyOwner': 'White and black opening-NFT owners cannot be the same account',
};

// WebSocket error mapping
const WS_ERROR_MAP: Record<string, string> = {
  'ECONNREFUSED': 'Connection refused - server may be down',
  'ETIMEDOUT': 'Connection timed out',
  'ECONNRESET': 'Connection was reset',
  'ENOTFOUND': 'Server not found',
  'EADDRINUSE': 'Address already in use',
  'EACCES': 'Permission denied',
  'EADDRNOTAVAIL': 'Address not available',
  'EAFNOSUPPORT': 'Address family not supported',
  'EALREADY': 'Connection already in progress',
  'EBADF': 'Bad file descriptor',
  'ECONNABORTED': 'Connection aborted',
  'EFAULT': 'Bad address',
  'EHOSTDOWN': 'Host is down',
  'EHOSTUNREACH': 'Host is unreachable',
  'EINTR': 'Interrupted system call',
  'EINVAL': 'Invalid argument',
  'EISCONN': 'Socket is already connected',
  'ENETDOWN': 'Network is down',
  'ENETRESET': 'Network dropped connection',
  'ENETUNREACH': 'Network is unreachable',
  'ENOBUFS': 'No buffer space available',
  'ENOTSOCK': 'Socket operation on non-socket',
  'EOPNOTSUPP': 'Operation not supported',
  'EPROTO': 'Protocol error',
  'EPROTONOSUPPORT': 'Protocol not supported',
  'EPROTOTYPE': 'Protocol wrong type for socket',
  'ESHUTDOWN': 'Cannot send after socket shutdown',
  'ESOCKTNOSUPPORT': 'Socket type not supported',
  'ETOOMANYREFS': 'Too many references',
  'EWOULDBLOCK': 'Operation would block',
};

export function handleError(error: unknown, context?: string): void {
  const errorDetails = extractErrorDetails(error);
  const friendlyMessage = getFriendlyMessage(errorDetails);
  
  // Log the error with context
  logger.error('Error occurred', {
    context,
    error: errorDetails,
    originalError: error,
  });

  // Show toast with friendly message
  toast.error(friendlyMessage, {
    duration: 5000,
    position: 'top-center',
  });
}

function extractErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    // Try to extract Anchor error code
    const anchorErrorMatch = error.message.match(/Error Code: ([A-Za-z]+)/);
    if (anchorErrorMatch) {
      return {
        code: anchorErrorMatch[1],
        message: error.message,
      };
    }

    // Check for WebSocket errors
    const wsErrorCode = Object.keys(WS_ERROR_MAP).find(code => 
      error.message.includes(code)
    );
    if (wsErrorCode) {
      return {
        code: wsErrorCode,
        message: error.message,
      };
    }

    return {
      message: error.message,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  return {
    message: 'An unknown error occurred',
    details: error,
  };
}

function getFriendlyMessage(errorDetails: ErrorDetails): string {
  // Check Anchor error map
  if (errorDetails.code && ANCHOR_ERROR_MAP[errorDetails.code]) {
    return ANCHOR_ERROR_MAP[errorDetails.code];
  }

  // Check WebSocket error map
  if (errorDetails.code && WS_ERROR_MAP[errorDetails.code]) {
    return WS_ERROR_MAP[errorDetails.code];
  }

  // Fallback to error message or default
  return errorDetails.message || 'An unexpected error occurred';
}

// Helper function to check if error is recoverable
export function isRecoverableError(error: unknown): boolean {
  const errorDetails = extractErrorDetails(error);
  
  // List of error codes that are recoverable
  const recoverableCodes = [
    'ETIMEDOUT',
    'ECONNRESET',
    'ENETDOWN',
    'ENETRESET',
    'ENETUNREACH',
    'EWOULDBLOCK',
  ];

  return errorDetails.code ? recoverableCodes.includes(errorDetails.code) : false;
}

// Helper function to get retry delay based on error
export function getRetryDelay(error: unknown): number {
  const errorDetails = extractErrorDetails(error);
  
  // Default retry delays for different error types
  const retryDelays: Record<string, number> = {
    'ETIMEDOUT': 2000,
    'ECONNRESET': 1000,
    'ENETDOWN': 5000,
    'ENETRESET': 3000,
    'ENETUNREACH': 5000,
    'EWOULDBLOCK': 500,
  };

  return errorDetails.code ? retryDelays[errorDetails.code] || 1000 : 1000;
} 