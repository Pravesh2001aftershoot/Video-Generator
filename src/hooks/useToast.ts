import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast(ms = 1800) {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<number>();

  const toast = useCallback(
    (m: string) => {
      setMsg(m);
      setShow(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShow(false), ms);
    },
    [ms],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { msg, show, toast };
}
