import { useEffect } from 'react';

const useScrollbarStyles = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .notifications-scroll::-webkit-scrollbar,
      .cds--list-box__menu::-webkit-scrollbar { width: 6px; }
      .notifications-scroll::-webkit-scrollbar-track,
      .cds--list-box__menu::-webkit-scrollbar-track { background: var(--cds-layer); }
      .notifications-scroll::-webkit-scrollbar-thumb,
      .cds--list-box__menu::-webkit-scrollbar-thumb { background: var(--cds-border-subtle); border-radius: 3px; }
      .notifications-scroll::-webkit-scrollbar-thumb:hover,
      .cds--list-box__menu::-webkit-scrollbar-thumb:hover { background: var(--cds-border-strong); }
      .cds--number input[type="number"]::-webkit-outer-spin-button,
      .cds--number input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      .cds--number { position: relative; }
      .cds--number::after { content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 6px solid var(--cds-border-subtle); pointer-events: none; z-index: 1; }
      .cds--number::before { content: ''; position: absolute; right: 12px; top: 50%; transform: translateY(-50%) translateY(-3px); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 6px solid var(--cds-border-subtle); pointer-events: none; z-index: 1; }
      .cds--number:hover::after,
      .cds--number:hover::before { border-top-color: var(--cds-border-strong); }
      .cds--number:hover::after { border-bottom-color: var(--cds-border-strong); }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
};

export default useScrollbarStyles;