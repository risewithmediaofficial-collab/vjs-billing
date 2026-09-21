import { useEffect } from 'react';

// Reference count to support nested / stacked modals properly
let lockCount = 0;

/**
 * Increment lock count and apply scroll lock classes / styles to document
 */
export function lockScroll() {
  lockCount++;
  if (lockCount === 1) {
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Decrement lock count and restore scroll when all locks are released
 */
export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
}

/**
 * Force clear all scroll locks (e.g. on full navigation / reset)
 */
export function forceUnlockScroll() {
  lockCount = 0;
  document.body.classList.remove('modal-open');
  document.documentElement.classList.remove('modal-open');
  document.body.style.overflow = '';
}

/**
 * Returns current lock count
 */
export function getScrollLockCount() {
  return lockCount;
}

/**
 * Custom hook to lock screen/body scroll when a popup, modal, or form is active.
 * Restores scroll automatically when component unmounts or isActive becomes false.
 *
 * @param {boolean} isActive - Whether the popup or form modal is currently active
 */
export default function useScrollLock(isActive) {
  useEffect(() => {
    if (!isActive) return;
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isActive]);
}
