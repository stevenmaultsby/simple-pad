import classes from "./Button.module.css";

export interface ButtonProperties {
  title: String;
  handleClick: any;
}

export default function ExtentionButton({ props, ...args }) {
  return (
    <button
      onClick={props.handleClick}
      className={`${classes.extensionButton}`}
      {...args}
    >
      {props.title}
    </button>
  );
}
