import { useState, useEffect, useRef } from 'react';

const NumberInput = ({ value, onChange, className, ...props }) => {
  const [display, setDisplay] = useState(String(value));
  const ref = useRef(null);

  useEffect(() => {
    if (document.activeElement !== ref.current) {
      setDisplay(String(value));
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setDisplay(raw);
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseFloat(display);
    if (isNaN(parsed) || display === '') {
      onChange(0);
      setDisplay('0');
    } else {
      setDisplay(String(parsed));
    }
  };

  return (
    <input
      ref={ref}
      type="number"
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  );
};

export default NumberInput;
