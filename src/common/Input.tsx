import { FC, useState } from "react";
import styles from "./Input.module.scss";

interface IInputProps {
  placeholder: string;
  password?: boolean;
}

export const Input: FC<IInputProps> = ({ placeholder, password }) => {
  const [value, setValue] = useState("");

  return (
    <input
      onChange={(ev) => setValue(ev.target.value)}
      type={password ? "password" : "text"}
      placeholder={placeholder}
      className={styles.input}
      value={value}
    />
  );
};
