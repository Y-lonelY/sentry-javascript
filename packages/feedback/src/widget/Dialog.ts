import type { FeedbackComponent, FeedbackInternalOptions } from '../types';
import type { FormComponentProps } from './Form';
import { Form } from './Form';
import { Logo } from './Logo';
import { createElement } from './util/createElement';

export interface DialogProps
  extends FormComponentProps,
    Pick<FeedbackInternalOptions, 'formTitle' | 'showBranding' | 'colorScheme'> {
  onClosed?: () => void;
}

export interface DialogComponent extends FeedbackComponent<HTMLDialogElement> {
  /**
   * Shows the error message
   */
  showError: (message: string) => void;

  /**
   * Hides the error message
   */
  hideError: () => void;

  /**
   * Opens and shows the dialog and form
   */
  open: () => void;

  /**
   * Closes the dialog and form
   */
  close: () => void;

  /**
   * Check if dialog is currently opened
   */
  checkIsOpen: () => boolean;
}

/**
 * Feedback dialog component that has the form
 */
export function Dialog({
  formTitle,
  showBranding,
  showName,
  showEmail,
  isNameRequired,
  isEmailRequired,
  colorScheme,
  defaultName,
  defaultEmail,
  onClosed,
  onCancel,
  onSubmit,
  ...textLabels
}: DialogProps): DialogComponent {
  let el: HTMLDialogElement | null = null;

  /**
   * Handles when the dialog is clicked. In our case, the dialog is the
   * semi-transparent bg behind the form. We want clicks outside of the form to
   * hide the form.
   */
  function handleDialogClick(): void {
    close();

    // Only this should trigger `onClose`, we don't want the `close()` method to
    // trigger it, otherwise it can cause cycles.
    onClosed && onClosed();
  }

  /**
   * Close the dialog
   */
  function close(): void {
    if (el) {
      el.open = false;
    }
  }

  /**
   * Opens the dialog
   */
  function open(): void {
    if (el) {
      el.open = true;
    }
  }

  /**
   * Check if dialog is currently opened
   */
  function checkIsOpen(): boolean {
    return (el && el.open === true) || false;
  }

  const {
    el: formEl,
    showError,
    hideError,
  } = Form({
    showEmail,
    showName,
    isEmailRequired,
    isNameRequired,

    defaultName,
    defaultEmail,
    onSubmit,
    onCancel,
    ...textLabels,
  });

  el = createElement(
    'dialog',
    {
      className: 'dialog',
      open: true,
      onClick: handleDialogClick,
    },
    createElement(
      'div',
      {
        className: 'dialog__content',
        onClick: e => {
          // Stop event propagation so clicks on content modal do not propagate to dialog (which will close dialog)
          e.stopPropagation();
        },
      },
      createElement(
        'h2',
        { className: 'dialog__header' },
        formTitle,
        showBranding &&
          createElement(
            'a',
            {
              className: 'brand-link',
              target: '_blank',
              href: 'https://sentry.io/welcome/',
              title: 'Powered by Sentry',
              rel: 'noopener noreferrer',
            },
            Logo({ colorScheme }).el,
          ),
      ),
      formEl,
    ),
  );

  return {
    get el() {
      return el;
    },
    showError,
    hideError,
    open,
    close,
    checkIsOpen,
  };
}
