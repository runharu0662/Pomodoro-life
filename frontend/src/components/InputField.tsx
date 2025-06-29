/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const inputFieldStyle = css`
  margin: 10px;
  label {
    font-weight: bold;
  }
  input {
    margin-left: 5px;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;

const InputField = ({ label, value, onChange }: InputFieldProps) => {
  return (
    <div css={inputFieldStyle}>
      <label>
        {label}
        <input type="number" value={value} onChange={onChange} />
      </label>
    </div>
  );
};

export default InputField;