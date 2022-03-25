import { FC, ReactNode } from "react";
import styles from "./Typography.module.scss";

interface ITypographyProps {
  children: ReactNode;
  type: "h1" | "h2" | "h3" | "h4" | "display" | "error";
}

export const Typography: FC<ITypographyProps> = ({ children, type }) => {
  return (
    <span className={`${styles.typography} ${styles[`typography-${type}`]}`}>
      {children}
    </span>
  );
};
