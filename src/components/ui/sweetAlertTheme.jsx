import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { colors } from '../../constants/theme';

const primary = colors.primary?.DEFAULT || '#790728';
const primarySoft = colors.primary?.[50] || '#F2E6EA';

/** MOIF-themed SweetAlert2 instance (maroon confirm, slate text). */
export const swalThemed = Swal.mixin({
  confirmButtonColor: primary,
  cancelButtonColor: '#64748b',
  color: '#334155',
  background: '#ffffff',
  customClass: {
    popup: 'moif-swal-popup',
    title: 'moif-swal-title',
    confirmButton: 'moif-swal-confirm',
    cancelButton: 'moif-swal-cancel',
  },
  buttonsStyling: true,
});

function runFocus(focus) {
  if (!focus) return;
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (typeof focus === 'function') focus();
      else focus?.current?.focus?.();
    }, 50);
  });
}

/**
 * Warning-style alert (single OK). After close, focuses optional ref or callback.
 */
/**
 * Success alert (single OK).
 */
export function alertSuccess(message, options = {}) {
  const {
    title = 'Success',
    autoClose = true,
    timerMs = 1800,
    progress = true,
  } = options;
  return swalThemed.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: autoClose ? undefined : 'OK',
    showConfirmButton: !autoClose,
    allowOutsideClick: !autoClose,
    allowEscapeKey: !autoClose,
    timer: autoClose ? timerMs : undefined,
    timerProgressBar: autoClose && progress,
    didOpen: () => {
      if (autoClose && progress) Swal.showLoading();
    },
  });
}

export function alertWarning(message, options = {}) {
  const { title = 'Attention', focus } = options;
  return swalThemed
    .fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'OK',
      allowOutsideClick: true,
    })
    .then(() => runFocus(focus));
}

/**
 * Yes / No question. Returns Promise<boolean> (true if confirmed).
 */
export function confirmQuestion(message, options = {}) {
  const {
    title = 'Confirm',
    confirmText = 'Yes',
    cancelText = 'No',
    focusOnCancel,
    focusOnConfirm,
  } = options;
  return swalThemed
    .fire({
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      focusCancel: true,
    })
    .then((result) => {
      if (result.isConfirmed) runFocus(focusOnConfirm);
      else if (result.dismiss === Swal.DismissReason.cancel) runFocus(focusOnCancel);
      return result.isConfirmed === true;
    });
}

export { primary as swalPrimaryColor, primarySoft as swalPrimarySoft };
