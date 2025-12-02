// utils/body-scroll-lock.ts
let scrollLockCount = 0

export function lockBodyScroll() {
  if (typeof document === 'undefined') return

  if (scrollLockCount === 0) {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight =
      window.innerWidth > document.documentElement.clientWidth ? '15px' : '0'
  }
  scrollLockCount++
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return

  scrollLockCount = Math.max(0, scrollLockCount - 1)

  if (scrollLockCount === 0) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}
