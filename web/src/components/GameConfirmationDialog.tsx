import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useStakeSelector } from '@/hooks/useStakeSelector';
import { useMatchmaker } from '@/hooks/useMatchmaker';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
/* eslint-enable @typescript-eslint/no-unused-vars */

interface GameConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  whitePlayer: {
    address: string;
    rating?: number;
  };
  blackPlayer: {
    address: string;
    rating?: number;
  };
  stake: number;
  timeControl: {
    initial: number;
    increment: number;
  };
}

export function GameConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  whitePlayer,
  blackPlayer,
  stake,
  timeControl,
}: GameConfirmationDialogProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatStake = (lamports: number) => {
    return `${lamports / 1e9} SOL`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-neutral p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white mb-4"
                >
                  Confirm Game Settings
                </Dialog.Title>

                <div className="mt-2 space-y-4">
                  {/* Players */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-border rounded-lg p-4">
                      <div className="text-sm text-gray-400">White</div>
                      <div className="text-white font-mono">{formatAddress(whitePlayer.address)}</div>
                      {whitePlayer.rating && (
                        <div className="text-sm text-gray-400 mt-1">Rating: {whitePlayer.rating}</div>
                      )}
                    </div>
                    <div className="bg-border rounded-lg p-4">
                      <div className="text-sm text-gray-400">Black</div>
                      <div className="text-white font-mono">{formatAddress(blackPlayer.address)}</div>
                      {blackPlayer.rating && (
                        <div className="text-sm text-gray-400 mt-1">Rating: {blackPlayer.rating}</div>
                      )}
                    </div>
                  </div>

                  {/* Time Control */}
                  <div className="bg-border rounded-lg p-4">
                    <div className="text-sm text-gray-400">Time Control</div>
                    <div className="text-white">
                      {formatTime(timeControl.initial)} + {timeControl.increment}s
                    </div>
                  </div>

                  {/* Stake */}
                  <div className="bg-border rounded-lg p-4">
                    <div className="text-sm text-gray-400">Stake</div>
                    <div className="text-white font-mono">{formatStake(stake)}</div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={onConfirm}
                  >
                    Confirm & Start
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 