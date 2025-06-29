/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

interface ButtonProps {
  onClick: () => void;
  disabled: boolean;
  text: string;
}

const buttonStyle = (disabled: boolean) => css`
  margin: 10px;
  padding: 5px 10px;
  background-color: ${disabled ? "#ccc" : "#007bff"};
  color: ${disabled ? "#666" : "white"};
  border: none;
  border-radius: 4px;
  cursor: ${disabled ? "not-allowed" : "pointer"};
  &:hover {
    background-color: ${disabled ? "#ccc" : "#0056b3"};
  }
`;

const Button = ({ onClick, disabled, text }: ButtonProps) => {
  return (
    <button css={buttonStyle(disabled)} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

export default Button;