import { decrypt } from './crypto.utils.js';

declare const __CLCVII_SHARED_IV: number[];
declare const __CLCVII_CIPHER_TEXT: string;

const iv = new Uint8Array(__CLCVII_SHARED_IV);
const buffer = atob(__CLCVII_CIPHER_TEXT);
const cipher = Uint8Array.from(buffer, c => c.charCodeAt(0));
const form = document.forms.item(0);

form?.addEventListener(
  'submit',
  async event => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);

    try {
      const password = data.get('password') as string;
      const serial = await decrypt({ cipher, iv }, password);
      const serialInput = form.elements.namedItem('serial') as HTMLInputElement;

      serialInput.value = serial;
      serialInput.style.width = `${serial.length}ch`;

      delete form.dataset.errored;
      form.dataset.fulfilled = '';
    } catch (_) {
      delete form.dataset.fulfilled;
      form.dataset.errored = '';
    }
  },
  { capture: true }
);

form?.addEventListener('input', () => {
  delete form.dataset.errored;
  delete form.dataset.fulfilled;
});
