import React, { useEffect, useRef, useState } from "react";

export default function FormInputField({ value, type, placeholder, onChange,error }) {
  const [focusedclass, setFocusedClass] = useState("label-ip");
  const ip1 = useRef();
 
  return (
    <>
    <div
      className="user-ip"
      onClick={() => {
        setFocusedClass("focused-ip");
        ip1.current.focus();
      }}
      onFocus={() => {
        setFocusedClass("focused-ip");
        ip1.current.focus();
      }}
    >
      <span className={focusedclass}>{placeholder}</span>
      <input
        value={value}
        onChange={(e) => {onChange(e)}}
        ref={ip1}
        type={type}
      />
     
      </div>
      {error && <p className="error-message-form">{error}</p>}
      
      </>
  );
}
